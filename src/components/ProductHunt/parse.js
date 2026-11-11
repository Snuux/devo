/**
 * Turns the Product Hunt Atom feed (https://www.producthunt.com/feed) into the rows the card renders.
 *
 * @param {String} xml - the raw feed
 * @returns {Array<{id: String, name: String, tagline: String, link: String, author: String, publishedAt: String}>}
 */
export default function parseProductHunt(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Product Hunt returned an unreadable feed');
  }

  return Array.from(doc.getElementsByTagName('entry')).map(entry => {
    const text = tag => (entry.getElementsByTagName(tag)[0]?.textContent || '').trim();
    const link = entry.getElementsByTagName('link')[0];

    // The content is escaped HTML: the first paragraph holds the tagline, the second holds links.
    const content = new DOMParser().parseFromString(text('content'), 'text/html');
    const tagline = (content.querySelector('p')?.textContent || '').trim();

    return {
      id: text('id'),
      name: text('title'),
      tagline,
      link: link ? link.getAttribute('href') : 'https://www.producthunt.com',
      author: text('name'),
      publishedAt: text('published'),
    };
  });
}
