import { expect } from 'chai';
import fs from 'fs';
import path from 'path';

import parseProductHunt from '@/components/ProductHunt/parse';
import parseDesignerNews from '@/components/DesignerNews/parse';

const fixture = name => fs.readFileSync(path.resolve(__dirname, 'fixtures', name), 'utf8');

describe('parseProductHunt', () => {
  it('reads products from the Atom feed', () => {
    const items = parseProductHunt(fixture('producthunt.xml'));

    expect(items).to.have.length(2);
    expect(items[0]).to.deep.equal({
      id: 'tag:www.producthunt.com,2005:Post/1306167',
      name: 'Skillbox',
      tagline: 'One library for your AI skills, synced to every agent',
      link: 'https://www.producthunt.com/products/skillbox-5',
      author: 'Adenekan Wonderful',
      publishedAt: '2026-11-05T20:01:18-08:00',
    });
  });

  it('rejects a response that is not a feed', () => {
    expect(() => parseProductHunt('<html><body>Not found')).to.throw();
  });
});

describe('parseDesignerNews', () => {
  it('reads stories from the homepage and skips sponsors', () => {
    const items = parseDesignerNews(fixture('designernews.html'));

    expect(items).to.have.length(2);
    expect(items[0]).to.deep.equal({
      title: 'Nobody wants a blank page, nobody touches a perfect one',
      url: 'https://uxdesign.cc/nobody-wants-a-blank-page-nobody-touches-a-perfect-one-48d452a26dae',
      threadLink: 'https://designernews.co/stories/nobody-wants-a-blank-page-nobody-touches-a-perfect-one',
      hostname: 'uxdesign.cc',
      points: 0,
      commentCount: 0,
    });
  });

  it('returns nothing for a page without stories', () => {
    expect(parseDesignerNews('<html><body></body></html>')).to.deep.equal([]);
  });
});
