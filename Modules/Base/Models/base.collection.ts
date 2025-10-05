import { Collection, Db, ObjectId, FindOptions, Filter, WithId, OptionalUnlessRequiredId, MatchKeysAndValues } from "mongodb";

export type BaseEntity = {
  _id: ObjectId;
  createDate?: Date;
  updateDate?: Date;
};

export abstract class BaseCollection<T extends BaseEntity> {
  protected collection: Collection<T>;
  private static db: Db;

  /** Sets the database instance globally */
  public static initializeDatabase(dbInstance: Db): void {
    if (!this.db) this.db = dbInstance;
  }

  constructor(public collectionName: string) {
    this.collection = BaseCollection.db.collection<T>(collectionName);
  }

  /** Logs messages if verbose mode is enabled */
  protected log(message: string): void {
    console.log(`[${this.collectionName}] ${message}`);
  }

  /** Converts MongoDB's `WithId<T>` to `T` while preserving the `_id` field */
  private static convertWithId<T extends BaseEntity>(doc: WithId<T> | null): T | null {
    return doc ? ({ ...doc, _id: doc._id } as unknown as T) : null;
  }

  /** Converts an array of `WithId<T>` to `T[]` */
  private static mapWithIdArray<T extends BaseEntity>(docs: WithId<T>[]): T[] {
    return docs.map((doc) => BaseCollection.convertWithId(doc)!);
  }

  /** Retrieves multiple documents based on a query */
  public async getByQuery(query: Filter<T> = {}, options?: FindOptions<T>): Promise<T[]> {
    const results = await this.collection.find(query, options).toArray();
    return BaseCollection.mapWithIdArray(results);
  }

  /** Retrieves a single document based on a query */
  public async getOneByQuery(query: Filter<T> = {}, options?: FindOptions<T>): Promise<T | null> {
    return await this.collection.findOne(query, options);
  }

  /** Retrieves a document by its `_id` */
  public async getById(id: string | ObjectId): Promise<T | null> {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await this.collection.findOne({ _id: objectId } as Filter<T>);
    return BaseCollection.convertWithId(result);
  }

  /** Inserts a new document while ensuring `createDate` and `updateDate` are set */
  public async insert(item: Omit<T, keyof BaseEntity>): Promise<T | null> {
    const newItem = {
      ...item,
      createDate: new Date(),
      updateDate: new Date()
    } as OptionalUnlessRequiredId<T>;

    const { insertedId } = await this.collection.insertOne(newItem);
    return this.getById(insertedId);
  }

  /** Deletes a document by `_id` */
  public async delete(id: string | ObjectId): Promise<boolean> {
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const { deletedCount } = await this.collection.deleteOne({ _id: objectId } as Filter<T>);
    return deletedCount > 0;
  }

  /** Deletes multiple documents matching a given query */
  public async deleteByQuery(query: Filter<T>): Promise<number> {
    const { deletedCount } = await this.collection.deleteMany(query);
    return deletedCount;
  }

  /** Clears all documents from the collection, with an optional filter for safety */
  public async clearCollection(query: Filter<T> = {}): Promise<number> {
    const { deletedCount } = await this.collection.deleteMany(query);
    return deletedCount;
  }

  /** Updates a single document while ensuring `updateDate` is updated */
  public async update(filters: Filter<T>, replacers: Partial<T>): Promise<T | null> {
    const { _id, ...safeReplacers } = replacers;
    safeReplacers.updateDate = new Date();

    const updated = await this.collection.findOneAndUpdate(filters, { $set: safeReplacers as MatchKeysAndValues<T> }, { returnDocument: "after" });
    return BaseCollection.convertWithId(updated);
  }

  /** Updates multiple documents while ensuring `updateDate` is updated */
  public async updateMany(filters: Filter<T>, replacers: Partial<T>): Promise<number> {
    const { _id, ...safeReplacers } = replacers;
    safeReplacers.updateDate = new Date();

    const { modifiedCount } = await this.collection.updateMany(filters, { $set: safeReplacers as MatchKeysAndValues<T> });
    return modifiedCount;
  }

  /** Counts documents that align with the query */
  public async countByQuery(query: Filter<T> = {}): Promise<number> {
    return this.collection.countDocuments(query);
  }
}
