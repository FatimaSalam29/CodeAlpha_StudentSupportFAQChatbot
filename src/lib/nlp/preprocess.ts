/**
 * NLP preprocessing pipeline, shared by stored FAQs and user questions:
 * normalization -> lowercase -> punctuation removal -> tokenization ->
 * stop-word removal (`stopword` library) -> optional spelling correction
 * (`fastest-levenshtein`) -> Porter stemming (`stemmer` library).
 */
import { removeStopwords, eng } from "stopword";
import { stemmer } from "stemmer";
import { distance } from "fastest-levenshtein";

/** Extra filler words common in support questions, on top of the library's English list. */
const EXTRA_STOPWORDS = [
  "when", "where", "which", "who", "whom", "why", "please", "pls", "plz", "would", "could",
  "should", "tell", "know", "want", "much", "many", "there", "also", "any", "anyone", "someone",
  "something", "way", "ways", "need", "about", "into", "via", "just", "regarding", "kindly",
  "dear", "sir", "madam", "whats", "hows", "wheres", "get", "got", "us", "im", "ive", "dont", "doesnt", "cant", "able",
];
export const STOPWORDS: string[] = Array.from(new Set([...eng, ...EXTRA_STOPWORDS]));

/** Informal spellings and abbreviations mapped to a canonical form. */
const ABBREVIATIONS: Record<string, string> = {
  u: "you", ur: "your", r: "are", uni: "university", info: "information", reg: "registration",
  sem: "semester", assn: "assignment", assgn: "assignment", hw: "homework", id: "id",
  timetable: "timetable", datesheet: "date sheet", recheck: "recheck", e: "", "e-books": "ebooks",
};

const CONTRACTIONS: [RegExp, string][] = [
  [/\bcan't\b/g, "can not"], [/\bwon't\b/g, "will not"], [/n't\b/g, " not"],
  [/'re\b/g, " are"], [/'s\b/g, ""], [/'d\b/g, " would"], [/'ll\b/g, " will"],
  [/'ve\b/g, " have"], [/'m\b/g, " am"],
];

/** Unicode + case normalization, contraction expansion and punctuation removal. */
export function normalize(text: string): string {
  let t = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  t = t.replace(/[’‘`]/g, "'");
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  // Remove punctuation/symbols; keep letters, digits and whitespace.
  t = t.replace(/[^a-z0-9\s]/g, " ");
  return t.replace(/\s+/g, " ").trim();
}

/** Whitespace tokenizer over normalized text, with abbreviation expansion. */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of normalize(text).split(" ")) {
    if (!raw) continue;
    const mapped = ABBREVIATIONS[raw] ?? raw;
    for (const piece of mapped.split(" ")) if (piece) out.push(piece);
  }
  return out;
}

/** Removes stop words using the `stopword` library plus project extras. */
export function removeStops(tokens: string[]): string[] {
  return removeStopwords(tokens, STOPWORDS).filter((t) => t.length > 1 || /\d/.test(t));
}

/** Porter stemming via the `stemmer` library (e.g. "registering" -> "regist"). */
export function stem(token: string): string {
  return stemmer(token);
}

/**
 * Corrects a token to the closest known vocabulary word when it is not already known.
 * Allowed edit distance scales with word length to avoid wrong corrections on short words.
 */
export function correctSpelling(token: string, vocabulary: ReadonlySet<string>): string {
  if (vocabulary.has(token) || token.length < 4 || /\d/.test(token)) return token;
  const maxDist = token.length >= 8 ? 2 : 1;
  let best = token;
  let bestDist = Infinity;
  for (const word of vocabulary) {
    if (Math.abs(word.length - token.length) > maxDist) continue;
    const d = distance(token, word);
    if (d < bestDist || (d === bestDist && word < best)) {
      bestDist = d;
      best = word;
    }
  }
  return bestDist <= maxDist ? best : token;
}

/** Tokens after normalization + stop-word removal, before stemming (used to build the spelling vocabulary). */
export function contentWords(text: string): string[] {
  return removeStops(tokenize(text));
}

/** Full pipeline: returns stemmed terms ready for TF-IDF vectorization. */
export function preprocess(text: string, vocabulary?: ReadonlySet<string>): string[] {
  const words = contentWords(text);
  return words.map((w) => stem(vocabulary ? correctSpelling(w, vocabulary) : w));
}
