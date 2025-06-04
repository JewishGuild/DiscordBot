import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  Client,
  Colors,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel
} from "discord.js";
import { BaseCommand } from "../../Base/Commands/base.command.js";
import { SupportService } from "../Services/support.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";

class ClearCommand extends BaseCommand {
  constructor() {
    super();
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    if (!SupportService.isSupportMember(interaction.member as GuildMember)) throw new Error("You're not a support staff member.");

    /* Get selected options */
    const amount = interaction.options.getNumber("amount", true);

    /* Bulk delete messages */
    const channel = interaction.channel as TextChannel;
    await channel.bulkDelete(amount);

    /* Handle reply */
    const embed = this.constructEmbed(amount);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ embeds: [embed] });
  }

  private constructEmbed(amount: number) {
    return new Embed({ color: Colors.Green, description: `✅ Deleted ${amount} messages` }, { color: { state: false } });
  }

  protected buildData(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Deletes 1-100 messages")
      .addNumberOption((amount) => amount.setName("amount").setDescription("Amount of messages to delete").setRequired(true).setMinValue(1).setMaxValue(100))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const clearCommand = new ClearCommand();
