import { Loader2 } from "lucide-react";

export default function ContentDetailLoading() {
    return (
        <div className="min-h-svh bg-background text-foreground relative overflow-hidden flex flex-col pt-20 md:pt-40 px-4 md:px-8">
            <div className="container mx-auto max-w-7xl w-full flex flex-col lg:flex-row gap-10 md:gap-16 lg:gap-20 items-start">

                {/* Left Column Skeleton: Poster */}
                <div className="w-full max-w-[300px] md:max-w-[360px] mx-auto lg:mx-0 shrink-0">
                    <div className="aspect-3/4 w-full bg-card/50 rounded-3xl animate-pulse flex items-center justify-center border border-white/5">
                        <Loader2 className="animate-spin text-primary/50" size={40} />
                    </div>

                    {/* Info chips skeleton desktop */}
                    <div className="mt-12 hidden lg:flex flex-col gap-5">
                        <div className="h-16 w-full rounded-2xl bg-card/30 animate-pulse" />
                        <div className="h-16 w-full rounded-2xl bg-card/30 animate-pulse" />
                    </div>
                </div>

                {/* Right Column Skeleton: Title and Content */}
                <div className="flex-1 w-full max-w-4xl space-y-6 lg:space-y-8 mt-4 lg:mt-0">
                    {/* Title Skeleton */}
                    <div className="space-y-4">
                        <div className="h-12 md:h-16 lg:h-20 w-3/4 max-w-lg bg-card/60 rounded-xl animate-pulse" />
                        <div className="h-12 md:h-16 lg:h-20 w-1/2 max-w-md bg-card/40 rounded-xl animate-pulse" />
                    </div>

                    {/* Metadata Skeleton */}
                    <div className="flex items-center gap-4 mt-8">
                        <div className="h-4 w-24 bg-card/50 rounded-full animate-pulse" />
                        <div className="h-4 w-24 bg-card/50 rounded-full animate-pulse" />
                    </div>

                    {/* Synopsis Skeleton */}
                    <div className="space-y-3 mt-12 max-w-2xl pl-6 relative">
                        <div className="absolute left-0 top-0 mb-1 w-1 h-full bg-card/50 rounded-full" />
                        <div className="h-4 w-full bg-card/40 rounded-full animate-pulse" />
                        <div className="h-4 w-[90%] bg-card/40 rounded-full animate-pulse" />
                        <div className="h-4 w-[80%] bg-card/40 rounded-full animate-pulse" />
                    </div>

                    {/* Desktop CTA Skeleton */}
                    <div className="hidden sm:flex mt-16">
                        <div className="h-20 w-64 bg-primary/20 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Mobile CTA Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                <div className="w-full h-16 bg-primary/20 rounded-2xl animate-pulse" />
            </div>
        </div>
    );
}
