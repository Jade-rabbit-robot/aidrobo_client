<!-- jrf -->
<template>
  <div class="map" ref="map" @touchmove="map_move()">
    <div class="fa_map_box1">
      <div
        class="map_box1"
        ref="map_box1"
        @touchstart="rubberstart($event)"
        @touchmove="rubbermove($event)"
        @touchend="rubberend($event)"
        v-bind:style="{ transform: 'translate(' + left + 'px,' + top + 'px)' }"
      >
        <img id="img1" :src="mapData.src" @load="init" ref="img1" />
        <!-- <img id="img1" src="../../../static2/img/map2.png" @load="init" ref="img1" /> -->
        <svg
          v-if="planEnabled && planSvgPoints"
          class="plan_path"
          :viewBox="'0 0 ' + mapData.width + ' ' + mapData.height"
          :width="mapData.width * scale"
          :height="mapData.height * scale"
        >
          <polyline :points="planSvgPoints" />
        </svg>
        <svg
          v-if="scanEnabled && scanSvgPoints.length"
          class="scan_layer"
          :viewBox="'0 0 ' + mapData.width + ' ' + mapData.height"
          :width="mapData.width * scale"
          :height="mapData.height * scale"
        >
          <circle
            v-for="(point, index) in scanSvgPoints"
            :key="'scan-' + index"
            :cx="point.x"
            :cy="point.y"
            :r="scanPointRadius"
          />
        </svg>
        <div
          class="robot"
          v-bind:style="{
            transform:
              'translate(' +
              (robotXY.x * scale - 12) +
              'px,' +
              (robotXY.y * scale - 12) +
              'px) rotate(' +
              (90 - robotYaw) +
              'deg)'
          }"
        ></div>
        <div
          v-for="(item, index) in pointsInMapImage"
          :key="index"
          class="map_point"
          v-bind:style="{
            transform:
              'translate(' +
              (item.x * scale - 25) +
              'px,' +
              (item.y * scale + -70) +
              'px)'
          }"
        >
          <img src="../../../static2/img/point.png" width="50px" />
          <span class="pointNum">{{ index + 1 }}</span>
        </div>
        <div class="map_box2">
          <canvas id="operate" ref="operate"></canvas>
        </div>
      </div>
    </div>
    <div class="img2">
      <div
        class="show_img"
        ref="show_img"
        v-bind:style="{
          'margin-top': img2_top + 'px',
          'margin-left': img2_left + 'px'
        }"
      ></div>
      <img id="img2" :src="mapData.src" ref="img2" />
    </div>
    <div class="zoom">
      <img src="@/assets/img/seeMap/fda.png" @click="zoom('f')" />
      <img src="@/assets/img/seeMap/sxiao.png" @click="zoom('s')" />
    </div>
    <div class="active" v-if="!navigationPoint">
      <img
        src="@/assets/img/seeMap/active.png"
        @click="changeTool('')"
        v-if="tool == 'patrol' || tool == 'point'"
      />
      <img
        src="@/assets/img/seeMap/disActive.png"
        @click="changeTool('patrol')"
        v-else
      />
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapState, mapMutations } from "vuex";
import { applyTransformToPoint, changeStr, mapToImg, imgToMap, normalizeFrameId, quaternionToYawDeg, resolveTransform, updateTransformGraph } from "@/assets/common"

