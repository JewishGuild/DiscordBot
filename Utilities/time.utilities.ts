import moment from "moment";

export class TimeUtilities {
  public static formatMinutes(minutes: number): string {
    if (minutes <= 0) return "0m";

    const mins = Math.max(0, Math.floor(moment.duration(minutes, "minutes").asMinutes()));

    const MIN_PER_H = 60;
    const MIN_PER_D = 60 * 24;
    const MIN_PER_W = MIN_PER_D * 7;

    const w = Math.floor(mins / MIN_PER_W);
    let r = mins % MIN_PER_W;

    const d = Math.floor(r / MIN_PER_D);
    r %= MIN_PER_D;

    const h = Math.floor(r / MIN_PER_H);
    const m = r % MIN_PER_H;

    const parts: string[] = [];
    if (w) parts.push(`${w}w`);
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m || parts.length === 0) parts.push(`${m}m`);
    return parts.join(" ");
  }

  public static formatLocalizedTime(normalizedEpoc: number): `<t:${string}:F>` {
    return `<t:${normalizedEpoc}:F>`;
  }
}
