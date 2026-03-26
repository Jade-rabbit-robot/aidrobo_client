<template>
  <div class="main">
    <div class="box">
      <div>
        <div class="title">连接设置</div>
        <div>
          <div class="item rosItem">
            <span>ROS WebSocket</span>
            <div class="inputWrap">
              <el-input
                v-model.trim="rosURLInput"
                placeholder="ws://192.168.1.120:9090"
              ></el-input>
            </div>
          </div>
          <div class="itemTip">地址会保存到当前设备，下次启动继续使用。</div>
          <div class="itemTip">支持输入完整地址，或直接输入 IP:端口。</div>
          <div class="actionRow">
            <el-button type="primary" @click="saveRosURL">保存</el-button>
            <el-button type="primary" @click="saveAndReconnect">保存并重连</el-button>
            <el-button @click="resetToDefault">恢复默认</el-button>
          </div>
          <div class="currentUrl">当前保存地址：{{ currentRosURL }}</div>
        </div>
      </div>
      <div v-for="(item, i) in box" :key="i">
        <div class="title">{{ item.title }}</div>
        <!-- 基础设置 -->
        <div v-if="item.title === '表情锁屏'">
          <div class="item">
            <span>开启/关闭</span>
            <el-switch v-model="value" active-color="#05E29E" inactive-color="#1A1931" active-text="开" inactive-text="关">
            </el-switch>
          </div>
        </div>
        <div v-else>
          <div v-for="(v,k) in item.info" :key="k" class="item">{{ k }}:{{ v}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      value: true,
      rosURLInput: '',
      currentRosURL: '',
      box: [
        // {
        //   title: "表情锁屏"
        // },
        // {
        //   title: "设备信息",
        //   info: {
        //     '机器编号(SN)': "AIDR-T2301110001",
        //     '软件版本': "0.5.5.1.d",
        //   }
        // },
        {
          title: "主要硬件信息",
          info: {
            '主控': "AIBOX Powerby Aidlux",
            '辅控': "艺科 YKRC-2",
            '激光雷达': "蓝海 LDS-50C-C20E",
            '双目模组': "奥比中光 DaBai",
          },

        },

      ]
    }
  },
  created () {
    this.loadRosURL()
  },
  methods: {
    getRosConfig () {
      return window.AIDROBO_ROS_CONFIG || {}
    },
    loadRosURL () {
      const rosConfig = this.getRosConfig()
      const currentURL = rosConfig.getRosURL ? rosConfig.getRosURL() : ''
      this.rosURLInput = currentURL
      this.currentRosURL = currentURL
    },
    validateRosURL () {
      const rosConfig = this.getRosConfig()
      const normalizedURL = rosConfig.normalizeRosURL
        ? rosConfig.normalizeRosURL(this.rosURLInput)
        : (this.rosURLInput || '').trim()
      if (!normalizedURL || !/^wss?:\/\/.+/i.test(normalizedURL)) {
        this.$message.error('请输入正确的 ROS WebSocket 地址')
        return ''
      }
      return normalizedURL
    },
    saveRosURL () {
      const nextURL = this.validateRosURL()
      if (!nextURL) {
        return
      }
      const rosConfig = this.getRosConfig()
      this.currentRosURL = rosConfig.setRosURL ? rosConfig.setRosURL(nextURL) : nextURL
      this.rosURLInput = this.currentRosURL
      this.$message.success('ROS 地址已保存，请点击“保存并重连”生效')
    },
    saveAndReconnect () {
      const nextURL = this.validateRosURL()
      if (!nextURL) {
        return
      }
      const rosConfig = this.getRosConfig()
      this.currentRosURL = rosConfig.reconnectRos ? rosConfig.reconnectRos(nextURL) : nextURL
      this.rosURLInput = this.currentRosURL
      this.$message.success('ROS 地址已保存，正在重连')
    },
    resetToDefault () {
      const rosConfig = this.getRosConfig()
      this.currentRosURL = rosConfig.resetRosURL ? rosConfig.resetRosURL() : ''
      this.rosURLInput = this.currentRosURL
      this.$message.success('已恢复默认 ROS 地址')
    }
  }
}
</script>

<style lang="less" scoped>
.main {
  overflow: auto;
  height: 100%;
}

.box {
  display: flex;
  flex-wrap: wrap;
  color: #fff;

  &>div {
    padding: 40px 70px;
    width: 670px;
    min-height: 220px;
    border-radius: 20px;
    background: linear-gradient(116deg, rgba(71, 84, 141, 0.64) 12%, rgba(71, 66, 124, 0.52) 90%);
    backdrop-filter: blur(10.88px);
    box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
    margin-top: 30px;
    margin-bottom: 30px;
    margin-left: 100px;

    .title {
      font-size: 40px;
      font-weight: bold;
    }

    &>div {
      margin-top: 40px;

      .item {
        margin-top: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 730px;

        .el-switch {
          transform: scale(2.5);
          margin-right: 30px;
        }
      }

      .itemTip {
        font-size: 28px;
        color: #C1C1C1;
      }

      .actionRow {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-top: 30px;
      }

      .currentUrl {
        margin-top: 30px;
        font-size: 28px;
        color: #C1C1C1;
        line-height: 1.5;
        word-break: break-all;
      }

      .inputWrap {
        width: 430px;
      }
    }
  }
}
</style>
<style  scoped>
.item>>>.el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
}

/*打开时文字位置设置*/
.item>>>.el-switch__label--right {
  z-index: 1;
  right: 18px;
}

/*关闭时文字位置设置*/
.item>>>.el-switch__label--left {
  z-index: 1;
  left: 18px;
}

/*显示文字*/
.item>>>.el-switch__label.is-active {
  display: block;
}

.timeInp>>>.el-input {
  width: 140px;
  font-size: 35px;
}

.filesInp>>>.el-input {
  width: 300px;
  font-size: 35px;
}

.item>>>.el-input__inner {
  height: 70px;
  border-radius: 10px;

}

.actionRow>>>.el-button {
  min-width: 170px;
  height: 70px;
  font-size: 28px;
  border-radius: 35px;
}
</style>
