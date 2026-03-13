<template>
  <div class="map" ref="map">
    <div class="fa_map_box1">
      <div
        class="map_box1"
        ref="map_box1"
        v-bind:style="{ transform: 'translate(' + left + 'px,' + top + 'px)' }"
      >
        <img id="img1" :src="mapData.src" ref="img1" />
        <svg
          v-if="scanSvgPoints.length"
          class="scan_layer"
          :viewBox="'0 0 ' + mapData.width + ' ' + mapData.height"
          :width="mapData.width * scale"
          :height="mapData.height * scale"
        >
          <circle
            v-for="(point, index) in scanSvgPoints"
            :key="'build-scan-' + index"
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
              (xx2(robotPoint.x) * scale - 12) +
              'px,' +
              (yy2(robotPoint.y) * scale - 12) +
              'px) rotate(' +
                (90 - robotYaw) +
              'deg)'
          }"
          v-if="showType != 'see'"
        ></div>
        <div
          class="charge"
          v-bind:style="{
            transform:
              'translate(' +
              (chargeXY.x * scale - 46) +
              'px,' +
              (chargeXY.y * scale - 124) +
              'px)'
          }"
          v-else
        >
          <img
            id="img1"
            src="@/assets/img/startPoint.svg"
            @load="init"
            ref="img1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapState, mapMutations } from "vuex";
import { applyTransformToPoint, changeStr, normalizeFrameId, quaternionToYawDeg, resolveTransform, updateTransformGraph } from "@/assets/common"

export default {
  props: ['showType'],
  data () {
    return {
      mapData: {
        src: "",
        width: 0,
        height: 0,
        resolution: 0,
        positionX: 0,
        positionY: 0,
      },
      chargeXY: { x: 0, y: 0 },
      scale: 1,
      left: 0,
      top: 0,
      scanMapPoints: [],
      scanListener: null,
      robotTfListener: null,
      robotTransform: null,
      scanFrameId: '',
      scanTransform: null,
      mapListener: null,
      tfMessageListener: null,
      tfStaticListener: null,
      tfGraph: {},
    };
  },
  computed: {
    ...mapState([
      "robotPoint",
      "robotYaw"
    ]),
    scanSvgPoints () {
      if (!this.mapData.resolution) {
        return []
      }
      return this.scanMapPoints
        .map(point => ({
          x: this.xx2(point.x),
          y: this.yy2(point.y)
        }))
        .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
    },
    scanPointRadius () {
      return this.scale > 1 ? 1 : 1.2
    }
  },
  mounted () {
    this.$store.state.map_width = this.$refs.map.offsetWidth;
    this.subscribeTfMessages()
    this.subscribeScan()
    this.getMap()
  },
  beforeDestroy() {
    this.unsubscribeTfMessages()
    this.unsubscribeScan()
    this.unsubscribeMap()
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
    subscribeScan() {
      if (this.scanListener) {
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
    unsubscribeMap() {
      if (!this.mapListener) {
        return
      }
      robotMap.unsubscribe(this.mapListener)
      this.mapListener = null
    },
    getMap () {
      if (this.showType === 'see') {
        const msg = new ROSLIB.ServiceRequest({
          id: this.$route.query.id * 1
        });
        getMapImage.callService(msg, (res) => {
          console.log('[ getMapImage OK]-61', res)
          if (res.success) {
            this.mapData = changeStr(res.map)
            this.chargeXY = { x: this.xx2(0), y: this.yy2(0) }
            this.init()
          }
        }, (result) => {
          console.log('[ getMapImage ERR]-61', result)
        });
      } else {
        this.mapListener = res => {
          this.mapData = changeStr(res)
          this.init()
        }
        robotMap.subscribe(this.mapListener)
      }
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
    init () {
      let img1 = document.getElementById("img1");
      const sc = 1380 / this.mapData.width
      this.scale = sc
      img1.width = this.scale * this.mapData.width
      img1.height = this.scale * this.mapData.height
    },
    yy2 (y) {
      return this.mapData.height - (y - this.mapData.positionY) / this.mapData.resolution;
    },
    xx2 (x) {
      return (x - this.mapData.positionX) / this.mapData.resolution;
    },
  }
};
</script>

<style lang="less" scoped>
.map {
  position: relative;
  top: 0;
  height: calc(100% - 70px);
  width: 1380px;
  border-radius: 5px;
  background: #526cad;
  overflow: auto;
}

.map_box1 {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
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
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
}

.charge {
  width: 92px;
  height: 124px;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
