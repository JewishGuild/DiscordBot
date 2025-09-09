import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BaseSlashCommand } from "../../Base/Commands/base.command.js";
import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { muteDurations } from "../Config/restriction.config.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { UserStatsService } from "../../Info/Services/user-stats.service.js";

class MuteCommand extends BaseSlashCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const isCommanderStaff = await UserStatsService.isStaffMember({ guild: interaction.guild, id: interaction.user.id });
    if (!isCommanderStaff) throw new Error("You're not a staff member");

    /* Get selected options */
    const user = interaction.options.getUser("user", true);
    const duration = interaction.options.getNumber("duration", true);
    const reason = interaction.options.getString("reason", true);

    /* Verify options validity */
    const memberApi = new MemberService(interaction.guild);
    const member = await memberApi.getMemberById(user.id);

    const isTargetStaff = await UserStatsService.isStaffMember({ guild: interaction.guild!, id: user.id });
    if (isTargetStaff) throw new Error("Can't warn a staff member");

    /* Apply mute to member */
    await RestrictionService.muteMember({ member, moderatorId: interaction.user.id, duration, reason, interaction });
  }

  protected createSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("mute")
      .setDescription("Mutes a member temporarily")
      .addUserOption((user) => user.setName("user").setDescription("User to mute").setRequired(true))
      .addNumberOption((duration) => duration.setName("duration").setDescription("Duration of mute").setRequired(true).setChoices(muteDurations))
      .addStringOption((reason) => reason.setName("reason").setDescription("Reason for the temp mute").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const muteCommand = new MuteCommand();
