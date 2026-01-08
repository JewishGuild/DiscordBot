import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { RestrictionService } from "../../Services/restriction.service.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { WarningEntity } from "Modules/Moderation/Types/warns.types.js";

class ListSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const user = interaction.options.getUser("user", true);

    /* Lists the warnings */
    const warnings = await RestrictionService.getMemberWarnings(user.id);
    if (warnings.length === 0) throw new Error("User doesn't have any warnings");
    await interaction.editReply({ embeds: [this.constructEmbed(user.tag, warnings)] });
  }

  private constructEmbed(userTag: string, warnings: Array<WarningEntity>) {
    const embed = new Embed({
      title: `Warning list of ${userTag}`,
      fields: warnings.map((warn) => ({
        name: `Reason: \`${warn.reason.slice(0, 240)}\``, // backlog
        value: `Given by: <@${warn.moderatorId}>\nAt: \`${warn.createDate}\`\nID: \`${warn._id.toString()}\``
      }))
    });
    return embed;
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("list")
      .setDescription("Lists all the member's warnings")
      .addUserOption((user) => user.setName("user").setDescription("User to warn").setRequired(true));
  }
}

export const listSubCommand = new ListSubCommand();
