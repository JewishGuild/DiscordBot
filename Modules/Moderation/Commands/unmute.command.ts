import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, GuildMember, SlashCommandBuilder, Snowflake } from "discord.js";
import { BaseSlashCommand } from "../../Base/Commands/base.command.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";
import { StaffService } from "../Services/staff.service.js";

class UnmuteCommand extends BaseSlashCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    if (!StaffService.isStaffMember(interaction.member as GuildMember)) throw new Error("You're not a support staff member.");

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

  protected createSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("unmute")
      .setDescription("Mutes a member temporarily")
      .addUserOption((user) => user.setName("user").setDescription("User to mute").setRequired(true))
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const unmuteCommand = new UnmuteCommand();
