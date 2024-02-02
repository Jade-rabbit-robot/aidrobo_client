<template>
  <div class="soc-stat">
    <div class="soc-stat-content">
      <!-- cpu core cpu7 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu7"
        class="core-cpu-stat"
        :contentStyle="`width: 100px; height: ${
          (133 / 10) * socStats.cpu_use.cpu7
        }px;`"
        itemStyle="height: 10px;border-radius: 2px; margin-bottom: 3px;"
      />
      <!-- cpu core cpu6 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu6"
        class="core-cpu6-stat"
        :contentStyle="`width: 46px; height: ${
          (60 / 10) * socStats.cpu_use.cpu6
        }px;`"
        itemStyle="height: 4px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu5 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu5"
        class="core-cpu5-stat"
        :contentStyle="`width: 46px; height: ${
          (60 / 10) * socStats.cpu_use.cpu5
        }px;`"
        itemStyle="height: 4px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu4 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu4"
        class="core-cpu4-stat"
        :contentStyle="`width: 46px; height: ${
          (60 / 10) * socStats.cpu_use.cpu4
        }px;`"
        itemStyle="height: 4px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu3 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu3"
        class="core-cpu3-stat"
        :contentStyle="`width: 30px; height: ${
          (60 / 10) * socStats.cpu_use.cpu3
        }px;`"
        itemStyle="height: 4px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu2 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu2"
        class="core-cpu2-stat"
        :contentStyle="`width: 30px; height: ${
          (60 / 10) * socStats.cpu_use.cpu2
        }px;`"
        itemStyle="height: 4px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu1 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu1"
        class="core-cpu1-stat"
        :contentStyle="`width: 30px; height: ${
          (60 / 10) * socStats.cpu_use.cpu1
        }px;`"
        itemStyle="height: 4px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu0 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu0"
        class="core-cpu0-stat"
        :contentStyle="`width: 30px; height: ${
          (60 / 10) * socStats.cpu_use.cpu0
        }px;`"
        itemStyle="height: 4px;border-radius: 2px; margin-bottom: 2px;"
      />

      <!-- gpu_use -->
      <SocProgress
        :percent="socStats.gpu_use"
        class="gpu-stat-container"
        :contentStyle="`width: 100px; height: ${
          (130 / 10) * socStats.gpu_use
        }px;`"
        itemStyle="height: 10px;border-radius: 2px; margin-bottom: 3px;"
      />

      <!-- dsp use -->
      <SocProgress
        :percent="socStats.dsp_use"
        class="dsp-stat-container"
        :contentStyle="`width: 138px; height: ${
          (130 / 10) * socStats.dsp_use
        }px;`"
        itemStyle="height: 10px;border-radius: 2px; margin-bottom: 3px;"
      />
    </div>
  </div>
</template>

<script>
import SocProgress from "./SocProgress.vue";

export default {
  name: "SocStat",
  components: {
    SocProgress,
  },
  props: {
    socStats: Object,
  },
  data() {
    return {};
  },
};
</script>

<style lang="less" scoped>
.soc-stat {
  width: 90%;
}
.soc-stat-content {
  position: relative;
  width: 360px;
  height: 340px;
  background: center / 100% 100% no-repeat url("../../assets/img/soc.png");
}

.core-cpu-stat {
  position: absolute;
  left: 30px;
  bottom: 178px
}
.core-cpu6-stat,
.core-cpu5-stat,
.core-cpu4-stat {
  position: absolute;
  bottom: 250px;
}

.core-cpu6-stat {
  left: 165px;
}

.core-cpu5-stat {
  right: 82px;
}

.core-cpu4-stat {
  right: 14px;
}

.core-cpu3-stat,
.core-cpu2-stat,
.core-cpu1-stat,
.core-cpu0-stat {
  position: absolute;
  bottom: 178px;
}

.core-cpu3-stat {
  left: 165px;
}

.core-cpu2-stat {
  left: 216px;
}

.core-cpu1-stat {
  right: 64px;
}

.core-cpu0-stat {
  right: 14px;
}

.gpu-stat-container {
  position: absolute;
  left: 30px;
  bottom: 10px;
}

.dsp-stat-container {
  position: absolute;
  right: 35px;
  bottom: 10px;
}
</style>
