import { Configuration } from "./root.config.js";

interface IMongoConfig {
  host: string;
}

export const mongodb: Configuration<IMongoConfig> = {
  development: {
    host: "mongodb://127.0.0.1:27017"
  },
  production: {
    host: `${process.env.MONGO_URL}`
  }
};
