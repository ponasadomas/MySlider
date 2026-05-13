
interface NavigateOptions {
  replace?: boolean;
}

export const navigateToSlugUrl = (url: string, options: NavigateOptions = {}) => {
  const { replace = false } = options;
  const method = replace ? 'replaceState' : 'pushState';
  // Change the URL without reloading the page
  window.history[method]({}, '', url);

};
