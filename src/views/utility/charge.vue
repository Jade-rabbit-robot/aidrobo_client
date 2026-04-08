<template>
  <div>
    <div class="header">
      <div style="width: 800px">
        {{ `充电桩状态：${isSetDockPose ? "已" : "未"}设置充电桩位置` }}
      </div>
      <div>状态：{{ dockStatusLabel }}</div>
    </div>
    <div class="camera-bar">
      <div class="camera-switch">
        <span class="camera-label">后置相机</span>
        <el-switch
          v-model="cameraEnabled"
          active-text="打开"
          inactive-text="关闭"
          @change="handleCameraToggle"
        />
      </div>
      <div v-if="cameraEnabled" class="camera-status">{{ cameraStatusText }}</div>
    </div>
    <div class="btns">
      <el-button
        type="primary"
        v-for="item in dockAction.slice(0, 3)"
        class="action"
        :key="item.value"
        @click="setDock(item.value)"
        :loading="loadingDock.startsWith(item.value)"
        :disabled="handleDisable(item)"
      >
        {{ item.label }}
      </el-button>
      <el-button
        type="primary"
        v-for="item in dockAction.slice(3)"
        class="action"
        :key="item.value"
        @click="cancelDock"
        :loading="cancelLoading"
        :disabled="!['undock', 'set_dock_pose-result', 'dock-result'].includes(loadingDock)"
      >
        {{ item.label }}
      </el-button>
    </div>
    <div v-if="cameraEnabled" class="camera-panel">
      <canvas ref="rearCameraCanvas" class="camera-canvas"></canvas>
      <div v-if="cameraError" class="camera-error">{{ cameraError }}</div>
    </div>
  </div>
</template>

<script>
import fullscreenLoading from "@/components/fullscreenLoading";

