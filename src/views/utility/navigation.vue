<template>
  <div class="newMapBox">
    <ShowMap
      :showPlan="true"
      :showScan="true"
      :navigationTargetMode="true"
      @navigation-target-selected="onNavigationTargetSelected"
    />
    <div class="right point">
      <div class="titleBox">
        <div class="pageTitle">
          <img src="@/assets/img/editMap/point.svg" />
          <span>定点导航</span>
        </div>
        <div class="card">
          <p class="cardTitle">当前机器人位置</p>
          <p class="cardValue">({{ robotPoint.x.toFixed(2) }}, {{ robotPoint.y.toFixed(2) }})</p>
        </div>
        <div class="card instruction">
          <p class="cardTitle">操作说明</p>
          <p class="cardText">在地图上点击目标位置后，沿目标朝向滑动一小段距离，系统会立即发送单个导航目标点。</p>
        </div>
        <div class="card" v-if="targetPose">
          <p class="cardTitle">最近一次导航目标</p>
          <p class="cardValue">({{ targetPose.x.toFixed(2) }}, {{ targetPose.y.toFixed(2) }})</p>
          <p class="cardSub">角度 {{ targetYaw.toFixed(1) }}°</p>
        </div>
      </div>
      <div class="goPoint" @click="onExit">退出导航</div>
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
    }
  },
  computed: {
    ...mapState([
      "robotPoint",
      'robotTaskStatus'
    ]),
    targetYaw() {
      if (!this.targetPose || !this.targetPose.orientation) {
        return 0;
      }
      return quaternionToYawDeg(this.targetPose.orientation);
    }
  },
  mounted () {
    this.$store.state.hasSave = false;
    this.$store.state.tool = 'navigation-target';
    this.$store.state.patrol_arr = [];
    this.$store.state.patrol_arr_area = [];
    const type = new ROSLIB.ServiceRequest({
      action: 'patrol'
    });
    robotMode.callService(type, (result) => {
      if (result.message!=='ok') {
        this.$message('状态切换失败');
      }
      console.log('[ robotMode OK]-61', result)
    }, (result) => {
      this.$message('状态切换失败');
      console.log('[ robotMode ERR]-61', result)
    });
  },
  beforeDestroy() {
    if (this.$store.state.tool === 'navigation-target') {
      this.$store.state.tool = '';
    }
  },
  methods: {
    publishNavigation(point) {
      const msg = new ROSLIB.Message({
        header: {
          stamp: {sec: 0, nanosec: 0},
          frame_id: "map"
        },
        pose: {
          position: {
            x: point.x,
            y: point.y,
            z: point.z || 0.0
          },
          orientation: point.orientation || {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
        }
      });
      StartNavigation.publish(msg);
      this.$message('已发送导航目标点');
    },
    onNavigationTargetSelected(point) {
      this.targetPose = point;
      if (this.robotTaskStatus.working || this.robotTaskStatus.suspend) {
        const type = new ROSLIB.ServiceRequest({
          cmd: 'cancel'
        });
        patrolState.callService(type, (res) => {
          console.log('[ patrol_control cancel ok]-61', res)
          this.publishNavigation(point)
        }, (res) => {
          console.log('[ patrol_control cancel ERR]-61', res)
        });
      } else {
        this.publishNavigation(point)
      }
    },
    onExit() {
      if (this.robotTaskStatus.navigate && (this.robotTaskStatus.working || this.robotTaskStatus.suspend)) {
        const type = new ROSLIB.ServiceRequest({
          cmd: 'cancel'
        });
        patrolState.callService(type, (res) => {
          console.log('[ patrol_control cancel ok]-61', res)
        }, (res) => {
          console.log('[ patrol_control cancel ERR]-61', res)
        });
      }
      this.$store.state.tool = '';
      this.$store.state.patrol_arr = [];
      this.$store.state.patrol_arr_area = [];
      this.$router.push({ name: 'utility' })
    }
  }
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
