"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactPlayer to avoid hydration mismatch
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
}) as any;

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
  isAnswered,
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
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  // Normalize times to prevent bad ranges from firing question point immediately
  const sTime = Number(startTime) || 0;
  const pTime = Number(stopTime) > sTime ? Number(stopTime) : sTime + 3; // Ensure at least 3 seconds of playing
  const eTime = Number(endTime) > pTime ? Number(endTime) : pTime + 5;

  // Reset state when moving to a new question (videoUrl changes or component remounts for new q)
  useEffect(() => {
    setHasReachedQuestion(false);
    setCurrentTime(sTime);
    setIsPlaying(true);

    if (playerRef.current && ready) {
      playerRef.current.seekTo(sTime, "seconds");
    }
  }, [videoUrl, sTime, ready]);

  // Handle playback state based on props (enforce pause heavily)
  useEffect(() => {
    if (isQuestionActive) {
      setIsPlaying(false);
      // Force underlying player to pause properly
      try {
        const internal = playerRef.current?.getInternalPlayer();
        if (internal?.pauseVideo) internal.pauseVideo();
        else if (internal?.pause) internal.pause();
      } catch (err) {}
    } else if (isAnswered && !isPlaying && currentTime < eTime) {
      setIsPlaying(true);
      try {
        const internal = playerRef.current?.getInternalPlayer();
        if (internal?.playVideo) internal.playVideo();
        else if (internal?.play) internal.play();
      } catch (err) {}
    }
  }, [isQuestionActive, isAnswered, currentTime, eTime, isPlaying]);

  const handleProgress = (state: { playedSeconds: number }) => {
    const current = state.playedSeconds;

    // Reject early initializations where it hasn't actually started seeking
    if (current < sTime && Math.abs(current - sTime) > 1.5) {
      return;
    }

    setCurrentTime(current);

    // Phase 1: Reaching the question
    if (!hasReachedQuestion && !isAnswered && !isQuestionActive) {
      if (current >= pTime) {
        setIsPlaying(false);
        setHasReachedQuestion(true);
        // Robust pause
        try {
          const internal = playerRef.current?.getInternalPlayer();
          if (internal?.pauseVideo) internal.pauseVideo();
          else if (internal?.pause) internal.pause();
        } catch (e) {}

        onQuestionPointReached();
      }
    }

    // Phase 2: Reaching the end
    if (isAnswered) {
      if (current >= eTime) {
        setIsPlaying(false);
        onSceneComplete();
      }
    }
  };

  const handleReady = () => {
    setReady(true);
    if (playerRef.current) {
      playerRef.current.seekTo(sTime, "seconds");
      setIsPlaying(!isQuestionActive); // Don't auto-play if question is active
    }
  };

  // UX Improvement: calculate visual progress to question to build anticipation
  const progressToQuestion = hasReachedQuestion
    ? 100
    : Math.max(
        0,
        Math.min(100, ((currentTime - sTime) / (pTime - sTime)) * 100),
      );

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl group border border-white/5"
      onMouseEnter={() => setShowVolumeControl(true)}
      onMouseLeave={() => setShowVolumeControl(false)}
    >
      {/* Dim overlay at top for UI readability and to hide Youtube ugly titles */}
      <div className="absolute top-0 left-0 w-full h-[80px] bg-gradient-to-b from-black/80 to-transparent z-15 pointer-events-auto" />

      {/* Anticipation UX: Progress Bar to question appearing */}
      {!isQuestionActive && !isAnswered && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10 z-20 overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-primary transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(var(--primary-rgb),1)]"
            style={{ width: `${progressToQuestion || 0}%` }}
          />
        </div>
      )}

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
              start: sTime,
              showinfo: 0,
              modestbranding: 1,
              controls: 0,
              rel: 0,
              disablekb: 1,
              iv_load_policy: 3,
              fs: 0,
              playsinline: 1,
              origin:
                typeof window !== "undefined"
                  ? window.location.origin
                  : undefined,
            },
          },
        }}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 text-red-500 font-bold p-4 text-center">
          {error}
        </div>
      )}

      {/* Volume Control - Centered at the top. Improved visuals */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 transition-all duration-500 opacity-0 group-hover:opacity-100 hover:opacity-100 shadow-xl">
        <button
          onClick={() => setMuted(!muted)}
          aria-label={muted ? "Unmute" : "Mute"}
          className="text-white hover:text-primary transition-colors focus:outline-none"
        >
          {muted || volume === 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : volume < 0.5 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
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
          className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform shadow-inner"
        />
      </div>

      {/* Pulsing subtle cue when ready and waiting for question */}
      {!isQuestionActive && !isAnswered && ready && (
        <div className="absolute right-4 bottom-4 w-3 h-3 bg-primary/80 rounded-full animate-ping z-20" />
      )}
    </div>
  );
}
