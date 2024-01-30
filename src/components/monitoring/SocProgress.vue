<template>
  <div class="container" :style="contentStyle">
    <div class="soc-progress">
      <div
        v-for="item in 10"
        :key="item"
        class="soc-progress-item"
        :style="itemStyle"
      ></div>
      <!-- <div
        v-for="item in (10 - updatePercent)"
        :key="'empty' + item"
        class="soc-empty-progress-item"
        :style="itemStyle"></div> -->
    </div>
    <!-- <div class="soc-mask" :style="contentStyle"></div> -->
  </div>
</template>

<script>
export default {
  name: "SocProgress",
  props: {
    percent: () => Number | String,
    contentStyle: String,
    itemStyle: String,
  },
  data() {
    return {
      updatePercent: 0,
      updateInterval: null,
    };
  },
  watch: {
    percent(newVal, oldVal) {
      if (newVal > oldVal) {
        for (let i = oldVal; i <= newVal; i++) {
          this.updateInterval = setInterval(() => {
            this.updatePercent = i;
            // console.log('up: ', i)
          }, 1000 / (newVal - oldVal));
        }
      } else if (newVal < oldVal) {
        for (let i = newVal; i <= oldVal; i++) {
          this.updateInterval = setInterval(() => {
            this.updatePercent = i;
            // console.log('down: ', i)
          }, 1000 / (oldVal - newVal));
        }
      } else {
        this.updatePercent = newVal;
      }

      // console.log('new:',newVal, ' -- old:', oldVal)
    },
  },
  beforeDestroy() {
    clearInterval(this.updateInterval);
  },
};
</script>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column-reverse;
  overflow: hidden;
  transition: height 0.25s ease 0.25s;
}
.soc-progress {
  position: absolute;
  width: 100%;
  bottom: 0;
  // overflow: hidden;
  // transition: height 0.35s linear;
  // transform: rotate(180deg);
}

.soc-progress-item {
  width: inherit;
  transition: all 1s linear;
}

.soc-progress-item:nth-child(10) {
  background: #009be1;
}
.soc-progress-item:nth-child(9) {
  background: #13bdff;
}
.soc-progress-item:nth-child(8) {
  background: #3dd0ff;
}
.soc-progress-item:nth-child(7) {
  background: #51e0ff;
}
.soc-progress-item:nth-child(6) {
  background: #62ffbe;
}
.soc-progress-item:nth-child(5) {
  background: #f3ff3a;
}
.soc-progress-item:nth-child(4) {
  background: #ffb331;
}
.soc-progress-item:nth-child(3) {
  background: #ff8d31;
}
.soc-progress-item:nth-child(2) {
  background: #ff6031;
}
.soc-progress-item:nth-child(1) {
  background: #ff3b3b;
  margin-top: 3px;
}

// .soc-progress-item:nth-child(10) {
//   background: #FFF9C9;
// }
// .soc-progress-item:nth-child(9) {
//   background: #FEF5A8;
// }
// .soc-progress-item:nth-child(8) {
//   background: #FFF27A;
// }
// .soc-progress-item:nth-child(7) {
//   background: #FEE746;
// }
// .soc-progress-item:nth-child(6) {
//   background: #FCD72E;
// }
// .soc-progress-item:nth-child(5) {
//   background: #FFB529;
// }
// .soc-progress-item:nth-child(4) {
//   background: #FF942E;
// }
// .soc-progress-item:nth-child(3) {
//   background: #FF7832;
// }
// .soc-progress-item:nth-child(2) {
//   background: #FF5B35;
// }
// .soc-progress-item:nth-child(1) {
//   background: #FF3F36;
//   margin-top: 3px;
// }

// .soc-progress-item:nth-child(10) {
//   background: #0D3651;
// }
// .soc-progress-item:nth-child(9) {
//   background: #0E6288;
// }
// .soc-progress-item:nth-child(8) {
//   background: #1490C0;
// }
// .soc-progress-item:nth-child(7) {
//   background: #20B9EA;
// }
// .soc-progress-item:nth-child(6) {
//   background: #3FC6E3;
// }
// .soc-progress-item:nth-child(5) {
//   background: #75C3A3;
// }
// .soc-progress-item:nth-child(4) {
//   background: #AAB056;
// }
// .soc-progress-item:nth-child(3) {
//   background: #D29428;
// }
// .soc-progress-item:nth-child(2) {
//   background: #D27428;
// }
// .soc-progress-item:nth-child(1) {
//   background: #D25028;
//   margin-top: 3px;
// }
</style>
