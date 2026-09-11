/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Sparkles,
  Keyboard,
  BookOpen,
  RotateCcw,
  Clipboard,
  AlertCircle,
  Languages,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EngineType, SpeechSpeed, SpeechTone, GeneratedAudioRecord, SamplePhrase, KhmerAnalysis } from './types';
import { AudioPlayer } from './components/AudioPlayer';
import { KhmerKeyboard } from './components/KhmerKeyboard';
import { SamplePhrases } from './components/SamplePhrases';
import { VoiceSettings } from './components/VoiceSettings';
import { GenerationHistory } from './components/GenerationHistory';

const STORAGE_KEY = 'khmer_tts_history_v1';

export default function App() {
  const [khmerText, setKhmerText] = useState<string>(
    'ជំរាបសួរ! សូមស្វាគមន៍មកកាន់កម្មវិធីបំប្លែងអត្ថបទទៅជាសំឡេងភាសាខ្មែរ។'
  );
  const [engine, setEngine] = useState<EngineType>('native');
  const [selectedVoice, setSelectedVoice] = useState<string>('bopha');
  const [selectedTone, setSelectedTone] = useState<SpeechTone>('natural');
  const [speechSpeed, setSpeechSpeed] = useState<SpeechSpeed>('normal');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<GeneratedAudioRecord | null>(null);
  const [history, setHistory] = useState<GeneratedAudioRecord[]>([]);

  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [showSamples, setShowSamples] = useState<boolean>(false);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<KhmerAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 15));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (record: GeneratedAudioRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev.filter((r) => r.id !== record.id)].slice(0, 15);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Handle storage quota limit if base64 files are large
        try {
          const minimal = updated.slice(0, 5);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
        } catch {
          // Ignore
        }
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  // Keyboard insertion handlers maintaining cursor position
  const handleInsertChar = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setKhmerText((prev) => prev + char);
      return;
    }

    const start = textarea.selectionStart ?? khmerText.length;
    const end = textarea.selectionEnd ?? khmerText.length;
    const newText = khmerText.substring(0, start) + char + khmerText.substring(end);

    setKhmerText(newText);

    // Restore cursor position after the inserted character
    setTimeout(() => {
      textarea.focus();
      const newPos = start + char.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleBackspace = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    if (start === end && start > 0) {
      // Remove one character or combining mark before cursor
      const newText = khmerText.substring(0, start - 1) + khmerText.substring(end);
      setKhmerText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 1, start - 1);
      }, 10);
    } else if (start !== end) {
      const newText = khmerText.substring(0, start) + khmerText.substring(end);
      setKhmerText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start);
      }, 10);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setKhmerText(text);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleSelectPhrase = (phrase: SamplePhrase) => {
    setKhmerText(phrase.khmer);
    setShowSamples(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Primary Speech Generation
  const handleGenerateVoice = async () => {
    const textToSpeak = khmerText.trim();
    if (!textToSpeak) {
      setErrorMessage('សូមបញ្ចូលអត្ថបទជាភាសាខ្មែរ (Please enter Khmer text)');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          engine,
          voice: selectedVoice,
          tone: selectedTone,
          speed: speechSpeed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      const isVoiceMale = ['dara', 'piseth', 'puck', 'charon', 'fenrir'].includes(
        (data.voice || selectedVoice).toLowerCase()
      );

      const newRecord: GeneratedAudioRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: textToSpeak,
        audioUrl: data.audioUrl,
        format: data.format || 'mp3',
        engine: data.engine || engine,
        voice: data.voice || selectedVoice,
        gender: data.gender || (isVoiceMale ? 'male' : 'female'),
        tone: selectedTone,
        durationSeconds: data.durationSeconds || 3,
        timestamp: Date.now(),
        fallbackUsed: data.fallbackUsed,
      };

      setCurrentRecord(newRecord);
      saveToHistory(newRecord);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Error communicating with voice synthesis service.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Romanization and Translation Analysis
  const handleAnalyzeText = async () => {
    const textToAnalyze = khmerText.trim();
    if (!textToAnalyze) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-khmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 text-yellow-400 shadow-sm">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  Khmer Text to Voice
                </h1>
                <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400 border border-yellow-500/20">
                  ភាសាខ្មែរ
                </span>
              </div>
              <p className="font-khmer text-xs text-neutral-400">
                បំប្លែងអត្ថបទទៅជាសំឡេងភាសាខ្មែរធម្មជាតិ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-300 border border-neutral-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Voice Engine Ready</span>
              <span className="sm:hidden">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Text Input, Keyboard, & Voice Settings (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Input Card */}
            <div
              id="input-card"
              className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl shadow-black/30"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    អត្ថបទភាសាខ្មែរ (Khmer Text)
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {khmerText.length} chars
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="sample-phrases-toggle"
                    type="button"
                    onClick={() => setShowSamples(!showSamples)}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      showSamples
                        ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
                        : 'border-neutral-750 bg-neutral-800 text-neutral-300 hover:bg-neutral-750 hover:text-white'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Samples</span>
                    {showSamples ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  <button
                    id="virtual-keyboard-toggle"
                    type="button"
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      showKeyboard
                        ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
                        : 'border-neutral-750 bg-neutral-800 text-neutral-300 hover:bg-neutral-750 hover:text-white'
                    }`}
                  >
                    <Keyboard className="h-3.5 w-3.5" />
                    <span className="font-khmer">ក្តារចុច</span>
                  </button>

                  <button
                    id="paste-clipboard-btn"
                    type="button"
                    onClick={handlePasteClipboard}
                    className="flex items-center gap-1 rounded-lg border border-neutral-750 bg-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-750 hover:text-neutral-200 transition-colors"
                    title="Paste from clipboard"
                  >
                    {copiedNotification ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                  </button>

                  <button
                    id="clear-text-btn"
                    type="button"
                    onClick={() => setKhmerText('')}
                    className="flex items-center gap-1 rounded-lg border border-neutral-750 bg-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-750 hover:text-red-300 transition-colors"
                    title="Clear text"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Sample Phrases Accordion */}
              {showSamples && (
                <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3">
                  <SamplePhrases onSelectPhrase={handleSelectPhrase} />
                </div>
              )}

              {/* Quick Voice Bar */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-950/60 p-2 border border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 pl-1">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-400">សំឡេង (Voice):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'bopha', name: 'Bopha', khmer: 'បុប្ផា (ស្រីធម្មជាតិ)', gender: 'female' },
                    { id: 'dara', name: 'Dara', khmer: 'តារា (ប្រុសពិតៗ)', gender: 'male' },
                    { id: 'sophea', name: 'Sophea', khmer: 'សុភា (ស្រីផ្លូវការ)', gender: 'female' },
                    { id: 'piseth', name: 'Piseth', khmer: 'ពិសិដ្ឋ (ប្រុសអត្ថាធិប្បាយ)', gender: 'male' },
                  ].map((v) => {
                    const isSelected = selectedVoice.toLowerCase() === v.id;
                    const isFemale = v.gender === 'female';
                    return (
                      <button
                        key={v.id}
                        id={`quick-voice-${v.id}`}
                        type="button"
                        onClick={() => {
                          setEngine('native');
                          setSelectedVoice(v.id);
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-yellow-500 text-neutral-950 font-bold shadow-sm'
                            : isFemale
                            ? 'bg-neutral-900 text-rose-300/90 hover:bg-neutral-800 hover:text-rose-200 border border-neutral-800'
                            : 'bg-neutral-900 text-sky-300/90 hover:bg-neutral-800 hover:text-sky-200 border border-neutral-800'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? 'bg-neutral-950' : isFemale ? 'bg-rose-400' : 'bg-sky-400'
                          }`}
                        />
                        <span className="font-khmer">{v.khmer}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  id="khmer-text-input"
                  ref={textareaRef}
                  value={khmerText}
                  onChange={(e) => setKhmerText(e.target.value)}
                  placeholder="វាយបញ្ចូលអត្ថបទជាភាសាខ្មែរនៅទីនេះ... (Type or paste Khmer text here...)"
                  rows={5}
                  className="font-khmer w-full rounded-xl border border-neutral-750 bg-neutral-950/80 p-4 text-lg leading-relaxed text-neutral-100 placeholder-neutral-500 focus:border-yellow-500/70 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all resize-y"
                  dir="ltr"
                />
              </div>

              {/* Virtual Keyboard Drawer */}
              {showKeyboard && (
                <div className="mt-4">
                  <KhmerKeyboard
                    onInsertChar={handleInsertChar}
                    onBackspace={handleBackspace}
                    onClear={() => setKhmerText('')}
                    onClose={() => setShowKeyboard(false)}
                  />
                </div>
              )}

              {/* Error Message if any */}
              {errorMessage && (
                <div
                  id="tts-error-alert"
                  className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  id="analyze-khmer-btn"
                  type="button"
                  onClick={handleAnalyzeText}
                  disabled={isAnalyzing || !khmerText.trim()}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-750 bg-neutral-800 px-3.5 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-750 hover:text-white disabled:opacity-50 transition-colors"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                  ) : (
                    <Languages className="h-4 w-4 text-yellow-400" />
                  )}
                  <span>Phonetics & Translation</span>
                </button>

                <button
                  id="generate-voice-btn"
                  type="button"
                  onClick={handleGenerateVoice}
                  disabled={isGenerating || !khmerText.trim()}
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-3 font-semibold text-neutral-950 shadow-lg shadow-yellow-500/20 hover:from-yellow-400 hover:to-amber-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>កំពុងបំប្លែងសំឡេង...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5" />
                      <div className="text-left">
                        <div className="text-sm leading-tight">Generate Speech</div>
                        <div className="font-khmer text-[11px] font-normal leading-tight opacity-90">
                          បំប្លែងសំឡេង
                        </div>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Voice and Tone Settings */}
            <div
              id="voice-settings-card"
              className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl shadow-black/30"
            >
              <VoiceSettings
                engine={engine}
                onEngineChange={setEngine}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                selectedTone={selectedTone}
                onToneChange={setSelectedTone}
                speechSpeed={speechSpeed}
                onSpeedChange={setSpeechSpeed}
              />
            </div>
          </div>

          {/* Right Column: Active Player, Analysis & History (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Audio Player */}
            <AudioPlayer
              currentRecord={currentRecord}
              onReplay={() => {
                if (currentRecord) {
                  setCurrentRecord({ ...currentRecord });
                }
              }}
            />

            {/* Romanization and Translation Analysis Card */}
            {analysis && (
              <div
                id="khmer-analysis-card"
                className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl shadow-black/30 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-yellow-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>ការបញ្ចេញសំឡេង & អត្ថន័យ (Pronunciation & Meaning)</span>
                  </div>
                  <button
                    onClick={() => setAnalysis(null)}
                    className="text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    Dismiss
                  </button>
                </div>

                {analysis.romanization && (
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      Phonetic Romanization (របៀបអាន)
                    </label>
                    <p className="mt-1 text-sm font-medium text-yellow-300/90 italic bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                      "{analysis.romanization}"
                    </p>
                  </div>
                )}

                {analysis.englishTranslation && (
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                      English Meaning (អត្ថន័យជាភាសាអង់គ្លេស)
                    </label>
                    <p className="mt-1 text-sm text-neutral-200 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                      {analysis.englishTranslation}
                    </p>
                  </div>
                )}

                {analysis.words && analysis.words.length > 0 && (
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1 block">
                      Word Breakdown (ពាក្យគន្លឹះ)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {analysis.words.map((w, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-neutral-950/80 p-2 border border-neutral-800/60 text-xs"
                        >
                          <p className="font-khmer font-bold text-neutral-100">{w.khmer}</p>
                          <p className="text-[11px] text-yellow-400/80 italic">{w.romanization}</p>
                          <p className="text-[11px] text-neutral-400">{w.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generation History */}
            <div
              id="history-card"
              className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl shadow-black/30"
            >
              <GenerationHistory
                history={history}
                onPlayRecord={(rec) => setCurrentRecord(rec)}
                onSelectRecordText={(text) => {
                  setKhmerText(text);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                onClearHistory={clearHistory}
              />
            </div>

            {/* Helpful Guide Card */}
            <div
              id="khmer-guide-card"
              className="rounded-2xl border border-neutral-850 bg-neutral-900/40 p-4 text-xs text-neutral-400 space-y-2"
            >
              <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <span>អំពីការប្រើប្រាស់ (About Khmer Text to Voice)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-neutral-400">
                <li>Supports standard Khmer vowels, consonants, and subscript (ជើង) characters.</li>
                <li>Use the built-in virtual keyboard if your device lacks Khmer input support.</li>
                <li>Download generated speech anytime as an MP3/WAV file for offline listening or video voiceover.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span>Khmer Text to Voice Generator</span>
            <span>•</span>
            <span className="font-khmer">ភាសាខ្មែរ</span>
          </div>
          <div>
            Built with Google AI Studio & Native Khmer Speech Synthesis
          </div>
        </div>
      </footer>
    </div>
  );
}
