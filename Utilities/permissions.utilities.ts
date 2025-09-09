export const DiscordPermission = {
  // Basic permissions (bits 0–9)
  CREATE_INSTANT_INVITE: 1n,
  KICK_MEMBERS: 2n,
  BAN_MEMBERS: 4n,
  ADMINISTRATOR: 8n,
  MANAGE_CHANNELS: 16n,
  MANAGE_GUILD: 32n,
  ADD_REACTIONS: 64n,
  VIEW_AUDIT_LOG: 128n,
  PRIORITY_SPEAKER: 256n,
  STREAM: 512n,

  // Communication permissions (bits 10–19)
  VIEW_CHANNEL: 1024n,
  SEND_MESSAGES: 2048n,
  SEND_TTS_MESSAGES: 4096n,
  MANAGE_MESSAGES: 8192n,
  EMBED_LINKS: 16384n,
  ATTACH_FILES: 32768n,
  READ_MESSAGE_HISTORY: 65536n,
  MENTION_EVERYONE: 131072n,
  USE_EXTERNAL_EMOJIS: 262144n,
  VIEW_GUILD_INSIGHTS: 524288n,

  // Voice permissions (bits 20–29)
  CONNECT: 1048576n,
  SPEAK: 2097152n,
  MUTE_MEMBERS: 4194304n,
  DEAFEN_MEMBERS: 8388608n,
  MOVE_MEMBERS: 16777216n,
  USE_VAD: 33554432n,
  CHANGE_NICKNAME: 67108864n,
  MANAGE_NICKNAMES: 134217728n,
  MANAGE_ROLES: 268435456n,
  MANAGE_WEBHOOKS: 536870912n,

  // Advanced permissions (bits 30–39)
  MANAGE_EMOJIS_AND_STICKERS: 1073741824n,
  USE_APPLICATION_COMMANDS: 2147483648n,
  REQUEST_TO_SPEAK: 4294967296n,
  MANAGE_EVENTS: 8589934592n,
  MANAGE_THREADS: 17179869184n,
  CREATE_PUBLIC_THREADS: 34359738368n,
  CREATE_PRIVATE_THREADS: 68719476736n,
  USE_EXTERNAL_STICKERS: 137438953472n,
  SEND_MESSAGES_IN_THREADS: 274877906944n,
  USE_EMBEDDED_ACTIVITIES: 549755813888n,

  // Modern permissions (bits 40–46)
  MODERATE_MEMBERS: 1099511627776n,
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 2199023255552n,
  USE_SOUNDBOARD: 4398046511104n,
  CREATE_EXPRESSIONS: 8796093022208n,
  CREATE_EVENTS: 17592186044416n,
  USE_EXTERNAL_SOUNDS: 35184372088832n,
  SEND_VOICE_MESSAGES: 70368744177664n
} as const;

export type DiscordPermission = (typeof DiscordPermission)[keyof typeof DiscordPermission];

export enum PermissionCategory {
  ADMINISTRATIVE = "Administrative",
  MODERATION = "Moderation",
  COMMUNICATION = "Communication",
  VOICE = "Voice",
  MANAGEMENT = "Management",
  MODERN = "Modern",
  CUSTOM = "Custom"
}

