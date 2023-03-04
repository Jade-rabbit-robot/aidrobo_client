<template>
  <div class="main">
    <div>
      <img src="@/assets/img/relocation.svg" alt="relocation" />
    </div>
    <div class="content">请选择当前需要执行的重定位操作</div>
    <div class="btnBox">
      <div class="common">自动重定位</div>
      <div class="common">自动重定位</div>
      <div class="common">自动重定位</div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
}

.btnBox {
  position: absolute;
  bottom: 140px;
  width: 100%;
  display: flex;
  justify-content: space-evenly;

  .common {
    width: 380px;
    height: 120px;
    border-radius: 10px;
    background: linear-gradient(106deg, #596AB5 10%, rgba(66, 82, 146, 0.53) 89%);
    backdrop-filter: blur(10.88px);
    box-shadow: 0px 2px 10px 0px rgba(1, 29, 90, 0.72);
    text-align: center;
    line-height: 120px
  }
}
</style>
