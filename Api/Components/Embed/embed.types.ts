import { ActionRowBuilder, APIEmbedField, ButtonBuilder, EmbedData } from "discord.js";
import { Embed } from "./embed.component.js";

interface ConfigOption<T> {
  state: boolean;
  value: T;
}

export type EmbedConfig = {
  [K in keyof EmbedData]?: ConfigOption<EmbedData[K]>;
};

export type EmbedConfigOverrides = Partial<{ [K in keyof EmbedConfig]?: Partial<EmbedConfig[K]> }>;

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  fieldsPerPage: number;
  originalFields: Array<APIEmbedField>;
}

export interface PaginationResult {
  embed: Embed;
  needsPagination: boolean;
  components?: ActionRowBuilder<ButtonBuilder>[];
}
