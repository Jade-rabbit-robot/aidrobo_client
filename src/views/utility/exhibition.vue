<template>
  <div class="exhibition-container layout-gutter">
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
    this.loading && this.loading.close();
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
.exhibition-container {
  box-sizing: border-box;
  display: flex;
  color: #fff;
  width: 100%;
  height: 100%;
  position: relative;
  padding-left: 20px;
}
</style>
