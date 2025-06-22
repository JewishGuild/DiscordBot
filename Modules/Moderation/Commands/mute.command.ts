import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, GuildMember, PermissionFlagsBits, SlashCommandBuilder, Snowflake } from "discord.js";
import { BaseCommand } from "../../Base/Commands/base.command.js";
import { SupportService } from "../Services/support.service.js";
import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { muteDurations, RestrictionDurations } from "../Config/restriction.config.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { StaffService } from "../Services/staff.service.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";

class MuteCommand extends BaseCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    if (!SupportService.isSupportMember(interaction.member as GuildMember)) throw new Error("You're not a support staff member.");

    /* Get selected options */
    const user = interaction.options.getUser("user", true);
    const duration = interaction.options.getNumber("duration", true);
    const reason = interaction.options.getString("reason", true);

    /* Verify options validity */
    const memberApi = new MemberService(interaction.guild);
    const member = await memberApi.getMemberById(user.id);
    if (StaffService.isStaffMember(member)) throw new Error("Can't mute a staff member.");

    /* Apply mute to member */
    const embed = this.constructEmbed(member.id, interaction.user.id, duration, reason);
    await RestrictionService.muteMember(member, interaction.user.id, duration, reason);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ title: "Member Muted", user: interaction.user, embed });
  }

  private constructEmbed(memberId: Snowflake, modId: Snowflake, duration: number, reason: string) {
    return new Embed({
      description: `<@${memberId}> has been muted by <@${modId}> ${
        duration === RestrictionDurations.Permanent ? "Permanently" : `for \`${duration}m\``
      } with reason: \`${reason}\``
    });
  }

  protected buildData(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("mute")
      .setDescription("Mutes a member temporarily")
      .addUserOption((user) => user.setName("user").setDescription("User to mute").setRequired(true))
      .addNumberOption((duration) => duration.setName("duration").setDescription("Duration of mute").setRequired(true).setChoices(muteDurations))
      .addStringOption((reason) => reason.setName("reason").setDescription("Reason for the temp mute").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const muteCommand = new MuteCommand();
