import { SlideType_CopyBlock } from '../types';

function preloadFromSrcSet(srcSet: string, sizes: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    // Setting srcset + sizes on an off-DOM image triggers the browser's native
    // responsive image selection — same algorithm as <picture>/<img srcset>,
    // so it picks the same resolution that will actually be used on render.
    img.sizes = sizes;
    img.srcset = srcSet;
  });
}

function preloadFromSrc(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function preloadOneImageObject(imageObj: any): Promise<void> {
  if (!imageObj) return Promise.resolve();

  if ('svg' in imageObj) {
    return preloadFromSrc(imageObj.svg);
  }

  // Nested responsive (SlideType_ResponsiveImage / SlideType_InlineResponsiveImage).
  // Mirror ResponsiveImageOutput EXACTLY: it emits <source srcset=webp>/<source
  // srcset=png> only when those srcSets are non-empty, and always an
  // <img src={png.images[0].path ?? png.src}> fallback. Single-URL images (no
  // responsive-loader → empty srcSet) load via that <img> src, so preloading via
  // an empty srcSet fetches nothing — fall back to the exact src the browser uses.
  if ('png' in imageObj || 'webp' in imageObj) {
    const webp = imageObj.webp;
    const png = imageObj.png;
    if (webp?.srcSet) return preloadFromSrcSet(webp.srcSet, imageObj.sizes ?? '');
    if (png?.srcSet) return preloadFromSrcSet(png.srcSet, imageObj.sizes ?? '');
    const fallback = png?.images?.[0]?.path ?? png?.src ?? webp?.images?.[0]?.path ?? webp?.src;
    return fallback ? preloadFromSrc(fallback) : Promise.resolve();
  }

  // Flat responsive (SlideType_FlatResponsiveImage — webpack plugin direct output).
  if ('srcSet' in imageObj) {
    if (imageObj.srcSet) return preloadFromSrcSet(imageObj.srcSet, imageObj.sizes ?? '');
    const fallback = imageObj.images?.[0]?.path ?? imageObj.src;
    return fallback ? preloadFromSrc(fallback) : Promise.resolve();
  }

  return Promise.resolve();
}

async function preloadSlideImages(slide: SlideType_CopyBlock): Promise<void> {
  const imageObjects = [
    ...(slide.image ? [slide.image] : []),
    ...(slide.copyImages ?? []),
  ];
  await Promise.all(imageObjects.map(preloadOneImageObject));
}

// Preloads images in the order slides are provided — earlier entries first.
// Images within a single slide load in parallel; slides load sequentially so
// the nearest slide is always prioritised over later ones.
export function preloadImages(slides: SlideType_CopyBlock[]): void {
  const run = async () => {
    for (const slide of slides) {
      await preloadSlideImages(slide);
    }
  };
  run().catch((error) => console.error('Error in preloadImages:', error));
}
