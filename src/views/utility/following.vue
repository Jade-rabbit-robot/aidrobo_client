<template>
  <div class="following-container">
    <div class="video-container" id="video"></div>
    <div class="right">
      <div class="rText">
        <p class="title">{{ text.title }}</p>
        <p class="description">{{ text.description }}</p>
      </div>

      <div>
        <div class="message hide" ref="message">
          <img src="@/assets/img/forbid.svg" />
          <span>跟踪丢失</span>
        </div>
        <div :class="['action', { readyBtn: !loading }]" @click="followAction">
          {{ isStart ? "停止跟随" : "开始跟随" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const TEXT = {
  idle: {
    title: '选择跟随目标',
    description: '请选择跟随目标后点击下方开始跟随按钮'
  },
  following: {
    title: '正在跟随...',
    description: '正在跟随标记的目标，行走的速度请勿过快'
  }
}
export default {
  data() {
    return {
      isStart: false,
      loading: false,
    };
  },
  computed: {
    text() {
      return this.isStart ? TEXT.following : TEXT.idle
    }
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
    // 开始/停止 跟随
    followAction() {
      if(this.loading) return;
      this.isStart = !this.isStart;
      this.loading = true;
      this.messageShow(true);
      setTimeout(() => {
        this.loading = false;
        this.messageShow(false);
      },1000)
    },
    initVideo() {
      const video = document.getElementById('video')
      const top = video.getBoundingClientRect().top
      const left = video.getBoundingClientRect().left
      const width = video.getBoundingClientRect().width
      const height = video.getBoundingClientRect().height
      // TODO: 0 0 rgb size
      if (window.aidShowBridge && window.aidShowBridge.setSurfaceLocation) {
        window.aidShowBridge.setSurfaceLocation(left, top, width, height, 0, 0, 1920);
      }
    },
    messageShow(show) {
      this.$refs.message.classList.remove('hide');
      if(!show)  {
        this.$refs.message.classList.add('hide');
      }
    }
  },
};
</script>

<style lang="less" scoped>
.following-container {
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
  width: 1380px;
  //background: transparent;
  //border-radius: 5px;
  background: #526cad;
  //overflow: hidden;
}

.right {
  width: 434px;
  height: 1010px;
  background-color: #ccc;
  border-radius: 5px;
  background: linear-gradient(
    155deg,
    rgba(71, 84, 141, 0.64) 24%,
    rgba(71, 66, 124, 0.52) 98%
  );
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 50px;
  margin-left: 30px;
  justify-content: space-between;
  padding: 20px 20px 70px 20px;
  box-sizing: border-box;

  .rText {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 20px 34px;
    p {
      line-height: 45px;
      text-align: center;
    }
    .title {
      padding-bottom: 10px;
    }
    .description {
      margin-top: 35px;
    }
  }
}

.message {
  width: 300px;
  height: 80px;
  border-radius: 10px;
  background: #2E3449;
  backdrop-filter: blur(10px);
  margin-bottom: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  &.hide {
    transform: translateY(40px);
    opacity: 0;
  }
  span {
    margin-top: -5px;
    margin-left: 20px;
    font-size: 35px;
    font-weight: normal;
    line-height: 45px;
    letter-spacing: 1px;
  }
}
.action {
  width: 300px;
  height: 120px;
  border-radius: 10px;
  background: #4f5478;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  letter-spacing: 1px;
}
.readyBtn {
  background: linear-gradient(
    110deg,
    rgba(55, 89, 238, 0.64) 11%,
    rgba(30, 157, 244, 0.37) 89%
  ) !important;
}
</style>
