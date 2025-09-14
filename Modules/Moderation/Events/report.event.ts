import { Client, ClientEvents } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";
import { systemPrefix } from "../Config/report.config.js";
import { ReportService } from "../Services/report.service.js";

class ReportEvent extends BaseEvent<"interactionCreate"> {
  constructor() {
    super("interactionCreate");
  }

  public async execute(client: Client<true>, ...args: ClientEvents["interactionCreate"]): Promise<void> {
    const [interaction] = args;

    if (interaction.isButton()) {
      const customId = interaction.customId;

      try {
        if (customId.startsWith(systemPrefix)) {
          const reportedMessageId = customId.split("-")[1];
          const message = interaction.message;
          const resolver = interaction.user.id;
          await ReportService.handleReportResolve({ resolver, message, reportedMessageId });
          await interaction.reply({ content: "Report resolved successfully", flags: ["Ephemeral"] });
        }
      } catch (error) {
        //@ts-ignore
        await interaction.reply({ content: error.message, flags: ["Ephemeral"] });
      }
    }
  }
}

export const reportEvent = new ReportEvent();
