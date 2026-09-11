import React, { useState } from 'react';
import { SAMPLE_PHRASES } from '../data/khmerData';
import { SamplePhrase } from '../types';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface SamplePhrasesProps {
  onSelectPhrase: (phrase: SamplePhrase) => void;
}

export const SamplePhrases: React.FC<SamplePhrasesProps> = ({ onSelectPhrase }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Samples (ទាំងអស់)' },
    { id: 'greetings', label: 'Greetings (ការគួរសម)' },
    { id: 'daily', label: 'Daily (ប្រចាំថ្ងៃ)' },
    { id: 'tourism', label: 'Tourism (ទេសចរណ៍)' },
    { id: 'proverbs', label: 'Proverbs (សុភាសិត)' },
    { id: 'numbers', label: 'Numbers (លេខ)' },
  ];

  const filteredPhrases =
    selectedCategory === 'all'
      ? SAMPLE_PHRASES
      : SAMPLE_PHRASES.filter((p) => p.category === selectedCategory);

  return (
    <div id="sample-phrases-panel" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <BookOpen className="h-3.5 w-3.5 text-yellow-400" />
          <span>គំរូឃ្លាភាសាខ្មែរ (Khmer Sample Phrases)</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`filter-${cat.id}`}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border border-neutral-700/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* List of Phrases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {filteredPhrases.map((phrase) => (
          <button
            key={phrase.id}
            id={`phrase-card-${phrase.id}`}
            type="button"
            onClick={() => onSelectPhrase(phrase)}
            className="group flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-left hover:border-yellow-500/40 hover:bg-neutral-850 transition-all text-xs"
          >
            <div>
              <p className="font-khmer text-sm font-medium text-neutral-100 group-hover:text-yellow-300 transition-colors line-clamp-2">
                {phrase.khmer}
              </p>
              {phrase.phonetic && (
                <p className="mt-1 text-[11px] text-neutral-400 italic">
                  {phrase.phonetic}
                </p>
              )}
              <p className="mt-0.5 text-[11px] text-neutral-400 line-clamp-1">
                {phrase.english}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between pt-1 border-t border-neutral-800/50 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500/60" />
                {phrase.categoryLabel.split(' ')[0]}
              </span>
              <span className="flex items-center gap-0.5 text-yellow-400/90 group-hover:translate-x-0.5 transition-transform">
                Use Text <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
