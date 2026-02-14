export type Emotion =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'frustrated'
  | 'confused'
  | 'anxious'
  | 'excited'
  | 'neutral';

export interface EmotionAnalysis {
  emotion: Emotion;
  confidence: number;
  keywords: string[];
}

const emotionPatterns = {
  happy: {
    keywords: [
      'happy', 'great', 'awesome', 'excellent', 'wonderful', 'fantastic',
      'love', 'perfect', 'amazing', 'thank', 'thanks', 'good', 'nice',
      '😊', '😃', '😄', '🎉', '👍', '❤️'
    ],
    phrases: ['thank you', 'thanks so much', 'appreciate it', 'love it']
  },
  sad: {
    keywords: [
      'sad', 'unhappy', 'disappointed', 'sorry', 'upset', 'down',
      'depressed', 'miserable', 'terrible', 'awful', 'horrible', 'bad',
      '😢', '😞', '😔', '☹️'
    ],
    phrases: ['feel bad', 'not good', 'very disappointed', 'let down']
  },
  angry: {
    keywords: [
      'angry', 'mad', 'furious', 'outraged', 'livid', 'hate', 'disgusting',
      'ridiculous', 'unacceptable', 'pathetic', 'stupid', 'worst',
      '😠', '😡', '🤬'
    ],
    phrases: ['fed up', 'sick of', 'had enough', 'this is ridiculous']
  },
  frustrated: {
    keywords: [
      'frustrated', 'annoying', 'irritating', 'aggravating', 'troublesome',
      'difficult', 'struggling', 'stuck', 'problem', 'issue', 'ugh', 'argh',
      '😤', '😫'
    ],
    phrases: ['not working', 'doesnt work', "doesn't work", 'cant seem', 'keep trying']
  },
  confused: {
    keywords: [
      'confused', 'confusing', 'unclear', 'understand', 'what', 'how',
      'why', 'help', 'lost', 'unsure', 'uncertain', 'dont know',
      '😕', '🤔', '😵'
    ],
    phrases: ['dont understand', "don't understand", 'not sure', 'how do', 'what is', 'explain']
  },
  anxious: {
    keywords: [
      'worried', 'concern', 'nervous', 'anxious', 'scared', 'afraid',
      'uncertain', 'unsure', 'hesitant', 'doubt', 'fear',
      '😰', '😨', '😟'
    ],
    phrases: ['worried about', 'concerned about', 'what if', 'will it']
  },
  excited: {
    keywords: [
      'excited', 'cant wait', "can't wait", 'looking forward', 'eager',
      'pumped', 'thrilled', 'stoked', 'yay', 'woohoo', 'wow',
      '🎉', '🤩', '😍', '🥳'
    ],
    phrases: ['cant wait', "can't wait", 'so excited', 'looking forward']
  }
};

export function detectEmotion(text: string): EmotionAnalysis {
  const normalized = text.toLowerCase().trim();
  const scores: Record<Emotion, { score: number; matches: string[] }> = {
    happy: { score: 0, matches: [] },
    sad: { score: 0, matches: [] },
    angry: { score: 0, matches: [] },
    frustrated: { score: 0, matches: [] },
    confused: { score: 0, matches: [] },
    anxious: { score: 0, matches: [] },
    excited: { score: 0, matches: [] },
    neutral: { score: 0, matches: [] }
  };

  for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
    const emotionKey = emotion as Exclude<Emotion, 'neutral'>;

    for (const keyword of patterns.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        scores[emotionKey].score += 2;
        scores[emotionKey].matches.push(keyword);
      }
    }

    for (const phrase of patterns.phrases) {
      if (normalized.includes(phrase.toLowerCase())) {
        scores[emotionKey].score += 3;
        scores[emotionKey].matches.push(phrase);
      }
    }
  }

  if (normalized.includes('?')) {
    scores.confused.score += 1;
  }

  if (normalized.includes('!')) {
    scores.excited.score += 0.5;
    scores.angry.score += 0.5;
  }

  const entries = Object.entries(scores) as [Emotion, { score: number; matches: string[] }][];
  const sorted = entries.sort((a, b) => b[1].score - a[1].score);

  const topEmotion = sorted[0];
  const maxScore = topEmotion[1].score;

  if (maxScore === 0) {
    return {
      emotion: 'neutral',
      confidence: 1.0,
      keywords: []
    };
  }

  return {
    emotion: topEmotion[0],
    confidence: Math.min(maxScore / 10, 1.0),
    keywords: topEmotion[1].matches
  };
}

export function getEmotionColor(emotion: Emotion): string {
  const colors: Record<Emotion, string> = {
    happy: 'text-green-600',
    sad: 'text-blue-600',
    angry: 'text-red-600',
    frustrated: 'text-orange-600',
    confused: 'text-purple-600',
    anxious: 'text-yellow-600',
    excited: 'text-pink-600',
    neutral: 'text-gray-600'
  };
  return colors[emotion];
}

export function getEmotionEmoji(emotion: Emotion): string {
  const emojis: Record<Emotion, string> = {
    happy: '😊',
    sad: '😔',
    angry: '😠',
    frustrated: '😤',
    confused: '🤔',
    anxious: '😟',
    excited: '🎉',
    neutral: '😐'
  };
  return emojis[emotion];
}
