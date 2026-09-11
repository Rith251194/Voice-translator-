import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Repeat,
  Sparkles,
  Check,
  Copy,
  FileAudio,
} from 'lucide-react';
import { GeneratedAudioRecord } from '../types';
import { getVoiceFileName } from '../utils/audioNaming';

interface AudioPlayerProps {
  currentRecord: GeneratedAudioRecord | null;
  onReplay?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ currentRecord }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Setup Web Audio Analyser for visualizer
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      // Browsers may restrict multiple source creations; fallback animation will handle visualization
    }
  }, []);

  // Update playback state on new record
  useEffect(() => {
    if (audioRef.current && currentRecord?.audioUrl) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      audioRef.current.load();
      // Auto-play when new audio is generated
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [currentRecord?.audioUrl]);

  // Handle Play/Pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    setupAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      if (d && !isNaN(d) && isFinite(d)) {
        setDuration(d);
      } else if (currentRecord?.durationSeconds) {
        setDuration(currentRecord.durationSeconds);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleDownload = () => {
    if (!currentRecord?.audioUrl) return;
    const a = document.createElement('a');
    a.href = currentRecord.audioUrl;
    const ext = (currentRecord.format || 'mp3') as 'mp3' | 'wav';
    const effectiveDuration = duration > 0 ? duration : (currentRecord.durationSeconds || 3);
    const fileName = getVoiceFileName(effectiveDuration, ext);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyText = () => {
    if (!currentRecord?.text) return;
    navigator.clipboard.writeText(currentRecord.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Waveform visualization canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 36;
      const barWidth = 4;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      let dataArray: Uint8Array | null = null;
      if (analyserRef.current && isPlaying) {
        dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < numBars; i++) {
        let barHeight = 4;
        if (isPlaying) {
          if (dataArray && dataArray.length > 0) {
            const dataIndex = Math.floor((i / numBars) * (dataArray.length / 2));
            const val = dataArray[dataIndex] || 0;
            barHeight = Math.max(4, (val / 255) * (height - 8));
          } else {
            // Synthetic wave animation if Web Audio is restricted
            const wave = Math.sin(phase + (i * 0.35)) * 0.5 + 0.5;
            barHeight = 6 + wave * (height - 12);
          }
        } else {
          barHeight = 4 + Math.sin(i * 0.3) * 3;
        }

        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Gradient coloring: warm amber gold to bright saffron
        const progress = duration > 0 ? currentTime / duration : 0;
        const isPast = i / numBars <= progress;

        ctx.fillStyle = isPast
          ? 'rgba(234, 179, 8, 0.95)' // Yellow 500
          : isPlaying
            ? 'rgba(234, 179, 8, 0.35)'
            : 'rgba(255, 255, 255, 0.15)';

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += 0.08;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  if (!currentRecord) {
    return (
      <div
        id="empty-player-card"
        className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center backdrop-blur-sm"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800/80 text-yellow-500/80">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-200">
          សំឡេងត្រៀមរួចរាល់ (Audio Ready to Generate)
        </h3>
        <p className="mt-1 text-sm text-neutral-400">
          Enter or pick Khmer text, select your voice and style, then click "Generate Speech".
        </p>
      </div>
    );
  }

  return (
    <div
      id="active-player-card"
      className="rounded-2xl border border-neutral-700/60 bg-neutral-900 p-6 shadow-xl shadow-black/40"
    >
      <audio
        ref={audioRef}
        src={currentRecord.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        loop={isLooping}
        preload="auto"
      />

      {/* Header Info */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
            {currentRecord.voice}
          </span>
          <span className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300">
            {currentRecord.format.toUpperCase()} • {currentRecord.engine === 'native' ? 'Khmer Native' : 'Gemini AI'}
          </span>
          {currentRecord.fallbackUsed && (
            <span className="rounded-md bg-amber-950/60 px-2 py-0.5 text-xs text-amber-300 border border-amber-800/40">
              Auto-Enhanced
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="copy-text-btn"
            onClick={copyText}
            title="Copy Khmer Text"
            className="flex h-8 items-center gap-1 rounded-lg border border-neutral-750 bg-neutral-800 px-2.5 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Text'}
          </button>
          <button
            id="download-audio-btn"
            onClick={handleDownload}
            title="Download Audio File"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 text-xs font-medium text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Target Download Filename Display */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-950/80 px-3 py-2 border border-neutral-800/80 text-xs">
        <div className="flex items-center gap-2 text-neutral-300 min-w-0">
          <FileAudio className="h-4 w-4 text-yellow-400 shrink-0" />
          <span className="text-[11px] text-neutral-400 font-mono">File:</span>
          <span className="font-mono font-medium text-yellow-300/90 truncate select-all">
            {getVoiceFileName(duration > 0 ? duration : (currentRecord.durationSeconds || 3), currentRecord.format)}
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 font-medium">
          {currentRecord.gender === 'male' ? '👨 សំឡេងប្រុស (Male)' : '👩 សំឡេងស្រី (Female)'}
        </span>
      </div>

      {/* Spoken Text Display */}
      <div className="mb-5 rounded-xl bg-neutral-950/70 p-4 border border-neutral-800">
        <p className="font-khmer text-lg leading-relaxed text-neutral-100 select-text">
          {currentRecord.text}
        </p>
      </div>

      {/* Animated Waveform Canvas */}
      <div className="mb-4 flex items-center justify-center rounded-xl bg-neutral-950/40 p-2 border border-neutral-800/50">
        <canvas
          ref={canvasRef}
          width={420}
          height={48}
          className="w-full h-12 rounded cursor-pointer"
          onClick={togglePlayPause}
        />
      </div>

      {/* Scrubber and Timestamps */}
      <div className="mb-4 space-y-1.5">
        <input
          id="audio-progress-slider"
          type="range"
          min={0}
          max={duration > 0 ? duration : 100}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300 transition-colors"
        />
        <div className="flex justify-between text-xs text-neutral-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || currentRecord.durationSeconds)}</span>
        </div>
      </div>

      {/* Primary Player Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          {/* Loop button */}
          <button
            id="loop-toggle-btn"
            onClick={() => setIsLooping(!isLooping)}
            title={isLooping ? 'Disable Loop' : 'Enable Loop'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              isLooping
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                : 'border-neutral-800 bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Repeat className="h-4 w-4" />
          </button>

          {/* Replay 0s button */}
          <button
            id="replay-audio-btn"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => setIsPlaying(true));
              }
            }}
            title="Replay from start"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Main Play/Pause Button */}
          <button
            id="play-pause-btn"
            onClick={togglePlayPause}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-neutral-950 font-bold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400 active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950/60 p-1">
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              id={`speed-btn-${rate}`}
              onClick={() => handleRateChange(rate)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                playbackRate === rate
                  ? 'bg-yellow-500/20 text-yellow-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            id="mute-toggle-btn"
            onClick={toggleMute}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-400 hover:accent-yellow-300"
          />
        </div>
      </div>
    </div>
  );
};
