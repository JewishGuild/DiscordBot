import { BaseFetchOptions, Guild, RoleCreateOptions, RoleManager } from "discord.js";
import { GuildApi } from "../guild.api.js";

/**
 * API for managing roles in a guild.
 * Extends {@link GuildApi} to provide utilities for retrieving and creating roles.
 */
export class RoleApi extends GuildApi {
  /** Manages the guild's roles. @see {@link RoleManager} */
  protected readonly roleManager: RoleManager;

  /**
   * Initializes the Role API with the given guild instance.
   *
   * @param guild - The Discord {@link Guild} instance.
   */
  constructor(guild: Guild) {
    super(guild);
    this.roleManager = this.guild.roles;
  }

  /**
   * Fetches a guild role by its ID.
   *
   * @param id - The role ID.
   * @param options - (Optional) Fetch options. @see {@link BaseFetchOptions}
   * @returns A promise resolving to the fetched role.
   */
  public async getRoleById(id: string, options?: BaseFetchOptions) {
    return this.roleManager.fetch(id, options);
  }

  /**
   * Creates a new role in the guild.
   *
   * @param options - The role creation options. @see {@link RoleCreateOptions}
   * @returns A promise resolving to the created role.
   */
  public async createRole(options: RoleCreateOptions) {
    return this.roleManager.create(options);
  }
}
