import { AuditLogEvent, Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { PermissionsUtilities } from "../../../Utilities/permissions.utilities.js";
import { SecurityService } from "../Services/security.service.js";
import { IGNORED_CHANNELS_REGEXES } from "../Config/security.config.js";

class ChannelDeleteEvent extends BaseEvent<"channelDelete"> {
  constructor() {
    super("channelDelete", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["channelDelete"]): Promise<void> {
    const [channel] = args;
    if (channel.isDMBased() || !channel.guild) return;
    if (!!IGNORED_CHANNELS_REGEXES.some((rx) => rx.test(channel.name))) return;

    const entry = await SecurityService.fetchMatchingAuditLogEntry({
      guild: channel.guild,
      type: AuditLogEvent.ChannelDelete,
      targetId: channel.id,
      eventAt: Date.now()
    });
  }
}

export const channelDeleteEvent = new ChannelDeleteEvent();
