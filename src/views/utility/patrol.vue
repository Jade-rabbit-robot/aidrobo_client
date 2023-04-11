<template>
  <div class="newMapBox">
    <ShowMap />
    <div class="right point">
      <div class="rText" v-if="!$store.state.patrol_arr.length">
        <p>选择位置点</p>
        <p>请点击按钮，依次在地图中点击想巡逻的位置点</p>
      </div>
      <div class="titleBox" v-else>
        <p>选择位置点:</p>
        <div class="mapNameB">
          <p v-for="(e, i) in $store.state.patrol_arr" :key="i" class="mapName" @click="onDelOne(i)">({{ (e.x).toFixed(2)
          }},{{
  (e.y).toFixed(2)
}})</p>
        </div>
      </div>
      <div class="goPoint delList" @click="onDelList()" v-if="$store.state.patrol_arr.length">清除路线</div>

      <div class="goPoint" @click="onBegin()">{{ text }}</div>
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
      text: '选择位置',
      hasHistory: false,
    }
  },
  mounted () {
    this.$store.state.hasSave = false;
    this.$store.state.patrol_arr = [];
    this.$store.state.patrol_arr_area = [];
    try {
      this.getPoint()
    } catch (error) {
    }
    // 状态机
    const type = new ROSLIB.ServiceRequest({
      action: 'patrol'
    });
    robotMode.callService(type, (result) => {
      console.log('[ robotMode OK]-61', result)
      if (!result.success) {
        this.$message('状态切换失败');
      }
    }, (result) => {
      this.$message('状态切换失败');
      console.log('[ robotMode ERR]-61', result)
    });
  },
  methods: {
    addPoint (data) {
      const data_ = data.map((e) => {
        return { x: e.x, y: e.y, z: 0 }
      })
      const msg2 = new ROSLIB.ServiceRequest(
        {
          map_id: this.$store.state.nowMapID,
          data: JSON.stringify(data_),
          frame_id: 'map',
          data_type: 'waypoint'
        }
      );
      OperationAdd.callService(msg2, (result) => {
        console.log('[  addPoint OK]-61', result)
      }, (result) => {
        console.log('[  addPoint ERR]-61', result)
      });
    },
    updatePoint (data) {
      const data_ = data.map((e) => {
        return { x: e.x, y: e.y, z: 0 }
      })
      const msg2 = new ROSLIB.ServiceRequest(
        {
          id: 1,
          data: JSON.stringify({
            map_id: this.$store.state.nowMapID,
            frame_id: 'map',
            point_list: JSON.stringify(data_)
          }),
          data_type: 'waypoint'
        }
      );
      OperationUpdate.callService(msg2, (result) => {
        console.log('[  updatePoint OK]-61', result)
      }, (result) => {
        console.log('[  updatePoint ERR]-61', result)
      });
    },
    getPoint () {
      getMapLinkedDataList.callService(msg2, (result) => {
        if (result.success) {
          let msg = []
          try {
            msg = JSON.parse(result.message)
            this.$store.state.patrol_arr = JSON.parse(msg[0].point_list);
            this.text = '开始巡逻'
            this.hasHistory = true
          } catch (error) {
            this.$message('获取巡逻点失败');
          }
          console.log(this.$store.state.patrol_arr)
        } else {
          this.$message('获取巡逻点失败');
        }
        console.log('[  getPoint OK]-61', result)
      }, (result) => {
        console.log('[  getPoint ERR]-61', result)
      });
    },
    onDelOne (i) {
      this.$store.state.patrol_arr.splice(i, 1)
      this.$store.state.patrol_arr_area.splice(i, 1)
    },
    onDelList () {
      this.$store.state.patrol_arr = []
      this.$store.state.patrol_arr_area = []
    },
    onBegin () {
      if (this.text === '选择位置') {
        this.$store.state.tool = 'patrol'
        this.text = '开始巡逻'
      } else if (this.text === '开始巡逻') {
        if (this.$store.state.patrol_arr.length < 2) {
          return false;
        }
        if (this.hasHistory) {
          this.updatePoint(this.$store.state.patrol_arr)
        } else {
          this.addPoint(this.$store.state.patrol_arr)
        }
        const point = { poses: [] }
        this.$store.state.patrol_arr.map(e => {
          point.poses.push(
            {
              header: {
                stamp: {
                  sec: 0,
                  nanosec: 0
                },
                frame_id: "map"
              },
              pose: {
                position: {
                  x: e.x,
                  y: e.y,
                  z: 0.0
                },
                orientation: {
                  x: 0.0,
                  y: 0.0,
                  z: 0.0,
                  w: 1.0
                }
              }
            }
          )
        })
        const msg = new ROSLIB.Message(point);
        TalkerPoint.publish(msg);
        this.text = '暂停巡逻'
      } else if (this.text === '暂停巡逻') {
        const type = new ROSLIB.ServiceRequest({
          cmd: 'pause'
        });
        patrolState.callService(type, (res) => {
          console.log('[ patrol_control ok]-61', res)
        }, (res) => {
          console.log('[ patrol_control ERR]-61', res)
        });
        this.text = '恢复巡逻'
      } else if (this.text === '恢复巡逻') {
        const type = new ROSLIB.ServiceRequest({
          cmd: 'resume'
        });
        patrolState.callService(type, (res) => {
          console.log('[ patrol_control ok]-61', res)
        }, (res) => {
          console.log('[ patrol_control ERR]-61', res)
        });
        this.text = '暂停巡逻'
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
  height: 1010px;
  line-height: 50px;
  margin-left: 30px;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;

  .rText {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 20px;
  }

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

  .mapNameB {
    height: 640px;
    overflow: auto;
    width: 100%;
  }

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
    margin-top: 20px;
    padding: 10px 0;
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

.delList {
  position: absolute;
  bottom: 160px;
}

.readyBtn {
  background: linear-gradient(110deg, rgba(55, 89, 238, 0.64) 11%, rgba(30, 157, 244, 0.37) 89%) !important;
}
</style>
