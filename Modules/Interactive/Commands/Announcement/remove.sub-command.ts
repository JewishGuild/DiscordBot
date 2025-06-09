import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, Snowflake, Colors } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../../Utilities/logger.utilities.js";
import { AnnouncementService } from "../../Services/announcements.service.js";

class RemoveSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const name = interaction.options.getString("name", true);

    /* Removes the announcement */
    const success = await AnnouncementService.removeAnnouncement(name);
    const embed = this.constructEmbed(interaction.user.id, name, success);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ title: "Announcement Removed", embed, user: interaction.user });
  }

  private constructEmbed(id: Snowflake, name: string, success: boolean) {
    const description = success ? `Announcement \`${name}\` has been removed by <@${id}>` : `Announcement \`${name}\` not found`;
    const color = success ? Colors.Green : Colors.Red;
    return new Embed({ color, description }, { color: { state: false } });
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("remove")
      .setDescription("Removes an announcement")
      .addStringOption((name) => name.setName("name").setDescription("Name of the announcement").setRequired(true));
  }
}

export const removeSubCommand = new RemoveSubCommand();
