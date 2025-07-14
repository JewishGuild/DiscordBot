export enum RestrictionRoles {
  Muted = "1369728233666252802"
}

export enum RestrictionChannels {
  MutedText = "1371995539276824668"
}

export enum RestrictionDurations {
  OneMinute = 1,
  FiveMinutes = 5,
  FifteenMinutes = 15,
  ThirtyMinutes = 30,
  OneHour = 60,
  ThreeHours = 180,
  SixHours = 360,
  TwelveHours = 720,
  OneDay = 1440,
  ThreeDays = 4320,
  OneWeek = 10080,
  Permanent = -1
}

export const muteDurations = [
  // { name: "1 Min", value: RestrictionDurations.OneMinute },
  { name: "5 Min", value: RestrictionDurations.FiveMinutes },
  { name: "15 Min", value: RestrictionDurations.FifteenMinutes },
  { name: "30 Min", value: RestrictionDurations.ThirtyMinutes },
  { name: "1 Hour", value: RestrictionDurations.OneHour },
  { name: "3 Hours", value: RestrictionDurations.ThreeHours },
  { name: "6 Hours", value: RestrictionDurations.SixHours },
  { name: "12 Hours", value: RestrictionDurations.TwelveHours },
  { name: "1 Day", value: RestrictionDurations.OneDay },
  { name: "3 Days", value: RestrictionDurations.ThreeDays },
  { name: "1 Week", value: RestrictionDurations.OneWeek },
  { name: "Permanent", value: RestrictionDurations.Permanent }
];

export function muteDmFormatter(duration: number, reason: string) {
  const estimatedDuration = Math.floor(Date.now() / 1000) + duration * 60;
  return `⛔ You have been muted in JewishGuild server. You will be muted ${
    duration <= RestrictionDurations.Permanent ? "permanently" : `until <t:${estimatedDuration}:F>`
  } with reason: \`${reason}\``;
}

export function warnDmFormatter(reason: string) {
  return `⚠️ You have been warned in JewishGuild server. Reason is: \`${reason}\``;
}
