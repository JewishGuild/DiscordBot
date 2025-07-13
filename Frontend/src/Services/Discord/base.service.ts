import { DiscordSDK } from "@discord/embedded-app-sdk";
import { HttpService } from "../http.service";

export abstract class BaseDiscordSDKService extends HttpService {
  private static sdkInstance: DiscordSDK | null = null;
  private static isInitialized = false;

  protected static async ensureSDKInitialized(): Promise<DiscordSDK> {
    if (!BaseDiscordSDKService.sdkInstance) {
      BaseDiscordSDKService.sdkInstance = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
    }

    if (!BaseDiscordSDKService.isInitialized) {
      await BaseDiscordSDKService.sdkInstance.ready();
      BaseDiscordSDKService.isInitialized = true;
      console.log("Discord SDK initialized");
    }

    return BaseDiscordSDKService.sdkInstance;
  }

  protected async getSDK(): Promise<DiscordSDK> {
    return BaseDiscordSDKService.ensureSDKInitialized();
  }

  protected static isReady(): boolean {
    return BaseDiscordSDKService.isInitialized;
  }

  public static async initialize(): Promise<void> {
    await BaseDiscordSDKService.ensureSDKInitialized();
  }
}
