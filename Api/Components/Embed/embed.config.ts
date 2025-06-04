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
      iconURL: "https://cdn.discordapp.com/avatars/1376543468897308765/7fc7f440986eba5c8c5b3e1160d4b2c5.webp"
    }
  }
};
