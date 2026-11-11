<template>
  <div class="dn-item">
    <div class="title-row">
      <div>
        <div class="site-string" v-if="item.hostname">
          <a :href="hostnameLink"> ({{ item.hostname }}) </a>
        </div>
        <div class="title truncate">
          <a :href="item.url" :title="item.title">{{ item.title }}</a>
        </div>
      </div>
    </div>
    <div class="meta-data">
      {{ item.points }} {{ item.points === 1 ? 'point' : 'points' }} |
      <a class="thread-link" :href="item.threadLink">
        {{ commentsLabel }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Row',
  props: {
    item: {
      required: true,
      type: Object,
    },
  },
  computed: {
    hostnameLink() {
      return `https://${this.item.hostname}`;
    },
    commentsLabel() {
      if (this.item.commentCount > 0) {
        return this.item.commentCount === 1 ? '1 comment' : `${this.item.commentCount} comments`;
      }
      return 'discuss';
    },
  },
};
</script>

<style scoped>
.dn-item {
  font-size: 16px;
  padding: 8px 0;
  text-align: left;
  border-bottom: 1px solid #dfe3e8a8;
}

.night-mode .dn-item {
  border-bottom: 1px solid #dfe3e82d;
}

.dn-item .row {
  margin: 0;
}

.dn-item a {
  text-decoration: none;
  color: inherit;
}

.dn-item .meta-data a {
  margin: 0 2.5px;
}

.dn-item a:hover {
  text-decoration: underline;
  text-decoration-line: underline;
  text-decoration-style: initial;
  text-decoration-color: initial;
}

.dn-item .title {
  white-space: nowrap;
  overflow: hidden;
}

.dn-item .title-row {
  margin-bottom: 4px;
}

.dn-item .title-row > div {
  max-width: 100%;
}

.dn-item .site-string {
  color: rgb(130, 130, 130);
  font-size: 10.667px;
  float: right;
  white-space: nowrap;
  margin-top: 3px;
  padding-left: 4px;
}

.meta-data {
  color: rgb(130, 130, 130);
  font-size: 9.33333px;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
