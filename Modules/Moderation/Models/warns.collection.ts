import { Snowflake } from "discord.js";
import { BaseCollection } from "../../Base/Models/base.collection.js";
import { Warning, WarningEntry } from "../Types/warns.types.js";
import { ObjectId } from "mongodb";

export class WarnsCollection extends BaseCollection<WarningEntry> {
  private static instance: WarnsCollection;

  constructor() {
    super("warns");
  }

  /** Singleton Accessor */
  public static getInstance(): WarnsCollection {
    if (!WarnsCollection.instance) {
      WarnsCollection.instance = new WarnsCollection();
    }
    return WarnsCollection.instance;
  }

  public async insertWarning(entry: Warning) {
    return this.insert(entry);
  }

  public async editWarning(id: Snowflake, ...args: Partial<Warning>[]) {
    return this.update({ id }, Object.assign({}, ...args));
  }

  public async getWarningsById(id: Snowflake) {
    return this.getByQuery({ id });
  }
}
