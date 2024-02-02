<template>
  <div id="monitoring-area">
    <videoPlayer />
    <resourceWatch />
  </div>
</template>

<script>
import videoPlayer from "./monitoring/videoPlayer.vue";
import resourceWatch from "./monitoring/resourceWatch.vue";
export default {
  name: "Send11MonitorArea",

  components: { videoPlayer, resourceWatch },

  data() {
    return {};
  },

  mounted() {},

  methods: {},
};
</script>

<style lang="less" scoped>
#monitoring-area {
  height: 100%;
  max-height: 1010px;
  width: 390px;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}
</style>