export default {
  data() {
    return {
      isSetDockPose: false,
      dockStatus: "",
      dockAction: [
        { label: "设为充电桩位置", value: "set_dock_pose" },
        { label: "开始回充", value: "dock" },
        { label: "脱离充电桩", value: "undock" },
        { label: "取消", value: "cancel_dock" }
      ],
      loadingDock: "",
      cancelLoading: false,
      cameraEnabled: false,
      cameraError: "",
      cameraFrameReady: false,
      cameraFrameWidth: 0,
      cameraFrameHeight: 0,
      cameraRenderToken: 0,
      cameraSubscribed: false
    };
  },
  computed: {
    dockStatusLabel() {
      const labes = {
        undock: "未充电",
        goto_dock_pose: "正在前往充电桩",
        charging: "已充上电",
        error: "错误"
      };
      return labes[this.dockStatus];
    },
    cameraStatusText() {
      if (this.cameraError) {
        return this.cameraError;
      }
      if (this.cameraFrameReady) {
        return `已接收画面 ${this.cameraFrameWidth} x ${this.cameraFrameHeight}`;
      }
      return "等待相机画面...";
    }
  },
  mounted() {
    let loading = fullscreenLoading();
    setTimeout(() => {
      loading && loading.close();
    }, 60 * 1000);
    const type = new ROSLIB.ServiceRequest({
      action: "patrol"
    });
    robotMode.callService(
      type,
      result => {
        console.log("[ robotMode OK]-61", result);
        if (result.message !== "ok") {
          this.$message("状态切换失败");
        }
        loading.close();
      },
      result => {
        this.$message("状态切换失败");
        console.log("[ robotMode ERR]-61", result);
        loading.close();
      }
    );
    this.getDockPose();
    this.initSubscribe();
  },
  beforeDestroy() {
    this.stopRearCameraSubscription();
  },
  methods: {
    getDockPose() {
      const msg = new ROSLIB.ServiceRequest({
        map_id: this.$store.state.nowMap.id
      });
      getDockPoseService.callService(
        msg,
        result => {
          console.log("[  getDockPoseService result]-61", result);
          this.isSetDockPose = result.success;
        },
        result => {
          console.log("[  getDockPoseService ERR]-61", result);
          this.isSetDockPose = false;
        }
      );
    },
    initSubscribe() {
      dockStateTopic.subscribe(res => {
        this.dockStatus = res.data;
      });
    },
    handleCameraToggle(enabled) {
      if (enabled) {
        this.startRearCameraSubscription();
        return;
      }
      this.stopRearCameraSubscription();
    },
    startRearCameraSubscription() {
      if (this.cameraSubscribed) {
        return;
      }
      this.cameraError = "";
      this.cameraFrameReady = false;
      this.cameraRenderToken++;
      rearCameraImageTopic.subscribe(this.handleRearCameraMessage);
      this.cameraSubscribed = true;
    },
    stopRearCameraSubscription() {
      if (this.cameraSubscribed) {
        rearCameraImageTopic.unsubscribe();
        this.cameraSubscribed = false;
      }
      this.cameraRenderToken++;
      this.cameraFrameReady = false;
      this.cameraFrameWidth = 0;
      this.cameraFrameHeight = 0;
      this.cameraError = "";
      this.clearRearCameraCanvas();
    },
    clearRearCameraCanvas() {
      const canvas = this.$refs.rearCameraCanvas;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    handleRearCameraMessage(message) {
      try {
        const canvas = this.$refs.rearCameraCanvas;
        if (!canvas || !this.cameraEnabled) {
          return;
        }
        if (this.isCompressedImageMessage(message)) {
          this.renderCompressedImageFrame(message, canvas);
          return;
        }
        const frame = this.normalizeImageFrame(message);
        if (!frame) {
          return;
        }
        const context = canvas.getContext("2d");
        canvas.width = frame.width;
        canvas.height = frame.height;
        context.putImageData(frame.imageData, 0, 0);
        this.cameraFrameWidth = frame.width;
        this.cameraFrameHeight = frame.height;
        this.cameraFrameReady = true;
        this.cameraError = "";
      } catch (error) {
        console.error("rear camera render error", error);
        this.cameraError = error.message || "相机画面渲染失败";
      }
    },
    isCompressedImageMessage(message) {
      return !!(message && message.data && typeof message.format === "string" && !message.width && !message.height);
    },
    renderCompressedImageFrame(message, canvas) {
      const bytes = this.normalizeImageDataArray(message.data);
      if (!bytes.length) {
        this.cameraError = "压缩相机消息没有图像数据";
        return;
      }
      const mimeType = this.getCompressedImageMimeType(message.format);
      const blob = new Blob([bytes], { type: mimeType });
      const imageUrl = window.URL.createObjectURL(blob);
      const image = new Image();
      const renderToken = this.cameraRenderToken;
      image.onload = () => {
        window.URL.revokeObjectURL(imageUrl);
        if (!this.cameraEnabled || renderToken !== this.cameraRenderToken) {
          return;
        }
        const context = canvas.getContext("2d");
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        canvas.width = width;
        canvas.height = height;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        this.cameraFrameWidth = width;
        this.cameraFrameHeight = height;
        this.cameraFrameReady = true;
        this.cameraError = "";
      };
      image.onerror = () => {
        window.URL.revokeObjectURL(imageUrl);
        if (renderToken !== this.cameraRenderToken) {
          return;
        }
        this.cameraError = `压缩相机画面解码失败，format: ${message.format || "unknown"}`;
      };
      image.src = imageUrl;
    },
    getCompressedImageMimeType(format) {
      const normalized = (format || "").toLowerCase();
      if (normalized.includes("png")) {
        return "image/png";
      }
      if (normalized.includes("webp")) {
        return "image/webp";
      }
      return "image/jpeg";
    },
    normalizeImageFrame(message) {
      if (!message || !message.width || !message.height) {
        this.cameraError = "相机消息缺少宽高信息";
        return null;
      }
      const encoding = (message.encoding || "rgb8").toLowerCase();
      const width = message.width;
      const height = message.height;
      const step = message.step || 0;
      const source = this.normalizeImageDataArray(message.data);
      if (!source.length) {
        this.cameraError = "相机消息没有图像数据";
        return null;
      }

      let imageData;
      switch (encoding) {
        case "rgb8":
          imageData = this.buildRgbImageData(source, width, height, false, step);
          break;
        case "bgr8":
          imageData = this.buildRgbImageData(source, width, height, true, step);
          break;
        case "rgba8":
          imageData = this.buildRgbaImageData(source, width, height, false, step);
          break;
        case "bgra8":
          imageData = this.buildRgbaImageData(source, width, height, true, step);
          break;
        case "mono8":
        case "8uc1":
          imageData = this.buildMonoImageData(source, width, height, step);
          break;
        default:
          throw new Error(`暂不支持的图像编码：${message.encoding}`);
      }

      return {
        width,
        height,
        imageData
      };
    },
    normalizeImageDataArray(data) {
      if (!data) {
        return new Uint8Array();
      }
      if (data instanceof Uint8Array) {
        return data;
      }
      if (Array.isArray(data)) {
        return Uint8Array.from(data);
      }
      if (typeof data === "string") {
        const binary = window.atob(data);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) {
          bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
      }
      if (data.buffer && data.buffer instanceof ArrayBuffer) {
        return new Uint8Array(data.buffer);
      }
      return new Uint8Array();
    },
    buildRgbImageData(source, width, height, reverseChannel, step) {
      const imageData = new ImageData(width, height);
      const target = imageData.data;
      const rowStride = step || width * 3;
      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          const sourceIndex = row * rowStride + column * 3;
          const targetIndex = (row * width + column) * 4;
          const red = source[sourceIndex] || 0;
          const green = source[sourceIndex + 1] || 0;
          const blue = source[sourceIndex + 2] || 0;
          target[targetIndex] = reverseChannel ? blue : red;
          target[targetIndex + 1] = green;
          target[targetIndex + 2] = reverseChannel ? red : blue;
          target[targetIndex + 3] = 255;
        }
      }
      return imageData;
    },
    buildRgbaImageData(source, width, height, reverseChannel, step) {
      const imageData = new ImageData(width, height);
      const target = imageData.data;
      const rowStride = step || width * 4;
      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          const sourceIndex = row * rowStride + column * 4;
          const targetIndex = (row * width + column) * 4;
          const first = source[sourceIndex] || 0;
          const second = source[sourceIndex + 1] || 0;
          const third = source[sourceIndex + 2] || 0;
          target[targetIndex] = reverseChannel ? third : first;
          target[targetIndex + 1] = second;
          target[targetIndex + 2] = reverseChannel ? first : third;
          target[targetIndex + 3] = source[sourceIndex + 3] === undefined ? 255 : source[sourceIndex + 3];
        }
      }
      return imageData;
    },
    buildMonoImageData(source, width, height, step) {
      const imageData = new ImageData(width, height);
      const target = imageData.data;
      const rowStride = step || width;
      for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
          const value = source[row * rowStride + column] || 0;
          const targetIndex = (row * width + column) * 4;
          target[targetIndex] = value;
          target[targetIndex + 1] = value;
          target[targetIndex + 2] = value;
          target[targetIndex + 3] = 255;
        }
      }
      return imageData;
    },
    handleDisable(item) {
      const actionDisable = !!this.loadingDock && !this.loadingDock.startsWith(item.value);
      let typeDisable = false;
      if (["set_dock_pose", "dock"].includes(item.value) && ["goto_dock_pose", "charging"].includes(this.dockStatus)) {
        typeDisable = true;
      }
      if (["dock"].includes(item.value) && !this.isSetDockPose) {
        typeDisable = true;
      }

      return actionDisable || typeDisable;
    },
    cancelDock() {
      if (this.cancelLoading) return;
      this.cancelLoading = true;
      const msg = new ROSLIB.ServiceRequest({
        data: "cancel_dock"
      });
      dockService.callService(
        msg,
        result => {
          console.log("[  dockService result]-61", "cancel_dock", result);
          this.loadingDock = "";
          this.cancelLoading = false;
          if (!result.success) {
            return;
          }
        },
        result => {
          console.log("[  dockService ERR]-61", "cancel_dock", result);
          this.loadingDock = "";
          this.cancelLoading = false;
        }
      );
    },
    setDock(action) {
      console.log("setDock----:", action);
      const doAction = this.loadingDock || action;
      const dockLabel = this.dockAction.find(item => doAction.startsWith(item.value)).label;
      if (this.loadingDock) {
        this.$message(`${dockLabel} 执行中，请稍后再试`);
        return;
      }
      this.loadingDock = action;
      const msg = new ROSLIB.ServiceRequest({
        data: action
      });
      dockService.callService(
        msg,
        result => {
          console.log("[  dockService result]-61", action, result);
          this.loadingDock = "";
          if (!result.success) {
            this.$message(result.message);
            return;
          }
          action === "undock" ? this.$message(`已${dockLabel}`) : this.waitResult(action);
        },
        result => {
          console.log("[  dockService ERR]-61", action, result);
          this.loadingDock = "";
          this.$message(`${dockLabel}失败`);
        }
      );
    },
    waitResult(action) {
      console.log("wait Result Topic:", action);
      this.loadingDock = `${action}-result`;
      dockResultTopic.subscribe(res => {
        console.log("---dock Result res---", action, res);
        this.loadingDock = "";
        const labels = {
          dock_succeeded: "回充成功",
          dock_failed: "靠桩失败",
          detect_dock_failed: "未检测到充电桩",
          set_dock_pose_succeeded: "设置充电桩位置成功",
          set_dock_pose_failed: "设置充电桩位置失败"
        };
        this.$message(labels[res.data]);
        if (action === "set_dock_pose") {
          this.getDockPose();
        }
        dockResultTopic.unsubscribe(res => console.log("dockResultTopic unsubscribe:", res));
      });
    }
  }
};
</script>

