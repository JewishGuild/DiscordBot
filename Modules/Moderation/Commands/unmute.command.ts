import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { BaseSlashCommand } from "../../Base/Commands/base.command.js";
import { RestrictionService } from "../Services/restriction.service.js";
import { MemberService } from "../../../Api/Guild/Member/member.service.js";
import { UserStatsService } from "../../Info/Services/user-stats.service.js";

class UnmuteCommand extends BaseSlashCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const isCommanderStaff = await UserStatsService.isStaffMember({ guild: interaction.guild, id: interaction.user.id });
    if (!isCommanderStaff) throw new Error("You're not a staff member");

    /* Get selected options */
    const user = interaction.options.getUser("user", true);

    /* Verify options validity */
    const memberApi = new MemberService(interaction.guild);
    const member = await memberApi.resolveMemberById(user.id);

    /* Apply mute to member */
    await RestrictionService.unmuteMember({ interaction, member });
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
