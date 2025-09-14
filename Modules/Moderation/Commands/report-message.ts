import {
  APIAttachment,
  ApplicationIntegrationType,
  Attachment,
  Client,
  Colors,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction
} from "discord.js";
import { BaseMessageContextCommand } from "../../Base/Commands/base.command.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { ReportService } from "../Services/report.service.js";

class ReportMessageCommand extends BaseMessageContextCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: MessageContextMenuCommandInteraction): Promise<void> {
    if (!interaction.guild) throw new Error("Must be inside of guild.");
    if (interaction.targetMessage.author.bot) throw new Error("Can't report bots' messages.");

    const reporterId = interaction.user.id,
      message = interaction.targetMessage,
      targetId = message.author.id,
      reportedMessageUrl = message.url,
      attachments = [...message.attachments.values()].map((a) => this.toAPIAttachment(a));

    if (reporterId === targetId) throw new Error("Can't report your own message.");

    await ReportService.handleReportSubmission({
      guild: interaction.guild,
      reporterId,
      targetId,
      reportedMessageUrl,
      attachments,
      content: message.content,
      reportedMessageId: message.id
    });
    const embed = this.constructEmbed();
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
  }

  protected createMessageContextCommand(): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder().setName("Report Message").setIntegrationTypes([ApplicationIntegrationType.GuildInstall]);
  }

  private constructEmbed() {
    return new Embed(
      {
        color: Colors.Green,
        description: `Message report submitted!`
      },
      { color: { state: false } }
    );
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

export const reportMessageCommand = new ReportMessageCommand();
