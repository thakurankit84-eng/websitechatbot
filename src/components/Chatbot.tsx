/*
  Chatbot component (Menu-based Option B)

  Key behavior for Assignment-1:
  - Accessible chat widget fixed at bottom-right.
  - Users interact using predefined menu buttons (no typing required).
  - Rule-based responses (no AI).
  - Fallback: "Contact admin for advanced queries"

  Updates requested:
  - Icons on every menu option (lucide-react).
  - Persistent action buttons (Back/Home/Restart) available on every screen.

  Notes:
  - This version intentionally logs each button click as a user message so the
    conversation reads naturally in the chat transcript.
*/

import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  MessageCircle,
  X,
  Bot,
  User,
  Ticket,
  CircleDollarSign,
  Clock,
  Armchair,
  XCircle,
  LogIn,
  HelpCircle,
  ArrowLeft,
  Home,
  RotateCcw,
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// Multi-level predefined menu (Option B): users navigate by clicking options
// instead of typing. This keeps behavior predictable and accessible.

type MenuId = 'main' | 'booking' | 'cancellation' | 'account';

type MenuOption =
  | { type: 'reply'; label: string; reply: string; icon: LucideIcon }
  | { type: 'goto'; label: string; to: MenuId; icon: LucideIcon }
  | { type: 'close'; label: string; icon: LucideIcon };

type Menu = {
  id: MenuId;
  title: string;
  prompt: string;
  options: MenuOption[];
};

// Assignment requirement: default response for unrecognized requests
const FALLBACK_TEXT = 'Contact admin for advanced queries';

