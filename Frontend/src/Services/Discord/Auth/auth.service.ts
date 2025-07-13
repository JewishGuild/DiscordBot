import { BaseDiscordSDKService } from "../base.service";

export class DiscordAuthService extends BaseDiscordSDKService {
  private currentUserId: string | null = null;

  /** Get Discord authorization code via OAuth2 flow */
  public async getAuthorizationCode(): Promise<string> {
    const sdk = await this.getSDK();

    const { code } = await sdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "applications.commands", "rpc.activities.write"]
    });

    return code;
  }

  /** Authenticate with Discord using access token */
  public async authenticateWithToken(accessToken: string): Promise<any> {
    const sdk = await this.getSDK();

    const auth = await sdk.commands.authenticate({
      access_token: accessToken
    });

    if (!auth) {
      throw new Error("Discord authentication failed");
    }

    this.currentUserId = auth.user.id;
    return auth;
  }

  /** Get current authenticated user's data */
  public async getCurrentUser() {
    const sdk = await this.getSDK();
    return await sdk.commands.getUser({ id: this.currentUserId! });
  }

  /** Check if user is currently authenticated with Discord */
  public async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}
