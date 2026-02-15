import { BaseReport, Report } from "../Types/report.types.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Snowflake } from "discord.js";
import { systemPrefix } from "../Config/report.config.js";

type SetFieldsParams = {
  content: string;
  attachments: Report["attachments"];
  reporter: Snowflake;
  target: Snowflake;
  source: string;
  resolver?: Snowflake;
  action: Report["action"];
};

export class ReportUtilities {
  public static createReportEmbed({
    reporterId,
    targetId,
    content,
    attachments,
    reportedMessageUrl,
    resolver,
    reportDetail,
    action,
    reportId
  }: BaseReport & { reportId?: string; resolver?: Snowflake; action?: Report["action"] }) {
    return new Embed({
      title: `Message Report`,
      description: `**__Report details:__**\n${reportDetail}`,
      fields: this.setFields({ content, attachments, reporter: reporterId, target: targetId, source: reportedMessageUrl, resolver, action }),
      footer: { text: `Report ID: ${reportId}` }
    });
  }

  public static createReportResolvedEmbed(reportId: string) {
    return new Embed({
      title: `Report resolved`,
      description: `Your report \`${reportId}\` has been resolved. Thank you very much!`
    });
  }

  public static createReportFalseEmbed(reportId: string) {
    return new Embed({
      title: `Report flagged as false`,
      description: `Your report \`${reportId}\` has been flagged as false. Contact support for further information`
    });
  }

  public static formatReportedMessageUrl(reportedMessageUrl: string) {
    return `[Message](${reportedMessageUrl})`;
  }

  private static setFields({ content, attachments, reporter, target, source, resolver, action }: SetFieldsParams) {
    const actionText = this.resolveActionText(action);
    return [
      ...(content ? [{ name: "Content", value: content }] : []),
      ...(attachments.length ? [{ name: "Attachments", value: `${attachments.map((a) => `[**${a.filename}**](${a.url}) (${a.size}B)`)}` }] : []),
      { name: "Reporter", value: `<@${reporter}>`, inline: true },
      { name: "Reported", value: `<@${target}>`, inline: true },
      { name: "Source", value: this.formatReportedMessageUrl(source), inline: true },
      { name: "Status", value: resolver ? `✅ Resolved by <@${resolver}>` : "❌ Not resolved" },
      ...(actionText ? [{ name: "Action", value: actionText }] : [])
    ];
  }

  public static createReportRow(reportedMessageId: string) {
    const buttons: Array<ButtonBuilder> = [];

    buttons.push(
      new ButtonBuilder().setCustomId(`${systemPrefix}-${reportedMessageId}-neutral`).setLabel("Ignore").setStyle(ButtonStyle.Secondary).setEmoji("👍🏼"),
      new ButtonBuilder().setCustomId(`${systemPrefix}-${reportedMessageId}-false`).setLabel("False").setStyle(ButtonStyle.Primary).setEmoji("❌"),
      new ButtonBuilder().setCustomId(`${systemPrefix}-${reportedMessageId}-delete`).setLabel("Delete").setStyle(ButtonStyle.Primary).setEmoji("💬"),
      new ButtonBuilder().setCustomId(`${systemPrefix}-${reportedMessageId}-warn`).setLabel("Warn").setStyle(ButtonStyle.Danger).setEmoji("👮🏼")
    );
    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
  }

  private static resolveActionText(action: Report["action"]) {
    switch (action) {
      case "neutral":
        return "👍🏼 No action was made";
      case "false":
        return "❌ False report";
      case "delete":
        return "💬 Message deleted";
      case "warn":
        return "👮🏼 Message deleted & member warned";
      default:
        return "";
    }
  }

  public static updateReportEmbed({}) {}
}
