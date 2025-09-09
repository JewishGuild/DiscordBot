const restrictedWords = ["heil", "hitler", "goy", "palestine", "intifada", "nigger"];
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const restrictedRegex = new RegExp(`\\b(?:${restrictedWords.map(esc).join("|")})\\b`, "i");
