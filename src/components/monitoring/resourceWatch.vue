<template>
  <div class="content-wrapper">
    <div class="resource-chart">
      <SocStat :socStats="stats" />
    </div>
  </div>
</template>

<script>
import SocStat from "./SocStat.vue";
export default {
  name: "Send11ResourceWatch",

  components: {
    SocStat,
  },

  data() {
    return {
      stats: {
        cpu_use: {
          cpu0: 0,
          cpu1: 0,
          cpu2: 0,
          cpu3: 0,
          cpu4: 0,
          cpu5: 0,
          cpu6: 0,
          cpu7: 0,
        },
        gpu_use: 0,
        dsp_use: 0,
      },
    };
  },

  mounted() {
    this.$socket.open();
  },

  methods: {},

  sockets: {
    soc_info(data) {
      if (data) {
        console.log(data);
        if (!this.$store.state.ready) this.$store.state.ready = true;
        this.stats = {
          ...data,
        };
      }
    },
    connecting() {
      console.log("connecting");
    },
    disconnect() {
      alert("socket disconnect");
    },
    connect_error() {
      console.log("socket connect error");
    },
    connect() {
      console.log("socket connected");
    },
  },

  beforeDestroy() {
    this.$socket.close();
  },
};
</script>

<style lang="less" scoped>
.content-wrapper {
  box-shadow: 0px 0px 10px #1a316d;
  border-radius: 4px;
  margin-top: 20px;
  min-height: 400px;
  display: flex;
  .resource-chart {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .resource-value {
    margin-left: 15px;
    width: 90px;
    .value-item {
      display: flex;
      margin: 10px 0 20px;
      .value-item-name {
        color: #05e8c8;
        width: 40px;
        text-align: left;
        &:after {
          content: ":";
          color: #fff;
        }
      }
      .value-item-percent {
        color: #fff;
        text-align: right;
        flex: 1;
      }
    }
  }
}
</style>
