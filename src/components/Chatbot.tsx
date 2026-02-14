/*
  Chatbot component

  Design choices:
  - Accessibility: Provides ARIA roles (dialog, aria-live) and keyboard support (Enter to send, Escape to close). Focus is managed so keyboard/screen-reader users can interact easily.
  - Responsiveness: Renders as a full-width bottom sheet on small screens and a floating panel on larger screens using responsive Tailwind classes.
  - Usability: Message area auto-scrolls, polite loading indicator, and friendly fallback suggestions when no FAQ match is found.
  - FAQ matching: Uses direct keyword matches first, then fuzzy matching (Levenshtein + token overlap) with a conservative threshold to avoid incorrect answers.

  How to run and test the chat window locally:
  1) Install dependencies: `npm install` or `yarn` in the project root.
  2) Start the dev server: `npm run dev` (uses Vite). Open http://localhost:5173 (or the console URL).
  3) Interact with the chatbot:
     - Click the floating chat button to open the dialog (or press Tab to focus and Enter to open).
     - Type a question and press Enter to send (Shift+Enter inserts newline).
     - Press Escape to close the chat; focus returns to the chat toggle button.
     - Test on narrow screens to confirm bottom-sheet behavior and on wide screens for the floating panel.
  4) To test accessibility: use a screen reader (NVDA/VoiceOver) and keyboard-only navigation to ensure announcements and focus work as expected.

  Files of interest:
  - `src/components/Chatbot.tsx`  (this file)
  - `src/lib/faqRepository.ts`    (default fallback FAQs)

  Notes:
  - If Supabase is not configured, the component falls back to `getDefaultFaqs()`.
  - To modify matching behavior adjust the threshold in `findAnswer`.
*/

import { useState, useEffect, useRef } from 'react';
import { supabase, FAQ, SUPABASE_ENABLED } from '../lib/supabase';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { getDefaultFaqs } from '../lib/faqRepository';
import { detectEmotion, Emotion, getEmotionColor } from '../lib/emotionDetection';
import { generateEmpatheticResponse, generateNoAnswerResponse } from '../lib/empatheticResponses';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  emotion?: Emotion;
  emotionConfidence?: number;
}

