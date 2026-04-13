<template>
  <div class="newMapBox">
    <ShowMap />
    <div class="right">
      <p>IP:{{ $store.state.IP || "--" }}</p>
      <p>
        请使用手机遥控控制机器人行走建图，完成扫描后点击完成扫描进入下一步
      </p>
      <div class="pushModeBox">
        <div class="pushModeText">
          <div class="pushModeTitle">手推建图</div>
        </div>
        <el-switch
          v-model="pushMappingEnabled"
          :disabled="motorModeLoading"
          active-text="开"
          inactive-text="关"
          @change="onPushMappingChange"
        />
      </div>
      <div v-if="!pushMappingEnabled" class="joystickBox">
        <div class="joystickDesc">摇杆控制</div>
        <div
          ref="joystick"
          class="joystick"
          @pointerdown.stop.prevent="startJoystick"
        >
          <div class="joystick-ring"></div>
          <div class="joystick-cross joystick-cross-x"></div>
          <div class="joystick-cross joystick-cross-y"></div>
          <div
            class="joystick-handle"
            :style="joystickHandleStyle"
          ></div>
        </div>
      </div>
      <div class="over" @click="onOver()">完成扫描</div>
      <div class="out" @click="onOut()">退出</div>
    </div>
  </div>
</template>

<script>
import ShowMap from "@/components/map/new";

