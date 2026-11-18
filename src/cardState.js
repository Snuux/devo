import { DEFAULT_SUBREDDITS, DEFAULT_SORT, DEFAULT_SUBREDDIT_PLACEMENT } from './components/Reddit/reddit';

/**
 * Sources whose cards each keep their own settings and data.
 * Their store state holds `cards: { [cardIndex]: { settings, data, updated_at } }`.
 */
const DEFAULT_SETTINGS = {
  reddit: () => ({
    subreddits: [...DEFAULT_SUBREDDITS],
    sort: DEFAULT_SORT,
    subredditPlacement: DEFAULT_SUBREDDIT_PLACEMENT,
  }),
};

export const isPerCard = platform => platform in DEFAULT_SETTINGS;

export const emptyCardEntry = platform => ({
  settings: DEFAULT_SETTINGS[platform](),
  data: [],
  updated_at: 0,
});

/**
 * @returns {Object} - the card's entry, or a fresh default one when the card has none yet. Never changes the state.
 */
export const getCardEntry = (state, platform, cardIndex) => state[platform].cards[cardIndex] || emptyCardEntry(platform);

/**
 * @returns {Object} - the card's entry, created in the state when missing. Only for use inside mutations.
 */
export const ensureCardEntry = (state, platform, cardIndex) => {
  const { cards } = state[platform];
  if (!cards[cardIndex]) {
    cards[cardIndex] = emptyCardEntry(platform);
  }
  return cards[cardIndex];
};
