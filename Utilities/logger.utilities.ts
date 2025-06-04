import axios from "axios";
import { User } from "discord.js";
import { ConsoleUtilities } from "./console.utilities.js";
import { Embed } from "../Api/Components/Embed/embed.component.js";

type LogParams = {
  title: string;
  user: User;
  embed: Embed;
};

export class LoggerUtilities {
  private static readonly logger = new ConsoleUtilities("Logger");

  public static async log({ embed, user, title }: LogParams) {
    embed.setAuthor({ name: user.username, iconURL: user.avatarURL() || "" });
    embed.setTimestamp();
    embed.setTitle(title);
    embed.setFooter({
      text: `Made by the development team`,
      iconURL: "https://cdn.discordapp.com/avatars/1376543468897308765/7fc7f440986eba5c8c5b3e1160d4b2c5.webp"
    });

    try {
      this.logger.log(`${embed.toJSON()}`);
      await axios.post(process.env.WEBHOOK_URL, JSON.stringify({ embeds: [embed.toJSON()] }), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
      // @ts-ignore
      this.logger.error(err.message as string);
    }
  }
}