export default {
  props: ["initData", 'navigationPoint', 'showPlan', 'showScan'],
  data() {
    return {
      mapData: {
        src: "",
        width: 1930,
        height: 3909,
        resolution: 0,
        positionX: 0,
        positionY: 0,
      },
      robotXY: { x: 0, y: 0 },
      scale: 1,
      left: 0,
      top: 0,
      img2_scale: 1,
      img2_top: 0,
      img2_left: 0,
      imgsrc: null,
      d_width: null,
      d_height: null,
      operate_txc: null,
      interval: null, //全局控制定时器
      touch_data: null, //触摸点
      screen_w: 1380,
      yEnd: 0,
      xEnd: 0,
      planMapPoints: [],
      planListener: null,
      scanMapPoints: [],
      scanListener: null,
      robotTfListener: null,
      robotTransform: null,
      scanFrameId: '',
      scanTransform: null,
      tfMessageListener: null,
      tfStaticListener: null,
      tfGraph: {}
    };
  },
  computed: {
    ...mapState([
      "robotPoint",
      "robotYaw",
      "mcode",
      "rubber_data1",
      "rubber_data2",
      "head_h",
      "rubber_size",
      "go_rubber",
      "tool",
      "mapSrc",
      "init_img_data",
      "patrol_arr_area",
      "patrol_arr",
      "m_width",
      "m_height",
      "m_resolution",
      "_map_name",
      "zero",
      "stop_chang_data",
      "stop_point",
      "charge_po",
      "map_img_w",
      "navigationImgPoints",
    ]),
    pointsInMapImage () {
      return this.$props.navigationPoint ? this.navigationImgPoints : this.patrol_arr_area
    },
    planEnabled () {
      return !!(this.navigationPoint || this.showPlan)
    },
    scanEnabled () {
      return !!this.showScan
    },
    planImgPoints () {
      if (!this.mapData.resolution) {
        return []
      }
      return this.planMapPoints.map(point => ({
        x: mapToImg({ mapData: this.mapData, x: point.x }),
        y: mapToImg({ mapData: this.mapData, y: point.y })
      }))
    },
    planSvgPoints () {
      return this.planImgPoints
        .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
        .map(point => `${point.x},${point.y}`)
        .join(' ')
    },
    scanSvgPoints () {
      if (!this.mapData.resolution) {
        return []
      }
      return this.scanMapPoints
        .map(point => ({
          x: mapToImg({ mapData: this.mapData, x: point.x }),
          y: mapToImg({ mapData: this.mapData, y: point.y })
        }))
        .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
    },
    scanPointRadius () {
      return this.scale > 1 ? 1 : 1.2
    }
  },
  watch: {
    robotPoint: function (n) {
      this.robotXY = { x: mapToImg({ mapData: this.mapData, x: n.x }), y: mapToImg({ mapData: this.mapData, y: n.y }) }
    },
    initData: function (n) {
      if (n) {
        this.$store.state.patrol_arr_area = this.patrol_arr.map(e => {
          return { x: mapToImg({ mapData: this.mapData, x: e.x }), y: mapToImg({ mapData: this.mapData, y: e.y }) }
        })
      }
    }
  },
  mounted() {
    this.$store.state.map_width = this.$refs.map.offsetWidth;
    this.subscribeTfMessages()
    this.subscribePlan()
    this.subscribeScan()
    this.getMap()
  },
  beforeDestroy() {
    this.unsubscribeTfMessages()
    this.unsubscribePlan()
    this.unsubscribeScan()
  },
  methods: {
    subscribeTfMessages() {
      if (this.tfMessageListener || this.tfStaticListener) {
        return
      }
      this.tfMessageListener = message => {
        updateTransformGraph(this.tfGraph, message.transforms || [])
        this.refreshResolvedTransforms()
      }
      this.tfStaticListener = message => {
        updateTransformGraph(this.tfGraph, message.transforms || [])
        this.refreshResolvedTransforms()
      }
      RobotTF.subscribe(this.tfMessageListener)
      RobotTFStatic.subscribe(this.tfStaticListener)
    },
    unsubscribeTfMessages() {
      if (this.tfMessageListener) {
        RobotTF.unsubscribe(this.tfMessageListener)
      }
      if (this.tfStaticListener) {
        RobotTFStatic.unsubscribe(this.tfStaticListener)
      }
      this.tfMessageListener = null
      this.tfStaticListener = null
      this.robotTfListener = null
      this.robotTransform = null
      this.scanTransform = null
      this.tfGraph = {}
    },
    refreshResolvedTransforms() {
      const baseLinkTransform = resolveTransform(this.tfGraph, 'map', 'base_link')
      if (baseLinkTransform) {
        this.robotTransform = baseLinkTransform
        this.$store.state.robotPoint = {
          x: Number(baseLinkTransform.translation.x || 0),
          y: Number(baseLinkTransform.translation.y || 0)
        }
        this.$store.state.robotYaw = quaternionToYawDeg(baseLinkTransform.rotation)
      }
      if (this.scanFrameId) {
        this.scanTransform = resolveTransform(this.tfGraph, 'map', this.scanFrameId)
      }
    },
    subscribePlan() {
      if (!this.planEnabled || this.planListener) {
        return
      }
      this.planListener = message => {
        this.planMapPoints = (message.poses || []).map(item => item.pose.position)
      }
      NavigationPlan.subscribe(this.planListener)
    },
    unsubscribePlan() {
      if (!this.planListener) {
        return
      }
      NavigationPlan.unsubscribe(this.planListener)
      this.planListener = null
      this.planMapPoints = []
    },
    subscribeScan() {
      if (!this.scanEnabled || this.scanListener) {
        return
      }
      this.scanListener = message => {
        this.ensureScanFrameSubscription(message && message.header ? message.header.frame_id : '')
        this.scanMapPoints = this.convertScanToMapPoints(message)
      }
      RobotScan.subscribe(this.scanListener)
    },
    unsubscribeScan() {
      if (!this.scanListener) {
        return
      }
      RobotScan.unsubscribe(this.scanListener)
      this.scanListener = null
      this.scanMapPoints = []
    },
    ensureScanFrameSubscription(frameId) {
      const nextFrameId = normalizeFrameId(frameId)
      if (!nextFrameId || nextFrameId === this.scanFrameId) {
        return
      }
      this.scanFrameId = nextFrameId
      this.scanTransform = resolveTransform(this.tfGraph, 'map', nextFrameId)
    },
    convertScanToMapPoints(message) {
      const ranges = Array.isArray(message && message.ranges) ? message.ranges : []
      if (!ranges.length) {
        return []
      }

      const scanFrameId = normalizeFrameId(message && message.header ? message.header.frame_id : '')
      const isMapFrame = scanFrameId === 'map'
      if (!isMapFrame && !this.scanTransform) {
        return []
      }

      const angleMin = Number(message.angle_min || 0)
      const angleIncrement = Number(message.angle_increment || 0)
      const rangeMin = Number(message.range_min || 0)
      const rangeMax = Number(message.range_max || Infinity)
      const points = []

      for (let index = 0; index < ranges.length; index += 1) {
        const range = Number(ranges[index])
        if (!Number.isFinite(range) || range < rangeMin || range > rangeMax) {
          continue
        }
        const angle = angleMin + angleIncrement * index
        const localPoint = {
          x: range * Math.cos(angle),
          y: range * Math.sin(angle),
          z: 0
        }
        points.push(isMapFrame ? localPoint : applyTransformToPoint(localPoint, this.scanTransform))
      }

      return points
    },
    changeTool(type) {
      if (!type) {
        this.$store.state.tool = ''
      } else {
        if (window.location.hash.includes('patrol')) {
          this.$store.state.tool = 'patrol'
        } else {
          this.$store.state.tool = 'point'
        }
      }

    },
    getMap() {
      const msg = new ROSLIB.ServiceRequest({
        id: this.$store.state.nowMap.id * 1
      });
      console.log('getMapImage', msg)
      getMapImage.callService(msg, (res) => {
        console.log('[ getMapImage OK]-61', res)
        if (res.success) {
          this.mapData = changeStr(res.map)
          this.$props.navigationPoint && this.getPoints();
        }
      }, (result) => {
        console.log('[ getMapImage ERR]-61', result)
      });

    },
    zoom(type){
      let img_w = this.$refs.img1.width;
      let img_h = this.$refs.img1.height;
      let left = this.left;
      let top = this.top;
      let s_h = top / img_h;
      let s_w = left / img_w;

      if(type==='f'){
        if (this.scale < 20) {
          this.$refs.map_box1.style.transition = "transform 1s";
          this.scale += 0.1;
          this.img2_scale -= 0.025;
          img_w = this.d_width * this.scale;
          this.$refs.img1.width = img_w;
          img_h = this.$refs.img1.height;
          this.$refs.operate.style.transform = "scale(" + this.scale + ")";
          this.$refs.show_img.style.width =
            (this.$refs.img2.width * this.$refs.map.offsetWidth) / img_w + "px";
          this.$refs.show_img.style.height =
            (this.$refs.img2.height * this.$refs.map.offsetHeight) / img_h +
            "px";

          this.top = s_h * img_h;
          this.left = s_w * img_w;
        }
      }else{
        if (img_w > this.screen_w) {
          this.$refs.map_box1.style.transition = "transform 1s";
          this.scale > 1 ? (this.scale -= 0.1) : (this.scale = 1);
          this.img2_scale += 0.025;
          img_w < this.screen_w
            ? (img_w = this.screen_w)
            : (img_w = this.d_width * this.scale);
          this.$refs.img1.width = img_w;
          img_h = this.$refs.img1.height;
          this.$refs.operate.style.transform = "scale(" + this.scale + ")";
          this.$refs.show_img.style.width =
            (this.$refs.img2.width * this.$refs.map.offsetWidth) / img_w + "px";
          this.$refs.show_img.style.height =
            (this.$refs.img2.height * this.$refs.map.offsetHeight) / img_h +
            "px";
          if (this.scale == 1) {
            this.img2_left = this.img2_top = this.left = this.top = 0;
          }
        }
      }
    },
    touchStart(e, n) {
      this.$store.state.init_img_data = false;
      this.$refs.map_box1.style.transition = "none";
      e.currentTarget.classList.add("cli_box");
    },
    touchend(e) {
      clearInterval(this.interval);
      this.interval = null;
      e.currentTarget.classList.remove("cli_box");
    },
    init() {
      this.top = this.left = this.img2_top = this.img2_left = 0;
      this.scale = 1;
      this.$refs.operate.style.transform = "scale(" + this.scale + ")";
      let img1 = document.getElementById("img1");

      const sc = 1380 / this.mapData.width
      sc > 1 && (this.scale = sc)
      img1.width = this.scale * this.mapData.width


      let operate = document.getElementById("operate");
      this.$store.state.x_can = operate;
      this.operate_txc = operate.getContext("2d");
      // 获取的图片进行等比适配
      this.$store.state.map_img_w = this.d_width = operate.width =this.mapData.width;
      this.d_height = operate.height =  this.mapData.height;
      this.$refs.img2.width = img1.width / 11;
      this.$refs.show_img.style.width = this.$refs.map.offsetWidth / 11 + "px";
      this.$refs.show_img.style.height =
        this.$refs.map.offsetHeight / 11 + "px";
    },
    rubberstart(e) {
      let set_time = 0;
      this.$refs.map_box1.style.transition = "none";
      let ctx = this.operate_txc;
      e != undefined
        ? (this.touch_data = e.touches[0])
        : (this.touch_data = this.touch_data);
      if (this.tool == "") {
        // 地图滑动
        this.xEnd = Math.round(this.touch_data.pageX / this.scale);
        this.yEnd = Math.round(
          (this.touch_data.pageY - this.head_h) / this.scale
        );
      }
    },
    yy2(y) {
      return this.mapData.height - (y - this.mapData.positionY) / this.mapData.resolution;
    },
    xx2(x) {
      return (x - this.mapData.positionX) / this.mapData.resolution;
    },
    rubbermove(e) {
      let ctx = this.operate_txc;
      let r_x = Math.round((this.touch_data.pageX - this.left) / this.scale);
      let r_y = Math.round(
        (this.touch_data.pageY - this.head_h - this.top) / this.scale
      );
      e.preventDefault();
      e != undefined
        ? (this.touch_data = e.touches[0])
        : (this.touch_data = this.touch_data);
    },
    rubberend(e) {
      if (this.mcode <= 1 && (this.tool == "point" || this.tool == "patrol")) {
        this.patrol(e);
      }
    },
    map_move() {
      try {
        if (this.tool == "") {
          let cT =
            Math.round((this.touch_data.pageY - this.head_h) / this.scale) -
            this.yEnd;
          let cL = Math.round(this.touch_data.pageX / this.scale) - this.xEnd;
          this.yEnd = Math.round(
            (this.touch_data.pageY - this.head_h) / this.scale
          );
          let show_img_w =
            (this.$refs.img2.width * this.$refs.map.offsetWidth) /
            this.$refs.img1.width;
          let show_img_h =
            (this.$refs.img2.height * this.$refs.map.offsetHeight) /
            this.$refs.img1.height;
          this.xEnd = Math.round(this.touch_data.pageX / this.scale);
          this.top = this.top + cT*10;
          this.left = this.left + cL*10;
          this.img2_top -= (show_img_h / this.$refs.map.offsetHeight) * cT; //小地图边界判断(通过比例值获取)
          this.img2_left -= (show_img_w / this.$refs.map.offsetWidth) * cL;
          if (
            this.top <= this.$refs.map.offsetHeight - this.$refs.img1.height ||
            this.img2_top >= this.$refs.img2.height - show_img_h
          ) {
            this.top = this.$refs.map.offsetHeight - this.$refs.img1.height;
            this.img2_top = this.$refs.img2.height - show_img_h;
          } else {
            if (this.top >= 0 || this.img2_top <= 0) {
              this.top = 0;
              this.img2_top = 0;
            } else {
              this.top = this.top;
              this.img2_top = this.img2_top;
            }
          }
          if (
            this.left <=
            this.$refs.map.offsetWidth - this.$refs.img1.width
          ) {
            this.left = this.$refs.map.offsetWidth - this.$refs.img1.width;
            this.img2_left = this.$refs.img2.width - show_img_w;
          } else {
            if (this.left >= 0 || this.img2_left <= 0) {
              this.left = 0;
              this.img2_left = 0;
            } else {
              this.left = this.left;
              this.img2_left = this.img2_left;
            }
          }
        }
      } catch (e) {
      }
    },
    patrol(e) {
      if (this.tool == "point") {
        this.$store.state.patrol_arr_area = []
      }
      let circleX = Math.round(
        (this.touch_data.pageX - 30 - this.left) / this.scale
      );
      let circleY = Math.round(
        (this.touch_data.pageY - 150 - this.top) / this.scale
      );
      this.$store.state.patrol_arr_area.push({
        x: circleX,
        y: circleY
      });
      const xx_yy = this.patrol_arr_area.map(e => {
        return { x: imgToMap({ mapData: this.mapData, x: e.x }), y: imgToMap({ mapData: this.mapData, y: e.y }) };
      });
      this.$store.state.patrol_arr = xx_yy;
    },
    getPoints() {
      const msg = new ROSLIB.ServiceRequest({
        map_id: this.$store.state.nowMap.id * 1,
        data_type: 'waypoint_node'
      });
      NavigationPointsGet.callService(
        msg,
        result => {
          try {
            let points = JSON.parse(result.message);
            let res = points.map(p => {
              p.point_list = JSON.parse(p.point_list)
              return {
                x: p.point_list.position.x,
                y: p.point_list.position.y,
                name: p.point_list.name,
                id: p.id
              }
            })
            this.$store.state.navigationMapPoints = res;
            this.$store.state.navigationImgPoints = res.map(it => ({
              x: mapToImg({ mapData: this.mapData, x: it.x }),
              y: mapToImg({ mapData: this.mapData, y: it.y }),
              name: it.name,
              id: it.id
            }));
            console.log("[  NavigationPointsGet OK]-points", res);
          } catch (error) {
            console.log(error)
            this.$message("获取定点导航点位列表失败");
          }
          console.log("[  NavigationPointsGet OK]-61", result);
        },
        result => {
          console.log("[  NavigationPointsGet ERR]-61", result);
        }
      );
    },
  }
};
</script>

