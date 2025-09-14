import { ActionRowBuilder, ButtonBuilder, Guild, Message, Snowflake, TextChannel } from "discord.js";
import { ReportsCollection } from "../Models/reports.collection.js";
import { BaseReport, Report } from "../Types/report.types.js";
import { reportsChannel } from "../Config/report.config.js";
import { ChannelService } from "../../../Api/Guild/Channel/channel.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { ReportUtilities } from "../Utilities/report.utilities.js";

type HandleReportSubmissionParams = {
  guild: Guild;
} & BaseReport;

type SubmitReportMessageParams = {
  embed: Embed;
  row: ActionRowBuilder<ButtonBuilder>;
  guild: Guild;
};

type HandleReportResolveParams = {
  resolver: Snowflake;
  message: Message;
  reportedMessageId: Report["reportedMessageId"];
};

type ResolveReportMessageParams = {
  embed: Embed;
  row: ActionRowBuilder<ButtonBuilder>;
  message: Message;
};

export class ReportService {
  public static async handleReportSubmission(args: HandleReportSubmissionParams) {
    const { guild, reporterId, targetId, reportedMessageId, reportedMessageUrl, attachments, content } = args;
    const exists = await ReportsCollection.getInstance().getReportById(reportedMessageId);
    if (exists) throw new Error(`There's already an existing report on ${ReportUtilities.formatReportedMessageUrl(reportedMessageUrl)}`);

    const embed = ReportUtilities.createReportEmbed({ reporterId, targetId, content, attachments, reportedMessageUrl, reportedMessageId });
    const row = ReportUtilities.createReportRow(reportedMessageId, false);
    await this.submitReportMessage({ embed, row, guild });

    const report: Report = {
      reporterId,
      targetId,
      reportedMessageId,
      reportedMessageUrl,
      attachments,
      content,
      resolved: false,
      resolvedBy: ""
    };
    await ReportsCollection.getInstance().insertReport(report);
  }

  private static async resolveReportsChannel(guild: Guild) {
    const channelService = new ChannelService(guild);
    return await channelService.getChannelById<TextChannel>(reportsChannel);
  }

  private static async submitReportMessage({ embed, row, guild }: SubmitReportMessageParams) {
    const channel = await this.resolveReportsChannel(guild);
    return await channel.send({ embeds: [embed], components: [row] });
  }

  public static async handleReportResolve({ resolver, message, reportedMessageId }: HandleReportResolveParams) {
    const reportDoc = await ReportsCollection.getInstance().getReportById(reportedMessageId);
    if (!reportDoc) throw new Error("Invalid entry.");

    const { reporterId, targetId, content, attachments, reportedMessageUrl } = reportDoc;
    const embed = ReportUtilities.createReportEmbed({ reporterId, targetId, content, attachments, reportedMessageUrl, reportedMessageId, resolver });
    const row = ReportUtilities.createReportRow(reportedMessageId, true);
    await ReportsCollection.getInstance().editReport(reportedMessageId, { resolved: true, resolvedBy: resolver });
    await this.editReportMessage({ message, embed, row });
  }

  private static async editReportMessage({ embed, row, message }: ResolveReportMessageParams) {
    return await message.edit({ embeds: [embed], components: [row] });
  }
}
