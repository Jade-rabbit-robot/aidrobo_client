<template>
  <div class="newMapBox">
    <ShowMap
      :showScan="true"
      :relocationMode="true"
      @relocation-selected="onRelocationSelected"
    />
    <div class="right point">
      <div class="titleBox">
        <div class="pageTitle">
          <img src="@/assets/img/editMap/point.svg" />
          <span>重定位</span>
        </div>
        <div class="card">
          <p class="cardTitle">当前机器人位置</p>
          <p class="cardValue">({{ robotPoint.x.toFixed(2) }}, {{ robotPoint.y.toFixed(2) }})</p>
        </div>
        <div class="card instruction">
          <p class="cardTitle">操作说明</p>
          <p class="cardText">在地图上点击目标位置后，沿机器人朝向滑动一小段距离，系统会立即发送重定位位姿。</p>
        </div>
        <div class="card" v-if="targetPose">
          <p class="cardTitle">最近一次重定位</p>
          <p class="cardValue">({{ targetPose.x.toFixed(2) }}, {{ targetPose.y.toFixed(2) }})</p>
          <p class="cardSub">角度 {{ targetYaw.toFixed(1) }}°</p>
        </div>
      </div>
      <div class="goPoint" @click="onExit">退出重定位</div>
    </div>
  </div>
</template>

<script>
import ShowMap from "@/components/map/pointMap";
import { mapState } from "vuex";
import { quaternionToYawDeg } from "@/assets/common";

export default {
  components: {
    ShowMap
  },
  data () {
    return {
      targetPose: null,
    };
  },
  computed: {
    ...mapState(["robotPoint"]),
    targetYaw() {
      if (!this.targetPose || !this.targetPose.orientation) {
        return 0;
      }
      return quaternionToYawDeg(this.targetPose.orientation);
    }
  },
  mounted() {
    this.$store.state.hasSave = false;
    this.$store.state.actionStatus = "localization";
    this.$store.state.tool = "relocation";
    this.$store.state.patrol_arr = [];
    this.$store.state.patrol_arr_area = [];
    this.enterLocalizationMode();
  },
  beforeDestroy() {
    if (this.$store.state.tool === "relocation") {
      this.$store.state.tool = "";
    }
  },
  methods: {
    enterLocalizationMode() {
      const modeMsg = new ROSLIB.ServiceRequest({
        action: "localization"
      });
      robotMode.callService(
        modeMsg,
        result => {
          console.log("[ robotMode OK]-61", result);
          if (result.message !== "ok") {
            this.$message("切换重定位模式失败");
          }
        },
        result => {
          console.log("[ robotMode ERR]-61", result);
          this.$message("切换重定位模式失败");
        }
      );
    },
    onRelocationSelected(point) {
      this.targetPose = point;
      const poseMsg = new ROSLIB.Message({
        header: {
          stamp: {
            sec: 0,
            nanosec: 0
          },
          frame_id: "map"
        },
        pose: {
          pose: {
            position: {
              x: point.x,
              y: point.y,
              z: point.z || 0
            },
            orientation: point.orientation || { x: 0, y: 0, z: 0, w: 1 }
          },
          covariance: [
            0.25, 0, 0, 0, 0, 0,
            0, 0.25, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0.06853891945200942
          ]
        }
      });
      InitialPose.publish(poseMsg);
      this.$message("已发送重定位位姿");
    },
    onExit() {
      this.$store.state.tool = "";
      this.$store.state.patrol_arr = [];
      this.$store.state.patrol_arr_area = [];
      this.$router.push({ name: "utility" });
    }
  },
}
</script>

<style lang="less" scoped>
.newMapBox {
  display: flex;
  color: #fff;
  width: 100%;
  height: 100%;
  position: relative;
}

.right {
  width: 434px;
  height: calc(100% - 70px);
  background-color: #ccc;
  border-radius: 5px;
  background: linear-gradient(155deg, rgba(71, 84, 141, 0.64) 24%, rgba(71, 66, 124, 0.52) 98%);
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 30px;
  margin-top: 30px;
  overflow: hidden;
}

.titleBox {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px 0;
  gap: 18px;
  overflow-y: auto;
  flex: 1;
}

.pageTitle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  font-size: 34px;
  line-height: 1.2;
  font-weight: 600;
  margin-bottom: 4px;

  img {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
  }
}

.card {
  width: 100%;
  max-width: 338px;
  min-height: 100px;
  border-radius: 10px;
  opacity: 1;
  background: #2f3758;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px 20px;
  line-height: 1.5;
  text-align: center;
  box-sizing: border-box;
}

.cardTitle {
  font-size: 24px;
  line-height: 1.3;
  margin-bottom: 10px;
}

.cardValue {
  font-size: 24px;
  line-height: 1.4;
  word-break: break-all;
}

.cardText {
  font-size: 20px;
  line-height: 1.6;
  text-align: left;
}

.cardSub {
  font-size: 20px;
  line-height: 1.4;
  opacity: 0.8;
}

.instruction {
  align-items: stretch;
}

.goPoint {
  width: 300px;
  height: 120px;
  border-radius: 10px;
  background: #4F5478;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  margin: 24px 0 40px;
  flex-shrink: 0;
}
</style>
