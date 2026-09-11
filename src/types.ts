export type EngineType = 'native' | 'gemini';

export type VoiceGender = 'female' | 'male';

export interface VoiceOption {
  id: string;
  name: string;
  khmerName: string;
  gender: VoiceGender;
  description: string;
  badge: string;
  previewUrl?: string;
  sampleText?: string;
}

export type SpeechTone = 'natural' | 'formal' | 'storytelling' | 'cheerful' | 'calm';

export interface ToneOption {
  id: SpeechTone;
  label: string;
  khmerLabel: string;
  description: string;
}

export type SpeechSpeed = 'slow' | 'normal' | 'fast';

export interface SamplePhrase {
  id: string;
  category: 'greetings' | 'daily' | 'tourism' | 'proverbs' | 'numbers';
  categoryLabel: string;
  khmer: string;
  english: string;
  phonetic?: string;
}

export interface GeneratedAudioRecord {
  id: string;
  text: string;
  audioUrl: string;
  format: 'mp3' | 'wav';
  engine: EngineType;
  voice: string;
  gender?: VoiceGender;
  tone: SpeechTone;
  durationSeconds: number;
  timestamp: number;
  fallbackUsed?: boolean;
}

export interface KhmerAnalysis {
  romanization?: string;
  englishTranslation?: string;
  words?: Array<{
    khmer: string;
    romanization: string;
    meaning: string;
  }>;
}
