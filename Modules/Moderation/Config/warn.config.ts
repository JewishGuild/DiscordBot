import { RestrictionDurations } from "./restriction.config.js";

export const warnAmount = new Map([
  [3, RestrictionDurations.SixHours],
  [4, RestrictionDurations.TwelveHours],
  [5, RestrictionDurations.OneDay],
  [6, RestrictionDurations.ThreeDays],
  [7, RestrictionDurations.OneWeek]
]);

export const maxWarningThreshHold = Math.max(...warnAmount.keys());
export const minWarningThreshHold = Math.min(...warnAmount.keys());
