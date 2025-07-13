declare namespace NodeJS {
  interface ProcessEnv {
    HOST: string;
    PORT: string;
    MONGO_USER: string;
    MONGO_PASS: string;
    MONGO_CLUSTER: string;
    CLIENT_URL: string;
    BOT_TOKEN: string;
    WEBHOOK_URL: string;
    MONGO_URL: string;
    NODE_ENV: "development" | "production";
    VITE_DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
  }
}
