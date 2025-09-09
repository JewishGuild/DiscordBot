import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { UserStatsService } from "../Services/user-stats.service.js";

class MemberLeaveEvent extends BaseEvent<"guildMemberRemove"> {
  constructor() {
    super("guildMemberRemove", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["guildMemberRemove"]): Promise<void> {
    const [member] = args;
    if (member.user.bot) return;

    await UserStatsService.memberLeft({ member });
  }
}

export const memberLeaveEvent = new MemberLeaveEvent();
