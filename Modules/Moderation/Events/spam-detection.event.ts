import { Client, ClientEvents, GuildMember, Snowflake } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { SpamDetectionService } from "../Services/spam-detection.service.js";
import { StaffService } from "../Services/staff.service.js";
import { IgnoredChannels } from "../Config/spam.config.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { RestrictionDurations } from "../Config/restriction.config.js";

class SpamDetectionEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["messageCreate"]): Promise<void> {
    const [message] = args;
    if (message.author.bot || message.system || message.channel.id !== "1379819893385461820") return;

    const res = await SpamDetectionService.processMessage(client, message);
    if (StaffService.isStaffMember(message.member!) || this.isIgnoredChannel(message.channelId)) return;

    if (res.recommendedAction === "mute") {
      RestrictionService.muteMember(message.member!, client.user.id, res.rateLimitCheck.muteDuration!, "Spam");
    } else if (res.recommendedAction === "text") {
      await message.reply({ content: "The system has detected spam, please tune down and follow the server rules!" });
    }
  }

  public isIgnoredChannel(channelId: Snowflake) {
    for (const id in IgnoredChannels) {
      const ignoredId = id as keyof typeof IgnoredChannels;

      if (channelId === ignoredId) {
        return true;
      }
    }
    return false;
  }
}

export const spamDetectionEvent = new SpamDetectionEvent();
