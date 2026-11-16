/**
 * Minimal, dependency-free TF-IDF vectorizer and cosine similarity.
 * - TF: raw term count in the document.
 * - IDF (smoothed): ln((1 + N) / (1 + df)) + 1, as used by scikit-learn.
 * - Vectors are L2-normalized, so cosine similarity equals the dot product.
 */
export type SparseVector = Map<string, number>;

export class TfIdfVectorizer {
  private idf = new Map<string, number>();
  private docCount = 0;

  /** Learns IDF weights from a corpus of already-preprocessed documents (arrays of terms). */
  fit(documents: string[][]): this {
    this.docCount = documents.length;
    const df = new Map<string, number>();
    for (const doc of documents) {
      for (const term of new Set(doc)) df.set(term, (df.get(term) ?? 0) + 1);
    }
    this.idf.clear();
    for (const [term, freq] of df) {
      this.idf.set(term, Math.log((1 + this.docCount) / (1 + freq)) + 1);
    }
    return this;
  }

  get vocabularySize(): number {
    return this.idf.size;
  }

  getIdf(term: string): number | undefined {
    return this.idf.get(term);
  }

  /** Converts preprocessed terms into an L2-normalized TF-IDF vector. Unknown terms are ignored. */
  transform(terms: string[]): SparseVector {
    const tf = new Map<string, number>();
    for (const t of terms) if (this.idf.has(t)) tf.set(t, (tf.get(t) ?? 0) + 1);
    const vec: SparseVector = new Map();
    let norm = 0;
    for (const [t, count] of tf) {
      const w = count * (this.idf.get(t) as number);
      vec.set(t, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm);
    if (norm > 0) for (const [t, w] of vec) vec.set(t, w / norm);
    return vec;
  }
}

/** Cosine similarity between two sparse vectors (works for normalized or raw vectors). */
export function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  if (a.size === 0 || b.size === 0) return 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [t, w] of small) {
    const other = large.get(t);
    if (other !== undefined) dot += w * other;
  }
  let na = 0;
  let nb = 0;
  for (const w of a.values()) na += w * w;
  for (const w of b.values()) nb += w * w;
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
