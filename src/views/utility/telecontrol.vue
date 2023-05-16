<template>
  <div class="main">
    <div>
      <img src="@/assets/img/uti/yaokong.png" />
    </div>
    <div v-if="btnText === '开启遥控模式'">
      机器人与手机处在同一网络下，点击下方按钮开启遥控后，在手机端遥控App内输入所示的IP地址
    </div>
    <div v-else>
      IP：<span>{{ ip }}</span>
    </div>
    <div class="btn" @click="btnFun">
      {{ btnText }}
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      btnText: '开启遥控模式',
      ip: '192.168.222.167',
    }
  },
  mounted () {

  },
  methods: {
    btnFun () {
      if (this.btnText === '开启遥控模式') {
        this.btnText = '关闭遥控模式'
      } else {
        this.$router.push({
          path: "/utility"
        });
      }
    }
  }
}
</script>

<style lang="less" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  &>div {
    margin-top: 100px;
  }
}

.btn {
  width: 380px;
  height: 120px;
  border-radius: 10px;
  opacity: 1;
  background: linear-gradient(106deg, #596AB5 10%, rgba(66, 82, 146, 0.53) 89%);
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
