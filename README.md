# CodeAlpha_StudentSupportFAQChatbot

![Tests](https://img.shields.io/badge/tests-28%20passing-2563eb) ![Stack](https://img.shields.io/badge/React-19-2563eb) ![NLP](https://img.shields.io/badge/NLP-TF--IDF%20%2B%20cosine-2563eb)

**CodeAlpha_StudentSupportFAQChatbot** is a browser-based FAQ chatbot that answers common student questions about admissions, fees, attendance, exams, results, scholarships, the library, the LMS, registration, timetables and student support. It uses classic Natural Language Processing — text preprocessing, TF-IDF vectorization and cosine similarity — to find the stored FAQ closest to the user's question.

> **Disclaimer:** the FAQ answers are demonstration content only. They are generic guidance, not the official policy of any university.

## Features

- **36 FAQs across 12 topics**, each with several alternate phrasings.
- **NLP preprocessing:** lowercasing, accent and contraction normalization, punctuation removal, tokenization, abbreviation expansion, stop-word removal, Porter stemming and Levenshtein spelling correction.
- **TF-IDF + cosine similarity** matching, implemented from scratch with smoothed IDF and L2-normalized vectors.
- **Confidence threshold (0.30):** below it the bot does not guess; it shows a fallback with "Did you mean" suggestions.
- **Separate fallbacks** for empty, too-short and unrelated questions.
- **Chat interface:** welcome message, suggested questions, topic sidebar, quick chips, typing indicator, match percentage and category on answers, related questions, repeated-question note, Clear Chat, Enter to send (Shift + Enter for a new line) and a Send button.
- **Session history** kept in the browser tab.
- **Responsive** layout for phones, tablets and desktops.

## How matching works

```text
question -> normalize -> tokenize -> remove stop words -> spell-correct -> stem
         -> TF-IDF vector -> cosine similarity vs every stored phrasing
         -> best score >= 0.30 ? answer : fallback + suggestions
```

Settings such as the threshold live in `src/lib/nlp/config.ts`.

## Tech stack

React 19, TypeScript, Tailwind CSS v4, Vite, Vitest, and the `stopword`, `stemmer` and `fastest-levenshtein` libraries.

## Project structure

```text
src/
  data/faqs.json            FAQ dataset
  lib/nlp/                  preprocess, tfidf, faqMatcher, config
  components/chat/          chat interface
  pages-main.tsx            entry for the static GitHub Pages build
  test/faqMatcher.test.ts   matcher tests
pages/index.html            GitHub Pages HTML shell
vite.pages.config.ts        GitHub Pages build config
.github/workflows/deploy-pages.yml
```

## Getting started

```sh
npm install
npm run dev          # local development
npm test             # run the test suite
npm run build:pages  # static build in dist-pages/
```

## Deployment (GitHub Pages)

1. Push to `main`.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The **Deploy to GitHub Pages** workflow runs the tests, builds and publishes the site to:
   `https://<your-username>.github.io/CodeAlpha_StudentSupportFAQChatbot/`

## Testing

28 automated tests cover correct answers, alternate wordings, misspellings, unrelated questions, empty and too-short input, the similarity threshold and the TF-IDF/cosine math.

## Customizing the FAQs

Add entries to `src/data/faqs.json` with `id`, `category`, `question`, `alternates` and `answer`. The index rebuilds automatically.

## About

CodeAlpha_StudentSupportFAQChatbot was built as Task 2 of the CodeAlpha internship.
