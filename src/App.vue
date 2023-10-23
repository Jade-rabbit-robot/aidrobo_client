<template>
  <div id="app" ref="app">
    <headArea />
    <div class="showBox">
      <router-view></router-view>
    </div>
    <!--
    <toolArea @touchmove.prevent></toolArea>
    <showArea @touchmove.prevent></showArea> -->
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import toolArea from "./components/toolArea";
import headArea from "./components/headArea";
import showArea from "./components/showArea";
export default {
  data () {
    return {
      time_num: 0,
      map_state_num: "", //控制地图状态
      screen_w:
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth,
      screen_h:
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
    };
  },
  computed: {
    ...mapState(["loading_build", "loading_dev"])
  },
  mounted () {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.moveEnd);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.moveEnd);
  },
  methods: {
    onKeyDown(e) {
      const keyCodes = {
        38: 'f',//上
        40: 'b',//下
        37: 'l',//左
        39: 'r',//右
        80: 'p',// P
      }
      const type = keyCodes[e.keyCode];
      type && this.moveFun(type);
    },
    moveFun(type) {
      console.log("[ type ]-66", type);
      if (!type) {
        return false;
      }
      const linear = {
        x: 0,
        y: 0.0,
        z: 0.0,
      };
      const angular = {
        x: 0,
        y: 0.0,
        z: 0.0,
      };
      if (type == "f") {
        // 上
        linear.x = 0.32;
      } else if (type == "l") {
        // 左
        angular.z = 0.65;
      } else if (type == "b") {
        // 下
        linear.x = -0.32;
      } else if (type == "r") {
        // →
        angular.z = -0.65;
      } else if (type == "p") {
        linear.x = 0;
        angular.z = 0;
      }
      var run_msg = new ROSLIB.Message({ linear, angular });
      console.log("[ run_msg ]-86", run_msg);
      controlRobot.publish(run_msg);
    },
    moveEnd() {
      const linear = {
        x: 0,
        y: 0.0,
        z: 0.0,
      };
      const angular = {
        x: 0,
        y: 0.0,
        z: 0.0,
      };
      var run_msg = new ROSLIB.Message({ linear, angular });
      console.log("[ run_msg ]-86-end", run_msg);
      controlRobot.publish(run_msg);
    },
  },
  components: {
    headArea,
    toolArea,
    showArea
  }
};
</script>

<style>
#app {
  display: flex;
  display: -webkit-flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  opacity: 1;
  background: linear-gradient(302deg, #131c5b 0%, #3a5bb0 100%);
  font-size: 35px;
  font-weight: normal;
  line-height: 31px;
  letter-spacing: 0em;
  color: #fff;
}

.showBox {
  margin-top: 120px;
  width: 100%;
  height: 1080px;
}

.el-message-box {
  border-radius: 20px;
  opacity: 1;
  background: linear-gradient(122deg, #47548c 0%, #324387 100%);
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgb(1 29 90 / 72%);
  width: 800px;
  height: 500px;
  border: 0;
  font-size: 35px;
}

.el-message-box__btns {
  position: absolute;
  bottom: 40px;
  left: 50%;
  margin-left: -300px;
}

.el-message-box__btns button {
  width: 280px;
  height: 80px;
  border-radius: 60px;
  background: #d94040;
  border: 0;
  font-size: 35px;
  color: #fff;
}

.el-message-box__btns .el-button--primary {
  background: #7F86B9;
}

.el-message-box__title {
  color: #fff;
  font-size: 50px;
  margin-bottom: 30px;
}

.el-message-box__headerbtn {
  font-size: 50px;
}

.el-message-box__message {
  color: #fff;
  font-size: 35px;
  margin-top: 50px;
}

.el-message-box__message div {
    margin-bottom: 20px;

  }
.el-message {
  padding: 30px 60px;
  border-radius: 20px;
  background: #212A53;
  border: 5px solid #212A53;
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
  color: #fff;
}
  .el-message .el-icon-info,
  .el-message--info .el-message__content {
    font-size: 50px;
  color: #fff;

  }
</style>
