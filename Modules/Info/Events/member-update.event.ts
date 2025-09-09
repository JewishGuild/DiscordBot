import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { UserStatsService } from "../Services/user-stats.service.js";
import { CachingService } from "../../Base/Services/caching.service.js";

class MemberUpdateEvent extends BaseEvent<"guildMemberUpdate"> {
  constructor() {
    super("guildMemberUpdate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["guildMemberUpdate"]): Promise<void> {
    const [oldMember, newMember] = args;
    if (newMember.user.bot) return;

    await UserStatsService.memberUpdate({ oldMember, newMember });

    // caching
    if (oldMember.partial || newMember.partial || !CachingService.isMemberCached({ guild: newMember.guild, id: newMember.id }))
      CachingService.cacheMember({ guild: newMember.guild, id: newMember.id });
  }
}

export const memberEvent = new MemberUpdateEvent();
