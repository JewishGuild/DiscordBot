import { Colors } from "discord.js";
import { EmbedConfig } from "./embed.types.js";

export const config: EmbedConfig = {
  timestamp: {
    state: false,
    value: undefined
  },
  color: {
    state: true,
    value: Colors.Aqua
  },
  footer: {
    state: false,
    value: {
      text: `Made by the development team`,
      iconURL: "https://media.discordapp.net/attachments/978771506660257833/1385397411475882095/image.png"
    }
  },
  thumbnail: {
    state: false,
    // @ts-ignore
    value: "https://media.discordapp.net/attachments/978771506660257833/1385397411475882095/image.png"
  }
};
