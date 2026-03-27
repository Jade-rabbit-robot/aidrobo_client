<template>
  <div class="main">
    <div class="hero">
      <img src="@/assets/img/uti/yaokong.png" />
      <div class="heroText">
        <div class="title">遥控模式</div>
        <div v-if="btnText === '开启遥控模式'" class="desc">
          点击下方按钮进入遥控模式，左手摇杆控制转向，右手摇杆控制前进和后退
        </div>
        <div v-else class="desc">
          IP：<span>{{ $store.state.IP || '--' }}</span>
        </div>
      </div>
    </div>
    <div
      ref="joystickStage"
      class="joystickStage"
      :class="{ disabled: !remoteEnabled }"
    >
      <div
        ref="steeringCard"
        class="joystickCard draggableCard"
        :style="steeringCardStyle"
      >
        <div
          class="dragButton"
          @pointerdown.stop.prevent="startCardDrag('steering', $event)"
        >拖动</div>
        <div class="joystickLabel">左手转向</div>
        <div class="joystickHint">左右控制角速度，最大 1rad/s</div>
        <div
          ref="steeringJoystick"
          class="joystick"
          @pointerdown.stop.prevent="startSteeringJoystick"
        >
          <div class="joystick-ring"></div>
          <div class="joystick-cross joystick-cross-x"></div>
          <div class="joystick-cross joystick-cross-y"></div>
          <div class="joystick-axisLabel axis-left">左转</div>
          <div class="joystick-axisLabel axis-right">右转</div>
          <div
            class="joystick-handle"
            :style="steeringHandleStyle"
          ></div>
        </div>
      </div>
      <div
        ref="speedCard"
        class="joystickCard draggableCard"
        :style="speedCardStyle"
      >
        <div
          class="dragButton"
          @pointerdown.stop.prevent="startCardDrag('speed', $event)"
        >拖动</div>
        <div class="joystickLabel">右手速度</div>
        <div class="joystickHint">上下控制线速度，最大 0.4m/s</div>
        <div
          ref="speedJoystick"
          class="joystick"
          @pointerdown.stop.prevent="startSpeedJoystick"
        >
          <div class="joystick-ring"></div>
          <div class="joystick-cross joystick-cross-x"></div>
          <div class="joystick-cross joystick-cross-y"></div>
          <div class="joystick-axisLabel axis-top">前进</div>
          <div class="joystick-axisLabel axis-bottom">后退</div>
          <div
            class="joystick-handle"
            :style="speedHandleStyle"
          ></div>
        </div>
      </div>
    </div>
    <div class="statusBar">
      <span>线速度 {{ currentLinearX.toFixed(2) }} m/s</span>
      <span>角速度 {{ currentAngularZ.toFixed(2) }} rad/s</span>
    </div>
    <div class="btn" @click="btnFun">
      {{ btnText }}
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      btnText: '开启遥控模式',
      maxLinearSpeed: 0.4,
      maxAngularSpeed: 1,
      joystickRadius: 84,
      currentLinearX: 0,
      currentAngularZ: 0,
      steeringOffset: {
        x: 0,
        y: 0
      },
      speedOffset: {
        x: 0,
        y: 0
      },
      steeringPointerId: null,
      speedPointerId: null,
      joystickTimer: null,
      steeringCardPosition: {
        x: 0,
        y: 0
      },
      speedCardPosition: {
        x: 0,
        y: 0
      },
      draggedCards: {
        steering: false,
        speed: false
      },
      cardDragState: null,
    }
  },
  computed: {
    remoteEnabled() {
      return this.btnText !== '开启遥控模式'
    },
    steeringHandleStyle() {
      return {
        transform: `translate(${this.steeringOffset.x}px, ${this.steeringOffset.y}px)`
      }
    },
    speedHandleStyle() {
      return {
        transform: `translate(${this.speedOffset.x}px, ${this.speedOffset.y}px)`
      }
    },
    steeringCardStyle() {
      return {
        transform: `translate(${this.steeringCardPosition.x}px, ${this.steeringCardPosition.y}px)`
      }
    },
    speedCardStyle() {
      return {
        transform: `translate(${this.speedCardPosition.x}px, ${this.speedCardPosition.y}px)`
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.resetCardPositions()
    })
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    this.stopCardDrag()
    this.stopAllMotion();
  },
  methods: {
    onResize() {
      this.resetCardPositions()
    },
    getStageMetrics() {
      const stage = this.$refs.joystickStage
      if (!stage) {
        return null
      }
      return {
        width: stage.clientWidth,
        height: stage.clientHeight
      }
    },
    getCardSize(type) {
      const refName = type === 'steering' ? 'steeringCard' : 'speedCard'
      const card = this.$refs[refName]
      if (!card) {
        return { width: 430, height: 420 }
      }
      return {
        width: card.offsetWidth,
        height: card.offsetHeight
      }
    },
    clampCardPosition(type, position) {
      const stageMetrics = this.getStageMetrics()
      const cardSize = this.getCardSize(type)
      if (!stageMetrics) {
        return position
      }
      const maxX = Math.max(stageMetrics.width - cardSize.width, 0)
      const maxY = Math.max(stageMetrics.height - cardSize.height, 0)
      return {
        x: Math.min(Math.max(position.x, 0), maxX),
        y: Math.min(Math.max(position.y, 0), maxY)
      }
    },
    resetCardPositions() {
      const stageMetrics = this.getStageMetrics()
      if (!stageMetrics) {
        return
      }
      const steeringSize = this.getCardSize('steering')
      const speedSize = this.getCardSize('speed')
      const sideGap = 24
      const defaultY = Math.max(stageMetrics.height - Math.max(steeringSize.height, speedSize.height) - 12, 0)

      if (!this.draggedCards.steering) {
        this.steeringCardPosition = this.clampCardPosition('steering', {
          x: sideGap,
          y: defaultY
        })
      } else {
        this.steeringCardPosition = this.clampCardPosition('steering', this.steeringCardPosition)
      }

      if (!this.draggedCards.speed) {
        this.speedCardPosition = this.clampCardPosition('speed', {
          x: Math.max(stageMetrics.width - speedSize.width - sideGap, 0),
          y: defaultY
        })
      } else {
        this.speedCardPosition = this.clampCardPosition('speed', this.speedCardPosition)
      }
    },
    startCardDrag(type, event) {
      const cardPosition = type === 'steering' ? this.steeringCardPosition : this.speedCardPosition
      this.cardDragState = {
        type,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: cardPosition.x,
        originY: cardPosition.y
      }
      window.addEventListener('pointermove', this.onCardDragMove)
      window.addEventListener('pointerup', this.stopCardDrag)
      window.addEventListener('pointercancel', this.stopCardDrag)
    },
    onCardDragMove(event) {
      if (!this.cardDragState || event.pointerId !== this.cardDragState.pointerId) {
        return
      }
      const nextPosition = this.clampCardPosition(this.cardDragState.type, {
        x: this.cardDragState.originX + event.clientX - this.cardDragState.startX,
        y: this.cardDragState.originY + event.clientY - this.cardDragState.startY
      })
      if (this.cardDragState.type === 'steering') {
        this.steeringCardPosition = nextPosition
      } else {
        this.speedCardPosition = nextPosition
      }
      this.draggedCards = {
        ...this.draggedCards,
        [this.cardDragState.type]: true
      }
    },
    stopCardDrag(event) {
      if (
        event &&
        this.cardDragState &&
        event.pointerId !== undefined &&
        event.pointerId !== this.cardDragState.pointerId
      ) {
        return
      }
      window.removeEventListener('pointermove', this.onCardDragMove)
      window.removeEventListener('pointerup', this.stopCardDrag)
      window.removeEventListener('pointercancel', this.stopCardDrag)
      this.cardDragState = null
    },
    publishCmdVel() {
      const linear = {
        x: this.currentLinearX,
        y: 0,
        z: 0
      }
      const angular = {
        x: 0,
        y: 0,
        z: this.currentAngularZ
      }
      const message = new ROSLIB.Message({ linear, angular })
      if (window.publishControlTwist) {
        window.publishControlTwist(message)
        return
      }
      controlRobot.publish(message)
    },
    ensurePublishLoop() {
      if (this.joystickTimer || !this.remoteEnabled) {
        return
      }
      this.joystickTimer = setInterval(() => {
        this.publishCmdVel()
      }, 120)
    },
    clearPublishLoop() {
      if (!this.joystickTimer) {
        return
      }
      clearInterval(this.joystickTimer)
      this.joystickTimer = null
    },
    startSteeringJoystick(event) {
      if (!this.remoteEnabled || !this.$refs.steeringJoystick) {
        return
      }
      this.steeringPointerId = event.pointerId
      if (event.currentTarget && event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      window.addEventListener('pointermove', this.onSteeringMove)
      window.addEventListener('pointerup', this.stopSteeringJoystick)
      window.addEventListener('pointercancel', this.stopSteeringJoystick)
      this.updateSteering(event)
      this.ensurePublishLoop()
    },
    startSpeedJoystick(event) {
      if (!this.remoteEnabled || !this.$refs.speedJoystick) {
        return
      }
      this.speedPointerId = event.pointerId
      if (event.currentTarget && event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      window.addEventListener('pointermove', this.onSpeedMove)
      window.addEventListener('pointerup', this.stopSpeedJoystick)
      window.addEventListener('pointercancel', this.stopSpeedJoystick)
      this.updateSpeed(event)
      this.ensurePublishLoop()
    },
    onSteeringMove(event) {
      if (this.steeringPointerId !== event.pointerId) {
        return
      }
      this.updateSteering(event)
    },
    onSpeedMove(event) {
      if (this.speedPointerId !== event.pointerId) {
        return
      }
      this.updateSpeed(event)
    },
    updateSteering(event) {
      const joystick = this.$refs.steeringJoystick
      if (!joystick) {
        return
      }
      const rect = joystick.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaX = event.clientX - centerX
      const distance = Math.abs(deltaX)
      const limit = this.joystickRadius
      const offsetX = Math.max(Math.min(deltaX, limit), -limit)
      const normalizedX = distance > limit ? Math.sign(deltaX) : offsetX / limit
      const deadZone = 0.08

      this.steeringOffset = {
        x: offsetX,
        y: 0
      }
      this.currentAngularZ = Math.abs(normalizedX) < deadZone ? 0 : -normalizedX * this.maxAngularSpeed
      this.publishCmdVel()
    },
    updateSpeed(event) {
      const joystick = this.$refs.speedJoystick
      if (!joystick) {
        return
      }
      const rect = joystick.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const deltaY = event.clientY - centerY
      const distance = Math.abs(deltaY)
      const limit = this.joystickRadius
      const offsetY = Math.max(Math.min(deltaY, limit), -limit)
      const normalizedY = distance > limit ? Math.sign(deltaY) : offsetY / limit
      const deadZone = 0.08

      this.speedOffset = {
        x: 0,
        y: offsetY
      }
      this.currentLinearX = Math.abs(normalizedY) < deadZone ? 0 : -normalizedY * this.maxLinearSpeed
      this.publishCmdVel()
    },
    stopSteeringJoystick(event) {
      if (event && event.pointerId !== undefined && event.pointerId !== this.steeringPointerId) {
        return
      }
      window.removeEventListener('pointermove', this.onSteeringMove)
      window.removeEventListener('pointerup', this.stopSteeringJoystick)
      window.removeEventListener('pointercancel', this.stopSteeringJoystick)
      this.steeringPointerId = null
      this.steeringOffset = { x: 0, y: 0 }
      this.currentAngularZ = 0
      this.publishCmdVel()
      this.checkStopLoop()
    },
    stopSpeedJoystick(event) {
      if (event && event.pointerId !== undefined && event.pointerId !== this.speedPointerId) {
        return
      }
      window.removeEventListener('pointermove', this.onSpeedMove)
      window.removeEventListener('pointerup', this.stopSpeedJoystick)
      window.removeEventListener('pointercancel', this.stopSpeedJoystick)
      this.speedPointerId = null
      this.speedOffset = { x: 0, y: 0 }
      this.currentLinearX = 0
      this.publishCmdVel()
      this.checkStopLoop()
    },
    checkStopLoop() {
      if (this.currentLinearX !== 0 || this.currentAngularZ !== 0) {
        return
      }
      this.clearPublishLoop()
    },
    stopAllMotion() {
      this.stopSteeringJoystick()
      this.stopSpeedJoystick()
      this.currentLinearX = 0
      this.currentAngularZ = 0
      this.publishCmdVel()
      this.clearPublishLoop()
    },
    btnFun () {
      let msg = new ROSLIB.ServiceRequest({
        action: 'idle'
      });
      if (this.btnText === '开启遥控模式') {
        this.btnText = '关闭遥控模式'
        this.$store.state.actionStatus = 'remote'
        msg = new ROSLIB.ServiceRequest({
          action: 'remote_control'
        });
      } else {
        this.stopAllMotion()
        this.$store.state.actionStatus = 'idle'
        msg = new ROSLIB.ServiceRequest({
          action: 'idle'
        });
        this.$router.push({
          path: "/utility"
        });
      }
      robotMode.callService(msg, (result) => {
        console.log('[  finishMap OK]-61', result)
      }, (result) => {
        console.log('[  finishMap ERR]-61', result)
      });
    }
  }
}
</script>

<style lang="less" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: clamp(16px, 4vw, 40px) 16px clamp(24px, 6vw, 60px);
  box-sizing: border-box;

  &>div {
    margin-top: clamp(20px, 4vw, 40px);
  }
}

