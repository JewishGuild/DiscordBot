import { CachingService } from "../../Base/Services/caching.service.js";
import { BaseCollection } from "../../Base/Models/base.collection.js";
import { ArrayUserStats, IncrementalUserStats, NonGenericUserStats, UserStats, UserStatsEntity } from "../Types/user-stats.types.js";
import { Guild, Snowflake } from "discord.js";
import { PermissionsUtilities } from "../../../Utilities/permissions.utilities.js";
import { RestrictionService } from "../../Moderation/Services/restriction.service.js";
import { ReportService } from "../../../Modules/Moderation/Services/report.service.js";

export class UserStatsCollection extends BaseCollection<UserStatsEntity> {
  private static instance: UserStatsCollection;

  constructor() {
    super("user-stats");
  }

  /**
   * Singleton pattern to ensure only one instance exists
   * @returns The singleton instance of UserStatsCollection
   */
  public static getInstance(): UserStatsCollection {
    if (!UserStatsCollection.instance) {
      UserStatsCollection.instance = new UserStatsCollection();
    }
    return UserStatsCollection.instance;
  }

  private async loadStats({ guild, id }: { guild: Guild; id: Snowflake }) {
    const member = await CachingService.cacheMember({ guild, id });
    const permissions = PermissionsUtilities.analyze(member.permissions.bitfield);
    const warnings = await RestrictionService.getMemberWarnings(id);
    const muted = await RestrictionService.isMemberMuted(id);
    const reportsCount = await ReportService.getReportsCount(id);
    const falseReportsCount = await ReportService.getFalseReportsCount(id);

    const nicknames: Array<string> = [];
    if (member.nickname) nicknames.push(member.nickname);
    if (member.displayName) nicknames.push(member.displayName);
    if (member.user.globalName) nicknames.push(member.user.globalName);

    const userStats: UserStats = {
      // global
      id,
      nicknames: Array.from(new Set<string>(nicknames.map((n) => n.trim()).filter(Boolean))),
      boosted: !!member.premiumSince,
      warnCount: warnings.length,
      muteCount: muted ? 1 : 0,
      muteDurationCount: 0,
      reportsCount: reportsCount,
      falseReportsCount: falseReportsCount,
      joins: member.joinedTimestamp ? [member.joinedTimestamp] : [],
      leaves: [],

      // state
      isMember: true,
      isAdmin: permissions.isAdministrator,
      isStaff: permissions.isAdministrator || permissions.isStaff,
      isBooster: !!member.premiumSince,
      isMuted: muted
    };

    return await this.insert(userStats);
  }

  public async getUserStats({ guild, id }: { guild: Guild; id: Snowflake }) {
    const stats = await this.getOneByQuery({ id });
    if (stats) return stats;
    return await this.loadStats({ guild, id });
  }

  public async updateGenericStats({ guild, id }: { guild: Guild; id: Snowflake }, newStats: Omit<Partial<UserStats>, NonGenericUserStats>) {
    await this.getUserStats({ guild, id });
    await this.update({ id }, { ...newStats });
  }

  public async updateArrayStats({ guild, id }: { guild: Guild; id: Snowflake }, patch: Partial<Record<ArrayUserStats, UserStats[ArrayUserStats]>>) {
    await this.getUserStats({ guild, id });
    const addToSet: Record<string, any> = {};
    for (const [k, v] of Object.entries(patch) as [ArrayUserStats, UserStats[ArrayUserStats] | undefined][]) {
      if (!v || v.length === 0) continue;

      const first = v[0];
      if (typeof first === "string") {
        const cleaned = Array.from(new Set((v as string[]).map((s) => s.trim()).filter(Boolean)));
        if (cleaned.length) addToSet[k] = { $each: cleaned };
      } else if (typeof first === "number") {
        const cleaned = Array.from(new Set((v as number[]).filter((n): n is number => Number.isFinite(n))));
        if (cleaned.length) addToSet[k] = { $each: cleaned };
      }
    }
    if (!Object.keys(addToSet).length) return;

    await this.collection.updateOne(
      { id },
      {
        $addToSet: addToSet,
        $set: { updateDate: new Date() }
      },
      { upsert: true }
    );
  }

  public async updateIncrementalStats({ guild, id }: { guild: Guild; id: Snowflake }, patch: Partial<Record<IncrementalUserStats, number>>) {
    await this.getUserStats({ guild, id });
    const inc: Partial<Record<IncrementalUserStats, number>> = {};
    for (const [k, v] of Object.entries(patch) as [IncrementalUserStats, number | undefined][]) {
      if (typeof v === "number" && v !== 0) {
        inc[k] = (inc[k] ?? 0) + v;
      }
    }
    if (!Object.keys(inc).length) return;

    await this.collection.updateOne(
      { id },
      {
        $inc: inc,
        $set: { updateDate: new Date() }
      },
      { upsert: true }
    );
  }
}
