import { ActionRowBuilder, ButtonBuilder, Guild, Message, Snowflake, TextChannel } from "discord.js";
import { ReportsCollection } from "../Models/reports.collection.js";
import { BaseReport, Report, ReportAction } from "../Types/report.types.js";
import { reportsChannel } from "../Config/report.config.js";
import { ChannelService } from "../../../Api/Guild/Channel/channel.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { ReportUtilities } from "../Utilities/report.utilities.js";
import { RestrictionService } from "./restriction.service.js";
import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { MessageService } from "../../../Api/Guild/Channel/TextChannel/Message/message.service.js";

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
  action: ReportAction;
};

type ResolveReportMessageParams = {
  embed: Embed;
  row?: ActionRowBuilder<ButtonBuilder>;
  message: Message;
};

type HandleFalseReportParams = {
  resolver: Snowflake;
  reporterId: Snowflake;
  message: Message;
};

export class ReportService {
  public static async handleReportSubmission(args: HandleReportSubmissionParams) {
    const { guild, reporterId, targetId, reportedMessageId, reportedMessageUrl, attachments, content, reportDetail } = args;
    const exists = await ReportsCollection.getInstance().getReportById(reportedMessageId);
    if (exists) throw new Error(`There's already an existing report on ${ReportUtilities.formatReportedMessageUrl(reportedMessageUrl)}`);

    const embed = ReportUtilities.createReportEmbed({ reporterId, targetId, content, reportDetail, attachments, reportedMessageUrl, reportedMessageId });
    const row = ReportUtilities.createReportRow(reportedMessageId);
    await this.submitReportMessage({ embed, row, guild });

    const report: Report = {
      reporterId,
      targetId,
      reportedMessageId,
      reportedMessageUrl,
      attachments,
      content,
      reportDetail,
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

  public static async handleReportResolve({ resolver, message, reportedMessageId, action }: HandleReportResolveParams) {
    const reportDoc = await ReportsCollection.getInstance().getReportById(reportedMessageId);
    if (!reportDoc) throw new Error("Invalid entry.");

    const { _id, reporterId, targetId, content, attachments, reportedMessageUrl, reportDetail } = reportDoc;

    if (action === "delete" || action === "warn") {
      try {
        const channelService = new ChannelService(message.guild as Guild);
        const reportedMessageChannel = await channelService.getChannelById<TextChannel>(
          reportedMessageUrl.split("/")[reportedMessageUrl.split("/").length - 2]
        );
        const messageService = new MessageService(message.guild as Guild, reportedMessageChannel);
        const reportedMessage = await messageService.resolveMessageById(reportedMessageId);
        await reportedMessage.delete();
      } catch (err) {}

      if (action === "warn") {
        const memberService = new MemberService(message.guild as Guild);
        const member = await memberService.resolveMemberById(targetId);
        await RestrictionService.warnMember({ member, moderatorId: resolver, reason: `Was found guilty under report id "\`${_id.toString()}\`"` });
      }
    }

    const embed = ReportUtilities.createReportEmbed({
      reporterId,
      targetId,
      content,
      attachments,
      reportedMessageUrl,
      reportedMessageId,
      resolver,
      reportDetail,
      action
    });
    await ReportsCollection.getInstance().editReport(reportedMessageId, { resolved: true, resolvedBy: resolver, false: action === "false", action });
    await this.editReportMessage({ message, embed });
    if (action === "false") await this.handleFalseReport({ resolver, reporterId, message });
  }

  public static async handleFalseReport({ resolver, reporterId, message }: HandleFalseReportParams) {
    const falseReportsCount = await ReportsCollection.getInstance().countFalseReportsByReporter(reporterId);

    if (falseReportsCount > 0 && falseReportsCount % 5 === 0) {
      const memberService = new MemberService(message.guild as Guild);
      const member = await memberService.resolveMemberById(reporterId);
      await RestrictionService.warnMember({ member, moderatorId: resolver, reason: `Too many false reports.` });
    }
  }

  private static async editReportMessage({ embed, row, message }: ResolveReportMessageParams) {
    return await message.edit({ embeds: [embed], components: row ? [row] : [] });
  }
}
