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

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { supabase, FAQ, SUPABASE_ENABLED } from '../lib/supabase';
import { MessageCircle, X, Send, Bot, User, Minus, Plus } from 'lucide-react';
import { getDefaultFaqs } from '../lib/faqRepository';
import type { Emotion } from '../lib/emotionDetection';
import { getEmotionColor } from '../lib/emotionDetection';
import { analyzeAndRespond } from '../lib/emotionHelper';
import VoiceChat from './VoiceChat';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [, setFaqs] = useState<FAQ[]>([]); // keep setter for fetch fallback without reading the value
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchFAQs();
    // ensure chat doesn't overflow the right on small screens
    const onResize = () => {
      // nothing for now, placeholder for responsive adjustments
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Use helper that runs emotion detection + FAQ matching and prefers per-emotion answers
    const analysis = analyzeAndRespond(userMessage);

    addUserMessage(userMessage, analysis.emotion, analysis.confidence, analysis.keywords);
    setLoading(true);

    setTimeout(() => {
      addBotMessage(analysis.reply, analysis.emotion);
      setLoading(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter sends message; Shift+Enter allows newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceReply = (analysis: any) => {
    // analysis contains transcript, reply, emotion, confidence, keywords
    addUserMessage(analysis.transcript || '', analysis.emotion, analysis.confidence, analysis.keywords || []);
    setTimeout(() => addBotMessage(analysis.reply, analysis.emotion), 200);
  };

  if (!isOpen) {
    return (
      <button
        ref={toggleButtonRef}
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        aria-expanded={isOpen}
        aria-controls="chatbot-dialog"
        aria-label="Open chat support"
        className="fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 hover:scale-110 z-40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
      >
        <MessageCircle size={22} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      id="chatbot-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
      className="fixed bottom-0 left-0 right-0 sm:bottom-8 sm:right-8 sm:left-auto sm:w-80 w-full max-w-sm mx-auto sm:mx-0 max-h-[80vh] h-[60vh] bg-white rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden"
    >
      <div className="bg-red-600 text-white p-3 sm:p-4 flex items-center justify-between cursor-default">
        <div className="flex items-center gap-2">
          <Bot size={18} aria-hidden="true" />
          <div>
            <h3 id="chatbot-title" className="font-semibold text-sm">Movie Bot</h3>
            <p className="text-xs text-red-100">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized((s) => !s)}
            aria-label={isMinimized ? 'Restore chat' : 'Minimize chat'}
            title={isMinimized ? 'Restore' : 'Minimize'}
            className="p-1 bg-red-700/20 rounded text-white hover:bg-red-700/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            {isMinimized ? <Plus size={14} /> : <Minus size={14} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-red-700 p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            aria-label="Close chat"
            title="Close chat"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isMinimized ? (
        <div className="p-3 bg-gray-50 text-sm text-gray-700">Click the minimize icon to restore chat.</div>
      ) : (
        <>
          <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-3 bg-gray-50" role="log" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
                role="article"
                aria-label={`${message.isBot ? 'Bot' : 'You'} message at ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              >
                {message.isBot && (
                  <div className="bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[72%] p-2 sm:p-3 rounded-lg ${
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
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot size={14} aria-hidden="true" />
                </div>
                <div className="bg-white p-2 rounded-lg shadow-sm">
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

          <div className="p-3 sm:p-4 border-t bg-white sm:rounded-b-lg rounded-b-lg">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                aria-label="Type your message"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                aria-label="Send message"
                title="Send"
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                <Send size={18} aria-hidden="true" />
              </button>
              <div className="ml-2">
                <VoiceChat onReply={handleVoiceReply} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
