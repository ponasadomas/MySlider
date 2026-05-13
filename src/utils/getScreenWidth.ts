// Function to get the screen's width
export const getScreenWidth = (): number => {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};
