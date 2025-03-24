import path from "path";
import { fileURLToPath } from "url";

export class GeneralUtilities {
  public static async sleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  public static getTimeStamp(): string {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };

    return new Date().toLocaleString(undefined, options).replace(/,/g, " ").replace(/ {2}/g, " ");
  }

  public static getDirName(url: string): string {
    const __filename = fileURLToPath(url);
    return path.dirname(__filename);
  }
}
