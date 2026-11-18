import { expect } from 'chai';
import { vi } from 'vitest';

import store from '@/store';

// jsdom here has no usable localStorage or matchMedia, which the store reads when it is created.
// Saving the state is not what these tests check.
vi.hoisted(() => {
  const items = new Map();
  window.localStorage = {
    getItem: key => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: key => items.delete(key),
  };
  window.matchMedia = () => ({ matches: false });
});
vi.mock('vuex-persistedstate', () => ({ default: () => () => {} }));

const respondWith = (body) => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => body })));
};

const loadCard = (platform, cardIndex, transform) => store.dispatch('updatePlatformData', {
  platform, cardIndex, url: `https://example.test/${cardIndex}`, transform, forced: true,
});

describe('per-card state', () => {
  beforeEach(() => {
    store.state.reddit.cards = {};
    store.state.huggingface.cards = {};
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gives a new card the default reddit settings', () => {
    const { settings, data, updated_at: updatedAt } = store.getters.getCardState('reddit', 2);

    expect(settings).to.deep.equal({ subreddits: ['programming'], sort: 'hot', subredditPlacement: 'title' });
    expect(data).to.deep.equal([]);
    expect(updatedAt).to.equal(0);
  });

  it('keeps reddit settings apart for each card', () => {
    store.dispatch('setRedditSettings', { cardIndex: 0, subreddits: ['godot'], sort: 'top' });
    store.dispatch('setRedditSettings', { cardIndex: 1, subreddits: ['rust'], sort: 'top-week' });

    expect(store.getters.getCardState('reddit', 0).settings.subreddits).to.deep.equal(['godot']);
    expect(store.getters.getCardState('reddit', 0).settings.sort).to.equal('top');
    expect(store.getters.getCardState('reddit', 1).settings.subreddits).to.deep.equal(['rust']);
    expect(store.getters.getCardState('reddit', 1).settings.sort).to.equal('top-week');
  });

  it('stores loaded posts on the card that loaded them', async () => {
    respondWith(['first']);
    await loadCard('reddit', 0, data => data);
    respondWith(['second']);
    await loadCard('reddit', 1, data => data);

    expect(store.getters.getCardState('reddit', 0).data).to.deep.equal(['first']);
    expect(store.getters.getCardState('reddit', 1).data).to.deep.equal(['second']);
  });

  it('passes the card index to transform', async () => {
    respondWith([]);
    const seen = [];
    await loadCard('reddit', 3, (data, state, cardIndex) => {
      seen.push(cardIndex);
      return data;
    });

    expect(seen).to.deep.equal([3]);
  });

  it('keeps hugging face settings apart for each card', () => {
    store.dispatch('setHuggingFaceSettings', { cardIndex: 0, section: 'models', sort: 'likes' });
    store.dispatch('setHuggingFaceSettings', { cardIndex: 1, section: 'datasets' });

    expect(store.getters.getCardState('huggingface', 0).settings.section).to.equal('models');
    expect(store.getters.getCardState('huggingface', 0).settings.sort).to.equal('likes');
    expect(store.getters.getCardState('huggingface', 1).settings.section).to.equal('datasets');
    expect(store.getters.getCardState('huggingface', 2).settings.section).to.equal('models');
  });

  it('drops the items only of the hugging face card whose listing changed', async () => {
    respondWith(['item']);
    await loadCard('huggingface', 0, data => data);
    await loadCard('huggingface', 1, data => data);

    store.dispatch('setHuggingFaceSettings', { cardIndex: 0, section: 'spaces' });

    expect(store.getters.getCardState('huggingface', 0).data).to.deep.equal([]);
    expect(store.getters.getCardState('huggingface', 0).updated_at).to.equal(0);
    expect(store.getters.getCardState('huggingface', 1).data).to.deep.equal(['item']);
  });

  it('resets the cache only for the card whose subreddits changed', async () => {
    respondWith([]);
    await loadCard('reddit', 0, data => data);
    await loadCard('reddit', 1, data => data);

    store.dispatch('setRedditSettings', { cardIndex: 0, subreddits: ['godot'] });

    expect(store.getters.getCardState('reddit', 0).updated_at).to.equal(0);
    expect(store.getters.getCardState('reddit', 1).updated_at).to.be.above(0);
  });
});
