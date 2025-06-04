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
    console.log(user.avatarURL());
    embed.setAuthor({ name: user.username, iconURL: user.avatarURL() || "" });
    embed.setTimestamp();
    embed.setTitle(title);
    embed.setFooter({
      text: `Made by the development team`,
      iconURL: "https://cdn.discordapp.com/icons/1369668963021099131/578c1fa7db06a857a2c25c91191fb594.webp"
    });

    try {
      await axios.post(process.env.WEBHOOK_URL, { embeds: [embed] }, { headers: { "Content-Type": "application/json" } });
    } catch (err) {
      // @ts-ignore
      this.logger.error(err.message as string);
    }
  }
}
