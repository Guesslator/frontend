import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
            <div className="animate-spin text-primary mb-4">
                <Loader2 size={48} />
            </div>
            <p className="text-muted-foreground animate-pulse">Loading content...</p>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-7xl mt-12 opacity-50">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-card/50 rounded-xl animate-pulse" />
                ))}
            </div>
        </div>
    );
}
