<template>
  <div class="newMapBox">
    <ShowMap />
    <div class="right point">
      <div v-if="false">
        <p>选择位置点</p>
        <p>请点击想前往的位置</p>
      </div>
      <div class="titleBox">
        <p>选择位置点:</p>
        <p class="mapName">(2855,2349)</p>
      </div>
      <div class="titleBox">
        <p>机器人当前位置:</p>
        <p class="mapName">(2855,2349)</p>
      </div>
      <div class="goPoint" @click="onBegin()">{{text}}</div>
    </div>
  </div>
</template>

<script>
import ShowMap from "@/components/map/pointMap";

export default {
  components: {
    ShowMap
  },
  data () {
    return {
      text:'点击位置点',
    }
  },
  mounted () {
    this.$store.state.hasSave = false;
  },
  methods: {
    onBegin(){
      if(this.text==='点击位置点'){
        this.$store.state.tool='point'
        this.text='开始前往'
      }else if(this.text==='开始前往'){
        this.text='停止'
        const point = {
        header: {
          stamp: {
            sec: 0,
            nanosec: 0
          },
          frame_id: "map"
        },
        pose: {
          position: {
            x: this.$store.state.patrol_arr[0].x,
            y: this.$store.state.patrol_arr[0].y,
            z: 0.0
          },
          orientation: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            w: 1.0
          }
        }
      };
      const msg = new ROSLIB.Message(point);
      TalkerPoint.publish(msg);
      }else{

      }
    },
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
  margin-top: 30px;
    margin-left: 30px;
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
  line-height: 50px;
  margin-left: 30px;

  &>p {
    text-align: center;
    text-align: center;
    line-height: 50px;
    padding: 0px 40px;
  }
}
.titleBox {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 146px;

  .mapName {
    width: 329px;
    height: 80px;
    border-radius: 10px;
    opacity: 1;
    background: #2F3758;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
}
.goPoint {
  width: 300px;
  height: 120px;
  border-radius: 10px;
  background: #4F5478;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
}
.readyBtn{
  background: linear-gradient(110deg, rgba(55,89,238,0.64) 11%, rgba(30,157,244,0.37) 89%) !important;
}
</style>
