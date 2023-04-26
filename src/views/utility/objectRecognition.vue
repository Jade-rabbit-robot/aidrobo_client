<template>
  <div class="object-recognition-container">
    <div class="video-container" id="video"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.initVideo();
  },
  beforeDestroy() {
    if (window.aidShowBridge && window.aidShowBridge.close) {
      window.aidShowBridge.close();
    }
  },
  methods: {
    initVideo() {
      const video = document.getElementById("video");
      const top = video.getBoundingClientRect().top;
      const left = video.getBoundingClientRect().left;
      const width = video.getBoundingClientRect().width;
      const height = video.getBoundingClientRect().height;
      if (window.aidShowBridge && window.aidShowBridge.setSurfaceLocation) {
        window.aidShowBridge.setSurfaceLocation(left, top, width, height, 0, 0, 1920);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.object-recognition-container {
  box-sizing: border-box;
  display: flex;
  color: #fff;
  width: 100%;
  height: 100%;
  position: relative;
  padding-top: 30px;
  padding-left: 30px;
}

.video-container {
  position: relative;
  top: 0;
  height: 1010px;
  width: 1840px;
  //background: transparent;
  //border-radius: 5px;
  background: #526cad;
  //overflow: hidden;
}
</style>
