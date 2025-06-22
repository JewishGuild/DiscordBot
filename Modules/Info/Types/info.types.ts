import { APIEmbedField } from "discord.js";
import { CommandCategory } from "../../Base/Commands/base.command.js";

export type GroupedCommands = Record<CommandCategory, Array<APIEmbedField>>;
