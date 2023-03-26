<template>
  <div class="map" ref="map">
    <div class="fa_map_box1">
      <div class="map_box1" ref="map_box1" v-bind:style="{ transform: 'translate(' + left + 'px,' + top + 'px)' }">
        <img id="img1" :src="mapData.src" @load="init" ref="img1" />
        <!-- <img id="img1"
          src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCABZAFcDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDyOiiiv9UD/awKKqa7rukeGdIn13Xb9La0tk3zTSdFHQDA5JJIAAySSAASa5rwD8b/AAV8QUvnsWnsP7Pg8+4GqNFERHzufh2+VcDcTgDcvrXRTwmKq0ZVoQbjHRvpqeNjOIcjy/M6WXYnEQhXqpuEG7Sajdt26LR2btezSvZnUapqul6JYvqmtalb2dtFjzbi6mWONMkAZZiAMkgfU1Jd3drYWst9fXMcMEMbSTTSuFSNAMlmJ4AA5JNfKv7RXx70/wCI/i218K6bM9tpdnuezmkkIFzMeBJIh+6uAQmRuAZicbiq+Uav4y8S675fhu0uZntbRJI44JZWaO3LnLmMZwmSM8dTzX3GX8BYrF4aFStU9m3q01ey6dVr37X8tf5c4v8ApaZFw9nWKweX4T63TptQpzjU5eeorc+nI/cV/da+Llum1K8ftD4WfHrwP8Xb2507wzFfRTW0RkZLyFRvUMFbBRmHBZcg4PzDGcHHa187/ss/s3+PPBPiKz8deKNlhBEkjpYSndPKzw7VJUcRjEhzuO4FMFRnI+iK+a4gwmW4PMXTwNTnhZdb2fVX69/mftnhBn/G3EnBlPG8VYT6vinKSs1yuULJxly7x3cbNJ+7frdlFFFeIfqAUUUUAFYfjn4ieFPh3p6X3ia/KNPuFpbRIXluGVclVUfgNxwoLLkjIqfxl4y0HwHoMviHxDdeXCh2xxrgvNIQcRoCRljg+wAJJABI+NvjL8WG+J/inUJRqL29xcAJGscxMMSIMLbhm5weSSMKWZjjBIr6fhvh2rndfmndUo7tfl+r+7qfhvjV4yYHwwylU8M4VMdV+CnJ7LX3mrrdrlim1dvm1UWnb+OP7SPiXx3eyWH23EUU7PbWkJHk2hxt4OAZZAM/O3ALNtChiB5vpfjDWtNSdfPSfzTuP2oFyH6bgc9fr6VmSRyQyNFKhVlOGVhgg+lXdD8PXuuSnycRwof3s7j5V/xPtX7nhsuy/LsIqVOKUF/X9d/U/wAqM84y4w4y4ilj8VXnUxE2+r06W7WS06KKSSSiklY0rQNT8QTnUb0yeUzZkmc8v64J619p/AD4J/DbwB4VsPEfhvT3uru/tIbpdR1GFPPQPEOEAyIgQzZAJPzYLMAMcr+z9+zLb6No9nrvj+3eQplrXRryJHXYysMzq6n5vmDBBjYVGcnKr7hX5PxlxOsfL6phZvkTd7PR+Xn+Xqf6DfRr8C58JUf9Ys9w8frNSMXTVSN6lNvVzve0G72Sa59Ltx1TKKKK/PT+wwooooAKKKKAMb4geD4fHvg+98Jz6hJai7RdlxEoYxurq6nB+8NyjI4yMjI6j4e+NHh9tA8Qy2t1ZR+fBNLa3FzaudjTRyFW6rkjjjocfTFffVeV/tI/A3S/H/h+68SaVpMkmpxxr9ogtUBa7QYG7H/PRF5UjJYLsw3y7fs+Dc+hlWNVKs/3cn9zemvk9PJWXmz+aPpJeEuI8QOGZZhlsU8XQjqtW5043laK1XNFuTVlzNSaTbUYv4z02W31nX4X8R3zCORwJpmOOAMAE9ugGfxr62/ZK8DfD+30yfxHpjtPqdowhWKeJFFmrRglowrsWDkuvnNgsFYAL8275G1/Qrvw/qDWNyQykboZlHyyKejCu0+CHxf1fwD4msbhLyQGCULHiXaJoiRutnJBGxgOCQdpwRyBj9Q4my3E5rlUo4WpbTZbNdvns/L5p/wj4HcbZNwBx9TrZ9hFUfPZzlrOEnpzLdNxfvRuneWzTalH7vorK8GeNNA8e6DF4h8O3RkhclZY3GJIJBjdG6/wsMj2IIIJBBOrX8/1KdSlUcJqzWjTP9fMHjMJmGFhicNNTpzSlGUXdNPZproFUPEnijw74Q0t9Z8T6zb2VsmR5k8mNzBS21R1diFOFUEnHANZPxS+KPh/4V+Hzq+rkzXM2U0/T42xJcyDsOu1RkbmxgAjqSqn5I+M3x18S+M9WS+1u4hkvIowlva26kW9kDjdtUkkuxGSSSenOAoH0nD/AAzi87qKT92n37+n6vb1eh+K+L/jlw/4XYSVFNVcZZNQ6Rvs5ta3a1jBe89G+WL5j3vSP2rdP1/x/ZaPHpUel6GzMLu+1Rj5x3J8hAQ7YgJOCSWG05JTBr1bWdf0Hw5are+IdbtLCF5BGk17crErOQSFBYgE4BOPY1+c9jr+p2OrjWluWeYtmQsf9YO6n2NeleHLH4xfHjxDo+g+HHmmsNKgU2qaheKiW0AkTeeTuKAsq/KGbaqgZCgD7HNuBMFSlCpCqqVOK95vy1vdvdv5W2StZ/zd4e/Su4mx9HE4OvgZ43G1ai9hGC25uWPK4wjpCMVfRcylfmlLn5o/atpd2t/axX1jcxzQTRrJDNE4ZJEIyGUjggjkEUVlfD3w/q/hXwTpvhzXNTju7mytVieaKPaoA+6g4GQq4QMQC23JAJIor8rrRhCrKMHdJuz7rv8AM/vjLq+IxWX0a2IpunUlGLlB2vGTSbi7Nq8Xpo2tNGzZooorM7D55/aj/ZvN/BeeN/DW9oJJnur6I5drWViS8q9zExOWH8B+b7udny3qGn3el3smn30RSWJsOp/z0xzX6VV8jftO/s/TeFNYfUNC011sJudKn8wvnC5a2ckZDDDFM53KB8xIbH6xwRxRKb+o4qW3wv8AT1X4rV7Nv/Pv6UfgRQw8XxXkFJpN/voJOyb1UkktIyemtlGVoq6lGMM/9nj9pJfAHicLrlpM9rfQiLUVtoFd52QN5TJkrtYM2DztIZuM7cfQ/wASv2hfCfhHwjb6x4ZvbfVL3U7cyaXArHYEyQZZehRFYEFThiyleMMV+E0eW2mEiEo8bZB7gg1p6x4v1bWYjBKY4VZi0ogBXzCfXnp7V9DmvBuX5lmMMTa38y6Sttfr93RW7Nfjnh/9Jbi/gng7E5I2pt39jJr3qbk/ea+z3lZq3PJz1fNGXRfEv4weIvGmqyX1/rUt7ePEsUl+wCgIP4I1UAIvJ5AGSSepJPEUV2Pwf0H4Y+ItfjsPiLcarDb8+a+nTICi5GHwY2LAfxKPmwcrkjafpeXD5Xg26cPditorXTsv0R+JOvnPHvEcY4rEr21aXx1ZtRvJ6uU3d67uUrt7tmT4e07RLYwahrVxFKZnxBbKdwU5HzSY6AZBx37+lfbvwAn8B33gOK+8EaJ9jZcW+pCVAZmmQbiHkAHmj95uUjAAfAC8qMnRP2Tv2dV0u2lsvB63sbW6FL06rO32gFRiTKSBTu65UAc8ACu48G+BvC3w/wBKfRfCOmG0tXmMrRGeST5yqrnLsSOFUYzjivx/ivibLs7w6p0VUUk+tlH7lJ/ir3P9HvAHwP4w8L84li8wlhJ0alO16bnOqpW0anKlG19U+WXLyu1nozWooor4E/rYKKKKACqmuaHpPiTSZ9D1yxS5tLlNs0MnQjqCCOQQQCCMEEAggirdFVGUoSUouzRnWo0cRRlSqxUoSTTTV009Gmno01o09z4h/aG+B2v/AA81p7m4t/MDAv8AaoUxHdRj/lqo/hYZAdM/KSDyCGby2v0N+Jnwz0D4naEdK1ZBFcRbmsb5UBe3cjB4/iRsAMh4YAdCFYfDHxL+H+qeB9emsLvS5rYpN5cttKMtBJ125HBBBBVhkMCCCetfunB/Ekc3w3sKz/ex3813X9aPTTS/+U/0kPBOt4e5481y2DeBrt21bcJaXjJ23u9L3co+9eTU+XmauaFb6pc6rEujEidW3K4OAmOpPt60/RvDmpa1qBsIYTHs5nklBAiHct/hX1l+zb+zRF4K+y+MvE9nGJvLL21hc2/71HypSaQ5+VgN2Iyp25ViQ4wPXz7P8HkmFc6jvJ7R7s/OPCXwj4l8UM/hh8FFwowadSr0gr6tba9le7a02dus/Zj0LxT4e+GpsfFlhcWszahI8NvcBl2IVQNtRvmjUyCQgEDOS2MNk+h0UV/PmNxUsbi515JJyd7I/wBh+Gcio8M5BhsqpTc40YKClLd272/BdFpqFFFFcp7gUUUUAFFFFABXGfFr4O6b8UIrW4jvIbDULZ9ov2s/NZ4cNmIgOuRuIYEk7cHGNxz2dFb4bFV8HWVWjK0l1/rQ8rO8jyriPLZ5fmNJVKM7Xi7rZ3TTTTTTV00013PP/BP7Ongvwhq1r4huby71K8tUDKLoIIBOMfvVRVyCCDtDM23OeWAYegUUVWKxmKxtTnrzcn5mOQ8N5HwxhHhsroRpQbu0ursldt3bdkldthRRRXMe2FFFFAH/2Q=="
          ref="img1" /> -->
        <div class="robot" v-bind:style="{
          transform:
            'translate(' +
            (xx2(robotPoint.x) * scale - 2) +
            'px,' +
            (yy2(robotPoint.y) * scale - 2) +
            'px)',
        }" v-if="showType != 'see'">
        </div>
        <div class="charge" v-bind:style="{
          transform:
            'translate(' +
            (chargeXY.x * scale - 46) +
            'px,' +
            (chargeXY.y * scale - 124) +
            'px)',
        }" v-else>
          <img id="img1" src="@/assets/img/startPoint.svg" @load="init" ref="img1" />
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapState, mapMutations } from "vuex";
import { changeStr } from "@/assets/common"
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
    };
  },
  computed: {
    ...mapState([
      "robotPoint",
    ])
  },
  mounted () {
    this.$store.state.map_width = this.$refs.map.offsetWidth;
    this.getMap()
  },
  methods: {
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
        robotMap.subscribe(res => {
          this.mapData = changeStr(res)
          this.init()
        })
      }
    },
    init () {
      let img1 = document.getElementById("img1");
      const sc = 1380 / this.mapData.width
      this.scale = sc
      img1.width = this.scale * this.mapData.width
      img1.height = this.scale * this.mapData. height
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
  height: 1010px;
  width: 1380px;
  border-radius: 5px;
  background: #526CAD;
  overflow: auto;
}

.map_box1 {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.robot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  top: 0;
  left: 0;
  z-index: 11;
  background: #ff9b44;
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
