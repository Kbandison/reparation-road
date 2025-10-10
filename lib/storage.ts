import { supabase } from './supabase';

// Cache for image URLs to avoid repeated Supabase API calls
const urlCache = new Map<string, string>();

/**
 * Get the public URL for a Supabase storage file
 * @param path - The storage path (e.g., "archive-images/inspection-roll/page1.jpg")
 * @param bucket - The storage bucket name (default: "archive-images")
 * @returns The public URL for the file
 */
export function getSupabaseImageUrl(path: string, bucket: string = 'archive-images'): string {
  if (!path) return '';

  // If it's already an absolute URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Check cache first
  const cacheKey = `${bucket}:${path}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey)!;
  }

  // Get the public URL from Supabase storage
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  // Cache the result
  urlCache.set(cacheKey, data.publicUrl);

  return data.publicUrl;
}

/**
 * Preload an image to warm up the browser cache
 * @param url - The image URL to preload
 */
export function preloadImage(url: string): void {
  if (typeof window !== 'undefined' && url) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }
}

/**
 * Get optimized image URL with query parameters for Supabase transforms
 * Note: Supabase doesn't support image transforms on the free tier by default
 * This is a placeholder for when you upgrade or use a CDN
 */
export function getOptimizedImageUrl(
  path: string
  // options parameter commented out until image transforms are implemented
  // options?: { width?: number; height?: number; quality?: number }
): string {
  const url = getSupabaseImageUrl(path);

  // If you have Supabase image transforms enabled, you can add query params here
  // For now, just return the URL
  return url;
}
