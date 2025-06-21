import { ChatInputCommandInteraction, Client, SlashCommandSubcommandBuilder, Snowflake } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { roleOptions } from "../../Config/role.config.js";
import { MemberService } from "../../../../Api/Guild/Member/member.service.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../../Utilities/logger.utilities.js";

class RemoveSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    /* Get selected options */
    const user = interaction.options.getUser("user", true);
    const role = interaction.options.getString("role", true);

    /* Verify options validity */
    const memberApi = new MemberService(interaction.guild);
    const member = await memberApi.resolveMemberById(user.id);

    /* Add the role */
    if (!member.roles.cache.has(role)) throw new Error(`Member does not have the <@&${role}> role`);
    await member.roles.remove(role);
    const embed = this.constructEmbed(user.id, role);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ title: "Special Role Removed", user: interaction.user, embed });
  }

  private constructEmbed(memberId: Snowflake, roleId: Snowflake) {
    return new Embed({ description: `Removed <@&${roleId}> from <@${memberId}> successfully` });
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("remove")
      .setDescription("Removes special role")
      .addUserOption((user) => user.setName("user").setDescription("User to affect").setRequired(true))
      .addStringOption((role) => role.setName("role").setDescription("Name of the role").addChoices(roleOptions).setRequired(true));
  }
}
export const removeSubCommand = new RemoveSubCommand();
