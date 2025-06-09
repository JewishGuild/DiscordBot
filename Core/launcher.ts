import { BaseCollection } from "../Modules/Base/Models/base.collection.js";
import { Bot } from "./Bot/bot.js";
import { MongoDB } from "./Db/mongodb.js";
import { RootJob } from "./Server/root.job.js";
import { Server } from "./Server/server.js";

export class Launcher {
  public static async start(): Promise<void> {
    await MongoDB.connect();
    BaseCollection.initializeDatabase(MongoDB.getDatabase());

    await Server.getInstance().start();
    await Bot.getInstance().init();

    RootJob.startAll();
  }
}
