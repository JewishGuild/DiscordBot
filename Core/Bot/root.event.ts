import { Client, ClientEvents } from "discord.js";
import { ConsoleUtilities } from "../../Utilities/console.utilities.js";
import { BaseEvent } from "../../Modules/Base/Events/base.event.js";
import { readyEvent } from "../../Modules/Base/Events/ready.event.js";
import { interactiveEvent } from "../../Modules/Interactive/Events/interactive.event.js";
import { channelPresetEvent } from "../../Modules/Moderation/Events/channel-preset.event.js";
import { interactionEvent } from "../../Modules/Base/Events/interaction.event.js";
import { muteEvent } from "../../Modules/Moderation/Events/mute.event.js";

/**
 * Centralized event manager that registers all event handlers dynamically.
 */
export class RootEvent {
  /** Logger for event management */
  private static readonly logger = new ConsoleUtilities("Event", "Root");

  /** Stores multiple event handlers per event name */
  private static eventHandlers: Map<keyof ClientEvents, BaseEvent<keyof ClientEvents>[]> = new Map();

  /**
   * Initializes and registers all events.
   * @param client The Discord client instance.
   */
  public static init(client: Client<true>): void {
    this.logger.log("Initializing event handlers...");

    const eventInstances: BaseEvent<keyof ClientEvents>[] = [readyEvent, interactiveEvent, channelPresetEvent, interactionEvent, muteEvent];

    this.registerEvents(eventInstances);
    this.attachEvents(client);
  }

  /**
   * Registers provided event instances.
   * @param eventInstances The list of event instances to register.
   */
  private static registerEvents(eventInstances: BaseEvent<keyof ClientEvents>[]): void {
    for (const eventInstance of eventInstances) {
      if (!this.eventHandlers.has(eventInstance.name)) {
        this.eventHandlers.set(eventInstance.name, []);
      }
      this.eventHandlers.get(eventInstance.name)?.push(eventInstance);
    }
    this.logger.success(`Registered events: ${eventInstances.map((eventInstance) => eventInstance.name).join(", ")}`);
  }

  /**
   * Attaches all registered event handlers to the client.
   * If multiple handlers exist for the same event name, they execute sequentially.
   * @param client The Discord client instance.
   */
  private static attachEvents(client: Client<true>): void {
    for (const [eventName, eventInstances] of this.eventHandlers.entries()) {
      client.on(eventName, async (...args: ClientEvents[typeof eventName]) => {
        for (const eventInstance of eventInstances) {
          try {
            await eventInstance.execute(client, ...args);
          } catch (error) {
            this.logger.error(`Error executing event ${eventName}: ${error}`);
          }
        }
      });
    }
  }
}
