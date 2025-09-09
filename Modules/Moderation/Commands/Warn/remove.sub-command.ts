import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { RestrictionService } from "../../Services/restriction.service.js";

class RemoveSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const id = interaction.options.getString("id", true);

    /* Removes the warning */
    await RestrictionService.unwarnMember({ interaction, moderatorId: interaction.user.id, warnId: id });
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("remove")
      .setDescription("Removes a warning from a member")
      .addStringOption((id) => id.setName("id").setDescription("Id of the warning").setRequired(true));
  }
}

export const removeSubCommand = new RemoveSubCommand();
