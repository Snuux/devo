const BASE_URL = 'https://designernews.co';

const toNumber = value => {
  const match = /-?\d+/.exec(value || '');
  return match ? Number(match[0]) : 0;
};

/**
 * Designer News has no public API any more, so the stories are read from its homepage.
 *
 * @param {String} html - the homepage of https://designernews.co
 * @returns {Array<{title: String, url: String, threadLink: String, hostname: String, points: Number, commentCount: Number}>}
 */
export default function parseDesignerNews(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  return Array.from(doc.querySelectorAll('article'))
    .map(article => {
      const storyLink = article.querySelector('h2 a[href^="/stories/"]') || article.querySelector('a[href^="/stories/"]');
      if (!storyLink) {
        return null;
      }

      const threadLink = new URL(storyLink.getAttribute('href'), BASE_URL).href;
      const externalLink = article.querySelector('a[target="_blank"][href^="http"]');
      const url = externalLink ? externalLink.getAttribute('href') : threadLink;

      let hostname = '';
      if (externalLink) {
        try {
          hostname = new URL(url).hostname.replace(/^www\./, '');
        } catch (e) {
          hostname = '';
        }
      }

      const commentsLink = Array.from(article.querySelectorAll('a[href^="/stories/"]'))
        .find(a => /comment/i.test(a.textContent));
      const score = article.querySelector('span[title*=" up,"]');

      return {
        title: storyLink.textContent.trim(),
        url,
        threadLink,
        hostname,
        points: score ? toNumber(score.textContent) : 0,
        commentCount: commentsLink ? toNumber(commentsLink.textContent) : 0,
      };
    })
    .filter(Boolean);
}
