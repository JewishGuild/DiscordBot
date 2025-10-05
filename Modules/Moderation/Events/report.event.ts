import { APIAttachment, Attachment, Client, ClientEvents, TextChannel } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { systemPrefix } from "../Config/report.config.js";
import { ReportService } from "../Services/report.service.js";
import { MessageService } from "../../../Api/Guild/Channel/TextChannel/Message/message.service.js";
import { ReportAction } from "../Types/report.types.js";

class ReportEvent extends BaseEvent<"interactionCreate"> {
  constructor() {
    super("interactionCreate");
  }

  public async execute(client: Client<true>, ...args: ClientEvents["interactionCreate"]): Promise<void> {
    const [interaction] = args;
    if (!interaction.guild) return;

    if (interaction.isButton()) {
      const customId = interaction.customId;
      await interaction.deferReply({ flags: ["Ephemeral"] });

      try {
        if (customId.startsWith(systemPrefix)) {
          const reportedMessageId = customId.split("-")[1];
          const action = customId.split("-")[2] as ReportAction;
          const message = interaction.message;
          const resolver = interaction.user.id;
          await ReportService.handleReportResolve({ resolver, message, reportedMessageId, action });
          await interaction.editReply({ content: "Report resolved successfully" });
        }
      } catch (error) {
        //@ts-ignore
        await interaction.editReply({ content: error.message });
      }
    }

    if (interaction.isModalSubmit()) {
      const customId = interaction.customId;
      await interaction.deferReply({ flags: ["Ephemeral"] });

      try {
        if (customId.startsWith(systemPrefix)) {
          const reportedMessageId = customId.split("-")[1];
          const messageService = new MessageService(interaction.guild, interaction.channel as TextChannel);
          const message = await messageService.resolveMessageById(reportedMessageId);

          const reporterId = interaction.user.id,
            targetId = message.author.id,
            reportedMessageUrl = message.url,
            attachments = [...message.attachments.values()].map((a) => this.toAPIAttachment(a));

          await ReportService.handleReportSubmission({
            guild: interaction.guild,
            reporterId,
            targetId,
            reportedMessageUrl,
            attachments,
            content: message.content,
            reportedMessageId: message.id,
            reportDetail: interaction.fields.getTextInputValue("details").trim()
          });
          await interaction.editReply({ content: "Report submitted successfully" });
        }
      } catch (error) {
        //@ts-ignore
        await interaction.editReply({ content: error.message });
      }
    }
  }

  private toAPIAttachment(a: Attachment): APIAttachment {
    return {
      id: a.id,
      filename: a.name,
      description: a.description ?? undefined,
      content_type: a.contentType ?? undefined,
      size: a.size,
      url: a.url,
      proxy_url: a.proxyURL,
      height: a.height ?? undefined,
      width: a.width ?? undefined,
      ephemeral: a.ephemeral ?? undefined,
      duration_secs: a.duration ?? undefined,
      waveform: a.waveform ?? undefined,
      flags: a.flags?.bitfield
    };
  }
}

export const reportEvent = new ReportEvent();
