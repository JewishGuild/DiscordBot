import { Guild, GuildMemberManager, Snowflake } from "discord.js";
import { GuildApi } from "../guild.api.js";

/**
 * API for managing members in a guild.
 * Extends {@link GuildApi} to provide utilities for retrieving and updating members.
 */
export class MemberApi extends GuildApi {
  /** Manages the guild's roles. @see {@link RoleManager} */
  protected readonly memberManager: GuildMemberManager;

  /**
   * Initializes the Member API with the given guild instance.
   *
   * @param guild - The Discord {@link Guild} instance.
   */
  constructor(guild: Guild) {
    super(guild);
    this.memberManager = this.guild.members;
  }

  /**
   * Fetches all guild members.
   *
   * @param options - (Optional) Fetch options. @see {@link BaseFetchOptions}
   * @returns A promise resolving to the fetched member.
   */
  public async getAllMembers() {
    return this.memberManager.fetch({ withPresences: false });
  }

  /**
   * Fetches a guild member by its ID.
   *
   * @param id - The member ID.
   * @param options - (Optional) Fetch options. @see {@link BaseFetchOptions}
   * @returns A promise resolving to the fetched member.
   */
  public async getMemberById(id: Snowflake) {
    return this.memberManager.fetch({ user: id, cache: true, withPresences: false });
  }
}
