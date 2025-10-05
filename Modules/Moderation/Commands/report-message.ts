import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  Client,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  ModalBuilder,
  Snowflake,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import { BaseMessageContextCommand } from "../../Base/Commands/base.command.js";
import { systemPrefix } from "../Config/report.config.js";
import { UserStatsService } from "../../Info/Services/user-stats.service.js";

class ReportMessageCommand extends BaseMessageContextCommand {
  constructor() {
    super("moderation", false);
  }

  public async execute(client: Client, interaction: MessageContextMenuCommandInteraction): Promise<void> {
    if (!interaction.guild) throw new Error("Must be inside of guild.");
    if (interaction.targetMessage.author.bot) throw new Error("Can't report bots' messages.");

    const reporterId = interaction.user.id,
      message = interaction.targetMessage,
      targetId = message.author.id;

    if (reporterId === targetId) throw new Error("Can't report your own message.");
    const isTargetStaff = await UserStatsService.isStaffMember({ guild: interaction.guild!, id: targetId });
    if (isTargetStaff) throw new Error("Can't report a staff member.");

    await interaction.showModal(this.constructModal(interaction.targetMessage.id));
  }

  protected createMessageContextCommand(): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder().setName("Report Message").setIntegrationTypes([ApplicationIntegrationType.GuildInstall]);
  }

  private constructModal(messageId: Snowflake) {
    const modal = new ModalBuilder().setCustomId(`${systemPrefix}-${messageId}`).setTitle("Report Message");
    const input = new TextInputBuilder()
      .setCustomId("details")
      .setLabel("Details")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder("Please elaborate as much as possible")
      .setMinLength(10);
    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
    modal.addComponents(row);
    return modal;
  }
}

export const reportMessageCommand = new ReportMessageCommand();
