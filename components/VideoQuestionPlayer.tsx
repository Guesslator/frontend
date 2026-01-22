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
  console.log("VideoPlayer URL:", videoUrl);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasReachedQuestion, setHasReachedQuestion] = useState(false);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Reset state when moving to a new question (videoUrl changes)
  useEffect(() => {
    console.log('New question loaded, resetting state');
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

  const handleStart = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        muted={false}
        controls={false}
        onReady={handleReady}
        onStart={() => console.log("Video Started")}
        onError={(e: any) => {
          console.error("Video Error:", e);
          setError("Failed to load video. Please check the URL.");
        }}
        onProgress={handleProgress as any}
        progressInterval={100} // Check every 100ms for precision
        config={{
          youtube: {
            playerVars: {
              showinfo: 0,
              modestbranding: 1,
              controls: 0,
              rel: 0, // Show related videos from same channel only (best available)
              disablekb: 1,
              iv_load_policy: 3, // Hide annotations
              fs: 0,
              playsinline: 1
            }
          }
        }}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 text-red-500 font-bold p-4 text-center">
          {error}
          <br />
          <span className="text-xs text-neutral-400">{videoUrl}</span>
        </div>
      )}

      {/* Transparent overlay to prevent interaction - REMOVED to allow sound interaction if needed, but since controls are off, this was just blocking right clicks mostly. We keep it off to be safe for audio policies maybe? No, let's keep the user request simple: enable sound. */}
      {/* <div className="absolute inset-0 z-[1]" /> */}


      {/* Debug Info */}
      <div className="absolute top-2 left-2 text-xs text-green-400 font-mono bg-black/80 p-1 z-50">
        Debug: {currentTime.toFixed(1)}s / Stop: {stopTime}s
      </div>
    </div>
  );
}
