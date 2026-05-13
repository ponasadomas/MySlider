// Function to check if the browser supports webp images
export const checkBrowserWebpSupport = async (): Promise<boolean> => {
  if (!window.createImageBitmap) return false;

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  return window.createImageBitmap(blob).then(() => true, () => false);
};
