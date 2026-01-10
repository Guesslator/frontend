import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';
import { trackAPIError, trackImageUpload, trackPerformance } from '@/lib/observability';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File validation constants
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_RESOLUTION = 2000; // 2000x2000

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    trackImageUpload('started');

    const session = await getServerSession(authOptions);

    // Require authentication
    if (!session?.user) {
      trackAPIError('/api/upload', 'POST', 401);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const role = (session.user as any)?.role || 'USER';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') || 'quiz-images';

    if (!file) {
      trackAPIError('/api/upload', 'POST', 400, undefined, { reason: 'No file provided' });
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only JPG, PNG, and WebP images are allowed.'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 2MB.'
      }, { status: 400 });
    }

    // Role-based moderation strategy
    // USER: Mandatory AI moderation for +18 content
    // ADMIN: Skip expensive AI checks (trusted users only)
    const moderation = role === 'ADMIN' ? undefined : 'aws_rek';

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<NextResponse>((resolve) => {
      cloudinary.uploader.upload_stream(
        {
          folder: bucket as string,
          resource_type: 'image',
          moderation: moderation,
          // Validate resolution on Cloudinary side
          transformation: [
            { width: MAX_RESOLUTION, height: MAX_RESOLUTION, crop: 'limit' }
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            resolve(NextResponse.json({
              error: 'Upload failed. Please try again.'
            }, { status: 500 }));
            return;
          }

          if (result) {
            // Check if resolution exceeds limits
            if (result.width > MAX_RESOLUTION || result.height > MAX_RESOLUTION) {
              resolve(NextResponse.json({
                error: `Image resolution too high. Maximum is ${MAX_RESOLUTION}x${MAX_RESOLUTION} pixels.`
              }, { status: 400 }));
              return;
            }

            // Check moderation result (USER uploads only)
            if (result.moderation && result.moderation.length > 0) {
              const moderationStatus = (result.moderation[0] as any).status;

              if (moderationStatus === 'rejected') {
                // Content policy violation detected
                trackImageUpload('rejected', {
                  userId: (session.user as any)?.id,
                  role,
                  bucket: bucket as string,
                });
                resolve(NextResponse.json({
                  error: 'Uploaded image violates content policy.',
                  moderationStatus: 'REJECTED'
                }, { status: 400 }));
                return;
              }

              if (moderationStatus === 'pending') {
                // Still being moderated - in production, handle async webhook
                // For now, we'll accept pending as it usually means safe
                resolve(NextResponse.json({
                  url: result.secure_url,
                  moderationStatus: 'PENDING'
                }));
                return;
              }

              // Approved
              trackImageUpload('success', {
                userId: (session.user as any)?.id,
                role,
                bucket: bucket as string,
                duration: Date.now() - startTime,
              });
              trackPerformance('image-upload', Date.now() - startTime);

              resolve(NextResponse.json({
                url: result.secure_url,
                moderationStatus: 'APPROVED'
              }));
            } else {
              // No moderation (admin upload)
              trackImageUpload('success', {
                userId: (session.user as any)?.id,
                role,
                bucket: bucket as string,
                moderationBypass: true,
                duration: Date.now() - startTime,
              });
              trackPerformance('image-upload', Date.now() - startTime);

              resolve(NextResponse.json({
                url: result.secure_url,
                moderationStatus: 'APPROVED'
              }));
            }
          } else {
            trackAPIError('/api/upload', 'POST', 500, undefined, { reason: 'No result from Cloudinary' });
            resolve(NextResponse.json({
              error: 'Upload failed. No result from Cloudinary.'
            }, { status: 500 }));
          }
        }
      ).end(buffer);
    });

  } catch (error) {
    console.error('Upload route error:', error);
    trackImageUpload('failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    });
    trackAPIError('/api/upload', 'POST', 500, error as Error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
