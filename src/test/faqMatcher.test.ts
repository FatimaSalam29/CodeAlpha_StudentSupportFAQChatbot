import { describe, expect, it } from "vitest";
import { FaqMatcher, getFaqMatcher, FAQ_DATASET } from "@/lib/nlp";
import { TfIdfVectorizer, cosineSimilarity } from "@/lib/nlp/tfidf";

const m = getFaqMatcher();
const idOf = (q: string) => {
  const r = m.match(q);
  return r.type === "answer" ? r.best.faq.id : null;
};

describe("FAQ answers", () => {
  const cases: [string, string][] = [
    ["How do I apply for admission?", "admissions-apply"],
    ["What is the minimum attendance requirement?", "attendance-requirement"],
    ["How do I pay my fees?", "fees-payment"],
    ["Can I pay my fees in installments?", "fees-installments"],
    ["Fee refund policy", "fees-refund"],
    ["How can I check my exam results?", "results-check"],
    ["What should I do if I miss an exam?", "exams-missed"],
    ["How do I apply for a scholarship?", "scholarships-apply"],
    ["Library timings", "library-hours"],
    ["Forgot my LMS password", "lms-login"],
    ["How do I submit assignments on the LMS?", "lms-assignments"],
    ["Can I add or drop a course?", "registration-add-drop"],
    ["Is counseling available for students?", "support-counseling"],
    ["Hostel accommodation", "support-hostel"],
    ["How do I apply for rechecking of my paper?", "results-recheck"],
  ];
  it.each(cases)("%s -> %s", (q, id) => expect(idOf(q)).toBe(id));
});

describe("spelling mistakes", () => {
  it.each([
    ["how to apply for admision", "admissions-apply"],
    ["minimum attendence requirement", "attendance-requirement"],
    ["libary timings", "library-hours"],
  ])("%s -> %s", (q, id) => expect(idOf(q)).toBe(id));
});

describe("fallbacks", () => {
  it.each(["What is the weather today?", "Who won the football match?", "asdkjasd"])("unrelated: %s", (q) => {
    const r = m.match(q);
    expect(r.type).toBe("fallback");
  });
  it("empty input", () => expect(m.match("   ")).toMatchObject({ type: "fallback", reason: "empty" }));
  it("too-short input", () => expect(m.match("?")).toMatchObject({ type: "fallback", reason: "too-short" }));
});

describe("engine", () => {
  it("answers only at or above the 0.30 threshold", () => {
    expect(m.config.similarityThreshold).toBe(0.3);
    const r = m.match("How do I pay my fees?");
    expect(r.type === "answer" && r.best.score >= 0.3).toBe(true);
  });
  it("indexes every FAQ in the dataset", () => expect(m.size).toBe(FAQ_DATASET.faqs.length));
  it("custom threshold of 1.01 never answers", () => {
    const strict = new FaqMatcher(FAQ_DATASET.faqs, { similarityThreshold: 1.01 });
    expect(strict.match("How do I pay my fees?").type).toBe("fallback");
  });
  it("cosine similarity of identical vectors is 1", () => {
    const v = new TfIdfVectorizer().fit([["fee", "pay"], ["exam"]]);
    const a = v.transform(["fee", "pay"]);
    expect(cosineSimilarity(a, a)).toBeCloseTo(1);
    expect(cosineSimilarity(a, v.transform(["exam"]))).toBe(0);
  });
});
