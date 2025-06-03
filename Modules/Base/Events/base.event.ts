import { Client, ClientEvents } from "discord.js";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";

/**
 * Base class for Discord event handling.
 * Provides structured logging and enforces event execution rules.
 *
 * @template EventName - A valid Discord event name from `ClientEvents`.
 */
export abstract class BaseEvent<EventName extends keyof ClientEvents> {
  /** The Discord event name as defined in {@link ClientEvents}. */
  public readonly name: EventName;

  /** Whether the event runs only once. */
  public readonly once: boolean;

  /** Logger instance for structured event logging using {@link ConsoleUtilities}. */
  protected readonly logger: ConsoleUtilities;

  /**
   * Initializes a new event handler.
   *
   * @param name - The event name from {@link ClientEvents}.
   * @param once - If `true`, the event triggers only once.
   */
  constructor(name: EventName, once: boolean = false) {
    this.name = name;
    this.once = once;
    this.logger = new ConsoleUtilities("Event", name);
  }

  /**
   * Executes the event. Must be implemented by subclasses.
   *
   * @param client - The Discord bot instance from {@link Client}.
   * @param args - The event-specific parameters from {@link ClientEvents}[`EventName`].
   */
  public abstract execute(client: Client<true>, ...args: ClientEvents[EventName]): Promise<void>;
}
