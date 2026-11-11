import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

import Row from '@/components/ProductHunt/Row.vue';

const item = {
  id: 'tag:www.producthunt.com,2005:Post/1306167',
  name: 'Skillbox',
  tagline: 'One library for your AI skills, synced to every agent',
  link: 'https://www.producthunt.com/products/skillbox-5',
  author: 'Adenekan Wonderful',
  publishedAt: '2026-11-05T20:01:18-08:00',
};

describe('ProductHunt/Row.vue', () => {
  it('row is properly rendered', () => {
    const wrapper = shallowMount(Row, { props: { item } });

    expect(wrapper.find('.title-row > a').text()).to.equal(item.name);
    expect(wrapper.find('.title-row > a').attributes('href')).to.equal(item.link);
    expect(wrapper.find('.description').text()).to.equal(item.tagline);
    expect(wrapper.find('.author').text()).to.equal(`by ${item.author}`);
  });
});
