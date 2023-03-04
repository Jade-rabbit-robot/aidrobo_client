<template>
  <div class="main">
    <div class="box">
      <div v-for="(item, i) in imgSrc" :key="i">
        <router-link :to="item.link||'#'" class="link">
          <img :src="item.src" />
          <p>{{ item.text }}</p>
        </router-link>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      imgSrc: [
        { src: require("@/assets/img/uti/uti1.svg"), text: '重定位', link: "/utility/relocation" },
        { src: require("@/assets/img/uti/uti2.svg"), text: '去位置点', link: "/utility/goPoint" },
        { src: require("@/assets/img/uti/uti3.svg"), text: '自主巡逻', link: "/utility/patrol" },
        { src: require("@/assets/img/uti/uti4.svg"), text: '返回原点/充电', link: "/utility/charge" },
        { src: require("@/assets/img/uti/uti5.svg"), text: '遥控模式', link: "/utility/telecontrol" },
        { src: require("@/assets/img/uti/uti6.svg"), text: '特征跟随', link: "/utility/following" },
        { src: require("@/assets/img/uti/uti7.svg"), text: '识物分类' },
        { src: require("@/assets/img/uti/uti8.svg"), text: '资源看板' },
      ],
      data: null,
      isSel: null
    };
  },
}
</script>

<style lang="less" scoped>
.box {
  display: flex;
  flex-wrap: wrap;
  color: #fff;
  height: 740px;
  align-content: space-between;
  margin-top: 150px;

  & div {
    width: 330px;
    height: 330px;
    border-radius: 20px;
    background: linear-gradient(132deg, rgba(71, 84, 141, 0.64) 17%, rgba(53, 81, 119, 0.15) 92%, rgba(53, 92, 119, 0.14) 93%);
    backdrop-filter: blur(10.88px);
    box-shadow: 0px 2px 31px 0px rgba(1, 29, 90, 0.72);
    margin-left: 120px;


    .link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      & img {
        width: 300px;
      }

      & p {
        position: absolute;
        bottom: 40px;
        text-align: center;
        width: 300px;
        color: #fff;
      }
    }

  }
}
</style>
