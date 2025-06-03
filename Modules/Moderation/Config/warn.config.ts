import { RestrictionDurations } from "./restriction.config.js";

export const warnAmount = new Map([
  [3, RestrictionDurations.ThirtyMinutes],
  [4, RestrictionDurations.OneHour],
  [5, RestrictionDurations.ThreeHours]
]);

export const maxWarningThreshHold = Math.max(...warnAmount.keys());
export const minWarningThreshHold = Math.min(...warnAmount.keys());
