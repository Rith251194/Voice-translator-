import React, { useState, useRef } from 'react';
import { EngineType, SpeechSpeed, SpeechTone, VoiceGender, VoiceOption } from '../types';
import { NATIVE_VOICES, GEMINI_VOICES, TONE_OPTIONS } from '../data/khmerData';
import { Mic, Sliders, Zap, Check, Play, Square, User, Volume2, Sparkles } from 'lucide-react';

interface VoiceSettingsProps {
  engine: EngineType;
  onEngineChange: (engine: EngineType) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  selectedTone: SpeechTone;
  onToneChange: (tone: SpeechTone) => void;
  speechSpeed: SpeechSpeed;
  onSpeedChange: (speed: SpeechSpeed) => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  engine,
  onEngineChange,
  selectedVoice,
  onVoiceChange,
  selectedTone,
  onToneChange,
  speechSpeed,
  onSpeedChange,
}) => {
  const [genderFilter, setGenderFilter] = useState<'all' | VoiceGender>('all');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Active voice list based on selected engine
  const availableVoices = engine === 'native' ? NATIVE_VOICES : GEMINI_VOICES;

  // Filter voices based on gender tab
  const filteredVoices = availableVoices.filter((v) => {
    if (genderFilter === 'all') return true;
    return v.gender === genderFilter;
  });

  // Preview Voice Sample
  const handleTogglePreview = (voice: VoiceOption, e: React.MouseEvent) => {
    e.stopPropagation();

    // If already playing this voice, stop it
    if (previewingVoiceId === voice.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      setPreviewingVoiceId(null);
      return;
    }

    // Stop any current audio
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
    }

    const audioUrl = `/previews/${voice.id.toLowerCase()}.mp3`;
    const audio = new Audio(audioUrl);
    previewAudioRef.current = audio;
    setPreviewingVoiceId(voice.id);

    audio.play().catch((err) => {
      console.warn('Voice preview error:', err);
      setPreviewingVoiceId(null);
    });

    audio.onended = () => {
      setPreviewingVoiceId(null);
    };

    audio.onerror = () => {
      // Fallback to API if static preview is somehow missing
      const fallbackUrl = `/api/voice-preview?voice=${voice.id.toLowerCase()}`;
      const fallbackAudio = new Audio(fallbackUrl);
      previewAudioRef.current = fallbackAudio;
      fallbackAudio.play().catch(() => setPreviewingVoiceId(null));
      fallbackAudio.onended = () => setPreviewingVoiceId(null);
      fallbackAudio.onerror = () => setPreviewingVoiceId(null);
    };
  };

  return (
    <div id="voice-settings-panel" className="space-y-5">
      {/* Engine Selection Header */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            <span>ម៉ាស៊ីនសំឡេង (Speech Engine)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Native Khmer Voice */}
          <button
            id="engine-native-btn"
            type="button"
            onClick={() => {
              onEngineChange('native');
              // Ensure selected voice is valid in native
              if (!NATIVE_VOICES.some((v) => v.id === selectedVoice)) {
                onVoiceChange(NATIVE_VOICES[0].id);
              }
            }}
            className={`flex flex-col rounded-xl border p-3.5 text-left transition-all relative ${
              engine === 'native'
                ? 'border-yellow-500/70 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-500/30'
                : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-khmer text-sm font-semibold text-neutral-100">
                  សំឡេងខ្មែរធម្មជាតិ (Native Khmer)
                </span>
              </div>
              {engine === 'native' && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-neutral-950">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Standard native Khmer speech with distinct male and female voice models
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                Highest Accuracy • Male & Female
              </span>
            </div>
          </button>

          {/* Gemini AI Voice */}
          <button
            id="engine-gemini-btn"
            type="button"
            onClick={() => {
              onEngineChange('gemini');
              if (!GEMINI_VOICES.some((v) => v.id === selectedVoice)) {
                onVoiceChange(GEMINI_VOICES[0].id);
              }
            }}
            className={`flex flex-col rounded-xl border p-3.5 text-left transition-all relative ${
              engine === 'gemini'
                ? 'border-yellow-500/70 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-500/30'
                : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-850'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-100">
                Gemini AI Studio Voice
              </span>
              {engine === 'gemini' && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-neutral-950">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Multi-speaker neural AI models with male & female persona timbres
            </p>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-500/20">
                Studio Personas • 5 Voices
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Voice Selection Section */}
      <div id="voice-selection-container" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-300">
            <Mic className="h-3.5 w-3.5 text-yellow-400" />
            <span>ជ្រើសរើសសំឡេង (Khmer Voice Selection)</span>
          </label>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1 rounded-lg bg-neutral-950/80 p-0.5 border border-neutral-800">
            <button
              id="filter-all-voices"
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                genderFilter === 'all'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              ទាំងអស់ (All)
            </button>
            <button
              id="filter-female-voices"
              type="button"
              onClick={() => setGenderFilter('female')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                genderFilter === 'female'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-neutral-400 hover:text-rose-300'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span>សំឡេងស្រី (Female)</span>
            </button>
            <button
              id="filter-male-voices"
              type="button"
              onClick={() => setGenderFilter('male')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                genderFilter === 'male'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-neutral-400 hover:text-sky-300'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>សំឡេងប្រុស (Male)</span>
            </button>
          </div>
        </div>

        {/* Distinct Khmer Voice Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoice.toLowerCase() === voice.id.toLowerCase();
            const isPreviewing = previewingVoiceId === voice.id;
            const isFemale = voice.gender === 'female';

            return (
              <div
                key={voice.id}
                id={`voice-card-${voice.id}`}
                onClick={() => onVoiceChange(voice.id)}
                className={`group relative flex flex-col justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-yellow-500/90 bg-yellow-500/10 shadow-md shadow-yellow-500/5 ring-1 ring-yellow-500/40'
                    : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                {/* Top Row: Name and Gender Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Gender Avatar Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-semibold text-xs shadow-inner ${
                        isFemale
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                          : 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                      }`}
                    >
                      {isFemale ? 'ស្រី' : 'ប្រុស'}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-neutral-100">{voice.name}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                            isFemale
                              ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                              : 'border-sky-500/20 bg-sky-500/10 text-sky-300'
                          }`}
                        >
                          {isFemale ? 'Female • ស្រី' : 'Male • ប្រុស'}
                        </span>
                      </div>
                      <p className="font-khmer text-xs text-neutral-300 font-medium mt-0.5">
                        {voice.khmerName}
                      </p>
                    </div>
                  </div>

                  {/* Selected Radio/Check indicator */}
                  <div className="shrink-0 pt-0.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500 text-neutral-950 shadow-sm'
                          : 'border-neutral-700 bg-neutral-800 group-hover:border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {voice.description}
                </p>

                {/* Bottom Row: Sample Player Button */}
                <div className="mt-3 flex items-center justify-between border-t border-neutral-800/60 pt-2 text-xs">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {voice.badge}
                  </span>

                  <button
                    id={`preview-voice-${voice.id}`}
                    type="button"
                    onClick={(e) => handleTogglePreview(voice, e)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isPreviewing
                        ? 'bg-yellow-500 text-neutral-950 font-bold shadow-sm'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750 hover:text-white border border-neutral-750'
                    }`}
                    title="Play voice preview"
                  >
                    {isPreviewing ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        <span>កំពុងចាក់...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" />
                        <span className="font-khmer">ស្តាប់គំរូ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tone and Speed row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Tone Selection */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Sliders className="h-3.5 w-3.5 text-yellow-400" />
            <span>រចនាបថសំឡេង (Speaking Tone)</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.id}
                id={`tone-btn-${t.id}`}
                type="button"
                onClick={() => onToneChange(t.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  selectedTone === t.id
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-semibold'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                <span className="font-khmer mr-1">{t.khmerLabel}</span>
                <span className="text-[11px] opacity-75">({t.label})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Speed Selection */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Sliders className="h-3.5 w-3.5 text-yellow-400" />
            <span>ល្បឿនអាន (Speaking Speed)</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'slow', label: 'Slow (យឺត)', desc: '0.85x speed' },
              { id: 'normal', label: 'Normal (ធម្មតា)', desc: '1.0x natural' },
              { id: 'fast', label: 'Fast (លឿន)', desc: '1.2x fluent' },
            ].map((s) => (
              <button
                key={s.id}
                id={`speed-setting-${s.id}`}
                type="button"
                onClick={() => onSpeedChange(s.id as SpeechSpeed)}
                className={`rounded-lg p-2 text-center text-xs transition-colors ${
                  speechSpeed === s.id
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-semibold'
                    : 'bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                <div>{s.label}</div>
                <div className="text-[10px] text-neutral-400 font-normal">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
