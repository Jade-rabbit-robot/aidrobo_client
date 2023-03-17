<template>
  <div class="newMapBox">
    <ShowMap />
    <div class="right">
      <div class="titleBox">
        <p>地图名称：</p>
        <p class="mapName">xxxxxx</p>
      </div>
      <div class="iconBtn" @click="onStop()">
        <img src="@/assets/img/seeMap/use.svg" />
        <p>使用地图</p>
      </div>
      <div class="iconBtn" @click="onStop()">
        <img src="@/assets/img/seeMap/now.svg" />
        <p>当前地图</p>
      </div>
      <div class="iconBtn" @click="onStop()">
        <img src="@/assets/img/seeMap/edit.svg" />
        <p>编辑地图</p>
      </div>
      <div class="over" @click="onOver()">
        <img src="@/assets/img/del.svg" />
        <p>删除地图</p>
      </div>
    </div>
  </div>
</template>

<script>
import ShowMap from "@/components/map/new";

export default {
  components: {
    ShowMap
  },
  data () {
    return {
      overText: '保存地图',
      rubber: false,
      stop: false,
    }
  },
  methods: {
    onRubber () {
      this.rubber = true;
      this.overText = '完成'
    },
    onStop () {
      this.stop = true
      this.overText = '完成'
    },
    onOver () {
      if (this.rubber || this.stop) {
        this.rubber = false
        this.stop = false
        this.overText = '保存地图'
        return
      }
      this.$confirm(`<div>是否确认完成扫描，确认后将生成地图进入编辑</div><div>（无法返回）</div>`, '完成扫描', {
        confirmButtonText: '取消',
        cancelButtonText: '确定',
        dangerouslyUseHTMLString: true,
        center: true
      }).then(() => {
        console.log('[  ]-69',)
      }).catch(() => {
        console.log('[  ]-72',)
      });
    },
    onOut () {
      this.$confirm(`<div>是否确认退出</div><div>（请确认所做操作已保存）</div>`, '退出编辑', {
        confirmButtonText: '取消',
        cancelButtonText: '确定',
        dangerouslyUseHTMLString: true,
        center: true
      }).then(() => {
        console.log('[  ]-69',)
      }).catch(() => {
        this.$router.push('/map')
        console.log('[  ]-72',)
      });
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
}

.iconBtn {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 300px;
  height: 120px;
  border-radius: 10px;
  opacity: 1;
  background: linear-gradient(110deg, rgba(71, 84, 141, 0.64) 11%, rgba(53, 81, 119, 0.15) 88%, rgba(53, 92, 119, 0.14) 89%);
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);


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

.over {
  width: 300px;
  height: 120px;
  border-radius: 10px;
  opacity: 1;
  background: #D94040;
  box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
}</style>
