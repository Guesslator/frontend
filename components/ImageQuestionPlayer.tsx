"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ImageQuestionPlayerProps {
    imageUrl: string;
    onImageLoaded: () => void;
    onQuestionPointReached: () => void;
    isQuestionActive: boolean;
    isAnswered: boolean;
}

export default function ImageQuestionPlayer({
    imageUrl,
    onImageLoaded,
    onQuestionPointReached,
    isQuestionActive,
    isAnswered
}: ImageQuestionPlayerProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [displayImage, setDisplayImage] = useState(false);

    useEffect(() => {
        // Reset state when imageUrl changes (new question)
        setImageLoaded(false);
        setDisplayImage(false);
    }, [imageUrl]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        setDisplayImage(true);
        onImageLoaded();

        // Automatically trigger question display when image loads
        setTimeout(() => {
            onQuestionPointReached();
        }, 500);
    };

    return (
        <div className="w-full h-full relative bg-black flex items-center justify-center">
            {!displayImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-white text-sm">Loading image...</p>
                    </div>
                </div>
            )}

            <motion.img
                src={imageUrl}
                alt="Quiz Question"
                onLoad={handleImageLoad}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.95 }}
                transition={{ duration: 0.5 }}
                className="max-w-full max-h-full object-contain"
            />

            {/* Blur overlay when question is active */}
            {isQuestionActive && !isAnswered && (
                <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
            )}
        </div>
    );
}
