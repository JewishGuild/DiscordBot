export const restrictedWords = [
  "heil",
  "hitler",
  /* "goy", "palestine", "palestinian",*/ "intifada",
  "intefada",
  "nigger",
  "nigga",
  "kike",
  "genocide"
] as const;
const GAP_MAX = 2;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const MAP: Record<string, string> = (() => {
  const pairs: Array<[string, string[]]> = [
    ["a", ["a", "@", "4", "à", "á", "â", "ä", "ã", "å", "ā", "α"]],
    ["b", ["b", "8", "ß", "в"]],
    ["c", ["c", "(", "č", "ć", "ç"]],
    ["d", ["d", "đ"]],
    ["e", ["e", "3", "€", "è", "é", "ê", "ë", "ē"]],
    ["f", ["f", "ƒ"]],
    ["g", ["g", "9"]],
    ["h", ["h", "#"]],
    ["i", ["i", "1", "!", "|", "í", "ì", "î", "ï", "ī", "ı"]],
    ["j", ["j"]],
    ["k", ["k", "κ"]],
    ["l", ["l", "|", "ɫ"]],
    ["m", ["m"]],
    ["n", ["n", "ñ", "η"]],
    ["o", ["o", "0", "°", "ō", "ò", "ó", "ô", "ö", "õ", "ο"]],
    ["p", ["p"]],
    ["q", ["q"]],
    ["r", ["r"]],
    ["s", ["s", "$", "5", "ś", "š", "ș"]],
    ["t", ["t", "+", "7"]],
    ["u", ["u", "ù", "ú", "û", "ü", "ū"]],
    ["v", ["v", "ν"]],
    ["w", ["w"]],
    ["x", ["x"]],
    ["y", ["y", "¥", "ý", "ÿ"]],
    ["z", ["z", "ž", "ż", "ź"]]
  ];
  const m: Record<string, string> = {};
  for (const [base, alts] of pairs) for (const ch of alts) m[ch] = base;
  return m;
})();

function stripDiacritics(s: string): string {
  return s.normalize("NFKD").replace(/\p{M}+/gu, "");
}

export function normalizeForModeration(input: string): string {
  let s = stripDiacritics(input.toLocaleLowerCase("en"));

  s = Array.from(s)
    .map((ch) => MAP[ch] ?? MAP[ch.normalize?.("NFKD")] ?? ch)
    .join("");

  s = s.replace(/[^a-z0-9]+/g, " ");
  s = s.replace(/([a-z])\1{2,}/g, "$1$1").replace(/([0-9])\1{1,}/g, "$1");
  return s.replace(/\s{2,}/g, " ").trim();
}

const between = `[^a-z0-9]{0,${GAP_MAX}}`;
const STRICTS = restrictedWords.map((w) => new RegExp(esc(w), "i"));
const GAPS = restrictedWords.map((w) => new RegExp(w.split("").join(between), "i"));

export function findRestricted(text: string): { matched: boolean; hits: string[]; triedEvading: boolean } {
  const rawLower = text.toLocaleLowerCase("en");
  const norm = normalizeForModeration(text);
  const hits = new Set<string>();
  let triedEvading = false;

  for (let i = 0; i < restrictedWords.length; i++) {
    const w = restrictedWords[i];
    const strictMatch = STRICTS[i].test(norm);
    const gapMatch = GAPS[i].test(norm);

    if (strictMatch || gapMatch) {
      hits.add(w);

      if ((gapMatch && !strictMatch) || (strictMatch && !new RegExp(esc(w), "i").test(rawLower))) {
        triedEvading = true;
      }
    }
  }
  return { matched: hits.size > 0, hits: [...hits], triedEvading };
}
