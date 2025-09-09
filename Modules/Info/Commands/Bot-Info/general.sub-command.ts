import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { Bot } from "../../../../Core/Bot/bot.js";

class GeneralSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction) {
    await interaction.editReply({ embeds: [this.constructEmbed(client)] });
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder().setName("general").setDescription("General info about the bot");
  }

  private constructEmbed(client: Client): Embed {
    return new Embed(
      {
        title: `Bot Information`,
        description: `Client ${client.user?.username} is the official bot of JewishGuild discord server`,
        fields: [
          { name: "Developed by", value: "<@313605730357870592>", inline: true },
          { name: "Current uptime", value: Bot.getInstance().getUptime(), inline: true }
        ],
        timestamp: Date.now()
      },
      {
        footer: { state: true },
        thumbnail: { state: true }
      }
    );
  }
}

export const generalSubCommand = new GeneralSubCommand();
