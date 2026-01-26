"use client";

import React, { useState, useEffect } from "react";
import { PlayCircle, ImageOff } from "lucide-react";

interface YouTubeThumbnailProps {
    videoUrl: string;
    alt: string;
    className?: string;
}

const getYouTubeId = (url: string) => {
    if (!url) {
        console.warn('YouTubeThumbnail: URL is empty');
        return null;
    }
    // Regex to handle standard watch urls, short urls, embeds, etc.
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    // Standard YouTube ID is 11 characters.
    const id = (match && match[2].length === 11) ? match[2] : null;

    if (!id) {
        console.error(`YouTubeThumbnail: Failed to extract ID from URL: "${url}"`);
    }

    return id;
};

export default function YouTubeThumbnail({ videoUrl, alt, className }: YouTubeThumbnailProps) {
    const videoId = getYouTubeId(videoUrl);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    // Priority order as requested:
    const qualities = [
        'maxresdefault',
        'hqdefault',
        'mqdefault',
        'default'
    ];

    const [currentQualityIndex, setCurrentQualityIndex] = useState(0);

    useEffect(() => {
        if (videoId) {
            const initialUrl = `https://img.youtube.com/vi/${videoId}/${qualities[0]}.jpg`;
            setImgSrc(initialUrl);
            setCurrentQualityIndex(0);
        }
    }, [videoId]);

    const handleError = () => {
        console.warn(`YouTubeThumbnail: Failed to load image: ${imgSrc}`);

        const nextIndex = currentQualityIndex + 1;
        if (nextIndex < qualities.length && videoId) {
            const nextQuality = qualities[nextIndex];
            const nextUrl = `https://img.youtube.com/vi/${videoId}/${nextQuality}.jpg`;

            setCurrentQualityIndex(nextIndex);
            setImgSrc(nextUrl);
        } else {
            console.error(`YouTubeThumbnail: All quality levels failed for ID: ${videoId}`);
            setImgSrc(null);
        }
    };

    if (!videoId) {
        console.warn(`YouTubeThumbnail: Render aborted - Invalid Video ID for URL: "${videoUrl}"`);
        return (
            <div className={`flex items-center justify-center bg-muted ${className}`}>
                <ImageOff className="text-muted-foreground" size={32} />
                <span className="sr-only">Invalid Video URL</span>
            </div>
        );
    }

    if (imgSrc === null) {
        return (
            <div className={`flex items-center justify-center bg-black/80 ${className}`}>
                <PlayCircle className="text-white/20" size={32} />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden group ${className}`}>
            <img
                src={imgSrc}
                alt={alt}
                onError={handleError}
                onLoad={() => { }}
                loading="lazy"
                className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                <PlayCircle className="text-white/80 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-lg" size={48} />
            </div>
        </div>
    );
}
