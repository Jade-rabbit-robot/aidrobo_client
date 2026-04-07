<template>
  <div class="calibration-root">
    <div class="card-container">
      <div class="card">
        <div class="card-header">
          <h3>上相机（Up）</h3>
          <div :class="['status-badge', statusClass(upStatus)]">{{ upStatus }}</div>
        </div>
        <div class="card-actions">
          <button
            class="calib-btn"
            :class="{ pressed: upPressed }"
            @mousedown.prevent="onUpMouseDown"
            @mouseup.prevent="onUpMouseUp"
            @touchstart.prevent="onUpMouseDown"
            @touchend.prevent="onUpMouseUp"
          >
            标定上相机
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>下相机（Down）</h3>
          <div :class="['status-badge', statusClass(downStatus)]">{{ downStatus }}</div>
        </div>
        <div class="card-actions">
          <button
            class="calib-btn"
            :class="{ pressed: downPressed, disabled: !upCalibrated }"
            :disabled="!upCalibrated"
            @mousedown.prevent="onDownMouseDown"
            @mouseup.prevent="onDownMouseUp"
            @touchstart.prevent="onDownMouseDown"
            @touchend.prevent="onDownMouseUp"
          >
            标定下相机
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal" @click.stop>
        <h4>{{ modalTitle }}</h4>
        <p>{{ modalMessage }}</p>
        <div class="modal-actions">
          <button @click="closeModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalibrationPage",
  data() {
    return {
      upStatus: "未标定",
      downStatus: "未标定",
      upCalibrated: false,
      upParams: null,
      downParams: null,
      upLastMsg: "",
      downLastMsg: "",
      upPressed: false,
      downPressed: false,
      showModal: false,
      modalTitle: "",
      modalMessage: ""
    };
  },
  mounted() {
    this.$message("相机需要在静止状态下进行标定，且标定完成后需要重启程序");
    this.initSubscribe();
  },
  methods: {
    statusClass(status) {
      switch (status) {
        case "未标定":
          return "unset";
        case "正在标定":
          return "running";
        case "标定完成":
          return "success";
        case "标定失败":
          return "fail";
        default:
          return "";
      }
    },
    initSubscribe() {
      rgbdCalibStatusTopic.subscribe(res => {
        console.log("up status", res);
        const statusLabel = ["未标定", "正在标定", "标定完成", "标定失败", "标定失败"];
        this.upStatus = statusLabel[res.data];
      });
    },
    onUpMouseDown() {
      this.upPressed = true;
      this.callUpService();
    },
    onUpMouseUp() {
      this.upPressed = false;
    },
    onDownMouseDown() {
      if (!this.upCalibrated) {
        this.openModal("提示", "请先标定上相机");
        return;
      }
      this.downPressed = true;
      this.callDownService();
    },
    onDownMouseUp() {
      this.downPressed = false;
    },
    callUpService() {
      this.upLastMsg = "";
      const req = new ROSLIB.ServiceRequest({});
      UpCalibService.callService(
        req,
        res => {
          this.upLastMsg = res.message || "";
          if (res.success) {
            this.upCalibrated = true;
            if (res.message) this.upParams = res.message;
          } else {
            const msg = (res.message || "").toLowerCase();
            if (msg.includes("平面系数") || msg.includes("plane")) {
              this.openModal("请清理", "检测到平面系数异常：请清理相机前方杂物后重试。");
            }
          }
        },
        err => {
          console.error("Up service error:", err);
          this.upLastMsg = String(err || "service call error");
        }
      );
    },
    callDownService() {
      this.downStatus = "正在标定";
      this.downLastMsg = "";
      const req = new ROSLIB.ServiceRequest({});
      DownCalibService.callService(
        req,
        res => {
          this.downLastMsg = res.message || "";
          if (res.success) {
            this.downStatus = "标定完成";
            if (res.message) this.downParams = res.message;
          } else {
            const msg = (res.message || "").toLowerCase();
            if (msg.includes("done")) {
              this.downStatus = "标定失败";
              this.openModal("标定失败", "下相机标定日志包含 'done'，标定被判定为失败。请检查配置或环境。");
            } else {
              this.downStatus = "标定失败";
              this.openModal("标定失败", res.message || "下相机标定失败");
            }
          }
        },
        err => {
          console.error("Down service error:", err);
          this.downLastMsg = String(err || "service call error");
          this.downStatus = "标定失败";
        }
      );
    },
    openModal(title, message) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
.calibration-root {
  padding: 28px;
  background: linear-gradient(155deg, rgba(71, 84, 141, 0.64) 24%, rgba(71, 66, 124, 0.52) 98%);
  min-height: 100%;
  box-sizing: border-box;
  line-height: 1.3em;
}
.card-container {
  display: flex;
  justify-content: center;
  gap: 28px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.card {
  flex: 1;
  min-height: 420px;
  background: rgba(71, 105, 180, 0.75);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(18, 42, 66, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h3 {
  margin: 0;
  color: #fff;
}
.status-badge {
  padding: 8px 12px;
  border-radius: 16px;
  color: white;
  font-size: 28px;
}
.status-badge.unset {
  background: #888;
}
.status-badge.running {
  background: #f39c12;
}
.status-badge.success {
  background: #16a34a;
}
.status-badge.fail {
  background: #dc2626;
}
.card-actions {
  margin-top: auto;
  display: flex;
  justify-content: center;
}
.calib-btn {
  width: 300px;
  height: 120px;
  border-radius: 10px;
  border: none;
  font-size: 35px;
  font-weight: 400;
  color: #fff;
  background: linear-gradient(110deg, rgba(55, 89, 238, 0.64) 11%, rgba(30, 157, 244, 0.37) 89%);
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  cursor: pointer;
  transition: transform 0.08s, filter 0.12s;
}
.calib-btn.pressed {
  transform: translateY(1px);
  filter: brightness(0.82);
}
.calib-btn.disabled {
  background: rgba(71, 84, 141, 0.4);
  cursor: not-allowed;
  color: #e0eaf5;
  box-shadow: none;
}
.modal-backdrop {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 50, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal {
  background: rgba(71, 105, 180, 0.85);
  padding: 18px;
  border-radius: 10px;
  min-width: 320px;
  max-width: 70vw;
  color: #fff;
}
.modal h4 {
  margin: 0 0 10px;
}
.modal p {
  margin: 0;
  line-height: 1.6;
}
.modal-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}
.modal-actions button {
  min-width: 120px;
  height: 52px;
  border: none;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(110deg, rgba(55, 89, 238, 0.8) 11%, rgba(30, 157, 244, 0.55) 89%);
}
</style>