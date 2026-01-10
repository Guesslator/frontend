"use client";

import { useState, useRef } from 'react';
import { Upload, X, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { t, Language } from '@/lib/i18n';

interface FileUploaderProps {
  lang: Language;
  bucket: 'quiz-banners' | 'quiz-questions' | 'quiz-videos' | 'quiz-images';
  onUploadComplete: (url: string, moderationStatus?: string) => void;
  currentImageUrl?: string;
  currentVideoUrl?: string;
  label?: string;
  accept?: string;
}

export default function FileUploader({
  lang,
  bucket,
  onUploadComplete,
  currentImageUrl,
  currentVideoUrl,
  label,
  accept = 'image/*'
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [moderationStatus, setModerationStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || currentVideoUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = accept.includes('video') || (previewUrl && (previewUrl.endsWith('.mp4') || previewUrl.includes('quiz-videos')));
  const isImage = accept === 'image/*';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setModerationStatus(null);

    // Validate file type
    if (isImage) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError(t(lang, 'invalidFileType') || 'Only JPG, PNG, and WebP images are allowed.');
        return;
      }

      // Validate file size for images (2MB max)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(t(lang, 'fileTooLarge') || 'File too large. Maximum size is 2MB.');
        return;
      }
    } else if (accept.includes('video')) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      // Validate file size for videos (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than 50MB`);
        return;
      }
    }

    setUploading(true);
    setModerating(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle moderation rejection or other errors
        if (data.moderationStatus === 'REJECTED') {
          setError(t(lang, 'imageModerationRejected') || 'Uploaded image violates content policy.');
          setModerationStatus('REJECTED');
        } else {
          setError(data.error || t(lang, 'uploadFailed') || 'Upload failed. Please try again.');
        }
        setPreviewUrl(null);
        return;
      }

      // Upload successful
      setModerationStatus(data.moderationStatus || 'APPROVED');
      onUploadComplete(data.url, data.moderationStatus);
    } catch (err) {
      setError(t(lang, 'uploadFailed') || 'Failed to upload file. Please try again.');
      setPreviewUrl(null);
      setModerationStatus(null);
    } finally {
      setUploading(false);
      setModerating(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setError(null);
    setModerationStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onUploadComplete('');
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        {previewUrl ? (
          <div className="relative w-full aspect-video bg-card rounded-lg overflow-hidden border border-border group">
            {isVideo ? (
              <video src={previewUrl} controls className="w-full h-full object-cover" />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}

            {!uploading && !moderating && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-2 bg-destructive hover:bg-destructive/90 rounded-full transition-colors z-10 opacity-0 group-hover:opacity-100"
                title="Remove Media"
              >
                <X size={16} className="text-white" />
              </button>
            )}

            {/* Upload & Moderation Status */}
            {(uploading || moderating) && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                <div className="text-center space-y-3">
                  <div className="animate-spin h-10 w-10 border-3 border-primary border-t-transparent rounded-full mx-auto" />
                  {moderating ? (
                    <>
                      <Shield size={24} className="mx-auto text-primary animate-pulse" />
                      <p className="text-sm font-bold text-white">
                        {t(lang, 'imageBeingChecked') || 'Image is being checked for safety...'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-white">{t(lang, 'uploading') || 'Uploading...'}</p>
                  )}
                </div>
              </div>
            )}

            {/* Moderation Success Badge */}
            {moderationStatus === 'APPROVED' && !uploading && !moderating && (
              <div className="absolute top-2 left-2 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                <CheckCircle size={14} className="text-white" />
                <span className="text-xs font-bold text-white">
                  {t(lang, 'imageSafe') || 'Safe'}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Upload Button */
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-8 bg-card border-2 border-dashed border-border hover:border-primary rounded-lg flex flex-col items-center justify-center gap-3 transition-colors group"
          >
            <Upload size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-foreground">{t(lang, 'selectFile') || 'Select File'}</span>
              <p className="text-xs text-muted-foreground">
                {isImage
                  ? 'JPG, PNG, WebP up to 2MB'
                  : accept.includes('video')
                  ? 'MP4 up to 50MB'
                  : 'Select a file'}
              </p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
          <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Moderation Info for Users */}
      {isImage && !previewUrl && !error && (
        <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <Shield size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {t(lang, 'moderationInfo') || 'All uploaded images are automatically checked for safety and content policy compliance.'}
          </p>
        </div>
      )}
    </div>
  );
}
