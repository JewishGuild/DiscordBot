import { GuildMember } from "discord.js";
import { StaffRoles } from "../Config/staff.config.js";

export class StaffService {
  public static isStaffMember(member: GuildMember) {
    for (const role in StaffRoles) {
      const roleName = role as keyof typeof StaffRoles;

      if (member.roles.cache.has(StaffRoles[roleName])) {
        return true;
      }
    }
    return false;
  }
}
