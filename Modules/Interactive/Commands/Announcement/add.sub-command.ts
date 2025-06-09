import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, Colors } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../../Utilities/logger.utilities.js";
import { AnnouncementCycle, announcementCycles, resolveAnnouncementCycleName } from "../../Config/announcements.config.js";
import { AnnouncementService } from "../../Services/announcements.service.js";
import { Announcement } from "../../Types/announcements.types.js";

class AddSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const name = interaction.options.getString("name", true);
    const message = interaction.options.getString("message", true);
    const cycle = interaction.options.getString("cycle", true) as AnnouncementCycle;
    const channel = interaction.options.getChannel("channel", true).id;

    /* Adds announcement */
    const embed = this.constructEmbed({ creatorId: interaction.user.id, channel, name, cycle, message, messageId: "" });
    await AnnouncementService.insertAnnouncement({ creatorId: interaction.user.id, channel, name, cycle, message, messageId: "" });
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ embed, title: `Announcement Created`, user: interaction.user });
  }

  private constructEmbed({ creatorId, name, message, cycle, channel }: Announcement) {
    return new Embed(
      {
        color: Colors.Green,
        description: `<@${creatorId}> Has created an announcement successfully named: \`${name}\``,
        fields: [
          { name: `Channel`, value: `<#${channel}>`, inline: true },
          { name: `Message`, value: message, inline: true },
          { name: `Cycle`, value: resolveAnnouncementCycleName(cycle), inline: true }
        ]
      },
      { color: { state: false } }
    );
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("add")
      .setDescription("Adds new announcement")
      .addStringOption((name) => name.setName("name").setDescription("Name of the announcement").setRequired(true))
      .addStringOption((message) => message.setName("message").setDescription("Message of the announcement").setRequired(true))
      .addStringOption((cycle) => cycle.setName("cycle").setDescription("Cycle of the announcement").addChoices(announcementCycles).setRequired(true))
      .addChannelOption((channel) => channel.setName("channel").setDescription("Channels of the announcement").setRequired(true));
  }
}

export const addSubCommand = new AddSubCommand();
