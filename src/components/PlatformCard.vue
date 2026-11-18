<template>
  <card
    :titleBackgroundColor="this.titleBackgroundColorBasedOnMode"
    :titleFontColor="this.titleFontColorBasedOnMode"
    :icon="options.icon"
    :externalLink="options.externalLink"
    :title="options.title"
    :iconOnClick="updateData"
    :settingsOnClick="hasSettings ? toggleSettings : null"
  >
    <template #card-title>
      <custom-select :cardIndex="cardIndex"></custom-select>
    </template>
    <template #card-body>
      <component
        v-if="hasSettings && settingsVisible"
        :is="options.settingsComponentName"
        v-bind="cardProps"
        @close="closeSettings"
        @saved="onSettingsSaved"
      ></component>
      <loading :color="loadingColorBasedOnMode" v-else-if="loading"></loading>
      <div v-else-if="failed" class="load-error">Could not load {{ options.title }}. Try refreshing.</div>
      <slot v-else name="card-body">
        <component :is="options.bodyComponentName" v-bind="cardProps"></component>
      </slot>
    </template>
  </card>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import settings from '@/settings';
import { isPerCard } from '@/cardState';
import Card from '@/components/Card.vue';
import Loading from '@/components/Loading.vue';
import CustomSelect from '@/components/PlatformSelect.vue';
import * as BodyComponents from '@/components/bodies';
import * as SettingsComponents from '@/components/settingsPanels';

export default {
  name: 'PlatformCard',
  components: {
    ...BodyComponents,
    ...SettingsComponents,
    Loading,
    Card,
    CustomSelect,
  },
  props: {
    cardIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      failed: false,
      settingsVisible: false,
    };
  },
  async created() {
    this.updateData(false);
  },
  methods: {
    async updateData(forced = true) {
      this.loading = true;
      this.failed = false;
      try {
        await this.updatePlatformData({
          platform: this.platform,
          cardIndex: this.cardIndex,
          url: this.options.dataUrl instanceof Function ? this.options.dataUrl(this.$store.state, this.cardIndex) : this.options.dataUrl,
          transform: this.options.transform,
          fetchOptions: this.options.fetchOptions,
          parseResponse: this.options.parseResponse,
          forced,
        });
      } catch (error) {
        this.failed = true;
      } finally {
        this.loading = false;
      }
    },

    toggleSettings() {
      this.settingsVisible = !this.settingsVisible;
    },

    closeSettings() {
      this.settingsVisible = false;
    },

    onSettingsSaved() {
      this.settingsVisible = false;
      this.updateData(true);
    },

    ...mapActions(['updatePlatformData']),
  },

  computed: {
    platform() {
      return this.getPlatformByIndex(this.cardIndex);
    },

    titleFontColorBasedOnMode() {
      return this.isNightMode ? this.options.nightMode.titleFontColor : this.options.titleFontColor;
    },

    titleBackgroundColorBasedOnMode() {
      return this.isNightMode ? this.options.nightMode.titleBackgroundColor : this.options.titleBackgroundColor;
    },

    loadingColorBasedOnMode() {
      return this.isNightMode ? this.options.nightMode.loadingColor : this.options.loadingColor;
    },

    options() {
      return settings.platforms[this.platform];
    },

    // only sources with per-card state receive the card index, other bodies would render it as a DOM attribute.
    cardProps() {
      return isPerCard(this.platform) ? { cardIndex: this.cardIndex } : {};
    },

    hasSettings() {
      return Boolean(this.options.settingsComponentName);
    },

    ...mapState({
      isNightMode: state => state.settings.isNightMode,
    }),

    ...mapGetters(['getPlatformByIndex']),
  },

  watch: {
    platform() {
      this.settingsVisible = false;
      this.updateData(false);
    },
  },
};
</script>

<style scoped>
.load-error {
  padding: 16px 0;
  text-align: left;
  color: rgb(130, 130, 130);
}
</style>
