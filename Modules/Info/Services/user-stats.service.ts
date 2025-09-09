import { Guild, GuildMember, PartialGuildMember, Snowflake } from "discord.js";
import { UserStatsCollection } from "../Models/user-stats.collection.js";
import { PermissionsUtilities } from "../../../Utilities/permissions.utilities.js";
import { GenericUserStats } from "../Types/user-stats.types.js";
import { CachingService } from "../../Base/Services/caching.service.js";

export class UserStatsService {
  public static async memberJoined({ member }: { member: GuildMember }) {
    await Promise.all([
      UserStatsCollection.getInstance().updateGenericStats({ guild: member.guild, id: member.id }, { isMember: true }),
      UserStatsCollection.getInstance().updateArrayStats({ guild: member.guild, id: member.id }, { joins: [member.joinedTimestamp!] })
    ]);
  }

  public static async memberLeft({ member }: { member: GuildMember | PartialGuildMember }) {
    await Promise.all([
      UserStatsCollection.getInstance().updateGenericStats(
        { guild: member.guild, id: member.id },
        { isMember: false, isAdmin: false, isStaff: false, isBooster: false }
      ),
      UserStatsCollection.getInstance().updateArrayStats({ guild: member.guild, id: member.id }, { leaves: [Date.now()] })
    ]);
  }

  public static async memberUpdate({ oldMember, newMember }: { oldMember: GuildMember | PartialGuildMember; newMember: GuildMember }) {
    await Promise.all([
      this.updatePermissions({ oldMember, newMember }),
      this.updateBoosterStatus({ oldMember, newMember }),
      this.updateNicknames({ oldMember, newMember })
    ]);
  }

  private static async updatePermissions({ oldMember, newMember }: { oldMember: GuildMember | PartialGuildMember; newMember: GuildMember }) {
    const oldPermissions = PermissionsUtilities.analyze(oldMember.permissions.bitfield);
    const newPermissions = PermissionsUtilities.analyze(newMember.permissions.bitfield);
    const patch: GenericUserStats = {};

    // Check admin logic
    const isOldAdmin = !!oldPermissions.isAdministrator;
    const isNewAdmin = !!newPermissions.isAdministrator;
    if (isOldAdmin !== isNewAdmin) patch.isAdmin = isNewAdmin;

    // Check staff logic
    const isOldStaff = !!(isOldAdmin || oldPermissions.isStaff);
    const isNewStaff = !!(isNewAdmin || newPermissions.isStaff);
    if (isOldStaff !== isNewStaff) patch.isStaff = isNewStaff;

    if (Object.keys(patch).length) await UserStatsCollection.getInstance().updateGenericStats({ guild: newMember.guild, id: newMember.id }, patch);
  }

  private static async updateBoosterStatus({ oldMember, newMember }: { oldMember: GuildMember | PartialGuildMember; newMember: GuildMember }) {
    const wasBoosting = !!oldMember.premiumSince;
    const isBoosting = !!newMember.premiumSince;
    if (wasBoosting === isBoosting) return;

    const patch: GenericUserStats = isBoosting ? { boosted: true, isBooster: true } : { isBooster: false };
    await UserStatsCollection.getInstance().updateGenericStats({ guild: newMember.guild, id: newMember.id }, patch);
  }

  private static async updateNicknames({ oldMember, newMember }: { oldMember: GuildMember | PartialGuildMember; newMember: GuildMember }) {
    const oldNickname = oldMember.nickname ?? null;
    const newNickname = newMember.nickname ?? null;
    const oldDisplayname = oldMember.displayName;
    const newDisplayname = newMember.displayName;
    if (oldNickname === newNickname && oldDisplayname === newDisplayname) return;

    const nicknames: Array<string> = [];
    if (newNickname?.trim()) nicknames.push(newNickname.trim());
    if (newDisplayname?.trim()) nicknames.push(newDisplayname.trim());

    const global = newMember.user.globalName?.trim();
    const user = newMember.user.username.trim();
    if (global) nicknames.push(global);
    if (user) nicknames.push(user);
    await UserStatsCollection.getInstance().updateArrayStats({ guild: newMember.guild, id: newMember.id }, { nicknames });
  }

  public static async updateChatActivity({ member }: { member: GuildMember }) {
    await UserStatsCollection.getInstance().updateGenericStats({ guild: member.guild, id: member.id }, { lastChatActivity: Date.now() });
  }

  public static async updateVoiceActivity({ member }: { member: GuildMember }) {
    await UserStatsCollection.getInstance().updateGenericStats({ guild: member.guild, id: member.id }, { lastVoiceActivity: Date.now() });
  }

  public static async isStaffMember({ guild, id }: { guild: Guild; id: Snowflake }) {
    return Boolean((await this.getUserStats({ guild, id }))?.isStaff);
  }

  public static async getUserStats({ guild, id }: { guild: Guild; id: Snowflake }) {
    return await UserStatsCollection.getInstance().getUserStats({ guild, id });
  }
}
