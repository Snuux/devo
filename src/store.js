import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import { parseSubreddits, normalizeSort, normalizeSubredditPlacement, DEFAULT_SUBREDDITS } from './components/Reddit/reddit';
import { buildUrl as buildHuggingFaceUrl, normalizeSettings } from './components/HuggingFace/huggingface';
import { isPerCard, getCardEntry, ensureCardEntry } from './cardState';

const GITHUB = 'github';
const HACKERNEWS = 'hackernews';
const PRODUCTHUNT = 'producthunt';
const DESIGNERNEWS = 'designernews';

const SETTINGS_ISNIGHTMODE = 'settings.isNightMode';

/**
 * @returns {Boolean} - in priority: the user's existing selection > their dark mode preference > false
 */
const getIsNightMode = () => {
  const localVersion = localStorage.getItem(SETTINGS_ISNIGHTMODE);
  if (localVersion) {
    return JSON.parse(localVersion);
  }

  const hasMatchMedia = 'matchMedia' in window;
  if (!hasMatchMedia) {
    return false;
  }

  const darkModeQuery = '(prefers-color-scheme: dark)';
  return window.matchMedia(darkModeQuery).matches;
};

/**
 * @returns {String} - the version number of the extension to version the state.
 */
const getVersion = () => {
  const defaultValue = 'default-version';
  if (typeof chrome === 'undefined' && typeof browser === 'undefined') {
    return defaultValue;
  }

  /* global chrome, browser */
  const browserInstance = chrome || browser;
  if (!browserInstance || !browserInstance.runtime) {
    return defaultValue;
  }

  if (!('getManifest' in browserInstance.runtime)) {
    return defaultValue;
  }

  if (typeof browserInstance.runtime.getManifest !== 'function') {
    return defaultValue;
  }

  const manifest = browserInstance.runtime.getManifest();
  return 'version' in manifest ? manifest.version : defaultValue;
};


export default createStore({
  plugins: [createPersistedState({
    key: `vuex-state-${getVersion()}`,
  })],
  state: {
    settings: {
      is24HourFormat: true,
      isNightMode: getIsNightMode(),
      cards: [GITHUB, HACKERNEWS, PRODUCTHUNT, DESIGNERNEWS],
      layout: 'OneLeftTwoRight',
      isFocusMode: false,
    },
    github: {
      updated_at: 0,
      cache: 5 * 60000,
      data: [],
    },
    hackernews: {
      updated_at: 0,
      cache: 5 * 60000,
      data: [],
    },
    producthunt: {
      updated_at: 0,
      cache: 15 * 60000,
      data: [],
    },
    designernews: {
      updated_at: 0,
      cache: 5 * 60000,
      data: [],
    },
    devto: {
      updated_at: 0,
      cache: 5 * 60000,
      data: [],
    },
    lobsters: {
      updated_at: 0,
      cache: 5 * 60000,
      data: [],
    },
    tabnews: {
      updated_at: 0,
      cache: 5 * 60000,
      data: [],
    },
    reddit: {
      cache: 5 * 60000,
      // each card keeps its own settings and posts, keyed by card index.
      cards: {},
    },
    yclaunches: {
      updated_at: 0,
      cache: 15 * 60000,
      data: [],
      responseDataKey: 'hits',
    },
    huggingface: {
      cache: 15 * 60000,
      // each card keeps its own settings and items, keyed by card index.
      cards: {},
    },
  },
  mutations: {
    set24HourFormat(state, is24HourFormat) {
      state.settings.is24HourFormat = is24HourFormat;
    },
    setNightMode(state, isNightMode) {
      state.settings.isNightMode = isNightMode;
      localStorage.setItem(SETTINGS_ISNIGHTMODE, isNightMode);
    },
    setFocusMode(state, isFocusMode) {
      state.settings.isFocusMode = isFocusMode;
    },
    setCardPlatform(state, { index, platform }) {
      state.settings.cards[index] = platform;
    },
    setLayout(state, layout) {
      state.settings.layout = layout;
    },
    setRedditSettings(state, {
      cardIndex, subreddits, sort, subredditPlacement,
    }) {
      const card = ensureCardEntry(state, 'reddit', cardIndex);
      const names = parseSubreddits((subreddits || []).join(' '));
      const previous = card.settings;
      const next = {
        subreddits: names.length > 0 ? names : [...DEFAULT_SUBREDDITS],
        sort: normalizeSort(sort),
        subredditPlacement: normalizeSubredditPlacement(subredditPlacement),
      };
      card.settings = next;
      // the cache belongs to the previous listing, the next update has to fetch again.
      // The subreddit placement only changes how posts are shown, so it keeps the cache.
      if (next.sort !== previous.sort || next.subreddits.join('+') !== previous.subreddits.join('+')) {
        card.updated_at = 0;
      }
    },
    setHuggingFaceSettings(state, { cardIndex, ...settings }) {
      const card = ensureCardEntry(state, 'huggingface', cardIndex);
      const previousUrl = buildHuggingFaceUrl(card.settings);
      card.settings = normalizeSettings(settings);
      // the cache belongs to the previous listing, the next update has to fetch again.
      if (buildHuggingFaceUrl(card.settings) !== previousUrl) {
        card.updated_at = 0;
        card.data = [];
      }
    },
    setPlatformData(state, { platform, cardIndex, data }) {
      const target = isPerCard(platform) ? ensureCardEntry(state, platform, cardIndex) : state[platform];
      target.data = data;
      target.updated_at = Date.now();
    },
  },
  actions: {
    set24HourFormat(context, is24HourFormat) {
      context.commit('set24HourFormat', is24HourFormat);
    },

    setNightMode(context, isNightMode) {
      context.commit('setNightMode', isNightMode);
    },

    setFocusMode(context, isFocusMode) {
      context.commit('setFocusMode', isFocusMode);
    },

    setCardPlatform(context, payload) {
      context.commit('setCardPlatform', payload);
    },

    setLayout(context, layout) {
      context.commit('setLayout', layout);
    },

    setRedditSettings(context, redditSettings) {
      context.commit('setRedditSettings', redditSettings);
    },

    setHuggingFaceSettings(context, settings) {
      context.commit('setHuggingFaceSettings', settings);
    },

    async updatePlatformData({ state, commit }, {
      platform, cardIndex, forced, url, transform, fetchOptions, parseResponse,
    }) {
      const platformConfig = state[platform];
      const threshold = platformConfig.cache;
      const lastUpdate = isPerCard(platform) ? getCardEntry(state, platform, cardIndex).updated_at : platformConfig.updated_at;
      const now = new Date();

      if (!lastUpdate || now - lastUpdate > threshold || forced) {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`Failed to load ${platform}: ${response.status}`);
        }

        let data;
        if (parseResponse) {
          data = parseResponse(await response.text());
        } else {
          data = await response.json();
          if ('responseDataKey' in platformConfig) {
            data = data[platformConfig.responseDataKey];
          }
        }

        if (typeof transform === 'function') {
          data = transform(data, state, cardIndex);
        }
        commit('setPlatformData', { platform, cardIndex, data });
      }
    },
  },
  getters: {
    getPlatformByIndex: state => cardIndex => state.settings.cards[cardIndex],
    getCardState: state => (platform, cardIndex) => getCardEntry(state, platform, cardIndex),
  },
});
