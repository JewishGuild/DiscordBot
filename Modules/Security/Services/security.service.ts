import { AuditLogEvent, Guild, Snowflake } from "discord.js";
import { GeneralUtilities } from "../../../Utilities/general.utilities.js";

type FetchMatchingAuditLogEntryParams = {
  guild: Guild;
  targetId: Snowflake;
  type: AuditLogEvent;
  eventAt: number;
};

export class SecurityService {
  public static async fetchMatchingAuditLogEntry({ guild, type, targetId, eventAt }: FetchMatchingAuditLogEntryParams) {
    const timeoutDuration = 1500;
    const retryDuration = 250;
    const recent = 5000;
    const deadline = Date.now() + timeoutDuration;

    while (Date.now() < deadline) {
      try {
        const logs = await guild.fetchAuditLogs({ type, limit: 5 });
        const entry =
          logs?.entries.find((e) => {
            const target = e.target;
            //@ts-ignore
            const isMatchingTarget = target?.id === targetId;
            const isRecent = e.createdTimestamp >= eventAt - recent;
            return isMatchingTarget && isRecent;
          }) ?? null;

        if (entry) return entry;
      } catch {
      } finally {
        await GeneralUtilities.sleep(retryDuration);
      }
    }
    return null;
  }
}
