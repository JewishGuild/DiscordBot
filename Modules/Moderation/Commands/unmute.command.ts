import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, GuildMember, SlashCommandBuilder, Snowflake } from "discord.js";
import { BaseCommand } from "../../Base/Commands/base.command.js";
import { SupportService } from "../Services/support.service.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";

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

    /* Apply mute to member */
    const embed = this.constructEmbed(member.id, interaction.user.id);
    await RestrictionService.unmuteMember(member);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ embed, title: "Member Unmuted", user: interaction.user });
  }

  private constructEmbed(memberId: Snowflake, modId: Snowflake) {
    return Embed.BaseEmbed({
      description: `<@${memberId}> has been unmuted by <@${modId}>`
    });
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
