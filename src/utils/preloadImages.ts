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

function preloadOneImageObject(imageObj: any): Promise<void> {
  if (!imageObj) return Promise.resolve();

  if ('svg' in imageObj) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = imageObj.svg;
    });
  }

  // Nested responsive (SlideType_ResponsiveImage / SlideType_InlineResponsiveImage)
  // Prefer webp to mirror the <picture> element which lists webp source first.
  if ('png' in imageObj || 'webp' in imageObj) {
    const format = imageObj.webp ?? imageObj.png;
    return preloadFromSrcSet(format.srcSet, imageObj.sizes ?? '');
  }

  // Flat responsive (SlideType_FlatResponsiveImage — webpack plugin direct output)
  if ('srcSet' in imageObj) {
    return preloadFromSrcSet(imageObj.srcSet, imageObj.sizes ?? '');
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