.hero {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: clamp(16px, 3vw, 40px);
  width: 100%;
  max-width: 1200px;
  justify-content: center;
}

.hero img {
  width: clamp(120px, 18vw, 220px);
  height: auto;
}

.heroText {
  width: 100%;
  max-width: 760px;
}

.title {
  font-size: clamp(24px, 4vw, 54px);
  line-height: 1.2;
}

.desc {
  margin-top: 20px;
  line-height: 1.6;
}

.joystickStage {
  position: relative;
  width: 100%;
  max-width: 1800px;
  min-height: 420px;
  transition: opacity 0.2s ease;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(16px, 2vw, 24px);
  align-items: flex-start;

  &.disabled {
    opacity: 0.45;
  }
}

.joystickCard {
  width: 100%;
  max-width: 430px;
  padding: clamp(18px, 2vw, 32px) clamp(14px, 2vw, 24px) clamp(18px, 2vw, 36px);
  border-radius: clamp(14px, 1.5vw, 24px);
  background: linear-gradient(145deg, rgba(24, 38, 82, 0.92) 0%, rgba(70, 92, 154, 0.45) 100%);
  box-shadow: 0px 12px 36px rgba(1, 29, 90, 0.32);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  left: 0;
  top: 0;
}

.draggableCard {
  position: absolute;
  left: 0;
  top: 0;
}

