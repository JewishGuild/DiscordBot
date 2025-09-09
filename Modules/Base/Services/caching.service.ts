import { Guild, Snowflake } from "discord.js";
import { MemberApi } from "../../../Api/Guild/Member/member.api.js";

export class CachingService {
  private static readonly cachedMembers = new Set<string>();

  private static key({ guild, id }: { guild: Guild; id: Snowflake }) {
    return `${guild.id}:${id}`;
  }

  public static async cacheMember({ guild, id }: { guild: Guild; id: Snowflake }) {
    const memberApi = new MemberApi(guild);
    const member = await memberApi.getMemberById(id);
    this.cachedMembers.add(this.key({ guild, id }));
    return member;
  }

  public static isMemberCached({ guild, id }: { guild: Guild; id: Snowflake }) {
    return this.cachedMembers.has(this.key({ guild, id }));
  }
}
