import { Snowflake } from "discord.js";
import { BaseCollection } from "../../Base/Models/base.collection.js";
import { MutedMember, MutedMemberEntity } from "../Types/mutes.types.js";
import { RestrictionDurations } from "../Config/restriction.config.js";

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
    let final: MutedMemberEntity | null;

    if (existing) {
      if (existing.permanent) throw new Error(`Member <@${id}> is already permanently muted.`);

      const duration = existing.duration + args.reduce((sum, arg) => sum + (arg.duration == RestrictionDurations.Permanent ? 0 : arg.duration || 0), 0);
      final = await this.editMutedMember(id, ...args, { duration, roles: existing.roles, timestamp: existing.timestamp });
    } else {
      final = await this.insert(Object.assign({}, ...args));
    }
    return final as MutedMemberEntity;
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
