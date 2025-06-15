import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { AnnouncementsCollection } from "../../Models/announcements.collection.js";

class PreviewSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const name = interaction.options.getString("name", true);

    /* Gets the announcement */
    const announcementEntity = await AnnouncementsCollection.getInstance().getOneByQuery({ name });
    if (!announcementEntity) throw new Error("Announcement not found");
    await interaction.reply({ content: `Announcement preview: \n${announcementEntity?.message}` });
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("preview")
      .setDescription("Previews an announcement")
      .addStringOption((name) => name.setName("name").setDescription("Name of the announcement").setRequired(true));
  }
}

export const previewSubCommand = new PreviewSubCommand();
