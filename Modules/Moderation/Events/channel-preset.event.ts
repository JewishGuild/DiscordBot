import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { RestrictionService } from "../Services/restriction.service.js";

class ChannelPresetEvent extends BaseEvent<"channelCreate"> {
  constructor() {
    super("channelCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["channelCreate"]): Promise<void> {
    const [channel] = args;
    await RestrictionService.setChannelMutedPreset(channel);
  }
}

export const channelPresetEvent = new ChannelPresetEvent();
