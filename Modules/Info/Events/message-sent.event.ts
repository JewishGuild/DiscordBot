import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { UserStatsService } from "../Services/user-stats.service.js";
import { CachingService } from "../../Base/Services/caching.service.js";

class MessageSentEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (!message.guild || !message.member || message.member.user.bot) return;

    await UserStatsService.updateChatActivity({ member: message.member });

    // caching
    if (message.member.partial || !CachingService.isMemberCached({ guild: message.guild, id: message.member.id }))
      CachingService.cacheMember({ guild: message.guild, id: message.member.id });
  }
}

export const messageSentEvent = new MessageSentEvent();
