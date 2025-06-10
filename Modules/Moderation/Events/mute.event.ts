import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { MutedMemberCollection } from "../Models/mutes.collection.js";

class MuteEvent extends BaseEvent<"guildMemberAdd"> {
  constructor() {
    super("guildMemberAdd", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["guildMemberAdd"]): Promise<void> {
    const [member] = args;
    const isMuted = await MutedMemberCollection.getInstance().getMutedMemberById(member.id);

    if (isMuted) {
      await RestrictionService.applyMute(member);
    }
  }
}

export const muteEvent = new MuteEvent();
