import { ApplicationIntegrationType, Client, ContextMenuCommandBuilder, GuildMember, UserContextMenuCommandInteraction } from "discord.js";
import { BaseUserContextCommand } from "../../Base/Commands/base.command.js";
import { RestrictionDurations } from "../Config/restriction.config.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { UserStatsService } from "../../Info/Services/user-stats.service.js";

class PermanentMuteCommand extends BaseUserContextCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: UserContextMenuCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const isCommanderStaff = await UserStatsService.isStaffMember({ guild: interaction.guild, id: interaction.user.id });
    if (!isCommanderStaff) throw new Error("You're not a staff member");

    /* Verify validity */
    const member = interaction.targetMember as GuildMember;
    if (!member) throw new Error("User is not a member in this guild.");

    const isTargetStaff = await UserStatsService.isStaffMember({ guild: interaction.guild!, id: member.id });
    if (isTargetStaff) throw new Error("Can't warn a staff member");

    /* Apply mute to member */
    const reason = "Suspicious antisemitic behavior";
    await RestrictionService.muteMember({ interaction, member, duration: RestrictionDurations.Permanent, reason, moderatorId: interaction.user.id });
  }

  protected createUserContextCommand(): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder().setName("Permanent Mute").setIntegrationTypes([ApplicationIntegrationType.GuildInstall]);
  }
}

export const permanentMuteCommand = new PermanentMuteCommand();
