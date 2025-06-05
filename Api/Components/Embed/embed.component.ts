import { EmbedBuilder, EmbedData } from "discord.js";
import { config } from "./embed.config.js";
import { GeneralUtilities } from "../../../Utilities/general.utilities.js";
import { EmbedConfig, EmbedConfigOverrides } from "./embed.types.js";

export class Embed extends EmbedBuilder {
  private readonly config: EmbedConfig;

  constructor(data: EmbedData, overrides: EmbedConfigOverrides = {}) {
    super(data);
    this.config = this.getConfig(overrides);
    console.log(this.config);
    this.implementConfig();
  }

  private implementConfig() {
    Object.entries(this.config).forEach(([key, definition]) => {
      if (definition.state) {
        const typedKey = key as keyof EmbedData;
        const method = `set${GeneralUtilities.capitalize(typedKey)}` as keyof this;

        if (typeof (this as any)[method] === "function") {
          (this as any)[method](definition.value);
        } else {
          // @ts-expect-error
          console.warn(`Embed method "${method}" does not exist.`);
        }
      }
    });
  }

  private getConfig(overrides: EmbedConfigOverrides = {}): EmbedConfig {
    return GeneralUtilities.deepMerge(config, overrides);
  }

  public static BaseEmbed = (data: EmbedData) => new Embed(data, { footer: { state: false } });
}
