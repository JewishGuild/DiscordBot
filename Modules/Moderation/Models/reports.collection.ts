import { BaseCollection } from "../../Base/Models/base.collection.js";
import { Report, ReportEntity } from "../Types/report.types.js";
import { Snowflake } from "discord.js";

export class ReportsCollection extends BaseCollection<ReportEntity> {
  private static instance: ReportsCollection;

  constructor() {
    super("reports");
  }

  /** Singleton Accessor */
  public static getInstance(): ReportsCollection {
    if (!ReportsCollection.instance) {
      ReportsCollection.instance = new ReportsCollection();
    }
    return ReportsCollection.instance;
  }

  public async insertReport(entry: Report) {
    return this.insert(entry);
  }

  public async editReport(reportedMessageId: Snowflake, ...args: Partial<Report>[]) {
    return this.update({ reportedMessageId }, Object.assign({}, ...args));
  }

  public async getReportById(reportedMessageId: Snowflake) {
    return this.getOneByQuery({ reportedMessageId });
  }

  public async deleteReport(reportedMessageId: Snowflake) {
    return this.deleteByQuery({ reportedMessageId });
  }

  public async countFalseReportsByReporter(reporterId: Snowflake) {
    return this.countByQuery({ reporterId, ["false"]: true });
  }
}
