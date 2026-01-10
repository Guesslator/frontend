import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate URL format
const isValidUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');

// Only create client if credentials are provided and URL is valid
export const supabase = supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function uploadFile(
  file: File,
  bucket: 'quiz-banners' | 'quiz-questions',
  path?: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    if (!supabase) {
      return {
        url: null,
        error: new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { url: null, error };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

export async function deleteFile(
  bucket: 'quiz-banners' | 'quiz-questions',
  filePath: string
): Promise<{ error: Error | null }> {
  try {
    if (!supabase) {
      return {
        error: new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
      };
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}
