import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { BaseJob } from "../../../Modules/Base/Jobs/base.job.js";
import { MutedMemberCollection } from "../Models/mutes.collection.js";
import { Bot } from "../../../Core/Bot/bot.js";
import { Guild } from "discord.js";
import { RestrictionService } from "../Services/restriction.service.js";

class MutedJob extends BaseJob {
  constructor() {
    super("muted", "* * * * *");
  }

  protected async execute(): Promise<void> {
    const mutedMembers = await MutedMemberCollection.getInstance().getExpiredMutedMembers();
    const membersService = new MemberService(Bot.getInstance().getClient().guilds.cache.first() as Guild);

    for (const mutedMember of mutedMembers) {
      try {
        const member = await membersService.getMemberById(mutedMember.id);
        await RestrictionService.unmuteMember(member);
      } catch {
        await RestrictionService.unmuteMember(mutedMember.id);
      }
    }
  }
}

export const mutedJob = new MutedJob();
