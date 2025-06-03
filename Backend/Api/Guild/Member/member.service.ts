import { Guild, Snowflake } from "discord.js";
import { MemberApi } from "./member.api.js";

export class MemberService extends MemberApi {
  constructor(guild: Guild) {
    super(guild);
  }

  public async resolveMemberById(id: Snowflake) {
    const member = await this.getMemberById(id);
    if (!member) throw new Error("Invalid, user is not a member in this guild.");
    return member;
  }
}
