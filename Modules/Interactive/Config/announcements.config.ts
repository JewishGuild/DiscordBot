export enum AnnouncementCycle {
  Minute = "* * * * *",
  Hour = "0 * * * *",
  ThreeHours = "0 */3 * * *",
  SixHours = "0 */6 * * *",
  TwelveHours = "0 */12 * * *",
  Day = "0 18 * * *"
}

export const announcementCycles = [
  { name: "Every minute", value: AnnouncementCycle.Minute },
  { name: "Every hour", value: AnnouncementCycle.Hour },
  { name: "Every 3 hours", value: AnnouncementCycle.ThreeHours },
  { name: "Every 6 hours", value: AnnouncementCycle.SixHours },
  { name: "Every 12 hours", value: AnnouncementCycle.TwelveHours },
  { name: "Every day", value: AnnouncementCycle.Day }
];

export function resolveAnnouncementCycleName(value: AnnouncementCycle) {
  return announcementCycles.find((cycle) => cycle.value == value)?.name || "Not found";
}
