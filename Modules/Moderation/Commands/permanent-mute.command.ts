import { ApplicationIntegrationType, Client, ContextMenuCommandBuilder, GuildMember, Snowflake, UserContextMenuCommandInteraction } from "discord.js";
import { BaseUserContextCommand } from "../../Base/Commands/base.command.js";
import { StaffService } from "../Services/staff.service.js";
import { RestrictionDurations } from "../Config/restriction.config.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";

class PermanentMuteCommand extends BaseUserContextCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: UserContextMenuCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    if (!StaffService.isStaffMember(interaction.member as GuildMember)) throw new Error("You're not a support staff member.");

    /* Verify validity */
    const member = interaction.targetMember as GuildMember;
    if (!member) throw new Error("User is not a member in this guild.");
    if (StaffService.isStaffMember(member)) throw new Error("Can't mute a staff member.");

    /* Apply mute to member */
    const reason = "Suspicious antisemitic behavior";
    const embed = this.constructEmbed(member.id, interaction.user.id, reason);
    await RestrictionService.muteMember(member, interaction.user.id, RestrictionDurations.Permanent, reason);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ title: "Member Permanently Muted", user: interaction.user, embed });
  }

  protected createUserContextCommand(): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder().setName("Permanent Mute").setIntegrationTypes([ApplicationIntegrationType.GuildInstall]);
  }

  private constructEmbed(memberId: Snowflake, modId: Snowflake, reason: string) {
    return new Embed({
      description: `<@${memberId}> has been muted by <@${modId}> Permanently with reason: \`${reason}\``
    });
  }
}

export const permanentMuteCommand = new PermanentMuteCommand();
