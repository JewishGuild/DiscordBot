import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../Base/Commands/base.command.js";
import { ChannelApi } from "../../../Api/Guild/Channel/channel.api.js";
import { RestrictionService } from "../Services/restriction.service.js";

class ApplyMutedPresetCommand extends BaseCommand {
  constructor() {
    super();
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    interaction.reply({ content: "Processing...", flags: "Ephemeral" });

    const channelApi = new ChannelApi(interaction.guild);
    const channels = await channelApi.getAllChannels();

    for (const [, channel] of channels) {
      await RestrictionService.setChannelMutedPreset(channel!);
    }
  }

  protected buildData(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("apply-muted-preset")
      .setDescription("Applies all the channels with the mute preset")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const applyMutedPresetCommand = new ApplyMutedPresetCommand();
