import { Snowflake } from "discord.js";

export const reportsChannel: Snowflake = process.env.NODE_ENV == "development" ? "1416846155375186153" : "1416888916404863096";
export const systemPrefix = "message_report";
