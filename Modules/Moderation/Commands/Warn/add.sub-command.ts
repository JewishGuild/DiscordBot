import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, Snowflake, Colors, Guild } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { RestrictionService } from "../../../../Modules/Moderation/Services/restriction.service.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { MemberService } from "../../../../Api/Guild/Member/member.service.js";
import { StaffService } from "../../../../Modules/Moderation/Services/staff.service.js";

class AddSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);

    /* Verify integrity */
    const membersService = new MemberService(interaction.guild as Guild);
    const member = await membersService.resolveMemberById(user.id);
    if (StaffService.isStaffMember(member)) throw new Error("Can't warn a staff member.");

    /* Adds the warning */
    await RestrictionService.warnUser(user.id, interaction.user.id, reason);
    interaction.reply({ embeds: [this.constructEmbed(user.id, interaction.user.id, reason)] });

    /* Checks for auto mute */
    await RestrictionService.warnMute(member);
  }

  private constructEmbed(userId: Snowflake, modId: Snowflake, reason: string) {
    return new Embed(
      { color: Colors.Green, description: `✅ <@${userId}> has been warned by <@${modId}> with reason: \`${reason}\`` },
      { color: { state: false } }
    );
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("add")
      .setDescription("Adds a warning to a member")
      .addUserOption((user) => user.setName("user").setDescription("User to warn").setRequired(true))
      .addStringOption((reason) => reason.setName("reason").setDescription("Reason for the warn").setRequired(true));
  }
}

export const addSubCommand = new AddSubCommand();
