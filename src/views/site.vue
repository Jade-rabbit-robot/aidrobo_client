<template>
  <div class="main">
    <div class="box">
      <div v-for="(item, i) in box" :key="i">
        <div class="title">{{ item.title }}</div>
        <!-- 基础设置 -->
        <div v-if="i === 0">
          <div class="item">
            <span>自动调整亮度</span>
            <el-switch v-model="value" active-color="#05E29E" inactive-color="#1A1931" active-text="开" inactive-text="关">
            </el-switch>
          </div>
          <div class="item">
            <span>基础避障</span>
            <el-switch v-model="value" active-color="#05E29E" inactive-color="#1A1931">
            </el-switch>
          </div>
          <div class="item itemTip">
            基础避障可以在遥控时提供保护
          </div>
        </div>
        <!-- 锁屏设置 -->
        <div v-else-if="i === 1">
          <div class="item">
            <span>自动锁屏</span>
            <el-switch v-model="value" active-color="#05E29E" inactive-color="#1A1931" active-text="开" inactive-text="关">
            </el-switch>
          </div>
          <div class="item timeInp">
            <span>进入锁屏时间(秒)</span>
            <el-input v-model="input" placeholder="请输入内容"></el-input>
          </div>
          <div class="item filesInp">
            <span>锁屏文件</span>
            <el-input v-model="input" placeholder="请输入内容"></el-input>
          </div>
        </div>
        <div v-else-if="i === 5">
          <div class="item">点击测试</div>
        </div>
        <div v-else>
          <div v-for="j in item.num" :key="j" class="item">机器编号(SN):{{ item['机器编号(SN)'] }}</div>
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
      input: '',
      box: [
        {
          title: "基础设置"
        },
        {
          title: "锁屏设置"
        }, {
          title: "设备信息",
          num: 2,
          '机器编号(SN)': "T2301110001",
          '机器编号(SN)': "T2301110001",
        }, {
          title: "网络设备信息",
          num: 2,
          '机器编号(SN)': "T2301110001",
          '机器编号(SN)': "T2301110001",
        }, {
          title: "主要硬件信息",
          num: 4,
          '机器编号(SN)': "T2301110001",
          '机器编号(SN)': "T2301110001",
          '机器编号(SN)': "T2301110001",
          '机器编号(SN)': "T2301110001",
        }, {
          title: "测试模式"
        },

      ]
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
  justify-content: space-evenly;
  color: #fff;

  &>div {
    padding: 40px 70px;
    width: 670px;
    height: 350px;
    border-radius: 20px;
    background: linear-gradient(116deg, rgba(71, 84, 141, 0.64) 12%, rgba(71, 66, 124, 0.52) 90%);
    backdrop-filter: blur(10.88px);
    box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
    margin-top: 30px;
    margin-bottom: 30px;

    .title {
      font-size: 40px;
    }

    &>div {
      margin-top: 40px;

      .item {
        margin-top: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 600px;

        .el-switch {
          transform: scale(2.5);
          margin-right: 30px;
        }
      }

      .itemTip {
        font-size: 28px;
        color: #C1C1C1;
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
</style>
