/*
  # Conversation Tracking with Emotion Analysis

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key) - unique conversation identifier
      - `session_id` (text) - browser session identifier
      - `started_at` (timestamptz) - conversation start time
      - `last_activity` (timestamptz) - last message timestamp
      - `message_count` (integer) - total messages in conversation
      - `created_at` (timestamptz) - record creation time
    
    - `conversation_messages`
      - `id` (uuid, primary key) - unique message identifier
      - `conversation_id` (uuid, foreign key) - links to conversations
      - `message_text` (text) - the actual message content
      - `is_bot` (boolean) - true if bot message, false if user
      - `detected_emotion` (text) - detected emotion (happy/sad/angry/etc)
      - `emotion_confidence` (numeric) - confidence score 0-1
      - `emotion_keywords` (text array) - keywords that triggered emotion
      - `timestamp` (timestamptz) - when message was sent
      - `created_at` (timestamptz) - record creation time

  2. Security
    - Enable RLS on both tables
    - Public read access for analytics (anonymous users)
    - No write restrictions (allows chatbot to function without auth)

  3. Indexes
    - Index on session_id for fast conversation lookup
    - Index on conversation_id for message retrieval
    - Index on detected_emotion for analytics

  4. Important Notes
    - Conversations are tracked by browser session
    - Emotion data helps improve chatbot responses over time
    - Data can be analyzed to understand user sentiment trends
*/

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  is_bot boolean DEFAULT false,
  detected_emotion text,
  emotion_confidence numeric(3,2),
  emotion_keywords text[],
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read conversations"
  ON public.conversations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert conversations"
  ON public.conversations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update conversations"
  ON public.conversations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON public.conversation_messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON public.conversation_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_emotion ON public.conversation_messages(detected_emotion);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON public.conversations(last_activity DESC);
