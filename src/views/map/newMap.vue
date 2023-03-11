<template>
  <div class="newMapBox">
    <ShowMap />
    <div class="right">
      <p>遥控模式已打开请使用手App遥控机器人行走建图，完成扫描后点击完成扫描进入下一步</p>
      <p>注意：起始位置为起始点或充电桩，建图需完成回环后回到该位置</p>
      <div class="over">完成扫描</div>
      <div class="out">退出</div>
    </div>
  </div>
</template>

<script>
import ShowMap from "@/components/showMap";

export default {
  components: {
    ShowMap
  },
  data () {
    return {

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
  align-items: center;
  justify-content: space-evenly;
}

.right {
  width: 434px;
  height: 1010px;
  background-color: #ccc;
  border-radius: 5px;
  background: linear-gradient(155deg, rgba(71, 84, 141, 0.64) 24%, rgba(71, 66, 124, 0.52) 98%);
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  height: 1010px;

  &>p {
    text-align: center;
    text-align: center;
    line-height: 50px;
    padding: 0px 40px;
  }
}

.over {
  width: 300px;
  height: 120px;
  border-radius: 10px;
  opacity: 1;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  background: #B04CF3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.out {
  width: 300px;
  height: 80px;
  border-radius: 10px;
  background: #4F5478;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
}
</style>