.dragButton {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 104px;
  height: 52px;
  padding: 0 22px;
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(145, 222, 255, 0.95) 0%, rgba(66, 129, 255, 0.95) 100%);
  box-shadow: 0 10px 22px rgba(6, 31, 98, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  letter-spacing: 2px;
  touch-action: none;
  user-select: none;
}

.joystickLabel {
  font-size: 40px;
  line-height: 1.2;
}

.joystickHint {
  margin-top: 14px;
  font-size: 24px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.78);
}

.joystick {
  position: relative;
  width: 80vw;
  height: 80vw;
  max-width: 240px;
  max-height: 240px;
  margin-top: clamp(20px, 4vw, 28px);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.14) 0%, rgba(9, 15, 36, 0.55) 70%, rgba(3, 8, 24, 0.9) 100%);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.08), 0 10px 30px rgba(4, 12, 38, 0.35);
  touch-action: none;
  user-select: none;
}

.joystick-ring {
  position: absolute;
  inset: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.12);
}

.joystick-cross {
  position: absolute;
  left: 50%;
  top: 50%;
  background: rgba(255, 255, 255, 0.12);
  transform: translate(-50%, -50%);
}

.joystick-cross-x {
  width: 170px;
  height: 2px;
}

.joystick-cross-y {
  width: 2px;
  height: 170px;
}

