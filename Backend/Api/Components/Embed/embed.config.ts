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
      text: ``,
      iconURL: ""
    }
  }
};
