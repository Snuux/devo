<template>
  <div class="ph-item">
    <div>
      <div class="title-row">
        <a :href="item.link">{{ item.name }}</a>
      </div>
      <h3 class="description" v-if="item.tagline">
        {{ item.tagline }}
      </h3>
      <div class="meta" v-if="item.author">
        <span class="author">by {{ item.author }}</span>
      </div>
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
};
</script>

<style>
.ph-item {
  font-size: 16px;
  padding: 12px 0;
  text-align: left;
  border-bottom: 1px solid #dfe3e8a8;
}

.night-mode .ph-item {
  border-bottom: 1px solid #dfe3e82d;
}

.ph-item a {
  text-decoration: none;
  color: inherit;
}

.ph-item a:hover {
  text-decoration: underline;
}

.ph-item .title-row {
  font-size: 20px;
  font-weight: 300;
  line-height: 32px;
}

.ph-item .description {
  color: rgb(153, 153, 153);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  margin-bottom: 5px;
  margin-top: 0px;
}

.ph-item .author {
  color: rgb(153, 153, 153);
  font-size: 11px;
}
</style>
