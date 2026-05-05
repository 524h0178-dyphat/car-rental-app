/**
 * Optimizes image URLs for common providers.
 * - Unsplash: thêm ?auto=format&q=80&w={width}&fit=crop
 * - Picsum (placeholder): không thay đổi
 */
export function optimizeImageUrl(url: string | undefined | null, width = 600): string {
  if (!url) return '';

  // Unsplash
  if (url.includes('unsplash.com') || url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&q=80&w=${width}&fit=crop`;
  }

  return url;
}

/**
 * Returns srcSet string for Unsplash images (responsive).
 * e.g. "https://...?w=400 400w, https://...?w=800 800w, ..."
 */
export function unsplashSrcSet(url: string | undefined | null): string {
  if (!url || !url.includes('unsplash.com')) return '';
  const base = url.split('?')[0];
  const widths = [400, 800, 1200];
  return widths
    .map((w) => `${base}?auto=format&q=80&w=${w}&fit=crop ${w}w`)
    .join(', ');
}
