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
      iconURL: "https://cdn.discordapp.com/icons/1369668963021099131/578c1fa7db06a857a2c25c91191fb594.webp?size=80&quality=lossless"
    }
  }
};
