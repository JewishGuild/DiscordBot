import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { AnnouncementService } from "../../Services/announcements.service.js";
import { AnnouncementEntity } from "../../Types/announcements.types.js";
import { resolveAnnouncementCycleName } from "../../Config/announcements.config.js";

class ListSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Lists the announcements */
    const announcements = await AnnouncementService.getAllAnnouncements();
    if (announcements.length === 0) throw new Error("There are no announcements");
    await interaction.followUp({ embeds: [this.constructEmbed(announcements)] });
  }

  private constructEmbed(announcements: Array<AnnouncementEntity>) {
    return new Embed({
      title: `Announcements List`,
      fields: announcements.map(({ name, message, channel, creatorId, cycle }) => ({
        name,
        value: `Created by: <@${creatorId}>\nMessage: ${message}\nChannel: <#${channel}>\nCycle: \`${resolveAnnouncementCycleName(cycle)}\``
      }))
    });
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder().setName("list").setDescription("Lists all the announcements");
  }
}

export const listSubCommand = new ListSubCommand();
