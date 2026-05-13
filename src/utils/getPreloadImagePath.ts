// This function is reliant on the imageObject that is being passed from ResponsiveImageGenerator Webpack plugin.
export async function getPreloadImagePath(imageObject: any, imageWidthToPreload: number) {
  // Check if imageObject exists
  if (!imageObject) {
    throw new Error('Image object is undefined or null');
  }

  // Check if this is an SVG image
  if ('svg' in imageObject) {
    return imageObject.svg;
  }

  // Mirror the <picture> element behaviour: prefer webp when the image data
  // includes it, fall back to png. The browser will pick webp via <source> if
  // available, so preloading png when webp exists loads a file it won't use.
  const imageFormat = imageObject.webp ? 'webp' : 'png';

  // Check if the expected format exists
  if (!imageObject[imageFormat] || !imageObject[imageFormat].images) {
    throw new Error(`Image object missing ${imageFormat} format or images array`);
  }

  const sortedImages = imageObject[imageFormat].images.sort((a: {width: number}, b: {width: number}) => a.width - b.width);
  const imageToPreload = sortedImages.find((img: {width: number}) => img.width >= imageWidthToPreload);

  return imageToPreload ? imageToPreload.path : imageObject[imageFormat].src;
}
