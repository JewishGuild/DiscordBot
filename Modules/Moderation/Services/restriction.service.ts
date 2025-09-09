import { ChatInputCommandInteraction, GuildMember, Snowflake, UserContextMenuCommandInteraction } from "discord.js";
import { MutedMemberCollection } from "../Models/mutes.collection.js";
import { muteDmFormatter, RestrictionDurations, RestrictionRoles, warnDmFormatter } from "../Config/restriction.config.js";
import { MutedMember, MutedMemberEntity } from "../Types/mutes.types.js";
import { DirectMessageUtilities } from "../../../Utilities/direct-message.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";
import { RestrictionUtilities } from "../Utilities/restriction.utilities.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { Warning } from "../Types/warns.types.js";
import { WarnsCollection } from "../Models/warns.collection.js";
import { maxWarningThreshHold, minWarningThreshHold, warnAmount } from "../Config/warn.config.js";
import { Bot } from "../../../Core/Bot/bot.js";
import { UserStatsCollection } from "../../Info/Models/user-stats.collection.js";
import { ObjectId } from "mongodb";

/** Parameters for muting a member */
interface MuteMemberParams {
  interaction?: ChatInputCommandInteraction | UserContextMenuCommandInteraction;
  member: GuildMember;
  moderatorId: Snowflake;
  duration: number;
  reason: string;
}

/** Parameters for unmuting a member */
interface UnmuteMemberParams {
  interaction?: ChatInputCommandInteraction;
  member: GuildMember | Snowflake;
}

/** Parameters for warn a member */
interface WarnMemberParams {
  interaction?: ChatInputCommandInteraction;
  member: GuildMember;
  moderatorId: Snowflake;
  reason: string;
}

/** Parameters for unwarn a member */
interface UnwarnMemberParams {
  interaction: ChatInputCommandInteraction;
  moderatorId: Snowflake;
  warnId: string;
}

export class RestrictionService {
  /** Mute a member by removing their roles and applying the mute role*/
  public static async muteMember({ interaction, member, moderatorId, duration, reason }: MuteMemberParams) {
    await this.ensureMemberNotMuted(member.id);
    const roles = await this.applyMute(member);

    const mutedMember: MutedMember = {
      id: member.id,
      moderatorId,
      duration,
      reason,
      timestamp: Date.now(),
      permanent: duration == RestrictionDurations.Permanent,
      roles
    };

    await MutedMemberCollection.getInstance().insertMutedMember(mutedMember);
    await UserStatsCollection.getInstance().updateIncrementalStats({ guild: member.guild, id: member.id }, { muteCount: 1, muteDurationCount: duration });
    await UserStatsCollection.getInstance().updateGenericStats({ guild: member.guild, id: member.id }, { isMuted: true });
    await DirectMessageUtilities.sendDM(member.user, muteDmFormatter(duration, reason));

    // log
    const embed = RestrictionUtilities.createMuteEmbed({ id: member.id, moderatorId, duration, reason, roles });
    await LoggerUtilities.log({ title: "Member Muted", user: interaction?.user || Bot.getInstance().getClient().user!, embed });
    if (interaction) {
      await InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    }
  }

  /** Unmute a member by reassigning their roles and revoking mute role*/
  public static async unmuteMember({ interaction, member }: UnmuteMemberParams) {
    const id = member instanceof GuildMember ? member.id : member;
    const mutedDocument = await this.ensureMemberMuted(id);
    let reassignedRoles: Array<Snowflake> = [];

    // Revoke the mute and return roles if it's an existing guild member
    if (member instanceof GuildMember) {
      reassignedRoles = [...(await this.revokeMute(member, mutedDocument))];
      await UserStatsCollection.getInstance().updateIncrementalStats(
        { guild: member.guild, id: member.id },
        { muteCount: -1, muteDurationCount: -mutedDocument.duration }
      );
      await UserStatsCollection.getInstance().updateGenericStats({ guild: member.guild, id: member.id }, { isMuted: false });

      // log
      const embed = RestrictionUtilities.createUnmuteEmbed({ id, roles: reassignedRoles });
      await LoggerUtilities.log({ title: "Member Unmuted", user: interaction?.user || Bot.getInstance().getClient().user!, embed });
      if (interaction) {
        await InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
      }
    }
    await MutedMemberCollection.getInstance().deleteMutedMember(id);
  }

