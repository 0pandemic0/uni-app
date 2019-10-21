import Vue from 'vue'

import {
  PAGE_CREATE,
  MOUNTED_DATA,
  UPDATED_DATA,
  PAGE_CREATED,
  VD_SYNC_CALLBACK
} from '../../../constants'

import {
  VDomSync
} from './vdom-sync'

import {
  setCurrentPage
} from '../page'

import {
  getPageVueComponent
} from '../../../page-factory'

let vd

let PageVueComponent

const handleData = {
  [PAGE_CREATE]: function onPageCreate (data) {
    const [pageId, pagePath] = data
    document.title = `${pagePath}[${pageId}]`
    // 设置当前页面伪对象，方便其他地方使用 getCurrentPages 获取当前页面 id，route
    setCurrentPage(pageId, pagePath)
    // 初始化当前页面 VueComponent（生成页面样式代码）
    PageVueComponent = getPageVueComponent(pagePath)
    // 生成当前页面 vd
    vd = new VDomSync(pageId)
  },
  [MOUNTED_DATA]: function onMounted (data) {
    vd.addVData.apply(vd, data)
  },
  [UPDATED_DATA]: function onUpdated (data) {
    vd.updateVData.apply(vd, data)
  },
  [PAGE_CREATED]: function onPageCreated (data) {
    const [pageId, pagePath] = data
    new PageVueComponent({
      mpType: 'page',
      pageId,
      pagePath
    }).$mount('#app')
  }
}

function vdSync ({
  data,
  options
}) {
  let isVdCallback = true
  data.forEach(data => {
    if (data[0] === PAGE_CREATE) { // 页面创建无需触发 callback
      isVdCallback = false
    }
    handleData[data[0]](data[1])
  })
  vd.flush()
  isVdCallback && Vue.nextTick(() => {
    UniViewJSBridge.publishHandler(VD_SYNC_CALLBACK)
  })
}

function getData (id, name, isFallbackContent = false) {
  try {
    return this.$r[id][name]
  } catch (e) {
    !isFallbackContent && console.error(this.$options.__file + `:[${this._$id}]$r[${id}][${name}] is undefined`)
  }
}

export function initData (Vue) {
  Vue.prototype._$g = getData

  UniViewJSBridge.subscribe('vdSync', vdSync)

  Object.defineProperty(Vue.prototype, '_$vd', {
    get () {
      return !this.$options.isReserved && vd
    }
  })

  Vue.mixin({
    beforeCreate () {
      if (this.$options.mpType) {
        this.mpType = this.$options.mpType
      }
      if (this._$vd) {
        this._$vd.initVm(this)
        console.log(`[${this._$id}] beforeCreate ` + Date.now())
      }
    }
  })
}
