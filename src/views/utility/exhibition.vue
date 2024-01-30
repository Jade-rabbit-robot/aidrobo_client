<template>
  <div class="screen-container layout-gutter">
    <ShowMap
      :initData="initData"
      :notShowActive="true"
      style="margin-right: 30px"
    />
    <MonitoringArea />
  </div>
</template>

<script>
import ShowMap from "@/components/map/pointMap";
import fullscreenLoading from "@/components/fullscreenLoading.js";
import MonitoringArea from "@/components/monitoringArea";
import { exit } from "../../services/http";

export default {
  components: {
    ShowMap,
    MonitoringArea,
  },
  data() {
    return {
      initData: false,
      loading: null,
    };
  },
  mounted() {
    this.loading = fullscreenLoading();
    this.getPoint();
  },
  beforeDestroy() {
    this.loading.close();
    exit();
  },
  methods: {
    getPoint() {
      const msg2 = new ROSLIB.ServiceRequest({
        map_id: this.$store.state.nowMap.id,
        data_type: "waypoint",
      });
      getMapLinkedDataList.callService(
        msg2,
        (result) => {
          if (result.success) {
            let msg = [];
            try {
              msg = JSON.parse(result.message);
              this.initData = true;
              this.$store.state.patrol_arr = JSON.parse(msg[0].point_list);
            } catch (error) {
              this.$message("获取巡逻点失败");
            }
            console.log(this.$store.state.patrol_arr);
          } else {
            this.$message("获取巡逻点失败");
          }
          this.loading.close();
        },
        (result) => {
          this.loading.close();
          console.log("[  getPoint ERR]-61", result);
        },
      );
    },
  },
};
</script>

<style lang="less" scoped>
.screen-container {
  box-sizing: border-box;
  display: flex;
  color: #fff;
  width: 100%;
  height: 100%;
  position: relative;
  padding-left: 30px;
  padding-right: 30px;
}

.map-wrapper {
  position: relative;
  top: 0;
  height: 100%;
  max-height: 1010px;
  flex: 1;
  //background: transparent;
  //border-radius: 5px;
  background: #526cad;
  //overflow: hidden;
}
.right-info {
  margin-left: 20px;
  width: 382px;
  height: 100%;
  max-height: 1010px;
  display: flex;
  flex-direction: column;
}
.video,
.extra {
  flex: 1;
  background: linear-gradient(
    137deg,
    rgba(71, 84, 141, 0.64) 19%,
    rgba(71, 66, 124, 0.52) 94%
  );
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
}
.video {
  margin-bottom: 20px;
}
.extra {
  height: 369px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