<style scoped>
.header {
  display: flex;
  padding: 100px 50px;
}
.camera-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 50px 40px;
  color: #fff;
}
.camera-switch {
  display: flex;
  align-items: center;
}
.camera-label {
  margin-right: 20px;
  font-size: 32px;
}
.camera-status {
  font-size: 26px;
  color: #cfe0ff;
}
.btns {
  padding: 0 50px;
  display: flex;
  justify-content: space-around;
}
.camera-panel {
  margin: 60px 50px 0;
  padding: 30px;
  border-radius: 20px;
  background: linear-gradient(
    132deg,
    rgba(71, 84, 141, 0.64) 17%,
    rgba(53, 81, 119, 0.15) 92%,
    rgba(53, 92, 119, 0.14) 93%
  );
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
}
.camera-canvas {
  display: block;
  width: 100%;
  min-height: 320px;
  max-height: 540px;
  object-fit: contain;
  background: rgba(8, 15, 34, 0.8);
  border-radius: 16px;
}
.camera-error {
  margin-top: 20px;
  color: #ffb4b4;
  font-size: 26px;
}
.action {
  width: 320px;
  height: 120px;
  font-size: 35px;
  border-radius: 10px;
  opacity: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  background: linear-gradient(
    110deg,
    rgba(55, 89, 238, 0.64) 11%,
    rgba(30, 157, 244, 0.37) 89%
  );
}
.action.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #4f5478;
}
.el-loading-mask {
  background-color: rgba(100, 100, 100, 0.5);
}
</style>