  /** Applies the mute by stripping roles, adding mute role, and disconnecting from voice */
  public static async applyMute(member: GuildMember) {
    const roles = await this.stripRoles(member);
    await member.roles.add(RestrictionRoles.Muted);
    await member.voice.disconnect();
    return roles;
  }

  /** Revokes mute by adding stripped roles, removing mute role */
  private static async revokeMute(member: GuildMember, document: MutedMemberEntity) {
    const roles = await this.reassignRoles(member, document.roles);
    await member.roles.remove(RestrictionRoles.Muted);
    return roles;
  }

  /** Removes all roles from a member and returns the IDs of successfully removed roles */
  private static async stripRoles(member: GuildMember) {
    const strippedRoles: Array<Snowflake> = [];

    for (const [id, role] of member.roles.cache) {
      try {
        await member.roles.remove(id);
        strippedRoles.push(id);
      } catch {}
    }
    return strippedRoles;
  }

  private static async reassignRoles(member: GuildMember, roles: Array<Snowflake>) {
    const reassignedRoles: Array<Snowflake> = [];
    if (!roles) return reassignedRoles;

    for (const id of roles) {
      try {
        await member.roles.add(id);
        reassignedRoles.push(id);
      } catch {}
    }
    return reassignedRoles;
  }

  public static async isMemberMuted(id: Snowflake) {
    return Boolean(await MutedMemberCollection.getInstance().getMutedMemberById(id));
  }

  private static async ensureMemberNotMuted(id: Snowflake) {
    const muted = await MutedMemberCollection.getInstance().getMutedMemberById(id);
    if (muted) throw new Error("Member is already muted");
  }

  private static async ensureMemberMuted(id: Snowflake) {
    const muted = await MutedMemberCollection.getInstance().getMutedMemberById(id);
    if (!muted) throw new Error("Member is not muted");
    return muted;
  }

  public static async warnMember({ interaction, member, moderatorId, reason }: WarnMemberParams) {
    const warning: Warning = {
      id: member.id,
      moderatorId,
      reason,
      timestamp: Date.now()
    };

    await WarnsCollection.getInstance().insertWarning(warning);
    await UserStatsCollection.getInstance().updateIncrementalStats({ guild: member.guild, id: member.id }, { warnCount: 1 });

    // log
    await DirectMessageUtilities.sendDM(member.user, warnDmFormatter(reason));
    const embed = RestrictionUtilities.createWarnEmbed({ id: member.id, moderatorId, reason });
    await LoggerUtilities.log({ title: "Member Warned", user: member.user, embed });

    if (interaction) await InteractionUtilities.fadeReply(interaction, { embeds: [embed] });

    // mute
    const warnings = await this.getMemberWarnings(member.id);
    const amount = this.getMuteDurationByWarningsAmount(warnings.length);
    if (amount) {
      await this.muteMember({ member, moderatorId, duration: amount, reason: `Automatic mute due to ${warnings.length} warnings` });
    }
  }

  public static async unwarnMember({ interaction, moderatorId, warnId }: UnwarnMemberParams) {
    const warnDocument = await WarnsCollection.getInstance().getOneByQuery({ _id: new ObjectId(warnId) });
    const success = await WarnsCollection.getInstance().delete(warnId);

    if (warnDocument && success) {
      await UserStatsCollection.getInstance().updateIncrementalStats({ guild: interaction.guild!, id: warnDocument.id }, { warnCount: -1 });
    }

    // log
    const embed = RestrictionUtilities.createUnwarnEmbed({ moderatorId, success, warnId });
    await LoggerUtilities.log({ title: "Member unwarned", user: interaction.user, embed });
    await InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
  }

  public static async getMemberWarnings(id: Snowflake) {
    return await WarnsCollection.getInstance().getWarningsById(id);
  }

  private static getMuteDurationByWarningsAmount(warningsAmount: number) {
    if (warningsAmount < minWarningThreshHold) return 0;
    if (warnAmount.has(warningsAmount)) return warnAmount.get(warningsAmount) as number;
    return warnAmount.get(maxWarningThreshHold) as number;
  }
}
