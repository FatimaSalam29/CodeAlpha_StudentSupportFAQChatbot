declare module "stopword" {
  export function removeStopwords(tokens: string[], stopwords?: string[]): string[];
  export const eng: string[];
}
