import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { UserStatsService } from "../Services/user-stats.service.js";
import { CachingService } from "../../Base/Services/caching.service.js";
import { MemberJoinRoles } from "../Config/member-join.config.js";

class MemberJoinEvent extends BaseEvent<"guildMemberAdd"> {
  constructor() {
    super("guildMemberAdd", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["guildMemberAdd"]): Promise<void> {
    const [member] = args;
    if (member.user.bot) return;
    await member.roles.add(MemberJoinRoles.Member);
    await UserStatsService.memberJoined({ member });
    await CachingService.cacheMember({ guild: member.guild, id: member.id }); // cache
  }
}

export const memberJoinEvent = new MemberJoinEvent();
