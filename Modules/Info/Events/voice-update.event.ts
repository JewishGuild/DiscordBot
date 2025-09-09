import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { UserStatsService } from "../Services/user-stats.service.js";
import { CachingService } from "../../Base/Services/caching.service.js";

class VoiceUpdateEvent extends BaseEvent<"voiceStateUpdate"> {
  constructor() {
    super("voiceStateUpdate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["voiceStateUpdate"]): Promise<void> {
    const [oldState, newState] = args;
    if (!newState.guild || !newState.member || newState.member.user.bot) return;

    await UserStatsService.updateVoiceActivity({ member: newState.member });

    // caching
    if (
      (oldState.member && oldState.member.partial) ||
      newState.member.partial ||
      !CachingService.isMemberCached({ guild: newState.guild, id: newState.member.id })
    )
      CachingService.cacheMember({ guild: newState.guild, id: newState.member.id });
  }
}

export const voiceUpdateEvent = new VoiceUpdateEvent();
