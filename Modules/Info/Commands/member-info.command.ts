import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BaseSlashCommand } from "../../Base/Commands/base.command.js";
import { UserStatsService } from "../Services/user-stats.service.js";
import { UserStatsEntity } from "../Types/user-stats.types.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { MutedMemberCollection } from "../../Moderation/Models/mutes.collection.js";
import { MutedMemberEntity } from "../../Moderation/Types/mutes.types.js";
import { TimeUtilities } from "../../../Utilities/time.utilities.js";

class MemberInfoCommand extends BaseSlashCommand {
  constructor() {
    super("info");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const isCommanderStaff = await UserStatsService.isStaffMember({ guild: interaction.guild, id: interaction.user.id });
    if (!isCommanderStaff) throw new Error("You're not a staff member");

    /* Retrieve target user stats */
    const targetUser = interaction.options.getUser("member", true);
    const targetStats = await UserStatsService.getUserStats({ guild: interaction.guild, id: targetUser.id });
    if (!targetStats) throw new Error("Failed to fetch data on targeted member");

    const currentMute = targetStats.isMuted ? await MutedMemberCollection.getInstance().getMutedMemberById(targetUser.id) : null;

    const embed = this.createEmbed(targetStats, currentMute);
    await interaction.editReply({ embeds: [embed] });
  }

  private createEmbed(stats: UserStatsEntity, currentMute: MutedMemberEntity | null) {
    const estimatedDuration = Math.floor(Date.now() / 1000) + (currentMute?.duration ?? 0) * 60;
    const muteDescription = currentMute
      ? `is muted by <@${currentMute.moderatorId}> ${
          currentMute.permanent ? "permanently" : `until ${TimeUtilities.formatLocalizedTime(estimatedDuration)}`
        } for: \`${currentMute.reason}\``
      : `has no ongoing limitations.`;
    const latestJoin = stats.joins![stats.joins!.length - 1];
    const latestLeave = stats.leaves![stats.leaves!.length - 1];

    // emojis
    const vMark = `<a:vvmark:1415092186151780362>`;
    const xMark = `<a:xxmark:1415092439252865205>`;
    const nitro = `<a:nitro_shapes42:1371950059637444790>`;
    const prison = `<a:pepeprison:1415088665948061787>`;
    const admin = `<a:pepestrong:1415093773083476048>`;
    const detective = `<:detective:1415090466524893294>`;
    const lights = `<a:lights:1415094423447928902>`;

    return new Embed(
      {
        title: `Member Information`,
        description: `${lights}ㅤMember <@${stats.id}> ${muteDescription}\n\n-# System is tracking data since ${TimeUtilities.formatLocalizedTime(
          Math.floor(1757455944364 / 1000)
        )}, earlier data might not appear.`,
        fields: [
          { name: "ㅤ", value: "ㅤ", inline: false },
          { name: `General Metrics ${detective}`, value: "ㅤ", inline: false },
          { name: "Known aliases", value: `\`${stats.nicknames!.join(",\t")}\``, inline: true },
          { name: `Server boost ${nitro}`, value: `Ever boosted: \`${stats.boosted}\`\nActive boosting: \`${stats.isBooster}\``, inline: true },
          { name: "Latest join", value: latestJoin ? TimeUtilities.formatLocalizedTime(Math.floor(latestJoin / 1000)) : "`No entry`", inline: true },
          { name: "Latest leave", value: latestLeave ? TimeUtilities.formatLocalizedTime(Math.floor(latestLeave / 1000)) : "`No entry`", inline: true },
          {
            name: "Latest chat activity",
            value: stats.lastChatActivity ? TimeUtilities.formatLocalizedTime(Math.floor(stats.lastChatActivity / 1000)) : "`No entry`",
            inline: true
          },
          {
            name: "Latest voice activity",
            value: stats.lastVoiceActivity ? TimeUtilities.formatLocalizedTime(Math.floor(stats.lastVoiceActivity / 1000)) : "`No entry`",
            inline: true
          },
          { name: "ㅤ", value: "ㅤ", inline: false },
          { name: `Permission Metrics ${admin} `, value: "ㅤ", inline: false },
          { name: "Administrator", value: stats.isAdmin ? vMark : xMark, inline: true },
          { name: "Staff", value: stats.isStaff ? vMark : xMark, inline: true },
          { name: "Member", value: stats.isMember ? vMark : xMark, inline: true },
          { name: "ㅤ", value: "ㅤ", inline: false },
          { name: `Infraction Metrics ${prison}`, value: "ㅤ", inline: false },
          { name: "Overall mutes count", value: `\`${stats.muteCount}\``, inline: true },
          { name: "Overall mutes duration", value: `\`${TimeUtilities.formatMinutes(stats.muteDurationCount ?? 0)}\``, inline: true },
          { name: "Overall warns count", value: `\`${stats.warnCount}\``, inline: true },
          { name: "Overall reports count", value: `\`${stats.reportsCount}\``, inline: true },
          { name: "Overall false reports count", value: `\`${stats.falseReportsCount}\``, inline: true }
        ]
      },
      { footer: { state: true }, timestamp: { state: true } }
    );
  }

  protected createSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("member-info")
      .setDescription("Retrieves member information")
      .addUserOption((user) => user.setName("member").setDescription("Member to view").setRequired(true))
      .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const memberInfoCommand = new MemberInfoCommand();
