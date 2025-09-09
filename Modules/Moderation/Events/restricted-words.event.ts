import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { restrictedRegex } from "../Config/words.config.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { UserStatsService } from "../../Info/Services/user-stats.service.js";

class RestrictedWordsEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (!message.guild || !message.member) return;

    if (restrictedRegex.test(message.content)) {
      const isTargetStaff = await UserStatsService.isStaffMember({ guild: message.guild, id: message.member.id });

      if (!isTargetStaff) {
        await RestrictionService.warnMember({
          member: message.member,
          moderatorId: client.user.id,
          reason: `Restricted content detected: "${message.content}"`
        });
      }
    }
  }
}

export const restrictedWordsEvent = new RestrictedWordsEvent();
