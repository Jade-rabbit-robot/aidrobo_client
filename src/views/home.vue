<template>
  <div class="homeBox">
    <router-link to="/utility">
      <div class="item">
        <img src="@/assets/img/home1.svg" />
        <p>应用功能</p>
      </div>
    </router-link>
    <router-link to="/map">
      <div class="item"> <img src="@/assets/img/home2.svg" />
        <p>地图管理</p>
      </div>
    </router-link>
    <router-link to="/site">
      <div class="item"> <img src="@/assets/img/home3.svg" />
        <p>设置</p>
      </div>
    </router-link>

  </div>
</template>

<script>
export default {
  data () {
    return {
      showTc: true
    };
  },
};
</script>

<style scoped>
.homeBox {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  height: calc(100% - 120px);
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: #fff;
  top: 234px;
  width: 500px;
  height: 700px;
  border-radius: 20px;
  opacity: 1;
  background: linear-gradient(142deg,
      rgba(71, 84, 141, 0.64) 20%,
      rgba(53, 81, 119, 0.15) 94%,
      rgba(53, 92, 119, 0.14) 95%);
  backdrop-filter: blur(10.88px);
  box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
}
</style>
