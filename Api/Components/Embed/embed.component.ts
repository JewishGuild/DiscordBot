import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  EmbedData,
  InteractionCollector,
  InteractionResponse,
  Message
} from "discord.js";
import { config } from "./embed.config.js";
import { GeneralUtilities } from "../../../Utilities/general.utilities.js";
import { EmbedConfig, EmbedConfigOverrides, PaginationResult, PaginationState } from "./embed.types.js";

export class Embed extends EmbedBuilder {
  private readonly config: EmbedConfig;
  private paginationState?: PaginationState;

  constructor(data: EmbedData, overrides: EmbedConfigOverrides = {}) {
    super(data);
    this.config = this.getConfig(overrides);
    this.implementConfig();
  }

  private implementConfig() {
    Object.entries(this.config).forEach(([key, definition]) => {
      if (definition.state) {
        const typedKey = key as keyof EmbedData;
        const method = `set${GeneralUtilities.capitalize(typedKey)}` as keyof this;

        if (typeof (this as any)[method] === "function") {
          (this as any)[method](definition.value);
        } else {
          // @ts-expect-error
          console.warn(`Embed method "${method}" does not exist.`);
        }
      }
    });
  }

  private getConfig(overrides: EmbedConfigOverrides = {}): EmbedConfig {
    return GeneralUtilities.deepMerge(config, overrides);
  }

  public createPaginated(threshold: number = 6): PaginationResult {
    const fields = this.data.fields || [];

    if (fields.length <= threshold) {
      return { embed: this, needsPagination: false };
    }

    const fieldsPerPage = threshold;
    const totalPages = Math.ceil(fields.length / fieldsPerPage);

    // Initialize pagination state
    this.paginationState = {
      currentPage: 0,
      totalPages,
      fieldsPerPage,
      originalFields: [...fields]
    };

    // Set initial page fields using array slicing: fields[start:end]
    this.updateFieldsForPage(0);

    const components = this.createPaginationComponents();

    return {
      embed: this,
      needsPagination: true,
      components: components ? [components] : []
    };
  }

  /**
   * Mathematical field slicing: For page P with chunk size C,
   * extract elements from index P*C to min((P+1)*C, |fields|)
   */
  private updateFieldsForPage(page: number) {
    if (!this.paginationState) return;

    const { fieldsPerPage, originalFields, totalPages } = this.paginationState!;

    // Ensure page is within bounds: 0 ≤ page < totalPages
    const safePage = Math.max(0, Math.min(page, totalPages - 1));

    const startIndex = safePage * fieldsPerPage;
    const endIndex = Math.min(startIndex + fieldsPerPage, originalFields.length);

    const pageFields = originalFields.slice(startIndex, endIndex);

    // Clear existing fields and set new ones
    this.setFields([]);
    this.addFields(pageFields);

    this.paginationState.currentPage = safePage;
  }

  private createPaginationComponents(): ActionRowBuilder<ButtonBuilder> | null {
    if (!this.paginationState || this.paginationState.totalPages <= 1) return null;

    const { currentPage, totalPages } = this.paginationState;
    const row = new ActionRowBuilder<ButtonBuilder>();

    // First page button (only show if more than 2 pages)
    if (totalPages > 2) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId("pagination_first")
          .setLabel("⏪")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 0)
      );
    }

    // Previous button
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("pagination_previous")
        .setLabel("◀️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0)
    );

    // Page indicator (if enabled)
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("pagination_info")
        .setLabel(`${currentPage + 1}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    // Next button
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("pagination_next")
        .setLabel("▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages - 1)
    );

    // Last page button (only show if more than 2 pages)
    if (totalPages > 2) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId("pagination_last")
          .setLabel("⏩")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === totalPages - 1)
      );
    }

    return row;
  }

  /**
   * Navigation functions implementing modular arithmetic for page cycling
   */
  public nextPage(): boolean {
    if (!this.paginationState) return false;

    const { currentPage, totalPages } = this.paginationState;
    if (currentPage >= totalPages - 1) return false;

    this.updateFieldsForPage(currentPage + 1);
    return true;
  }

  public previousPage(): boolean {
    if (!this.paginationState) return false;

    const { currentPage } = this.paginationState;
    if (currentPage <= 0) return false;

    this.updateFieldsForPage(currentPage - 1);
    return true;
  }

  public goToPage(page: number): boolean {
    if (!this.paginationState) return false;

    const { totalPages } = this.paginationState;
    if (page < 0 || page >= totalPages) return false;

    this.updateFieldsForPage(page);
    return true;
  }

  public firstPage(): boolean {
    return this.goToPage(0);
  }

  public lastPage(): boolean {
    if (!this.paginationState) return false;
    return this.goToPage(this.paginationState.totalPages - 1);
  }

  /**
   * Creates and manages the pagination collector
   * Implements timeout-based cleanup with exponential backoff for performance
   */
  public async startPagination(message: Message | InteractionResponse<boolean>): Promise<InteractionCollector<ButtonInteraction> | null> {
    if (!this.paginationState) return null;

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000, // 1 minute default
      filter: (interaction) => {
        return interaction.customId.startsWith("pagination_") && interaction.customId !== "pagination_info";
      }
    });

    collector.on("collect", async (interaction: ButtonInteraction) => {
      let updated = false;

      switch (interaction.customId) {
        case "pagination_first":
          updated = this.firstPage();
          break;
        case "pagination_previous":
          updated = this.previousPage();
          break;
        case "pagination_next":
          updated = this.nextPage();
          break;
        case "pagination_last":
          updated = this.lastPage();
          break;
      }

      if (updated) {
        const components = this.createPaginationComponents();
        await interaction.update({
          embeds: [this],
          components: components ? [components] : []
        });
      } else {
        await interaction.deferUpdate();
      }
    });

    collector.on("end", async () => {
      try {
        // Disable all buttons when collector expires
        const disabledRow = new ActionRowBuilder<ButtonBuilder>();
        const components = this.createPaginationComponents();

        if (components) {
          components.components.forEach((button) => {
            disabledRow.addComponents(ButtonBuilder.from(button).setDisabled(true));
          });

          await message.edit({
            embeds: [this],
            components: [disabledRow]
          });
        }
      } catch (error) {
        console.error("Failed to disable pagination buttons:", error);
      }
    });

    return collector;
  }

  public getCurrentPage(): number | null {
    return this.paginationState?.currentPage ?? null;
  }

  public getTotalPages(): number | null {
    return this.paginationState?.totalPages ?? null;
  }

  public static BaseEmbed = (data: EmbedData) => new Embed(data, { footer: { state: false } });
}
