import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, Guild } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { RestrictionService } from "../../Services/restriction.service.js";
import { MemberService } from "../../../../Api/Guild/Member/member.service.js";
import { UserStatsService } from "../../../Info/Services/user-stats.service.js";

class AddSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    /* Get selected options */
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);

    /* Verify integrity */
    const membersService = new MemberService(interaction.guild as Guild);
    const member = await membersService.resolveMemberById(user.id);

    const isTargetStaff = await UserStatsService.isStaffMember({ guild: interaction.guild!, id: user.id });
    if (isTargetStaff) throw new Error("Can't warn a staff member");

    /* Adds the warning */
    await RestrictionService.warnMember({ interaction, member, moderatorId: interaction.user.id, reason });
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
