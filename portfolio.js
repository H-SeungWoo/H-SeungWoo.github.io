// Paste the iframe's src from Canva's Share → Embed HTML code here.
export const portfolio = {
  title: '포트폴리오',
  embedUrl: 'https://www.canva.com/design/DAHWoRWg2iI/i-9A8yrbSEEgpN6Uz5JlbQ/view?embed',
  aspectRatio: '16 / 9',
};

export function getCanvaLinks(value = portfolio.embedUrl) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'www.canva.com' ||
        url.username || url.password || url.port ||
        !/^\/design\/[\w-]+(?:\/[\w-]+)?\/view\/?$/.test(url.pathname) ||
        !url.searchParams.has('embed')) return null;
    const view = new URL(url);
    view.search = '';
    view.hash = '';
    return { embed: url.href, view: view.href };
  } catch {
    return null;
  }
}
