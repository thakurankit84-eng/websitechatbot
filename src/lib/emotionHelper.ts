import { detectEmotion, Emotion } from './emotionDetection';
import { generateEmpatheticResponse, generateNoAnswerResponse } from './empatheticResponses';
import { getDefaultFaqs } from './faqRepository';

// Small helper module that performs emotion detection + FAQ lookup and returns an empathetic reply.

interface LocalFAQ {
  id?: string;
  question?: string;
  answer?: string;
  keywords?: string;
  emotion_answers?: Record<string, string>;
}

const sampleFaqs: LocalFAQ[] = getDefaultFaqs() as LocalFAQ[];

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  const alen = a.length;
  const blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  const v0 = new Array(blen + 1).fill(0);
  const v1 = new Array(blen + 1).fill(0);

  for (let i = 0; i <= blen; i++) v0[i] = i;

  for (let i = 0; i < alen; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < blen; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= blen; j++) v0[j] = v1[j];
  }
  return v1[blen];
};

const similarity = (a: string, b: string): number => {
  if (!a.length || !b.length) return 0;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
};

const tokenOverlap = (a: string, b: string): number => {
  const aTokens = a.split(/\W+/).filter(Boolean);
  const bTokens = b.split(/\W+/).filter(Boolean);
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  const setB = new Set<string>(bTokens);
  const common = aTokens.filter((t: string) => setB.has(t)).length;
  return common / Math.max(aTokens.length, bTokens.length);
};

function findFaq(question: string, faqs: LocalFAQ[]): { faq?: LocalFAQ; score: number } {
  const lowercaseQuestion = question.toLowerCase();

  // direct match
  for (const faq of faqs) {
    const keywords: string[] = (faq.keywords || '').toLowerCase().split(',').map((k: string) => (k || '').trim());
    const questionWords = (faq.question || '').toLowerCase();

    if (
      keywords.some((keyword: string) => Boolean(keyword) && lowercaseQuestion.includes(keyword)) ||
      (questionWords && lowercaseQuestion.includes(questionWords))
    ) {
      return { faq, score: 1 };
    }
  }

  // fuzzy
  let best: { faq?: LocalFAQ; score: number } = { score: 0 };
  for (const faq of faqs) {
    const q = (faq.question || '').toLowerCase();
    const a = ((faq.answer || '') as string).toLowerCase();

    const simQ = similarity(lowercaseQuestion, q);
    const simA = similarity(lowercaseQuestion, a);
    const overlapQ = tokenOverlap(lowercaseQuestion, q);
    const overlapA = tokenOverlap(lowercaseQuestion, a);

    const score = Math.max(simQ * 0.6 + overlapQ * 0.4, simA * 0.5 + overlapA * 0.5);

    if (score > best.score) {
      best = { faq, score };
    }
  }

  return best;
}

export interface AnalysisResult {
  input: string;
  emotion: Emotion;
  confidence: number;
  keywords: string[];
  baseAnswer: string | null;
  reply: string;
}

export function analyzeAndRespond(text: string): AnalysisResult {
  const emotionAnalysis = detectEmotion(text);
  const match = findFaq(text, sampleFaqs);

  let selectedBase: string | null = null;
  let reply: string;

  if (match.faq && match.score >= 0.35) {
    const faq = match.faq;
    // prefer per-emotion override if present
    const emoOverride = faq.emotion_answers && (faq.emotion_answers as Record<string, string>)[emotionAnalysis.emotion];
    selectedBase = emoOverride ?? faq.answer ?? null;

    // If an emotion-specific answer exists, use it directly (it's already empathetic/targeted).
    if (emoOverride) {
      reply = emoOverride;
    } else {
      // Wrap chosen base with empathetic framing
      reply = generateEmpatheticResponse(selectedBase || '', emotionAnalysis.emotion, emotionAnalysis.confidence ?? 0);
    }
  } else if (match.faq && match.score === 1) {
    // direct keyword match returned early with score 1
    const faq = match.faq;
    const emoOverride = faq.emotion_answers && (faq.emotion_answers as Record<string, string>)[emotionAnalysis.emotion];
    selectedBase = emoOverride ?? faq.answer ?? null;
    reply = emoOverride
      ? emoOverride
      : generateEmpatheticResponse(selectedBase || '', emotionAnalysis.emotion, emotionAnalysis.confidence ?? 0);
  } else {
    const suggestions = sampleFaqs.map((f: LocalFAQ) => `• ${f.question}`).join('\n');
    const suggestedTopics = `Here are some common topics I can help with:\n\n${suggestions}`;
    reply = generateNoAnswerResponse(emotionAnalysis.emotion, suggestedTopics);
  }

  return {
    input: text,
    emotion: emotionAnalysis.emotion,
    confidence: emotionAnalysis.confidence ?? 0,
    keywords: emotionAnalysis.keywords ?? [],
    baseAnswer: selectedBase,
    reply
  };
}

export function analyzeEmotion(text: string) {
  return detectEmotion(text);
}