.joystick-axisLabel {
  position: absolute;
  font-size: 22px;
  color: rgba(255, 255, 255, 0.72);
}

.axis-left {
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.axis-right {
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.axis-top {
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
}

.axis-bottom {
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
}

.joystick-handle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: clamp(64px, 20%, 92px);
  height: clamp(64px, 20%, 92px);
  margin-left: calc(clamp(64px, 20%, 92px) / -2);
  margin-top: calc(clamp(64px, 20%, 92px) / -2);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffffff 0%, #7fd6ff 18%, #3f78ff 58%, #2041a2 100%);
  box-shadow: 0 10px 24px rgba(14, 35, 103, 0.45);
  transition: transform 0.05s linear;
}

.statusBar {
  width: 100%;
  max-width: 920px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: clamp(8px, 2vw, 18px);
  padding: clamp(14px, 2vw, 22px) clamp(16px, 3vw, 32px);
  border-radius: 18px;
  background: rgba(18, 31, 72, 0.55);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.btn {
  width: 100%;
  max-width: 380px;
  height: 120px;
  max-height: 16vw;
  border-radius: 10px;
  opacity: 1;
  background: linear-gradient(106deg, #596AB5 10%, rgba(66, 82, 146, 0.53) 89%);
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(18px, 3vw, 30px);
  font-weight: 600;
}

</style>
