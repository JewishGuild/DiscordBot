import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { findRestricted } from "../Config/words.config.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { UserStatsService } from "../../Info/Services/user-stats.service.js";
import { RestrictionDurations } from "../Config/restriction.config.js";

class RestrictedWordsEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (!message.guild || !message.member) return;

    const { matched, triedEvading } = findRestricted(message.content.toLowerCase());
    if (matched) {
      const isTargetStaff = await UserStatsService.isStaffMember({ guild: message.guild, id: message.member.id });

      if (isTargetStaff) {
        await message.delete();
        await RestrictionService.warnMember({
          member: message.member,
          moderatorId: client.user.id,
          reason: `Restricted content detected: "${message.content}"`
        });

        if (!triedEvading) {
          await RestrictionService.muteMember({
            member: message.member,
            duration: RestrictionDurations.SixHours,
            moderatorId: client.user.id,
            reason: `Tried to evade restricted content detection: "${message.content}"`
          });
        }
      }
    }
  }
}

export const restrictedWordsEvent = new RestrictedWordsEvent();
