/** Tunable settings for the FAQ matcher. Edit here to change matching behaviour. */
export const MATCHER_CONFIG = {
  /** Minimum cosine similarity (0–1) required to answer with an FAQ. */
  similarityThreshold: 0.3,
  /** Scores between this and the threshold produce "did you mean" suggestions. */
  suggestionThreshold: 0.12,
  /** Maximum number of suggestions shown on a fallback. */
  maxSuggestions: 3,
  /** Enable Levenshtein-based spelling correction against the FAQ vocabulary. */
  spellCorrection: true,
} as const;

export type MatcherConfig = {
  similarityThreshold: number;
  suggestionThreshold: number;
  maxSuggestions: number;
  spellCorrection: boolean;
};
