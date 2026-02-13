"use client";

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactPlayer to avoid hydration mismatch
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface VideoQuestionPlayerProps {
  videoUrl: string;
  startTime: number;
  stopTime: number;
  endTime: number;
  onQuestionPointReached: () => void;
  onSceneComplete: () => void;
  isQuestionActive: boolean;
  isAnswered: boolean;
}

export default function VideoQuestionPlayer({
  videoUrl,
  startTime,
  stopTime,
  endTime,
  onQuestionPointReached,
  onSceneComplete,
  isQuestionActive,
  isAnswered
}: VideoQuestionPlayerProps) {

  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasReachedQuestion, setHasReachedQuestion] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Volume Control State
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false); // Can be used for hover effects if needed

  // Reset state when moving to a new question (videoUrl changes)
  useEffect(() => {

    setHasReachedQuestion(false);
    setCurrentTime(0);
    setIsPlaying(true); // Auto-start
    if (playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
    }
  }, [videoUrl, startTime]);

  // Handle playback state based on props
  useEffect(() => {
    if (isQuestionActive) {
      setIsPlaying(false);
    } else if (isAnswered && !isPlaying && currentTime < endTime) {
      setIsPlaying(true);
    }
  }, [isQuestionActive, isAnswered, currentTime, endTime, isPlaying]);

  const handleProgress = (state: { playedSeconds: number }) => {
    const current = state.playedSeconds;
    setCurrentTime(current);

    // Phase 1: Reaching the question
    if (!hasReachedQuestion && !isAnswered) {
      if (current >= stopTime) {
        setIsPlaying(false);
        setHasReachedQuestion(true);
        onQuestionPointReached();
      }
    }

    // Phase 2: Reaching the end
    if (isAnswered) {
      if (current >= endTime) {
        setIsPlaying(false);
        onSceneComplete();
      }
    }
  };

  const handleReady = () => {
    setReady(true);
    if (playerRef.current) {
      playerRef.current.seekTo(startTime, 'seconds');
      setIsPlaying(true); // Ensure playing when ready
    }
  };

  // Import Icons locally or assume they are available from lucide-react if imported at top
  // Since we are replacing the whole function, let's assume we need to add imports if missing.
  // BUT `replace_file_content` targets this block. The user didn't ask to change imports.
  // I will use simple SVG icons inline to avoid import errors if Lucide isn't imported, 
  // OR rely on existing imports if check. 
  // Actually, Lucide isn't imported in the original file. I'll stick to SVG for safety or add import later.
  // Safe bet: SVG inline.

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl group"
      onMouseEnter={() => setShowVolumeControl(true)}
      onMouseLeave={() => setShowVolumeControl(false)}
    >
      {/* Title Mask - "Top of it center it" ?? No, title mask is top bar. Volume is "top of it center it". */}
      {/* 
         Title Mask: Hides the YouTube title/share info. 
         YouTube shows title on hover. We put a div on top to block mouse events 
         and visually obscure it.
      */}
      <div className="absolute top-0 left-0 w-full h-[60px] bg-black z-[15] pointer-events-auto" />

      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        muted={muted}
        volume={volume}
        controls={false}
        onReady={handleReady}
        onError={(e: any) => {
          console.error("Video Error:", e);
          setError("Failed to load video. Please check the URL.");
        }}
        onProgress={handleProgress as any}
        progressInterval={100}
        config={{
          youtube: {
            playerVars: {
              showinfo: 0,
              modestbranding: 1,
              controls: 0,
              rel: 0,
              disablekb: 1,
              iv_load_policy: 3,
              fs: 0,
              playsinline: 1,
              origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            }
          }
        }}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 text-red-500 font-bold p-4 text-center">
          {error}
        </div>
      )}

      {/* Volume Control - Centered at the top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[20] flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 hover:opacity-100">
        <button
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="text-white hover:text-primary transition-colors focus:outline-none"
        >

          {muted || volume === 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          ) : volume < 0.5 ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (muted && parseFloat(e.target.value) > 0) setMuted(false);
          }}
          aria-label="Volume Control"
          className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
        />
      </div>

    </div>
  );
}
