type SizesType = {
  [key: number]: number | undefined;
  default: number;
};

// Used to get the image width to preload for Slider's slides that use images
export function getImageWidthBasedOnScreenWidth(screenWidth: number, sizes: SizesType, pixelDensity: number) {
  // Create an array of the keys from the sizes object and sort them in ascending order
  let keys = Object.keys(sizes).filter(key => key !== 'default').sort((a, b) => parseInt(a) - parseInt(b));

  // Initialize the result with the default size
  let result = sizes.default;

  // Iterate over each key
  for (let i = 0; i < keys.length; i++) {
      // Convert the current key to a number
      let key = parseInt(keys[i]);

      // If the given number is less than the current key
      if (screenWidth < key) {
          // Update the result with the value associated with the current key
          // Use the non-null assertion operator to tell TypeScript that sizes[key] will not be undefined
          result = sizes[key]!;
          break;
      }
  }

  return result * pixelDensity;
}
