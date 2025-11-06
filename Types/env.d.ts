declare namespace NodeJS {
  interface ProcessEnv {
    /* Irrelevant for now */
    HOST: string;
    PORT: string;
    MONGO_USER: string;
    MONGO_PASS: string;
    MONGO_CLUSTER: string;
    CLIENT_URL: string;
    MONGO_URL: string;

    /* Needed */
    BOT_TOKEN: string;
    WEBHOOK_URL: string;
    REPORTS_CHANNEL_ID: string;
    MUTED_ROLE_ID: string;
    MUTE_APPEAL_ROLE_ID: string;
    MUTED_CHANNEL_ID: string;
    MEMBER_ROLE_ID: string;
    NODE_ENV: "development" | "stage" | "production";
  }
}
