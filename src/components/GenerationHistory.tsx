import React from 'react';
import { GeneratedAudioRecord } from '../types';
import { History, Play, Download, Trash2, ArrowUpRight } from 'lucide-react';
import { getVoiceFileName } from '../utils/audioNaming';

interface GenerationHistoryProps {
  history: GeneratedAudioRecord[];
  onPlayRecord: (record: GeneratedAudioRecord) => void;
  onSelectRecordText: (text: string) => void;
  onClearHistory: () => void;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  history,
  onPlayRecord,
  onSelectRecordText,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return null;
  }

  const handleDownload = (record: GeneratedAudioRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = record.audioUrl;
    const ext = (record.format || 'mp3') as 'mp3' | 'wav';
    const effectiveDuration = record.durationSeconds || 3;
    const fileName = getVoiceFileName(effectiveDuration, ext);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="generation-history-panel" className="space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <History className="h-3.5 w-3.5 text-yellow-400" />
          <span>ប្រវត្តិសំឡេងដែលបានបង្កើត (Voice History)</span>
          <span className="ml-1 rounded-full bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-300">
            {history.length}
          </span>
        </div>

        <button
          id="clear-history-btn"
          onClick={onClearHistory}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 transition-colors"
          title="Clear History"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {history.map((record) => (
          <div
            key={record.id}
            id={`history-item-${record.id}`}
            className="group flex items-center justify-between gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3 hover:border-neutral-700 hover:bg-neutral-850 transition-all"
          >
            <div className="min-w-0 flex-1">
              <p className="font-khmer truncate text-sm font-medium text-neutral-200">
                {record.text}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="text-yellow-400/90">{record.voice}</span>
                <span>•</span>
                <span className="capitalize">{record.engine}</span>
                <span>•</span>
                <span>{formatTimestamp(record.timestamp)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id={`load-text-${record.id}`}
                onClick={() => onSelectRecordText(record.text)}
                title="Load into Editor"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-750 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                id={`download-history-${record.id}`}
                onClick={(e) => handleDownload(record, e)}
                title="Download"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-750 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                id={`play-history-${record.id}`}
                onClick={() => onPlayRecord(record)}
                title="Play Audio"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500 text-neutral-950 hover:bg-yellow-400 active:scale-95 transition-all shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
