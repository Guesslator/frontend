import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Music, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioQuestionPlayerProps {
    audioUrl: string;
    startTime?: number;
    stopTime?: number;
    endTime?: number; // Total duration if needed, or point to stop
    onQuestionPointReached?: () => void;
    onSceneComplete?: () => void;
    isQuestionActive: boolean;
    isAnswered: boolean;
}

export default function AudioQuestionPlayer({
    audioUrl,
    startTime = 0,
    stopTime = 10,
    endTime = 30, // Default duration if not specified
    onQuestionPointReached,
    onSceneComplete,
    isQuestionActive,
    isAnswered
}: AudioQuestionPlayerProps) {
    const playerRef = useRef<ReactPlayer>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Auto-play when question becomes active or initially
    useEffect(() => {
        if (!isAnswered && !isQuestionActive) {
            setPlaying(true);
        } else if (isQuestionActive) {
            // When question is active (user guessing), we might want to pause or keep looping?
            // Usually we might pause or let it play background.
            // Let's pause to let them think? Or loop?
            // "Song Guessing" usually plays a clip.
            // If we reached stopTime, we paused.
        }
    }, [isQuestionActive, isAnswered]);

    const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
        setCurrentTime(state.playedSeconds);
        // Calculate progress relative to the clip duration (startTime to stopTime)
        const clipDuration = stopTime - startTime;
        const currentInClip = state.playedSeconds - startTime;
        const p = Math.max(0, Math.min(100, (currentInClip / clipDuration) * 100));
        setProgress(p);

        if (!hasStarted && state.playedSeconds > 0) setHasStarted(true);

        // Check for Stop Time (Question Point)
        if (!isQuestionActive && !isAnswered && state.playedSeconds >= stopTime) {
            setPlaying(false);
            if (onQuestionPointReached) onQuestionPointReached();
        }

        // Check for End Time (Scene Complete) if answered
        // Logic: specific to implementation.
    };

    const togglePlay = () => {
        setPlaying(!playing);
    };

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Visualizer Background (Simulated) */}
            <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-20 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-4 bg-primary rounded-t-full"
                        animate={{
                            height: playing ? [20, Math.random() * 200 + 50, 20] : 20,
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.05
                        }}
                    />
                ))}
            </div>

            <div className="z-10 bg-card/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl flex flex-col items-center gap-8 shadow-2xl">
                {/* Icon / Album Art Placeholder */}
                <div className={`w-48 h-48 rounded-full flex items-center justify-center border-4 border-primary/20 bg-black/50 shadow-[0_0_50px_rgba(var(--primary),0.3)] transition-all duration-700 ${playing ? 'scale-110' : 'scale-100'}`}>
                    {playing ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                            <Music size={64} className="text-primary" />
                        </motion.div>
                    ) : (
                        <Music size={64} className="text-muted-foreground" />
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-4 w-full min-w-[300px]">
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        >
                            {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <div className="flex items-center gap-2 group">
                            <button
                                onClick={() => setMuted(!muted)}
                                className="text-white hover:text-primary transition-colors"
                                aria-label={muted ? "Unmute" : "Mute"}
                            >
                                {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={muted ? 0 : volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    if (muted) setMuted(false);
                                }}
                                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Player */}
            <div className="absolute opacity-0 pointer-events-none">
                <ReactPlayer
                    ref={playerRef}
                    url={audioUrl}
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    onProgress={handleProgress}
                    onEnded={() => setPlaying(false)}
                    config={{
                        youtube: {
                            playerVars: { start: startTime }
                        }
                    }}
                    width="100%"
                    height="100%"
                />
            </div>
        </div>
    );
}
