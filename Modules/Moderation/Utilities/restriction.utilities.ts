import { Colors, Snowflake } from "discord.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { RestrictionDurations } from "../Config/restriction.config.js";

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
}

interface WarnEmbedParams {
  id: Snowflake;
  moderatorId: Snowflake;
  reason: string;
}

interface UnwarnEmbedParams {
  moderatorId: Snowflake;
  success: boolean;
  warnId: string;
}

export class RestrictionUtilities {
  public static createMuteEmbed({ id, moderatorId, duration, reason, roles }: MuteEmbedParams) {
    const roleText = roles.length ? `\nRemoved Roles: ${roles.map((role) => `<@&${role}>`).join(" ")}` : "";
    return new Embed(
      {
        color: Colors.Green,
        description: `<@${id}> has been muted by <@${moderatorId}> ${
          duration === RestrictionDurations.Permanent ? "Permanently" : `for \`${duration}m\``
        } with reason: \`${reason}\`${roleText}`
      },
      { color: { state: false } }
    );
  }

  public static createUnmuteEmbed({ id, roles }: UnmuteEmbedParams) {
    const roleText = roles.length ? `\nReturned Roles: ${roles.map((role) => `<@&${role}>`).join(" ")}` : "";
    return new Embed(
      {
        color: Colors.Green,
        description: `<@${id}> has been unmuted.${roleText}`
      },
      { color: { state: false } }
    );
  }

  public static createWarnEmbed({ id, moderatorId, reason }: WarnEmbedParams) {
    return new Embed(
      { color: Colors.Green, description: `<@${id}> has been warned by <@${moderatorId}> with reason: \`${reason}\`` },
      { color: { state: false } }
    );
  }

  public static createUnwarnEmbed({ moderatorId, success, warnId }: UnwarnEmbedParams) {
    const description = success ? `Warning \`${warnId}\` has been revoked by <@${moderatorId}>` : `Warning \`${warnId}\` not found`;
    const color = success ? Colors.Green : Colors.Red;
    return new Embed({ color, description }, { color: { state: false } });
  }
}
