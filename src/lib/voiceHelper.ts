/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* Wrapper around Web Speech APIs for client-side STT and TTS.
   listenOnce(): captures a single phrase and returns transcript.
   speak(text, emotion): speaks text with voice parameters tuned by emotion.
*/

import { Emotion } from './emotionDetection';

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) ? true : false;
}

export function listenOnce(timeout = 8000): Promise<{ transcript?: string; error?: string }> {
  return new Promise((resolve) => {
    if (!isSpeechRecognitionSupported()) {
      resolve({ error: 'Speech recognition not supported in this browser.' });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    let finished = false;
    const onResult = (ev: any) => {
      const t = ev.results && ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript;
      finished = true;
      cleanup();
      resolve({ transcript: t });
    };

    const onError = (ev: any) => {
      finished = true;
      cleanup();
      resolve({ error: ev && ev.error ? ev.error : 'Speech recognition error' });
    };

    const onEnd = () => {
      if (!finished) {
        finished = true;
        cleanup();
        resolve({ error: 'No speech detected' });
      }
    };

    function cleanup() {
      try {
        recog.removeEventListener('result', onResult);
        recog.removeEventListener('error', onError);
        recog.removeEventListener('end', onEnd);
      } catch (e) {
        console.debug('cleanup error', e);
      }
      try { recog.stop(); } catch (e) { console.debug('stop error', e); }
    }

    recog.addEventListener('result', onResult);
    recog.addEventListener('error', onError);
    recog.addEventListener('end', onEnd);

    try {
      recog.start();
    } catch (e) {
      cleanup();
      resolve({ error: 'Failed to start speech recognition' });
      return;
    }

    // safety timeout
    setTimeout(() => {
      if (!finished) {
        finished = true;
        cleanup();
        resolve({ error: 'Listening timed out' });
      }
    }, timeout);
  });
}

export function speak(text: string, emotion?: Emotion): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !(window as any).speechSynthesis) {
      resolve();
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    // tune voice parameters by emotion
    switch (emotion) {
      case 'anxious':
      case 'sad':
        utter.rate = 0.9;
        utter.pitch = 0.8;
        break;
      case 'happy':
      case 'excited':
        utter.rate = 1.05;
        utter.pitch = 1.2;
        break;
      case 'angry':
      case 'frustrated':
        // calmer, slower to de-escalate
        utter.rate = 0.9;
        utter.pitch = 1.0;
        break;
      default:
        utter.rate = 1.0;
        utter.pitch = 1.0;
        break;
    }

    const onEnd = () => {
      try {
        utter.removeEventListener('end', onEnd as any);
        utter.removeEventListener('error', onError as any);
      } catch (e) { console.debug('remove listener failed', e); }
      resolve();
    };
    const onError = () => {
      try {
        utter.removeEventListener('end', onEnd as any);
        utter.removeEventListener('error', onError as any);
      } catch (e) { console.debug('remove listener failed', e); }
      resolve();
    };

    utter.addEventListener('end', onEnd as any);
    utter.addEventListener('error', onError as any);

    try {
      (window as any).speechSynthesis.cancel();
      (window as any).speechSynthesis.speak(utter);
    } catch (e) {
      console.debug('TTS speak failed', e);
      resolve();
    }
  });
}