const MENUS: Record<MenuId, Menu> = {
  main: {
    id: 'main',
    title: 'Main menu',
    prompt: 'Choose a topic below. I will guide you step-by-step.',
    options: [
      { type: 'goto', label: 'Booking help', to: 'booking', icon: Ticket },
      {
        type: 'reply',
        label: 'Ticket pricing',
        icon: CircleDollarSign,
        reply:
          'Ticket prices vary by movie, theatre, and showtime. You will see the final price before payment on the checkout page.',
      },
      {
        type: 'reply',
        label: 'Show timings',
        icon: Clock,
        reply:
          'To view show timings: open a movie → select your city/theatre → available showtimes will be listed.',
      },
      {
        type: 'reply',
        label: 'Seat selection',
        icon: Armchair,
        reply:
          'During booking, use the seat map to choose available seats. Selected seats are highlighted before you proceed to payment.',
      },
      {
        type: 'goto',
        label: 'Cancellation / Refunds',
        to: 'cancellation',
        icon: XCircle,
      },
      { type: 'goto', label: 'Account / Login help', to: 'account', icon: LogIn },
      { type: 'reply', label: 'Contact admin', icon: HelpCircle, reply: FALLBACK_TEXT },
      { type: 'close', label: 'Close chat', icon: X },
    ],
  },
  booking: {
    id: 'booking',
    title: 'Booking help',
    prompt: 'What part of booking do you need help with?',
    options: [
      {
        type: 'reply',
        label: 'Browse movies',
        icon: Ticket,
        reply:
          'Go to Movies → filter by language/genre → open a movie to see description and showtimes.',
      },
      {
        type: 'reply',
        label: 'Select city / theatre',
        icon: Home,
        reply:
          'After choosing a movie, select your city and preferred theatre to see available showtimes.',
      },
      {
        type: 'reply',
        label: 'Choose showtime',
        icon: Clock,
        reply:
          'Pick a showtime from the list. If a timing is sold out, it may be disabled or show limited seats.',
      },
      {
        type: 'reply',
        label: 'Select seats',
        icon: Armchair,
        reply:
          'Choose seats from the seat map (available seats only) → confirm selection → continue.',
      },
      {
        type: 'reply',
        label: 'Payment steps',
        icon: CircleDollarSign,
        reply:
          'After selecting seats, review the booking summary → confirm price → proceed to payment → you will receive booking confirmation.',
      },
    ],
  },
  cancellation: {
    id: 'cancellation',
    title: 'Cancellation / Refunds',
    prompt: 'Choose a cancellation topic:',
    options: [
      {
        type: 'reply',
        label: 'How to cancel',
        icon: XCircle,
        reply:
          'Go to My Bookings → select your ticket → choose Cancel. The system will show if cancellation is allowed.',
      },
      {
        type: 'reply',
        label: 'Refund policy',
        icon: CircleDollarSign,
        reply:
          'Refund depends on the cancellation window and policy shown during booking. If refund is not available, please contact admin.',
      },
      {
        type: 'reply',
        label: 'Change booking',
        icon: Ticket,
        reply:
          'If changes are supported, cancel the existing booking (if allowed) and book again. Otherwise, contact admin for assistance.',
      },
    ],
  },
  account: {
    id: 'account',
    title: 'Account / Login',
    prompt: 'Choose an account topic:',
    options: [
      {
        type: 'reply',
        label: 'How to login',
        icon: LogIn,
        reply:
          'To log in, click Login on the top-right of the website. Enter your credentials and submit.',
      },
      {
        type: 'reply',
        label: 'Forgot password',
        icon: HelpCircle,
        reply:
          'On the login page, click Forgot Password and follow the steps to reset your password.',
      },
      {
        type: 'reply',
        label: 'Account locked / OTP issues',
        icon: HelpCircle,
        reply:
          'If you are unable to receive OTP or your account is locked, please contact admin for advanced queries.',
      },
    ],
  },
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuId, setMenuId] = useState<MenuId>('main');
  const [menuStack, setMenuStack] = useState<MenuId[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const openChat = () => {
    setIsOpen(true);
    setMenuStack([]);
    setMenuId('main');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length == 0) {
      addBotMessage("Hello! I'm your movie booking assistant. Please choose one of the options below.");
      addBotMessage(MENUS.main.prompt);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [isOpen]);

  const goToMenu = (next: MenuId) => {
    setMenuStack((prev) => [...prev, menuId]);
    setMenuId(next);
    addBotMessage(MENUS[next].prompt);
  };

  const goBack = () => {
    setMenuStack((prev) => {
      const copy = [...prev];
      const prevMenu = copy.pop();
      if (prevMenu) {
        setMenuId(prevMenu);
        addBotMessage(MENUS[prevMenu].prompt);
      } else {
        setMenuId('main');
        addBotMessage(MENUS.main.prompt);
      }
      return copy;
    });
  };

  // Home: go to main menu, keep chat history
  const goHome = () => {
    setMenuStack([]);
    setMenuId('main');
    addBotMessage(MENUS.main.prompt);
  };

  // Restart: clear conversation + return to main menu
  const restartChat = () => {
    setMenuStack([]);
    setMenuId('main');
    setMessages([]);
    // Welcome + prompt will be re-added by the open effect when chat is open.
    // But we add them immediately for a smooth demo.
    setTimeout(() => {
      addBotMessage("Hello! I'm your movie booking assistant. Please choose one of the options below.");
      addBotMessage(MENUS.main.prompt);
    }, 0);
  };

  const handleOption = (opt: MenuOption) => {
    addUserMessage(opt.label);
    setLoading(true);

    setTimeout(() => {
      if (opt.type === 'reply') {
        addBotMessage(opt.reply || FALLBACK_TEXT);
      } else if (opt.type === 'goto') {
        goToMenu(opt.to);
      } else if (opt.type === 'close') {
        setIsOpen(false);
      } else {
        addBotMessage(FALLBACK_TEXT);
      }
      setLoading(false);
    }, 200);
  };

  if (!isOpen) {
    return (
      <button
        ref={toggleButtonRef}
        onClick={openChat}
        aria-expanded={isOpen}
        aria-controls="chatbot-dialog"
        aria-label="Open chat support"
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 hover:scale-110 z-40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
      >
        <MessageCircle size={28} aria-hidden="true" />
      </button>
    );
  }

  const ActionButton = ({
    label,
    icon: Icon,
    onClick,
    disabled,
  }: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-xs px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
      aria-label={label}
      title={label}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  );

  return (
    <div
      id="chatbot-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
      className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 w-full max-w-md mx-auto sm:mx-0 h-[60vh] sm:h-[600px] bg-white rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col z-40"
    >
      <div className="bg-red-600 text-white p-4 rounded-t-lg sm:rounded-t-lg flex items-center justify-between">
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
                message.isBot ? 'bg-white text-gray-800 shadow-sm' : 'bg-red-600 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        {/* Persistent actions (available everywhere) */}
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <div className="flex flex-wrap gap-2">
            {menuStack.length > 0 ? (
              <ActionButton label="Back" icon={ArrowLeft} onClick={() => { addUserMessage('Back'); goBack(); }} disabled={loading} />
            ) : null}
            <ActionButton label="Home" icon={Home} onClick={() => { addUserMessage('Home'); goHome(); }} disabled={loading} />
            <ActionButton label="Restart" icon={RotateCcw} onClick={() => { addUserMessage('Restart'); restartChat(); }} disabled={loading} />
          </div>
          <p className="text-xs text-gray-600">{MENUS[menuId].title}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {MENUS[menuId].options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={`${menuId}-${opt.label}`}
                type="button"
                onClick={() => handleOption(opt)}
                disabled={loading}
                className="text-xs px-3 py-2 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label={`Option: ${opt.label}`}
                title={opt.label}
              >
                <Icon size={14} aria-hidden="true" />
                {opt.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-[11px] text-gray-500">
          Tip: Use the menu buttons. For anything not covered, you will be asked to contact the admin.
        </p>
      </div>
    </div>
  );
}
