import { Snowflake } from "discord.js";
import { BaseCollection } from "../../Base/Models/base.collection.js";
import { Warning, WarningEntity } from "../Types/warns.types.js";

export class WarnsCollection extends BaseCollection<WarningEntity> {
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
    return this.insert(entry) as Promise<WarningEntity>;
  }

  public async editWarning(id: Snowflake, ...args: Partial<Warning>[]) {
    return this.update({ id }, Object.assign({}, ...args));
  }

  public async getWarningsById(id: Snowflake) {
    return this.getByQuery({ id });
  }
}
