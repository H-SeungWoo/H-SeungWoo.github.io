// Shared, pinned Anime.js loader. Navigation remains usable if the CDN is unavailable.
export const motionReady = import('https://cdn.jsdelivr.net/npm/animejs@4.2.2/+esm').catch(error => {
  console.warn('Animation library unavailable; using immediate transitions.', error);
  return null;
});
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
