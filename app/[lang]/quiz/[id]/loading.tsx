import { Loader2 } from "lucide-react";

export default function QuizLoading() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative p-4">
            {/* Header Area Skeleton */}
            <div className="w-full max-w-6xl flex justify-between items-end mb-4 px-2">
                <div className="h-8 w-24 bg-card/50 rounded-md animate-pulse" />
                <div className="flex flex-col items-end gap-2">
                    <div className="h-3 w-16 bg-card/50 rounded-md animate-pulse" />
                    <div className="h-8 w-20 bg-card/60 rounded-md animate-pulse" />
                </div>
            </div>

            {/* Video Player Skeleton */}
            <div className="w-full max-w-6xl relative shadow-2xl bg-black rounded-xl md:rounded-2xl overflow-hidden border border-border min-h-dvh md:min-h-0 md:aspect-video flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary/50 mb-4" size={56} />
                <p className="text-muted-foreground font-semibold uppercase tracking-widest text-sm animate-pulse">
                    Loading content...
                </p>
                {/* Simulated ambient glow */}
                <div className="absolute inset-0 bg-primary/5 blur-3xl animate-pulse -z-10" />
            </div>
        </div>
    );
}
