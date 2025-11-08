/**
 * Image optimization utilities for better performance
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimize image URL for better performance
 * @param url - Original image URL
 * @param options - Optimization options
 * @returns Optimized image URL
 */
export const optimizeImageUrl = (
  url: string,
  options: ImageOptimizationOptions = {}
): string => {
  if (!url) return '';

  const { width = 800, height = 600, quality = 95, format = 'webp' } = options;

  // For YouTube video thumbnails (i.ytimg.com)
  if (url.includes('i.ytimg.com')) {
    // Replace default.jpg (120x90) with maxresdefault.jpg (1280x720)
    // If maxresdefault doesn't exist, fall back to hqdefault (480x360)
    return url.replace(/\/(default|mqdefault|hqdefault|sddefault)\.jpg/, '/maxresdefault.jpg');
  }

  // For YouTube channel avatars (yt3.ggpht.com)
  if (url.includes('yt3.ggpht.com')) {
    // Replace s88 (88x88) with s800 (800x800) for high quality
    return url.replace(/=s\d+-/, '=s800-');
  }

  // For YouTube banners (yt3.googleusercontent.com)
  if (url.includes('yt3.googleusercontent.com') || url.includes('googleusercontent.com')) {
    // Remove size restrictions and add high quality parameters
    const optimizedUrl = url.split('=')[0]; // Remove all parameters
    // Add high quality parameters
    return `${optimizedUrl}=w2120-fcrop64=1,00005000ffffa5a8-k-c0xffffffff-no-nd-rj`;
  }

  // For Unsplash images, we can optimize them
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&crop=face&fm=${format}&q=${quality}`;
  }

  // For placeholder images
  if (url.includes('placehold.co')) {
    return `https://placehold.co/${width}x${height}`;
  }

  // For other images, return as is (could be enhanced with a CDN)
  return url;
};

/**
 * Generate responsive image URLs for different screen sizes
 * @param baseUrl - Base image URL
 * @returns Object with different sized image URLs
 */
export const generateResponsiveImages = (baseUrl: string) => {
  return {
    small: optimizeImageUrl(baseUrl, { width: 400, height: 300 }),
    medium: optimizeImageUrl(baseUrl, { width: 800, height: 600 }),
    large: optimizeImageUrl(baseUrl, { width: 1200, height: 900 }),
  };
};

/**
 * Lazy load image with intersection observer
 * @param imgRef - Image element reference
 * @param src - Image source
 */
export const lazyLoadImage = (
  imgRef: React.RefObject<HTMLImageElement>,
  src: string
) => {
  if (!imgRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(imgRef.current);
};
