import { useState } from 'react';
import { isSpeechRecognitionSupported, listenOnce, speak } from '../lib/voiceHelper';
import { analyzeAndRespond, AnalysisResult } from '../lib/emotionHelper';
import { Mic } from 'lucide-react';

export default function VoiceChat({ onReply }: { onReply?: (analysis: AnalysisResult) => void }) {
  const [listening, setListening] = useState(false);

  const startListen = async () => {
    if (!isSpeechRecognitionSupported()) {
      return;
    }

    setListening(true);
    const result = await listenOnce(10000);
    setListening(false);

    if (result.error) {
      return;
    }

    const transcript = (result.transcript || '').trim();

    if (transcript) {
      const analysis = analyzeAndRespond(transcript);
      // speak the reply
      await speak(analysis.reply, analysis.emotion);
      onReply?.(analysis);
    }
  };

  return (
    <button
      onClick={startListen}
      disabled={listening}
      aria-label="Speak to the bot"
      title={listening ? 'Listening...' : 'Speak to the bot'}
      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 ${listening ? 'bg-gray-400' : 'bg-red-600 text-white'}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Mic size={18} aria-hidden="true" />
    </button>
  );
}
