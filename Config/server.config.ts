import { Configuration } from "./root.config.js";

interface IServerConfig {
  host: string;
  port: number;
}

export const server: Configuration<IServerConfig> = {
  development: {
    host: "http://localhost",
    port: 3000
  },
  stage: {
    host: "http://localhost",
    port: 3000
  },
  production: {
    host: process.env.HOST,
    port: Number(process.env.PORT)
  }
};
