import dataset from "@/data/faqs.json";
import { FaqMatcher, type Faq } from "./faqMatcher";

export * from "./faqMatcher";
export { MATCHER_CONFIG } from "./config";

export const FAQ_DATASET = dataset as { meta: { title: string; version: string; disclaimer: string }; faqs: Faq[] };

let instance: FaqMatcher | null = null;
/** Lazily-built shared matcher over the bundled FAQ dataset. */
export function getFaqMatcher(): FaqMatcher {
  if (!instance) instance = new FaqMatcher(FAQ_DATASET.faqs);
  return instance;
}
