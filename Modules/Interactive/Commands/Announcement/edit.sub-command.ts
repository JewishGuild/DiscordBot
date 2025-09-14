import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, Colors, APIEmbedField } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../../Utilities/interaction.utilities.js";
import { WebhookUtilities } from "../../../../Utilities/webhook.utilities.js";
import { AnnouncementCycle, announcementCycles, resolveAnnouncementCycleName } from "../../Config/announcements.config.js";
import { Announcement } from "../../Types/announcements.types.js";
import { AnnouncementService } from "../../Services/announcements.service.js";

class EditSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const name = interaction.options.getString("name", true);
    const message = interaction.options.getString("message", false) as string | undefined;
    const cycle = interaction.options.getString("cycle", false) as AnnouncementCycle | undefined;
    const channel = interaction.options.getChannel("channel", false)?.id;

    /* Make sure there are edits */
    const edits = { message, cycle, channel };
    Object.keys(edits).forEach((key) => !edits[key as keyof typeof edits] && delete edits[key as keyof typeof edits]);
    const hasEdits = Object.values(edits).some((value) => value !== undefined);
    if (!hasEdits) throw new Error("No edits detected");

    /* Edits announcement */
    const embed = this.constructEmbed({ name, ...edits });
    await AnnouncementService.editAnnouncement(name, edits);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    WebhookUtilities.log({ embed, title: `Announcement Edited`, user: interaction.user });
  }

  private constructEmbed({ name, message, cycle, channel }: Partial<Announcement>) {
    const fields: APIEmbedField[] = [
      channel && { name: "Channel", value: `<#${channel}>` },
      message && { name: "Message", value: message },
      cycle && { name: "Cycle", value: resolveAnnouncementCycleName(cycle) }
    ].filter(Boolean) as APIEmbedField[];

    return new Embed(
      {
        color: Colors.Green,
        description: `Announcement: \`${name}\` has been edited successfully`,
        fields
      },
      { color: { state: false } }
    );
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("edit")
      .setDescription("Edits an announcement")
      .addStringOption((name) => name.setName("name").setDescription("Name of the announcement").setRequired(true))
      .addStringOption((message) => message.setName("message").setDescription("Message of the announcement"))
      .addStringOption((cycle) => cycle.setName("cycle").setDescription("Cycle of the announcement").addChoices(announcementCycles))
      .addChannelOption((channel) => channel.setName("channel").setDescription("Channels of the announcement"));
  }
}

export const editSubCommand = new EditSubCommand();
