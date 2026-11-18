<template>
  <div class="hf-list">
    <row v-for="item in lines" :key="item.id" :item="item"></row>
    <div v-if="lines.length === 0" class="hf-empty">Nothing found. Try other filters in the settings.</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Row from '@/components/HuggingFace/Row.vue';

export default {
  name: 'Body',
  components: { Row },
  props: {
    cardIndex: {
      type: Number,
      required: true,
    },
  },
  computed: {
    lines() {
      return this.getCardState('huggingface', this.cardIndex).data;
    },
    ...mapGetters(['getCardState']),
  },
};
</script>

<style>
.hf-list > :last-child {
  border: none;
}

.hf-empty {
  padding: 16px 0;
  text-align: left;
  color: rgb(130, 130, 130);
}
</style>
