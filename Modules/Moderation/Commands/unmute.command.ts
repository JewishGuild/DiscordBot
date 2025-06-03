import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, GuildMember, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../Base/Commands/base.command.js";
import { SupportService } from "../Services/support.service.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";

class UnmuteCommand extends BaseCommand {
  constructor() {
    super();
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    if (!SupportService.isSupportMember(interaction.member as GuildMember)) throw new Error("You're not a support staff member.");

    /* Get selected options */
    const user = interaction.options.getUser("user", true);

    /* Verify options validity */
    const memberApi = new MemberService(interaction.guild);
    const member = await memberApi.resolveMemberById(user.id);

    /* Apply temp mute to member */
    await RestrictionService.unmuteMember(member);
    interaction.reply({ embeds: [Embed.BaseEmbed({ description: `<@${member.id}> has been unmuted by <@${interaction.user.id}>` })] });
  }

  protected buildData(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("unmute")
      .setDescription("Mutes a member temporarily")
      .addUserOption((user) => user.setName("user").setDescription("User to mute").setRequired(true))
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const unmuteCommand = new UnmuteCommand();
