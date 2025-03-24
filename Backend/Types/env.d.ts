declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    MONGO_USER: string;
    MONGO_PASS: string;
    MONGO_CLUSTER: string;
    SESSION_SECRET: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;
    CLIENT_URL: string;
    BOT_TOKEN: string;
    NODE_ENV: "development" | "production";
  }
}
