import { Client } from "discord.js";
import { BaseEvent } from "./base.event.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { AnnouncementService } from "../../Interactive/Services/announcements.service.js";

class ReadyEvent extends BaseEvent<"ready"> {
  constructor() {
    super("ready", true);
  }

  // Handshake, must be synchronous
  public execute(client: Client<true>): void {
    this.logger.info(`Logged as client ${client.user!.username}`);

    if (process.env.NODE_ENV === "production") {
      LoggerUtilities.log({ title: "Ready", embed: this.constructLogEmbed(), user: client.user }); //only for production
    }

    AnnouncementService.startAllAnnouncements();
  }

  private constructLogEmbed() {
    return new Embed({ description: `✅ **Bot is now online**` });
  }
}

export const readyEvent = new ReadyEvent();