export const PERMISSION_CATEGORIES: Readonly<Record<PermissionCategory, readonly DiscordPermission[]>> = {
  [PermissionCategory.ADMINISTRATIVE]: [
    DiscordPermission.ADMINISTRATOR,
    DiscordPermission.MANAGE_GUILD,
    DiscordPermission.VIEW_AUDIT_LOG,
    DiscordPermission.VIEW_GUILD_INSIGHTS,
    DiscordPermission.VIEW_CREATOR_MONETIZATION_ANALYTICS
  ],

  [PermissionCategory.MODERATION]: [
    DiscordPermission.KICK_MEMBERS,
    DiscordPermission.BAN_MEMBERS,
    DiscordPermission.MANAGE_MESSAGES,
    DiscordPermission.MUTE_MEMBERS,
    DiscordPermission.DEAFEN_MEMBERS,
    DiscordPermission.MOVE_MEMBERS,
    DiscordPermission.MANAGE_NICKNAMES,
    DiscordPermission.MANAGE_ROLES,
    DiscordPermission.MODERATE_MEMBERS
  ],

  [PermissionCategory.COMMUNICATION]: [
    DiscordPermission.CREATE_INSTANT_INVITE,
    DiscordPermission.ADD_REACTIONS,
    DiscordPermission.VIEW_CHANNEL,
    DiscordPermission.SEND_MESSAGES,
    DiscordPermission.SEND_TTS_MESSAGES,
    DiscordPermission.EMBED_LINKS,
    DiscordPermission.ATTACH_FILES,
    DiscordPermission.READ_MESSAGE_HISTORY,
    DiscordPermission.MENTION_EVERYONE,
    DiscordPermission.USE_EXTERNAL_EMOJIS,
    DiscordPermission.USE_APPLICATION_COMMANDS,
    DiscordPermission.USE_EXTERNAL_STICKERS,
    DiscordPermission.SEND_MESSAGES_IN_THREADS,
    DiscordPermission.SEND_VOICE_MESSAGES
  ],

  [PermissionCategory.VOICE]: [
    DiscordPermission.PRIORITY_SPEAKER,
    DiscordPermission.STREAM,
    DiscordPermission.CONNECT,
    DiscordPermission.SPEAK,
    DiscordPermission.USE_VAD,
    DiscordPermission.REQUEST_TO_SPEAK,
    DiscordPermission.USE_SOUNDBOARD,
    DiscordPermission.USE_EXTERNAL_SOUNDS
  ],

  [PermissionCategory.MANAGEMENT]: [
    DiscordPermission.MANAGE_CHANNELS,
    DiscordPermission.CHANGE_NICKNAME,
    DiscordPermission.MANAGE_WEBHOOKS,
    DiscordPermission.MANAGE_EMOJIS_AND_STICKERS,
    DiscordPermission.MANAGE_EVENTS,
    DiscordPermission.MANAGE_THREADS,
    DiscordPermission.CREATE_PUBLIC_THREADS,
    DiscordPermission.CREATE_PRIVATE_THREADS,
    DiscordPermission.USE_EMBEDDED_ACTIVITIES
  ],

  [PermissionCategory.MODERN]: [DiscordPermission.CREATE_EXPRESSIONS, DiscordPermission.CREATE_EVENTS],

  [PermissionCategory.CUSTOM]: []
} as const;

export interface PermissionAnalysis {
  permissions: DiscordPermission[];
  permissionNames: string[];
  totalCount: number;
  isAdministrator: boolean;
  isStaff: boolean;
  categories: Record<PermissionCategory, DiscordPermission[]>;
  customBits: bigint[];
}

export class PermissionsUtilities {
  public static analyze(bitfield: bigint): PermissionAnalysis {
    const permissions: DiscordPermission[] = [];
    const permissionNames: string[] = [];
    const customBits: bigint[] = [];

    const knownPermissions = new Set<bigint>(Object.values(DiscordPermission));

    // Check each permission enum value
    for (const [name, value] of Object.entries(DiscordPermission)) {
      if (typeof value === "bigint" && this.hasPermission(bitfield, value)) {
        permissions.push(value);
        permissionNames.push(name);
      }
    }

    // Find custom/unknown bits (bits set but not in enum)
    for (let i = 0n; i < 64n; i++) {
      const bitValue = 1n << i;
      if ((bitfield & bitValue) === bitValue && !knownPermissions.has(bitValue)) {
        customBits.push(bitValue);
      }
    }

    const categories = this.categorizePermissions(permissions);
    const isAdministrator = permissions.includes(DiscordPermission.ADMINISTRATOR);
    const isStaff = isAdministrator || categories[PermissionCategory.ADMINISTRATIVE].length >= 2 || categories[PermissionCategory.MODERATION].length >= 2;

    return {
      permissions,
      permissionNames,
      totalCount: permissions.length + customBits.length,
      isAdministrator,
      isStaff,
      categories,
      customBits
    };
  }

  public static hasPermission(bitfield: bigint, permission: DiscordPermission): boolean {
    return (bitfield & permission) === permission;
  }

  public static hasAnyPermission(bitfield: bigint, permissions: DiscordPermission[]): boolean {
    const combinedPermissions = permissions.reduce((acc, perm) => acc | perm, 0n);
    return (bitfield & combinedPermissions) !== 0n;
  }

  public static hasAllPermissions(bitfield: bigint, permissions: DiscordPermission[]): boolean {
    const combinedPermissions = permissions.reduce((acc, perm) => acc | perm, 0n);
    return (bitfield & combinedPermissions) === combinedPermissions;
  }

  private static categorizePermissions(permissions: DiscordPermission[]): Record<PermissionCategory, DiscordPermission[]> {
    const result = {} as Record<PermissionCategory, DiscordPermission[]>;

    // Initialize all categories
    Object.values(PermissionCategory).forEach((category) => {
      result[category] = [];
    });

    // Categorize each permission
    permissions.forEach((permission) => {
      let categorized = false;

      for (const [category, categoryPermissions] of Object.entries(PERMISSION_CATEGORIES)) {
        if (categoryPermissions.includes(permission)) {
          result[category as PermissionCategory].push(permission);
          categorized = true;
          break;
        }
      }

      // If not in any predefined category, add to custom
      if (!categorized) {
        result[PermissionCategory.CUSTOM].push(permission);
      }
    });

    return result;
  }

  private static getPermissionBitPosition(permission: DiscordPermission): number {
    return Math.log2(Number(permission));
  }
}
