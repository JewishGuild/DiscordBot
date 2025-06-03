import { GuildMember } from "discord.js";
import { SupportRoles } from "../Config/support.config.js";

export class SupportService {
  public static isSupportMember(member: GuildMember) {
    for (const role in SupportRoles) {
      const roleName = role as keyof typeof SupportRoles;

      if (member.roles.cache.has(SupportRoles[roleName])) {
        return true;
      }
    }
    return false;
  }
}