const sampleFaqs: FAQ[] = getDefaultFaqs();

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeConversation();
      addBotMessage(
        "Hello! I'm your movie booking assistant. How can I help you today? You can ask me about ticket prices, show timings, cancellation policy, or anything else!"
      );
    }
  }, [isOpen]);

  const initializeConversation = async () => {
    if (!SUPABASE_ENABLED || conversationId) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ session_id: sessionId })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setConversationId(data.id);
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  const saveMessageToDatabase = async (
    text: string,
    isBot: boolean,
    emotion?: Emotion,
    emotionConfidence?: number,
    emotionKeywords?: string[]
  ) => {
    if (!SUPABASE_ENABLED || !conversationId) return;

    try {
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        message_text: text,
        is_bot: isBot,
        detected_emotion: emotion,
        emotion_confidence: emotionConfidence,
        emotion_keywords: emotionKeywords
      });

      await supabase
        .from('conversations')
        .update({
          last_activity: new Date().toISOString(),
          message_count: messages.length + 1
        })
        .eq('id', conversationId);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Focus the input when the dialog opens for immediate typing
      setTimeout(() => inputRef.current?.focus(), 0);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    } else {
      // Return focus to the toggle button when closed to preserve keyboard flow
      toggleButtonRef.current?.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchFAQs = async () => {
    try {
      if (!SUPABASE_ENABLED) {
        // Use centralized default FAQs when Supabase is not configured
        setFaqs(sampleFaqs);
        return;
      }

      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFaqs((data as FAQ[]) || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      // fallback to repository faqs on error
      setFaqs(sampleFaqs);
    }
  };

  const addBotMessage = (text: string, emotion?: Emotion) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      emotion,
    };
    setMessages((prev) => [...prev, message]);
    saveMessageToDatabase(text, true, emotion);
  };

  const addUserMessage = (text: string, emotion: Emotion, emotionConfidence: number, keywords: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
      emotion,
      emotionConfidence,
    };
    setMessages((prev) => [...prev, message]);
    saveMessageToDatabase(text, false, emotion, emotionConfidence, keywords);
  };

  // Levenshtein distance for fuzzy matching (kept local for simplicity)
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
    const setB = new Set(bTokens);
    const common = aTokens.filter((t) => setB.has(t)).length;
    return common / Math.max(aTokens.length, bTokens.length);
  };

  const findAnswer = (question: string): string | null => {
    const lowercaseQuestion = question.toLowerCase();

    // First try direct keyword / question match for high-precision answers
    for (const faq of faqs) {
      const keywords = (faq.keywords || '').toLowerCase().split(',').map(k => k.trim());
      const questionWords = faq.question.toLowerCase();

      if (
        keywords.some(keyword => keyword && lowercaseQuestion.includes(keyword)) ||
        lowercaseQuestion.includes(questionWords)
      ) {
        return faq.answer;
      }
    }

    // Fallback: compute fuzzy scores and pick best match
    let best: { faq?: FAQ; score: number } = { score: 0 };

    for (const faq of faqs) {
      const q = faq.question.toLowerCase();
      const a = (faq.answer || '').toLowerCase();

      const simQ = similarity(lowercaseQuestion, q);
      const simA = similarity(lowercaseQuestion, a);
      const overlapQ = tokenOverlap(lowercaseQuestion, q);
      const overlapA = tokenOverlap(lowercaseQuestion, a);

      // Weighted score: prefer question similarity and token overlap
      const score = Math.max(simQ * 0.6 + overlapQ * 0.4, simA * 0.5 + overlapA * 0.5);

      if (score > best.score) {
        best = { faq, score };
      }
    }

    // Threshold to avoid wrong matches; tweak as needed
    if (best.faq && best.score >= 0.35) {
      return best.faq.answer;
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    const emotionAnalysis = detectEmotion(userMessage);
    addUserMessage(userMessage, emotionAnalysis.emotion, emotionAnalysis.confidence, emotionAnalysis.keywords);
    setLoading(true);

    setTimeout(() => {
      const answer = findAnswer(userMessage);

      if (answer) {
        const empatheticAnswer = generateEmpatheticResponse(
          answer,
          emotionAnalysis.emotion,
          emotionAnalysis.confidence
        );
        addBotMessage(empatheticAnswer, emotionAnalysis.emotion);
      } else {
        const suggestions = sampleFaqs.map(f => `• ${f.question}`).join('\n');
        const suggestedTopics = `Here are some common topics I can help with:\n\n${suggestions}`;
        const empatheticNoAnswer = generateNoAnswerResponse(emotionAnalysis.emotion, suggestedTopics);
        addBotMessage(empatheticNoAnswer, emotionAnalysis.emotion);
      }
      setLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter sends message; Shift+Enter allows newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        ref={toggleButtonRef}
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="chatbot-dialog"
        aria-label="Open chat support"
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 hover:scale-110 z-40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
      >
        <MessageCircle size={28} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      id="chatbot-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
      className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 w-full max-w-md mx-auto sm:mx-0 h-[60vh] sm:h-[600px] bg-white rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col z-40"
    >
      <div className="bg-red-600 text-white p-4 rounded-t-lg sm:rounded-t-lg flex items-center justify-between" >
        <div className="flex items-center gap-2">
          <Bot size={24} aria-hidden="true" />
          <div>
            <h3 id="chatbot-title" className="font-semibold">Movie Bot</h3>
            <p className="text-xs text-red-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-red-700 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          aria-label="Close chat"
          title="Close chat"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" role="log" aria-live="polite">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
            role="article"
            aria-label={`${message.isBot ? 'Bot' : 'You'} message at ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          >
            {message.isBot && (
              <div className="bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Bot size={16} />
              </div>
            )}
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.isBot
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'bg-red-600 text-white'
              }`}
            >
              {!message.isBot && message.emotion && message.emotion !== 'neutral' && (
                <div className={`text-xs mb-1 font-semibold ${getEmotionColor(message.emotion)}`}>
                  {message.emotion.charAt(0).toUpperCase() + message.emotion.slice(1)} detected
                </div>
              )}
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {!message.isBot && (
              <div className="bg-gray-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center">
              <Bot size={16} aria-hidden="true" />
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white sm:rounded-b-lg rounded-b-lg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            aria-label="Type your message"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
            aria-label="Send message"
            title="Send"
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            <Send size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