<style scoped>
.map {
  position: relative;
  top: 0;
  height: calc(100% - 70px);
  width: 1380px;
  border-radius: 5px;
  background: #526cad;
  overflow: hidden;
  margin-top: 30px;
  margin-left: 30px;
}

.map_box1 {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.loc_robot {
  position: absolute;
  top: 0;
  left: 0;
}

.map_box2 {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

.plan_path {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  overflow: visible;
  pointer-events: none;
}

.plan_path polyline {
  fill: none;
  stroke: #37f2ff;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.9;
}

.scan_layer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 4;
  overflow: visible;
  pointer-events: none;
}

.scan_layer circle {
  fill: rgba(255, 196, 61, 0.35);
}

.rubber_sel {
  position: absolute;
  width: 150px;
  height: 50px;
  text-align: center;
  line-height: 50px;
  border: 1px solid #948f8f;
  background: #409eff;
  color: #fff;
  border-radius: 11px;
  margin-left: 50px;
  margin-top: 30px;
}

.rubber_sel2 {
  background: #d9dbdb;
  color: #000;
}

#operate {
  transform-origin: left top;
}

#operate2 {
  position: absolute;
  top: 20px;
  left: 80px;
  z-index: 20;
}

.img2 {
  position: absolute;
  right: 0;
  opacity: 0.7;
}

