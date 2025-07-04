import { Collection } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";

type DeepAssignable = Record<string | number | symbol, any>;

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

  public static capitalize(text: string): string {
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private static isPlainObject(value: any): value is DeepAssignable {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof value !== "function" &&
      !(value instanceof Date) &&
      !(value instanceof RegExp) &&
      !(value instanceof Map) &&
      !(value instanceof Set)
    );
  }

  public static deepMerge<T extends DeepAssignable, U extends DeepAssignable>(target: T, source: U): T & U {
    // Handle edge cases - these represent the boundary conditions of our recursive definition
    if (!this.isPlainObject(target)) {
      throw new Error("Target must be a plain object");
    }
    if (!this.isPlainObject(source)) {
      throw new Error("Source must be a plain object");
    }

    // Initial element
    const result = { ...target } as T & U;

    // Iterate through source properties - this implements the union dom(a) ∪ dom(b)
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key as keyof typeof result];

        // If both values are plain objects, we recurse (structural induction step)
        if (this.isPlainObject(targetValue) && this.isPlainObject(sourceValue)) {
          (result as any)[key] = this.deepMerge(targetValue, sourceValue);
        } else {
          (result as any)[key] = sourceValue;
        }
      }
    }

    return result;
  }

  public static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  public static formatTimeDifference(startStamp: number) {
    const uptimeMs = Date.now() - startStamp;

    const totalSeconds = Math.floor(uptimeMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
  }

  public static collectionToArray<T>(collection: Collection<string, T>): Array<T> {
    return collection.map((item) => item);
  }
}
