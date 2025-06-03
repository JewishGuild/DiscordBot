declare namespace NodeJS {
  interface ProcessEnv {
    HOST: string;
    PORT: string;
    MONGO_USER: string;
    MONGO_PASS: string;
    MONGO_CLUSTER: string;
    CLIENT_URL: string;
    BOT_TOKEN: string;
    NODE_ENV: "development" | "production";
  }
}