.show_img {
  background: #615555;
  opacity: 0.5;
  border: 1px solid;
  position: absolute;
  margin-top: 0px;
  margin-left: 0px;
  transform-origin: left top;
}

.patrol_list {
  margin-left: 5%;
  margin-top: 1%;
  font-size: 12px;
  width: 83%;
}

.list-complete-item {
  width: 75px;
  display: inline-block;
  height: 25px;
  line-height: 25px;
  margin-left: 3px;
  margin-top: 3px;
  position: relative;
}

.map_tool {
  position: fixed;
  width: 170px;
  height: 120px;
  left: 20px;
  bottom: 20px;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: space-between;
}

.map_tool div {
  height: 50px;
  width: 50px;
  font-size: 30px;
  background: rgba(26, 26, 26, 0.6);
  color: #505050;
  box-shadow: 1px 1px 11px #415d5d;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  transition: transform 0.1s linear;
}

.cli_box {
  box-shadow: inset 1px 1px 11px #436c6c !important;
}

.tram1 {
  transform: translate(60px, 60px);
}

.tram2 {
  transform: translate(0px, 60px);
}

.tram3 {
  transform: translate(-60px, 60px);
}

.tram4 {
  transform: translate(60px, 0px);
}

.tram5 {
  z-index: 2;
  background: #709080 !important;
  transform: rotate(90deg);
}

