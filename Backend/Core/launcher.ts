import { BaseCollection } from "../Modules/Base/Models/base.collection.js";
import { Bot } from "./Bot/bot.js";
import { MongoDB } from "./Db/mongodb.js";
import { Server } from "./Server/server.js";

export class Launcher {
  public static async start(): Promise<void> {
    await MongoDB.connect();
    await Bot.getInstance().init();
    await Server.getInstance().start();

    BaseCollection.initializeDatabase(MongoDB.getDatabase());
  }
}
