import { Emotion } from './emotionDetection';

interface EmpatheticPrefix {
  acknowledgment: string;
  transition: string;
}

const empatheticPrefixes: Record<Emotion, EmpatheticPrefix[]> = {
  happy: [
    {
      acknowledgment: "I'm glad you're feeling positive!",
      transition: "Let me help you with that."
    },
    {
      acknowledgment: "That's wonderful to hear!",
      transition: "Here's what I can tell you:"
    },
    {
      acknowledgment: "Great energy!",
      transition: "I'd be happy to assist."
    }
  ],
  sad: [
    {
      acknowledgment: "I understand this might be disappointing.",
      transition: "Let me see how I can help make this better."
    },
    {
      acknowledgment: "I'm sorry to hear you're not feeling great about this.",
      transition: "Here's what I can do to assist:"
    },
    {
      acknowledgment: "I can sense some disappointment.",
      transition: "Let me provide you with helpful information."
    }
  ],
  angry: [
    {
      acknowledgment: "I understand your frustration, and I'm here to help.",
      transition: "Let me provide you with the information you need:"
    },
    {
      acknowledgment: "I hear you, and I want to make this right.",
      transition: "Here's what you need to know:"
    },
    {
      acknowledgment: "I can see this is frustrating for you.",
      transition: "Let me help clarify things:"
    }
  ],
  frustrated: [
    {
      acknowledgment: "I can see you're having some difficulty with this.",
      transition: "Let me break this down for you:"
    },
    {
      acknowledgment: "I understand this can be confusing.",
      transition: "Here's a clearer explanation:"
    },
    {
      acknowledgment: "I'm here to help make this easier for you.",
      transition: "Let me explain:"
    }
  ],
  confused: [
    {
      acknowledgment: "That's a great question! Let me clarify.",
      transition: "Here's a simple explanation:"
    },
    {
      acknowledgment: "I can help clear that up for you.",
      transition: "Here's what you need to know:"
    },
    {
      acknowledgment: "No worries, I'm here to explain!",
      transition: "Let me walk you through this:"
    }
  ],
  anxious: [
    {
      acknowledgment: "I understand your concern. Let me help put your mind at ease.",
      transition: "Here's what you should know:"
    },
    {
      acknowledgment: "Don't worry, I'm here to help you with this.",
      transition: "Here's the information you need:"
    },
    {
      acknowledgment: "I can help address your concerns.",
      transition: "Let me explain:"
    }
  ],
  excited: [
    {
      acknowledgment: "I love the enthusiasm!",
      transition: "Here's what you need to know:"
    },
    {
      acknowledgment: "That's exciting!",
      transition: "Let me help you with that:"
    },
    {
      acknowledgment: "Great to see you so interested!",
      transition: "Here's the information:"
    }
  ],
  neutral: [
    {
      acknowledgment: "Thank you for reaching out.",
      transition: "Here's what I can tell you:"
    },
    {
      acknowledgment: "I'm happy to help.",
      transition: "Here's the information you need:"
    },
    {
      acknowledgment: "Let me assist you with that.",
      transition: "Here's what you should know:"
    }
  ]
};

const supportiveSuffixes: Record<Emotion, string[]> = {
  happy: [
    "Feel free to ask if you need anything else!",
    "Is there anything else I can help you with?",
    "Let me know if you have any other questions!"
  ],
  sad: [
    "I hope this helps improve your experience. Please let me know if you need anything else.",
    "If there's anything more I can do to help, please don't hesitate to ask.",
    "I'm here if you need any additional support or information."
  ],
  angry: [
    "I appreciate your patience. Is there anything else I can help clarify?",
    "Thank you for giving me the opportunity to help. Let me know if you need more information.",
    "I'm here to ensure you have the best experience possible. Feel free to ask anything else."
  ],
  frustrated: [
    "I hope that makes things clearer. Don't hesitate to ask if you need more help!",
    "Feel free to ask follow-up questions if anything is still unclear.",
    "I'm here to help make this as smooth as possible for you."
  ],
  confused: [
    "Does that make sense? Feel free to ask for more clarification!",
    "I'm happy to explain further if you need more details.",
    "Let me know if you'd like me to break it down differently!"
  ],
  anxious: [
    "I hope this helps ease your concerns. Please reach out if you have more questions.",
    "Feel free to ask anything else that might help you feel more comfortable.",
    "I'm here to support you through this process."
  ],
  excited: [
    "Enjoy! Let me know if you have any other questions!",
    "Hope you have a great experience! Feel free to reach out anytime.",
    "Can't wait for you to enjoy this! Ask away if you need more info!"
  ],
  neutral: [
    "Let me know if you need anything else.",
    "Feel free to ask if you have more questions.",
    "I'm here if you need additional information."
  ]
};

export function generateEmpatheticResponse(
  baseResponse: string,
  emotion: Emotion,
  confidence: number
): string {
  if (confidence < 0.3 || emotion === 'neutral') {
    return baseResponse;
  }

  const prefixes = empatheticPrefixes[emotion];
  const suffixes = supportiveSuffixes[emotion];

  const selectedPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const selectedSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${selectedPrefix.acknowledgment} ${selectedPrefix.transition}\n\n${baseResponse}\n\n${selectedSuffix}`;
}

export function generateNoAnswerResponse(emotion: Emotion, suggestedTopics: string): string {
  const empatheticIntros: Record<Emotion, string> = {
    happy: "I appreciate your positive energy! While I don't have a specific answer to that exact question,",
    sad: "I'm sorry I don't have a direct answer to your question.",
    angry: "I understand you need information, and I apologize that I don't have a specific answer to that question.",
    frustrated: "I can see you're looking for specific information. While I don't have that exact answer,",
    confused: "That's a great question! While I don't have that specific information,",
    anxious: "I understand you're looking for clarity. While I don't have that exact answer,",
    excited: "I love your enthusiasm! While I don't have that specific information right now,",
    neutral: "I don't have a specific answer to that question."
  };

  const supportiveOutros: Record<Emotion, string> = {
    happy: "I'm sure we can find what you're looking for together!",
    sad: "I hope these topics can still be helpful to you.",
    angry: "I want to ensure you get the help you need, so please try one of these topics.",
    frustrated: "I hope one of these topics addresses what you're looking for!",
    confused: "I hope one of these common topics can help clarify things for you!",
    anxious: "I'm confident one of these topics will help address your needs.",
    excited: "I'm sure one of these topics will be just what you need!",
    neutral: "Please try asking about one of these topics."
  };

  return `${empatheticIntros[emotion]} ${suggestedTopics}\n\n${supportiveOutros[emotion]}`;
}
