import { EmbedData } from "discord.js";

interface ConfigOption<T> {
  state: boolean;
  value: T;
}

export type EmbedConfig = {
  [K in keyof EmbedData]?: ConfigOption<EmbedData[K]>;
};

export type EmbedConfigOverrides = Partial<{ [K in keyof EmbedConfig]?: Partial<EmbedConfig[K]> }>;
