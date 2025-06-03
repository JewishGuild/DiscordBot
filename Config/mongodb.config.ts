import { Configuration } from "./root.config.js";

interface IMongoConfig {
  host: string;
}

export const mongodb: Configuration<IMongoConfig> = {
  development: {
    host: "mongodb://127.0.0.1:27017"
  },
  production: {
    host: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}`
  }
};
