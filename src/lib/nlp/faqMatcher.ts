/**
 * FAQ matcher: indexes every FAQ phrasing (main question + alternates) as a TF-IDF
 * document, then scores a user question by cosine similarity and returns the best FAQ.
 * Pure TypeScript with no UI dependencies, so it can be reused or unit-tested.
 */
import { MATCHER_CONFIG, type MatcherConfig } from "./config";
import { contentWords, preprocess } from "./preprocess";
import { TfIdfVectorizer, cosineSimilarity, type SparseVector } from "./tfidf";

export interface Faq {
  id: string;
  category: string;
  question: string;
  alternates?: string[];
  answer: string;
}

export interface ScoredFaq {
  faq: Faq;
  score: number;
  /** The stored phrasing that produced the best score. */
  matchedPhrase: string;
}

export type MatchResult =
  | { type: "answer"; best: ScoredFaq; alternatives: ScoredFaq[]; terms: string[] }
  | { type: "fallback"; reason: "empty" | "too-short" | "no-match"; suggestions: ScoredFaq[]; terms: string[] };

interface IndexedPhrase {
  faqIndex: number;
  phrase: string;
  vector: SparseVector;
}

export class FaqMatcher {
  readonly config: MatcherConfig;
  private readonly faqs: Faq[];
  private readonly vectorizer = new TfIdfVectorizer();
  private readonly vocabulary: Set<string>;
  private readonly index: IndexedPhrase[];

  constructor(faqs: Faq[], config: Partial<MatcherConfig> = {}) {
    this.config = { ...MATCHER_CONFIG, ...config };
    this.faqs = faqs;

    const phrases: { faqIndex: number; phrase: string }[] = [];
    faqs.forEach((faq, faqIndex) => {
      for (const phrase of [faq.question, ...(faq.alternates ?? [])]) phrases.push({ faqIndex, phrase });
    });

    // Spelling vocabulary = unstemmed content words from all stored phrasings.
    this.vocabulary = new Set(phrases.flatMap((p) => contentWords(p.phrase)));

    const docs = phrases.map((p) => preprocess(p.phrase));
    this.vectorizer.fit(docs);
    this.index = phrases.map((p, i) => ({ ...p, vector: this.vectorizer.transform(docs[i]) }));
  }

  get size(): number {
    return this.faqs.length;
  }

  get vocabularySize(): number {
    return this.vectorizer.vocabularySize;
  }

  /** Scores all FAQs (best phrasing per FAQ), sorted by descending cosine similarity. */
  rank(question: string): { terms: string[]; ranked: ScoredFaq[] } {
    const terms = preprocess(question, this.config.spellCorrection ? this.vocabulary : undefined);
    const qVec = this.vectorizer.transform(terms);
    const best = new Map<number, ScoredFaq>();
    for (const item of this.index) {
      const score = cosineSimilarity(qVec, item.vector);
      const current = best.get(item.faqIndex);
      if (!current || score > current.score) {
        best.set(item.faqIndex, { faq: this.faqs[item.faqIndex], score, matchedPhrase: item.phrase });
      }
    }
    const ranked = [...best.values()].sort((a, b) => b.score - a.score);
    return { terms, ranked };
  }

  /** Returns the best FAQ above the similarity threshold, or a fallback with optional suggestions. */
  match(question: string): MatchResult {
    if (!question || !question.trim()) return { type: "fallback", reason: "empty", suggestions: [], terms: [] };

    const { terms, ranked } = this.rank(question);
    if (terms.length === 0) return { type: "fallback", reason: "too-short", suggestions: [], terms };

    const [top, ...rest] = ranked;
    if (top && top.score >= this.config.similarityThreshold) {
      const alternatives = rest
        .filter((r) => r.score >= this.config.similarityThreshold * 0.8 && r.faq.category !== "General")
        .slice(0, 2);
      return { type: "answer", best: top, alternatives, terms };
    }

    const suggestions = ranked
      .filter((r) => r.score >= this.config.suggestionThreshold && r.faq.category !== "General")
      .slice(0, this.config.maxSuggestions);
    return { type: "fallback", reason: "no-match", suggestions, terms };
  }
}
