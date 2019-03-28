import Vue from 'vue'

import {
  isFn
} from 'uni-shared'

import {
  handleLink
} from 'uni-platform/runtime/wrapper/index'

import {
  getData,
  initHooks,
  handleEvent,
  baiduPageDestroy
} from './util'

const hooks = [
  'onShow',
  'onHide',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
  'onPageScroll',
  'onResize',
  'onTabItemTap',
  'onBackPress',
  'onNavigationBarButtonTap',
  'onNavigationBarSearchInputChanged',
  'onNavigationBarSearchInputConfirmed',
  'onNavigationBarSearchInputClicked'
]

export function createPage (vueOptions) {
  vueOptions = vueOptions.default || vueOptions
  let VueComponent
  if (isFn(vueOptions)) {
    VueComponent = vueOptions
    vueOptions = VueComponent.extendOptions
  } else {
    VueComponent = Vue.extend(vueOptions)
  }
  const pageOptions = {
    data: getData(vueOptions, Vue.prototype),
    onLoad (args) {
      if (__PLATFORM__ === 'mp-baidu') {
        this.$baiduComponentInstances = Object.create(null)
      }

      this.$vm = new VueComponent({
        mpType: 'page',
        mpInstance: this
      })

      this.$vm.__call_hook('created')
      this.$vm.__call_hook('onLoad', args) // 开发者可能会在 onLoad 时赋值，提前到 mount 之前
      this.$vm.$mount()
    },
    onReady () {
      this.$vm._isMounted = true
      this.$vm.__call_hook('mounted')
      this.$vm.__call_hook('onReady')
    },
    onUnload () {
      this.$vm.__call_hook('onUnload')
      if (__PLATFORM__ === 'mp-baidu') { // 百度组件不会在页面 unload 时触发 detached
        baiduPageDestroy(this.$vm)
      } else {
        this.$vm.$destroy()
      }
    },
    __e: handleEvent,
    __l: handleLink
  }

  initHooks(pageOptions, hooks)

  return Page(pageOptions)
}
