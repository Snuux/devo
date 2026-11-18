import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';

import PlatformSelect from '@/components/PlatformSelect.vue';
import LayoutSelect from '@/components/LayoutSelect.vue';

const createTestStore = (selected) => createStore({
  state: { settings: { isNightMode: false, cards: ['github'], layout: 'SingleColumn' } },
  getters: {
    getPlatformByIndex: state => cardIndex => state.settings.cards[cardIndex],
  },
  mutations: {
    setCardPlatform(state, { index, platform }) {
      state.settings.cards[index] = platform;
      selected.push(platform);
    },
    setLayout(state, layout) {
      state.settings.layout = layout;
      selected.push(layout);
    },
  },
  actions: {
    setCardPlatform: ({ commit }, payload) => commit('setCardPlatform', payload),
    setLayout: ({ commit }, layout) => commit('setLayout', layout),
  },
});

const mountSelect = (component, props = {}) => {
  const selected = [];
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: { plugins: [createTestStore(selected)], stubs: { FontAwesomeIcon: true } },
  });
  return { wrapper, selected };
};

describe('PlatformSelect.vue', () => {
  it('closes the list once a source is picked', async () => {
    const { wrapper, selected } = mountSelect(PlatformSelect, { cardIndex: 0 });

    await wrapper.trigger('click');
    expect(wrapper.find('.options').exists()).to.equal(true);

    await wrapper.findAll('.option-item').find(item => item.text() === 'Reddit').trigger('click');

    expect(selected).to.deep.equal(['reddit']);
    expect(wrapper.find('.options').exists()).to.equal(false);
    wrapper.unmount();
  });

  it('closes the list on a click outside it', async () => {
    const { wrapper } = mountSelect(PlatformSelect, { cardIndex: 0 });

    await wrapper.trigger('click');
    document.body.click();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.options').exists()).to.equal(false);
    wrapper.unmount();
  });
});

describe('LayoutSelect.vue', () => {
  it('closes the list once a layout is picked', async () => {
    const { wrapper, selected } = mountSelect(LayoutSelect);

    await wrapper.trigger('click');
    await wrapper.findAll('.option-item')[1].trigger('click');

    expect(selected).to.have.lengthOf(1);
    expect(wrapper.find('.options').exists()).to.equal(false);
    wrapper.unmount();
  });
});
