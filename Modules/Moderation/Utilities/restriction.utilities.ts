import { Colors, Snowflake } from "discord.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { RestrictionDurations } from "../Config/restriction.config.js";
import { TimeUtilities } from "../../../Utilities/time.utilities.js";

interface MuteEmbedParams {
  id: Snowflake;
  moderatorId: Snowflake;
  duration: number;
  reason: string;
  roles: Array<Snowflake>;
}

interface UnmuteEmbedParams {
  id: Snowflake;
  roles: Array<Snowflake>;
  expired: boolean;
}

interface WarnEmbedParams {
  id: Snowflake;
  moderatorId: Snowflake;
  reason: string;
  warnId: string;
}

interface UnwarnEmbedParams {
  moderatorId: Snowflake;
  warnId: string;
  userId: string;
}

export class RestrictionUtilities {
  public static createMuteEmbed({ id, moderatorId, duration, reason, roles }: MuteEmbedParams) {
    const roleText = roles.length ? `\nRemoved Roles: ${roles.map((role) => `<@&${role}>`).join(" ")}` : "";
    return new Embed(
      {
        color: Colors.Green,
        description: `<@${id}> has been muted by <@${moderatorId}> ${
          duration === RestrictionDurations.Permanent ? "Permanently" : `for \`${TimeUtilities.formatMinutes(duration)}\``
        } with reason: \`${reason}\`${roleText}`
      },
      { color: { state: false } }
    );
  }

  public static createUnmuteEmbed({ id, roles, expired }: UnmuteEmbedParams) {
    const roleText = roles.length ? `\nReturned Roles: ${roles.map((role) => `<@&${role}>`).join(" ")}` : "";
    const reason = expired ? `due to duration expire.` : `manually.`;
    return new Embed(
      {
        color: Colors.Green,
        description: `<@${id}> has been unmuted ${reason}${roleText}`
      },
      { color: { state: false } }
    );
  }

  public static createWarnEmbed({ id, moderatorId, reason, warnId }: WarnEmbedParams) {
    return new Embed(
      { color: Colors.Green, description: `<@${id}> has been warned by <@${moderatorId}> with reason: \`${reason}\`\nWarn id: \`${warnId}\`` },
      { color: { state: false } }
    );
  }

  public static createUnwarnEmbed({ moderatorId, warnId, userId }: UnwarnEmbedParams) {
    return new Embed(
      { color: Colors.Green, description: `User's <@${userId}> warning \`${warnId}\` has been revoked by <@${moderatorId}>` },
      { color: { state: false } }
    );
  }

  public static formatMuteDM(permanent: boolean, duration: number, reason: string) {
    const estimatedDuration = Math.floor(Date.now() / 1000) + duration * 60;
    return `⛔ You have been muted in JewishGuild server. You will be muted ${
      permanent ? "permanently" : `until ${TimeUtilities.formatMinutes(estimatedDuration)}`
    } with reason: \`${reason}\``;
  }

  public static formatUnmuteDM(expire: boolean) {
    return expire ? `🕛 Your mute duration has expired in JewishGuild server.` : `✅ Your mute was revoked by the moderation team in JewishGuild server.`;
  }

  public static formatWarnDM(reason: string, id: string) {
    return `⚠️ You have been warned in JewishGuild server. Reason is: \`${reason}\``;
  }

  public static formatUnwarnDM(id: string) {
    return `✅ Warning \`${id}\` has been revoked by the moderation team in JewishGuild server.`;
  }
}
