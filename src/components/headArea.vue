<template>
  <div class="headBox">
    <div class="toolRow">
      <router-link to="/">
      <div class="home">
        <img src="@/assets/img/homeico.svg" />
      </div>
      </router-link>
      <div class="rowR" @click="$store.state.showMsg=true">
        <div class="show"></div>
        <div class="title">阿加犀办公室大办公室</div>
        <div class="electric"></div>
        <div class="Tool" @click="showTool = !showTool">
          <img src="@/assets/img/headTool.svg" />
        </div>
      </div>
    </div>
    <div class="toolBox" v-show="showTool">
      <div class="btn btn1"></div>
      <div class="btn btn2"></div>
      <div class="btn btn3"></div>
      <div class="rightBox">
        <div class="right1">
          <div class="rTop" @click="add('luminance')"></div>
          <div class="rBody">
            <div class="rBodyBg" :style="{ height: luminance + '%' }"></div>
          </div>
          <div class="rTop" @click="minus('luminance')"></div>
        </div>
        <div class="right2">
          <div class="rTop" @click="add('voice')"></div>
          <div class="rBody">
            <div class="rBodyBg" :style="{ height: voice + '%' }"></div>
          </div>
          <div class="rTop" @click="minus('voice')"></div>
        </div>
      </div>
    </div>
    <Message>
      <div @click="$store.state.showMsg = false">12312312</div>
    </Message>
  </div>
</template>

<script>
import Message from "@/components/message";
import { mapState, mapMutations } from "vuex";

export default {
  computed: {
    ...mapState([
      "showMsg",
    ])
  },
  components: {
    Message
  },
  data() {
    return {
      showTc:false,
      showTool: false,
      luminance: 20,
      voice: 0
    };
  },
  methods: {
    add(type, fun) {
      this[type] < 100 && (this[type] += 1);
    },
    minus(type, fun) {
      this[type] > 0 && (this[type] -= 1);
    }
  },
  mounted() {
    console.log("[  ]-45");
  }
};
</script>

<style lang="less" scoped>
.headBox {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 1920px;
  height: 120px;
  opacity: 1;
  z-index: 10;
  color: #fff;
  background: linear-gradient(
    93deg,
    rgba(71, 84, 141, 0.64) 8%,
    rgba(53, 81, 119, 0.15) 86%,
    rgba(53, 92, 119, 0.14) 88%
  );
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
}
.toolRow {
  width: 100%;
  height: 100%;
  .home{
    width: 80px;
    height: 80px;
    background: #2F3758;
    border-radius: 10px;
    margin: 20px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rowR {
    width: 57%;
    height: 100%;
    margin-left: 42%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    & > div {
      height: 80px;
    }
    .show {
      color: #fff;
      background: #000;
      width: 350px;
      border-radius: 10px;
      opacity: 1;
      background: #2f3758;
      backdrop-filter: blur(10px);
    }
    .title {
      max-width: 400px;
      width: 370px;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 80px;
    }
    .electric {
      width: 120px;
      background: #fff;
    }
    .Tool {
      width: 80px;
      background: #33478b;
    border-radius: 50%;
    }
  }
}

/*  */
.toolBox {
  position: absolute;
  right: 60px;
  top: 125px;
  width: 634px;
  height: 534.28px;
  opacity: 1;
  background: #374275;
  box-sizing: border-box;
  border: 2px solid rgba(162, 155, 229, 0.32);
  backdrop-filter: blur(10px);
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.23);
  .btn {
    position: absolute;
    width: 338.35px;
    height: 87.54px;
    border-radius: 10px;
    opacity: 1;
    background: #232850;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.3);
  }
  .btn1 {
    left: 52.56px;
    top: 87.82px;
  }
  .btn2 {
    left: 52.56px;
    top: 202.71px;
  }
  .btn3 {
    left: 53px;
    top: 404.06px;
  }
  .btn3::before {
    content: "";
    width: 100%;
    height: 1px;
    background: #e1dddd;
    position: absolute;
    top: -42px;
  }
  .rightBox {
    position: absolute;
    left: 447.85px;
    top: 85px;
    width: 148.97px;
    height: 346.64px;
    opacity: 1;
    display: flex;
    justify-content: space-between;
    .rTop {
      width: 53.83px;
      height: 76.89px;
      background: #232850;
    }
    .rBody {
      width: 53.83px;
      height: 193.11px;
      background: #bfc9f9;
      position: relative;
      & > div {
        position: absolute;
        width: 53.83px;
        bottom: 0;
        background: #ccc;
      }
    }
  }
}
</style>
