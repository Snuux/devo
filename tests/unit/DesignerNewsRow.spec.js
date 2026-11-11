import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

import Row from '@/components/DesignerNews/Row.vue';

const item = {
  title: 'Nobody wants a blank page, nobody touches a perfect one',
  url: 'https://uxdesign.cc/nobody-wants-a-blank-page',
  threadLink: 'https://designernews.co/stories/nobody-wants-a-blank-page-nobody-touches-a-perfect-one',
  hostname: 'uxdesign.cc',
  points: 7,
  commentCount: 1,
};

describe('DesignerNews/Row.vue', () => {
  it('row is properly rendered', () => {
    const wrapper = shallowMount(Row, { props: { item } });

    expect(wrapper.find('.site-string').text()).to.equal(`(${item.hostname})`);
    expect(wrapper.find('.site-string > a').attributes('href')).to.equal(`https://${item.hostname}`);
    expect(wrapper.find('.title').text()).to.equal(item.title);
    expect(wrapper.find('.title > a').attributes('href')).to.equal(item.url);
    expect(wrapper.find('.thread-link').attributes('href')).to.equal(item.threadLink);
    expect(wrapper.find('.thread-link').text()).to.equal('1 comment');
    expect(wrapper.find('.meta-data').text()).to.contain('7 points');
  });

  it('offers to discuss a story without comments', () => {
    const wrapper = shallowMount(Row, { props: { item: { ...item, commentCount: 0 } } });

    expect(wrapper.find('.thread-link').text()).to.equal('discuss');
  });
});
