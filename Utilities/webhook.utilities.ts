import axios from "axios";
import { User } from "discord.js";
import { ConsoleUtilities } from "./console.utilities.js";
import { Embed } from "../Api/Components/Embed/embed.component.js";

type WebhookParams = {
  title: string;
  user: User;
  embed: Embed;
  comments?: string;
};

export class WebhookUtilities {
  private static readonly logger = new ConsoleUtilities("Webhook");

  public static async log(params: WebhookParams) {
    const embed = this.bindContent(params);

    try {
      await axios.post(process.env.WEBHOOK_URL, JSON.stringify({ embeds: [embed.toJSON()] }), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
      // @ts-ignore
      this.logger.error(err.message as string);
    }
  }

  private static bindContent({ embed, user, title, comments }: WebhookParams) {
    const embedCopy = new Embed(embed.data, embed.getOverrides());

    if (comments) {
      const { description } = embed.data;
      embedCopy.setDescription(description + `\n\n-# ${comments}`);
    }

    embedCopy.setAuthor({ name: user.username, iconURL: user.avatarURL() || "" });
    embedCopy.setTimestamp();
    embedCopy.setTitle(title);
    embedCopy.setFooter({
      text: `Made by the development team`,
      iconURL: "https://media.discordapp.net/attachments/978771506660257833/1385397411475882095/image.png"
    });

    return embedCopy;
  }
}
