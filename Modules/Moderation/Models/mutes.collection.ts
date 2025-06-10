import { Snowflake } from "discord.js";
import { BaseCollection } from "../../Base/Models/base.collection.js";
import { MutedMember, MutedMemberEntity } from "../Types/mutes.types.js";

export class MutedMemberCollection extends BaseCollection<MutedMemberEntity> {
  private static instance: MutedMemberCollection;

  constructor() {
    super("mutes");
  }

  /** Singleton Accessor */
  public static getInstance(): MutedMemberCollection {
    if (!MutedMemberCollection.instance) {
      MutedMemberCollection.instance = new MutedMemberCollection();
    }
    return MutedMemberCollection.instance;
  }

  public async insertMutedMember(entry: MutedMember) {
    return this.insert(entry);
  }

  public async editMutedMember(id: Snowflake, ...args: Partial<MutedMember>[]) {
    return this.update({ id }, Object.assign({}, ...args));
  }

  public async getMutedMemberById(id: Snowflake) {
    return this.getOneByQuery({ id });
  }

  public async upsertMutedMember(id: Snowflake, ...args: Partial<MutedMember>[]) {
    const existing = await this.getOneByQuery({ id });

    if (existing) {
      const duration = existing.duration + args.reduce((sum, arg) => sum + (arg.duration || 0), 0);
      await this.editMutedMember(id, ...args, { duration });
    } else {
      await this.insert(Object.assign({}, ...args));
    }
  }

  public async deleteMutedMember(id: Snowflake) {
    return this.deleteByQuery({ id });
  }

  public async getExpiredMutedMembers(): Promise<MutedMemberEntity[]> {
    const currentTimestamp = Date.now();

    const query = {
      permanent: { $ne: true },
      $expr: {
        $lt: [{ $add: ["$timestamp", { $multiply: ["$duration", 60000] }] }, currentTimestamp]
      }
    };

    return this.getByQuery(query);
  }
}
