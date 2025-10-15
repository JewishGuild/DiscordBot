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
    REPORTS_CHANNEL: string;
    NODE_ENV: "development" | "stage" | "production";
  }
}
