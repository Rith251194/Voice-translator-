import React, { useState } from 'react';
import { KHMER_KEYBOARD_SECTIONS } from '../data/khmerData';
import { Delete, Space, X, Keyboard } from 'lucide-react';

interface KhmerKeyboardProps {
  onInsertChar: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose: () => void;
}

export const KhmerKeyboard: React.FC<KhmerKeyboardProps> = ({
  onInsertChar,
  onBackspace,
  onClear,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const currentSection = KHMER_KEYBOARD_SECTIONS[activeTab];

  return (
    <div
      id="khmer-virtual-keyboard"
      className="rounded-2xl border border-neutral-700/80 bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-md transition-all"
    >
      {/* Keyboard Header */}
      <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
            <Keyboard className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">
              ក្តារចុចខ្មែរ (Khmer Virtual Keyboard)
            </h4>
            <p className="text-xs text-neutral-400">
              Click any character to insert at cursor
            </p>
          </div>
        </div>

        <button
          id="close-keyboard-btn"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          title="Close Keyboard"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex flex-wrap gap-1.5 border-b border-neutral-800/80 pb-2">
        {KHMER_KEYBOARD_SECTIONS.map((section, idx) => (
          <button
            key={section.title}
            id={`keyboard-tab-${idx}`}
            onClick={() => setActiveTab(idx)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              activeTab === idx
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <span className="font-khmer mr-1">{section.khmerTitle.split(' ')[0]}</span>
            <span className="hidden sm:inline">({section.title.split(' ')[0]})</span>
          </button>
        ))}
      </div>

      {/* Key Grid */}
      <div className="mb-3 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-1.5 max-h-48 overflow-y-auto p-1 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
        {currentSection.keys.map((keyChar, index) => (
          <button
            key={`${keyChar}-${index}`}
            id={`key-${index}`}
            type="button"
            onClick={() => onInsertChar(keyChar)}
            className="font-khmer flex h-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-850 text-base font-medium text-neutral-200 hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-300 active:scale-95 transition-all shadow-sm"
          >
            {keyChar === ' ' ? '␣' : keyChar}
          </button>
        ))}
      </div>

      {/* Action Keys */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <button
            id="key-action-coeng"
            type="button"
            onClick={() => onInsertChar('្')}
            className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
            title="Khmer Subscript Mark (ជើង / Coeng)"
          >
            <span className="font-khmer text-sm">្</span>
            <span>ជើង (Coeng)</span>
          </button>

          <button
            id="key-action-space"
            type="button"
            onClick={() => onInsertChar(' ')}
            className="flex items-center gap-1 rounded-lg border border-neutral-750 bg-neutral-800 px-3 py-1.5 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            <Space className="h-3.5 w-3.5" />
            <span>Space (ដកឃ្លា)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="key-action-backspace"
            type="button"
            onClick={onBackspace}
            className="flex items-center gap-1 rounded-lg border border-neutral-750 bg-neutral-800 px-3 py-1.5 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            <Delete className="h-3.5 w-3.5" />
            <span>Backspace</span>
          </button>

          <button
            id="key-action-clear"
            type="button"
            onClick={onClear}
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
