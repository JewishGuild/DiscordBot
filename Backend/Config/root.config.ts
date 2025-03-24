import { mongodb } from "../Config/mongodb.config.js";
import { server } from "./server.config.js";

export type ConfigurationKey = "development" | "production";

export type ConfigurationValue<T> = {
  [K in keyof T]: T[K];
};

export type Configuration<T> = {
  [E in ConfigurationKey]: ConfigurationValue<T>;
};

const environment = process.env.NODE_ENV || "development";

export const config = {
  environment,
  appName: "K02",
  mongodb: mongodb[environment],
  server: server[environment]
};