export default {
  components: {
    ShowMap
  },
  data() {
    return {
      mapName: this.$route.query.mapName,
      maxLinearSpeed: 0.4,
      maxAngularSpeed: 1,
      joystickRadius: 84,
      joystickOffset: {
        x: 0,
        y: 0
      },
      joystickPointerId: null,
      joystickTimer: null,
      lastCmdVel: {
        linearX: 0,
        angularZ: 0
      },
      pushMappingEnabled: false,
      motorModeLoading: false
    };
  },
  computed: {
    joystickHandleStyle() {
      return {
        transform: `translate(${this.joystickOffset.x}px, ${this.joystickOffset.y}px)`
      };
    }
  },
  mounted() {
    this.syncMotorMode("velocity", { silent: true }).catch(() => {});
  },
  beforeDestroy() {
    this.stopJoystick();
    if (this.pushMappingEnabled) {
      this.syncMotorMode("velocity", { silent: true });
    }
  },
  methods: {
    syncMotorMode(mode, options = {}) {
      const { silent = false } = options;
      return new Promise((resolve, reject) => {
        if (typeof setMotorMode === "undefined") {
          const error = new Error("set_motor_mode service unavailable");
          if (!silent) {
            this.$message.error("电机模式服务未初始化");
          }
          reject(error);
          return;
        }
        const request = new ROSLIB.ServiceRequest({
          data: mode
        });
        setMotorMode.callService(
          request,
          (result) => {
            if (result && result.success) {
              if (!silent && result.message) {
                this.$message.success(result.message);
              }
              resolve(result);
              return;
            }
            const message = (result && result.message) || "电机模式切换失败";
            if (!silent) {
              this.$message.error(message);
            }
            reject(new Error(message));
          },
          (error) => {
            const message = String(error || "电机模式服务调用失败");
            if (!silent) {
              this.$message.error(message);
            }
            reject(new Error(message));
          }
        );
      });
    },
    publishCmdVel(linearX, angularZ) {
      const linear = {
        x: linearX,
        y: 0,
        z: 0
      };
      const angular = {
        x: 0,
        y: 0,
        z: angularZ
      };
      this.lastCmdVel = { linearX, angularZ };
      const message = new ROSLIB.Message({ linear, angular });
      if (window.publishControlTwist) {
        window.publishControlTwist(message);
        return;
      }
      controlRobot.publish(message);
    },
    startCmdVelLoop() {
      if (this.joystickTimer) {
        return;
      }
      this.joystickTimer = setInterval(() => {
        const { linearX, angularZ } = this.lastCmdVel;
        this.publishCmdVel(linearX, angularZ);
      }, 120);
    },
    clearCmdVelLoop() {
      if (!this.joystickTimer) {
        return;
      }
      clearInterval(this.joystickTimer);
      this.joystickTimer = null;
    },
    startJoystick(event) {
      if (this.pushMappingEnabled || !this.$refs.joystick) {
        return;
      }
      this.joystickPointerId = event.pointerId;
      if (event.currentTarget && event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      window.addEventListener("pointermove", this.onJoystickMove);
      window.addEventListener("pointerup", this.stopJoystick);
      window.addEventListener("pointercancel", this.stopJoystick);
      this.updateJoystick(event);
      this.startCmdVelLoop();
    },
    onJoystickMove(event) {
      if (this.joystickPointerId !== null && event.pointerId !== this.joystickPointerId) {
        return;
      }
      this.updateJoystick(event);
    },
    updateJoystick(event) {
      const joystick = this.$refs.joystick;
      if (!joystick) {
        return;
      }
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const limit = this.joystickRadius;
      const ratio = distance > limit ? limit / distance : 1;
      const offsetX = deltaX * ratio;
      const offsetY = deltaY * ratio;
      const normalizedX = offsetX / limit;
      const normalizedY = offsetY / limit;
      const deadZone = 0.08;
      const angularZ = Math.abs(normalizedX) < deadZone ? 0 : -normalizedX * this.maxAngularSpeed;
      const linearX = Math.abs(normalizedY) < deadZone ? 0 : -normalizedY * this.maxLinearSpeed;

      this.joystickOffset = {
        x: offsetX,
        y: offsetY
      };
      this.publishCmdVel(linearX, angularZ);
    },
    stopJoystick(event) {
      if (
        event &&
        this.joystickPointerId !== null &&
        event.pointerId !== undefined &&
        event.pointerId !== this.joystickPointerId
      ) {
        return;
      }
      window.removeEventListener("pointermove", this.onJoystickMove);
      window.removeEventListener("pointerup", this.stopJoystick);
      window.removeEventListener("pointercancel", this.stopJoystick);
      this.clearCmdVelLoop();
      this.joystickPointerId = null;
      this.joystickOffset = {
        x: 0,
        y: 0
      };
      this.publishCmdVel(0, 0);
    },
    async onPushMappingChange(value) {
      this.motorModeLoading = true;
      if (value) {
        this.stopJoystick();
      }
      try {
        await this.syncMotorMode(value ? "torque" : "velocity", { silent: true });
        this.$message.success(value ? "已开启手推建图" : "已关闭手推建图");
      } catch (error) {
        this.pushMappingEnabled = !value;
      } finally {
        this.motorModeLoading = false;
      }
    },
    onOver () {
      this.$confirm(`<div>是否确认完成扫描，确认后将生成地图进入编辑</div><div>（无法返回）</div>`, '完成扫描', {
        dangerouslyUseHTMLString: true,
        center: true
      }).then(() => {
        const date = Date.now()
        const msg = new ROSLIB.ServiceRequest({
          map_file_name: `/maps/${date}`
        });
        saveMap.callService(msg, (result) => {
          if (result.success) {
            const msg2 = new ROSLIB.ServiceRequest(
              {
                map_name: this.mapName,
                map_file: `/maps/${date}`
              }
            );
            saveMapDb.callService(msg2, (result) => {
              console.log('[  saveMapDb OK]-61', result)
            }, (result) => {
              console.log('[  saveMapDb ERR]-61', result)
            });
            this.$router.push({ name: 'map' })
          } else {
            this.$message('保存失败');
          }
        }, (result) => {
          console.log('[  saveMap ERR]-61', result)
        });
      })
    },
    onOut () {
      this.$confirm(`<div>是否确认退出</div><div>（已扫描地图不会保存）</div>`, '退出扫描', {
        dangerouslyUseHTMLString: true,
        center: true
      }).then(() => {
        this.$router.push({ name: 'map' })
        console.log('[  ]-72',)
        this.$store.state.actionStatus = 'idle'
        const msg = new ROSLIB.ServiceRequest({
          action: 'idle'
        });
        robotMode.callService(msg, (result) => {
          console.log('[  finishMap OK]-61', result)
        }, (result) => {
          console.log('[  finishMap ERR]-61', result)
        });
        console.log('[  ]-69',)
      })
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
  height: calc(100% - 70px);
  background-color: #ccc;
  border-radius: 5px;
  background: linear-gradient(
    155deg,
    rgba(71, 84, 141, 0.64) 24%,
    rgba(71, 66, 124, 0.52) 98%
  );
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  & > p {
    text-align: center;
    text-align: center;
    line-height: 50px;
    padding: 0px 40px;
  }
}

.joystickBox {
  width: 300px;
  padding: 24px 20px 28px;
  border-radius: 20px;
  background: linear-gradient(
    145deg,
    rgba(27, 41, 88, 0.95) 0%,
    rgba(59, 88, 149, 0.48) 100%
  );
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pushModeBox {
  width: 300px;
  padding: 20px 24px;
  border-radius: 20px;
  background: linear-gradient(
    145deg,
    rgba(27, 41, 88, 0.95) 0%,
    rgba(59, 88, 149, 0.48) 100%
  );
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.pushModeText {
  flex: 1;
}

.pushModeTitle {
  font-size: 32px;
  line-height: 1.2;
}

.pushModeBox /deep/ .el-switch__label {
  color: rgba(255, 255, 255, 0.88);
}

.pushModeBox /deep/ .el-switch__label.is-active {
  color: #ffffff;
}


.joystickDesc {
  margin-top: 12px;
  font-size: 24px;
  line-height: 1.5;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.joystick {
  position: relative;
  width: 220px;
  height: 220px;
  margin-top: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.14) 0%, rgba(9, 15, 36, 0.55) 70%, rgba(3, 8, 24, 0.9) 100%);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.08), 0 10px 30px rgba(4, 12, 38, 0.35);
  touch-action: none;
  user-select: none;
}

.joystick-ring {
  position: absolute;
  inset: 26px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.12);
}

.joystick-cross {
  position: absolute;
  left: 50%;
  top: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
}

.joystick-cross-x {
  width: 150px;
  height: 2px;
}

.joystick-cross-y {
  width: 2px;
  height: 150px;
}

.joystick-handle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 88px;
  height: 88px;
  margin-left: -44px;
  margin-top: -44px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffffff 0%, #7fd6ff 18%, #3f78ff 58%, #2041a2 100%);
  box-shadow: 0 10px 24px rgba(14, 35, 103, 0.45);
  transition: transform 0.05s linear;
}

.over {
  width: 300px;
  height: 120px;
  border-radius: 10px;
  opacity: 1;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  background: #b04cf3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.out {
  width: 300px;
  height: 80px;
  border-radius: 10px;
  background: #4f5478;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
}
</style>
