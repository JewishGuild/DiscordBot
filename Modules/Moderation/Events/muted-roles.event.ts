import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { MutedMemberCollection } from "../Models/mutes.collection.js";

class MutedRolesEvent extends BaseEvent<"guildMemberUpdate"> {
  constructor() {
    super("guildMemberUpdate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["guildMemberUpdate"]): Promise<void> {
    const [, newMember] = args;
    const isMuted = await MutedMemberCollection.getInstance().getMutedMemberById(newMember.id);

    if (isMuted) {
      await RestrictionService.applyMute(newMember);
    }
  }
}

export const mutedRolesEvent = new MutedRolesEvent();
