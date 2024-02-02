<template>
  <div class="homeBox">
    <div class="item">
      <router-link to="/utility" class="link">
        <img src="@/assets/img/home1.svg" />
        <p>应用功能</p>
      </router-link>
    </div>
    <div class="item">
      <router-link to="/map" class="link">
        <img src="@/assets/img/home2.svg" />
        <p>地图管理</p>
      </router-link>
    </div>
    <div class="text">
      {{ text }}
    </div>
    <div class="logo">
      <img src="@/assets/img/logo.png" width="500px" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: "AidSimbot 2.0 / AidRos 0.4",
      showTc: true,
    };
  },
  mounted() {
    this.$store.state.tool = "";
    // 全局订阅机器人位置
    robotPosition.subscribe((message) => {
      if (message.pose) {
        const position = message.pose.position;
        this.$store.state.robotPoint = { x: position.x, y: position.y };
      }
    });
    // 获取当前地图id
    getCurrentMapId.callService(
      null,
      (result) => {
        this.$store.state.nowMap = { id: result.map_id, name: result.map_name };

        console.log("[  finishMap OK]-61", result);
      },
      (result) => {
        console.log("[  finishMap ERR]-61", result);
      },
    );
    // 获取ip
    const msg = new ROSLIB.ServiceRequest();
    GetStrings.callService(
      msg,
      (result) => {
        this.$store.state.IP = result.result;
        console.log("[  get_ip OK]-61", result);
      },
      (result) => {
        console.log("[  get_ip ERR]-61", result);
      },
    );
    // 电量信息
    BatteryState.subscribe((result) => {
      this.$store.state.percentage = result.percentage
        ? Math.ceil(result.percentage * 100)
        : 100;
    });
  },
};
</script>

<style scoped>
.homeBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  height: calc(100% - 120px);
  padding: 0 127px;
  box-sizing: border-box;
}

.item {
  //height: 100%;
  align-self: stretch;
  display: flex;
  align-items: center;
  padding-top: 20px;
  flex: 1;
  margin-left: 65px;
  &:first-of-type {
    margin-left: 0;
  }
}

.link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: #fff;
  top: 234px;
  width: 100%;
  height: 100%;
  max-height: 700px;
  min-height: 555px;
  border-radius: 20px;
  opacity: 1;
  background: linear-gradient(
    142deg,
    rgba(71, 84, 141, 0.64) 20%,
    rgba(53, 81, 119, 0.15) 94%,
    rgba(53, 92, 119, 0.14) 95%
  );
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
}

.text {
  font-size: 44px;
  position: absolute;
  bottom: 40px;
  left: 74px;
}

.logo {
  position: absolute;
  bottom: 30px;
  right: 30px;
}
</style>
