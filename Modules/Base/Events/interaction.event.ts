import { Client, ClientEvents, Colors } from "discord.js";
import { BaseEvent } from "./base.event.js";
import { RootCommand } from "../../../Core/Bot/root.command.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";

class InteractionEvent extends BaseEvent<"interactionCreate"> {
  constructor() {
    super("interactionCreate", true);
  }

  public async execute(client: Client<true>, ...args: ClientEvents["interactionCreate"]): Promise<void> {
    const [interaction] = args;

    if (interaction.isChatInputCommand()) {
      const subcommand = interaction.options.getSubcommand(false);
      const commandIdentifier = interaction.commandName + (subcommand ? ` (${subcommand})` : "");
      this.logger.log(`Command ${commandIdentifier} has been triggered`);

      try {
        await interaction.deferReply();
        await RootCommand.getCommandsCache()[interaction.commandName].execute(client, interaction);
        this.logger.success(`Command ${commandIdentifier} has been completed`);
      } catch (error) {
        this.logger.error(`Command ${commandIdentifier} has crashed, info: ${error}`);
        //@ts-ignore
        const embed = this.createErrorEmbed(error.message);
        InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
        LoggerUtilities.log({ title: "Error", embed, user: interaction.user });
      }
    }
  }

  private createErrorEmbed(errorMessage: string) {
    return new Embed({ color: Colors.Red, description: `❌ ${errorMessage}` }, { color: { state: false } });
  }
}

export const interactionEvent = new InteractionEvent();
