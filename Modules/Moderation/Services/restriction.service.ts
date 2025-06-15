import { GuildMember, NonThreadGuildBasedChannel, Snowflake, User } from "discord.js";
import { muteDmFormatter, RestrictionChannels, RestrictionDurations, RestrictionRoles, warnDmFormatter } from "../Config/restriction.config.js";
import { MutedMember } from "../Types/mutes.types.js";
import { MutedMemberCollection } from "../Models/mutes.collection.js";
import { Warning } from "../Types/warns.types.js";
import { WarnsCollection } from "../Models/warns.collection.js";
import { maxWarningThreshHold, minWarningThreshHold, warnAmount } from "../Config/warn.config.js";
import { Bot } from "../.../../../../Core/Bot/bot.js";
import { DirectMessageUtilities } from "../../../Utilities/direct-message.utilities.js";

export class RestrictionService {
  public static async setChannelMutedPreset(channel: NonThreadGuildBasedChannel) {
    if (RestrictionChannels.MutedText != channel.id) {
      await channel.permissionOverwrites.create(RestrictionRoles.Muted, { ViewChannel: false });
    }
  }

  public static async applyMute(member: GuildMember) {
    await member.roles.add(RestrictionRoles.Muted);
    await member.voice.disconnect();
  }

  public static async muteMember(member: GuildMember, moderatorId: Snowflake, duration: number, reason: string) {
    await this.applyMute(member);

    const mutedMember: MutedMember = {
      id: member.id,
      moderatorId: moderatorId,
      duration,
      reason,
      timestamp: Date.now(),
      permanent: duration == RestrictionDurations.Permanent
    };
    await MutedMemberCollection.getInstance().upsertMutedMember(member.id, mutedMember);
    await DirectMessageUtilities.sendDM(member.user, muteDmFormatter(duration, reason));
  }

  public static async revokeMute(member: GuildMember) {
    await member.roles.remove(RestrictionRoles.Muted);
  }

  public static async unmuteMember(member: GuildMember | Snowflake) {
    let id;
    if (member instanceof GuildMember) {
      await this.revokeMute(member);
      id = member.id;
    } else id = member;

    await MutedMemberCollection.getInstance().deleteMutedMember(id);
  }

  public static async warnUser(user: User, moderatorId: Snowflake, reason: string) {
    const warning: Warning = {
      id: user.id,
      moderatorId,
      reason,
      timestamp: Date.now()
    };

    const warningEntity = await WarnsCollection.getInstance().insertWarning(warning);
    await DirectMessageUtilities.sendDM(user, warnDmFormatter(reason));
    return warningEntity;
  }

  public static async unWarnUser(id: string) {
    return await WarnsCollection.getInstance().delete(id);
  }

  public static async getUserWarnings(id: Snowflake) {
    return await WarnsCollection.getInstance().getWarningsById(id);
  }

  public static async warnMute(member: GuildMember) {
    const warnings = await this.getUserWarnings(member.id);
    let duration = this.getWarningMuteDuration(warnings.length);

    if (duration) {
      this.muteMember(member, Bot.getInstance().getClient().user?.id as string, duration, "Warn mute");
    }
  }

  private static getWarningMuteDuration(warningsAmount: number) {
    if (warningsAmount < minWarningThreshHold) return 0;
    if (warnAmount.has(warningsAmount)) return warnAmount.get(warningsAmount) as number;
    return warnAmount.get(maxWarningThreshHold) as number;
  }
}
