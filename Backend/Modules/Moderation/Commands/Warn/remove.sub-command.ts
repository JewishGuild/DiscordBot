import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, Snowflake, Colors } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { RestrictionService } from "../../../../Modules/Moderation/Services/restriction.service.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";

class RemoveSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const id = interaction.options.getString("id", true);

    /* Adds the warning */
    const success = await RestrictionService.unWarnUser(id);
    interaction.reply({ embeds: [this.constructEmbed(interaction.user.id, id, success)] });
  }

  private constructEmbed(modId: Snowflake, id: string, success: boolean) {
    const description = success ? `✅ Warning \`${id}\` has been revoked by <@${modId}>` : `❌ Warning \`${id}\` not found`;
    const color = success ? Colors.Green : Colors.Red;
    return new Embed({ color, description }, { color: { state: false } });
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("remove")
      .setDescription("Removes a warning from a member")
      .addStringOption((id) => id.setName("id").setDescription("Id of the warning").setRequired(true));
  }
}

export const removeSubCommand = new RemoveSubCommand();
