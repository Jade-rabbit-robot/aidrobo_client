import Vue from 'vue'
import Router from 'vue-router'
// import patrol from '@/components/tool/patrol'
// import charge from '@/components/tool/charge'
// import point from '@/components/tool/point'
// import control from '@/components/tool/control'
import Home from '@/views/home'

import Utility from '@/views/utility/index'

import relocation from '@/views/utility/relocation'
import goPoint from '@/views/utility/goPoint'
import patrol from '@/views/utility/patrol'
import charge from '@/views/utility/charge'
import telecontrol from '@/views/utility/telecontrol'
import following from '@/views/utility/following'

import Site from '@/views/site'
import Map from '@/views/map/index'
import NewMap from '@/views/map/newMap'
Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}
export default new Router({
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/map',
      component: Map,
      // children: [
      //   {
      //     path: 'control',
      //     name: 'control',
      //     component: control
      //   },
      //   {
      //     path: 'patrol',
      //     name: 'patrol',
      //     component: patrol
      //   },
      //   {
      //     path: 'charge',
      //     name: 'charge',
      //     component: charge
      //   },
      //   {
      //     path: 'point',
      //     name: 'point',
      //     component: point
      //   }
      // ]
    },
    {
      path: '/newMap',
      name: 'newMap',
      component: NewMap,
    },
    {
      path: '/site',
      component: Site,
    },
    {
      path: '/utility',
      component: Utility,
    },
    {
      path: '/utility/relocation',
      component: relocation,
    },
    {
      path: '/utility/goPoint',
      component: goPoint,
    },
    {
      path: '/utility/patrol',
      component: patrol,
    },
    {
      path: '/utility/charge',
      component: charge,
    },
    {
      path: '/utility/telecontrol',
      component: telecontrol,
    },
    {
      path: '/utility/following',
      component: following,
    },
  ]
})
