<template>
  <div class="content-wrapper">
    <div class="video-box">
      <video id="video" poster="none"></video>
    </div>
    <button class="play-pause-btn" @click="playOrStop">
      <img :src="isPlay ? pauseIcon : playIcon" width="34px" /><span>{{
        isPlay ? "停止" : "开始运行AI识别"
      }}</span>
    </button>
  </div>
</template>

<script>
import playIcon from "@/assets/img/monitor/play.png";
import pauseIcon from "@/assets/img/monitor/pause.png";
import { stop, start } from "@/services/http";
export default {
  name: "Send11VideoPlayer",

  data() {
    return {
      playIcon,
      pauseIcon,
      isPlay: false,
    };
  },

  mounted() {
    const video = document.getElementById("video");
    const top = video.getBoundingClientRect().top;
    const left = video.getBoundingClientRect().left;
    const width = video.getBoundingClientRect().width;
    const height = video.getBoundingClientRect().height;
    if (window.aidShowBridge && window.aidShowBridge.setSurfaceLocation) {
      window.aidShowBridge.setSurfaceLocation(left, top, width, height, 1920);
    }

    // document.getElementById("video").addEventListener("ended", () => {
    //   this.isPlay = !this.isPlay;
    // });

    stop();
    // start();
    // this.isPlay = true;
  },

  methods: {
    playOrStop() {
      this.isPlay = !this.isPlay;
      if (this.isPlay) {
        // document.getElementById("video").play();
        start();
      } else {
        // document.getElementById("video").pause();
        stop();
      }
    },
  },
  watch: {
    "$store.state.ready": function (value) {
      if (value) {
        stop();

        setTimeout(
          () => {
            start();
            this.isPlay = true;
          },
          (window._second || 0.5) * 1000,
        );
      }
    },
  },
};
</script>

<style lang="less" scoped>
.content-wrapper {
  background: #344880;
  box-shadow: 0px 0px 10px #1a316d;
  // padding: 20px;
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  .video-box {
    flex:1;
    display: flex;
    justify-content: center;
    padding-top: 20px;
    video {
      width: 360px;
      height: 100%;
      background: black;
    }
  }

  .play-pause-btn {
    color: #fff;
    border-radius: 4px;
    width: 360px;
    margin: 20px auto;

    background: linear-gradient(
      101deg,
      rgba(71, 84, 141, 0.64) 9%,
      rgba(53, 81, 119, 0.15) 87%,
      rgba(53, 92, 119, 0.14) 88%
    );
    backdrop-filter: blur(10.88px);
    box-shadow: 0px 2px 8px 0px rgba(1, 29, 90, 0.72);

    height: 50px;
    line-height: 50px;
    text-align: center;
    // letter-spacing: 5px;
    // text-indent: 5px;
    border: none;
    outline: none;
    cursor: pointer;
    transition: all 0.5s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    letter-spacing: 3px;
    &:hover {
      background: #12275e;
    }
    img {
      width: 15px;
      margin-right: 10px;
      margin-bottom: 3px;
    }
  }
}
</style>
