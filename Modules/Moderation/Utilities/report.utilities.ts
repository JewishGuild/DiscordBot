import { BaseReport } from "../Types/report.types.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Snowflake } from "discord.js";
import { systemPrefix } from "../Config/report.config.js";

type SetFieldsParams = {
  reporter: Snowflake;
  target: Snowflake;
  source: string;
  resolver?: Snowflake;
};

export class ReportUtilities {
  public static createReportEmbed({ reporterId, targetId, content, attachments, reportedMessageUrl, resolver }: BaseReport & { resolver?: Snowflake }) {
    return new Embed({
      title: `Message Report`,
      description: `${content ? `Content:\n"${content}"` : ""}\n
                    ${attachments.length ? `Attachments: ${attachments.map((a) => `[**${a.filename}**](${a.url}) (${a.size}B)`)}` : ""}`,
      fields: this.setFields({ reporter: reporterId, target: targetId, source: reportedMessageUrl, resolver })
    });
  }

  public static formatReportedMessageUrl(reportedMessageUrl: string) {
    return `[Message](${reportedMessageUrl})`;
  }

  private static setFields({ reporter, target, source, resolver }: SetFieldsParams) {
    return [
      { name: "Reporter", value: `<@${reporter}>`, inline: true },
      { name: "Reported", value: `<@${target}>`, inline: true },
      { name: "Source", value: this.formatReportedMessageUrl(source), inline: true },
      { name: "Status", value: resolver ? `✅ Resolved by <@${resolver}>` : "❌ Not resolved" }
    ];
  }

  public static createReportRow(reportedMessageId: string, resolved: boolean) {
    const label = resolved ? "Resolved" : "Resolve";
    const style = resolved ? ButtonStyle.Secondary : ButtonStyle.Success;
    const emoji = resolved ? "✅" : "👮";
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`${systemPrefix}-${reportedMessageId}`).setLabel(label).setStyle(style).setDisabled(resolved).setEmoji(emoji)
    );
  }

  public static updateReportEmbed({}) {}
}
