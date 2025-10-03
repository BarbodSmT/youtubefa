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
  
  const { width = 400, height = 300, quality = 80, format = 'webp' } = options;
  
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
    small: optimizeImageUrl(baseUrl, { width: 200, height: 150 }),
    medium: optimizeImageUrl(baseUrl, { width: 400, height: 300 }),
    large: optimizeImageUrl(baseUrl, { width: 800, height: 600 }),
  };
};

/**
 * Lazy load image with intersection observer
 * @param imgRef - Image element reference
 * @param src - Image source
 * @param placeholder - Placeholder image
 */
export const lazyLoadImage = (
  imgRef: React.RefObject<HTMLImageElement>,
  src: string,
  placeholder: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+'
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
