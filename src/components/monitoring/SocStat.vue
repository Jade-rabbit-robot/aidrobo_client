<template>
  <div class="soc-stat">
    <div class="soc-stat-content">
      <!-- cpu core cpu7 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu7"
        class="core-cpu-stat"
        :contentStyle="`width: 116px; height: ${
          (140 / 10) * socStats.cpu_use.cpu7
        }px;`"
        itemStyle="height: 11px;border-radius: 2px; margin-bottom: 3px;"
      />
      <!-- cpu core cpu6 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu6"
        class="core-cpu6-stat"
        :contentStyle="`width: 51px; height: ${
          (80 / 10) * socStats.cpu_use.cpu6
        }px;`"
        itemStyle="height: 6px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu5 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu5"
        class="core-cpu5-stat"
        :contentStyle="`width: 51px; height: ${
          (80 / 10) * socStats.cpu_use.cpu5
        }px;`"
        itemStyle="height: 6px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu4 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu4"
        class="core-cpu4-stat"
        :contentStyle="`width: 51px; height: ${
          (80 / 10) * socStats.cpu_use.cpu4
        }px;`"
        itemStyle="height: 6px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu3 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu3"
        class="core-cpu3-stat"
        :contentStyle="`width: 36px; height: ${
          (70 / 10) * socStats.cpu_use.cpu3
        }px;`"
        itemStyle="height: 5px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu2 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu2"
        class="core-cpu2-stat"
        :contentStyle="`width: 36px; height: ${
          (70 / 10) * socStats.cpu_use.cpu2
        }px;`"
        itemStyle="height: 5px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu1 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu1"
        class="core-cpu1-stat"
        :contentStyle="`width: 36px; height: ${
          (70 / 10) * socStats.cpu_use.cpu1
        }px;`"
        itemStyle="height: 5px;border-radius: 2px; margin-bottom: 2px;"
      />
      <!-- cpu core cpu0 -->
      <SocProgress
        :percent="socStats.cpu_use.cpu0"
        class="core-cpu0-stat"
        :contentStyle="`width: 36px; height: ${
          (70 / 10) * socStats.cpu_use.cpu0
        }px;`"
        itemStyle="height: 5px;border-radius: 2px; margin-bottom: 2px;"
      />

      <!-- gpu_use -->
      <SocProgress
        :percent="socStats.gpu_use"
        class="gpu-stat-container"
        :contentStyle="`width: 116px; height: ${
          (160 / 10) * socStats.gpu_use
        }px;`"
        itemStyle="height: 13px;border-radius: 2px; margin-bottom: 3px;"
      />

      <!-- dsp use -->
      <SocProgress
        :percent="socStats.dsp_use"
        class="dsp-stat-container"
        :contentStyle="`width: 138px; height: ${
          (160 / 10) * socStats.dsp_use
        }px;`"
        itemStyle="height: 13px;border-radius: 2px; margin-bottom: 3px;"
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
.soc-stat-content {
  position: relative;
  width: 409px;
  height: 438px;
  background: url("../../assets/img/soc.png") center center no-repeat;
  background-size: 100% 100%;
}

.core-cpu-stat {
  position: absolute;
  left: 32px;
  bottom: 240px;
}
.core-cpu6-stat,
.core-cpu5-stat,
.core-cpu4-stat {
  position: absolute;
  bottom: 320px;
}

.core-cpu6-stat {
  left: 188px;
}

.core-cpu5-stat {
  right: 94px;
}

.core-cpu4-stat {
  right: 17px;
}

.core-cpu3-stat,
.core-cpu2-stat,
.core-cpu1-stat,
.core-cpu0-stat {
  position: absolute;
  bottom: 234px;
}

.core-cpu3-stat {
  left: 185px;
}

.core-cpu2-stat {
  left: 243px;
}

.core-cpu1-stat {
  right: 72px;
}

.core-cpu0-stat {
  right: 15px;
}

.gpu-stat-container {
  position: absolute;
  left: 31px;
  bottom: 17px;
}

.dsp-stat-container {
  position: absolute;
  right: 50px;
  bottom: 17px;
}
</style>