.tram6 {
  transform: translate(-60px, 0px);
}

.tram7 {
  transform: translate(60px, -60px);
}

.tram8 {
  transform: translate(0px, -60px);
}

.tram9 {
  transform: translate(-60px, -60px);
}

.map_point {
  position: absolute;
  top: 0;
  left: 0;
}

.robot {
  position: absolute;
  width: 24px;
  height: 24px;
  top: 0;
  left: 0;
  z-index: 11;
  transform-origin: 50% 50%;
  background: linear-gradient(
    180deg,
    rgb(255, 239, 133) 0%,
    rgb(255, 84, 84) 100%
  );
  clip-path: polygon(50% 0%, 100% 100%, 50% 74%, 0% 100%);
  box-shadow: -1px -2px 3px -5px rgb(249, 249, 249),
    4px 4px 10px -5px rgba(0, 0, 0, 0.3);
}

.pointNum {
  display: inline-block;
  position: absolute;
  font-size: 1.5rem;
  color: #000;
  top: 10px;
  left: 0;
  width: 50px;
  text-align: center;
}

.charge {
  width: 20px;
  height: 20px;
  background: #ccc;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  animation: mymove 3s infinite;
}

@keyframes mymove {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0.1;
  }
}

.active {
  position: fixed;
  bottom: 50px;
  left: 50px;
}
.zoom {
  position: fixed;
  bottom: 50px;
  left: 1130px;
}
</style>
