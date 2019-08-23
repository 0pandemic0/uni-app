import {
  isPlainObject
} from 'uni-shared'

const CLASS_RE = /^\s+|\s+$/g
const WXS_CLASS_RE = /\s+/

function getWxsClsArr (clsArr, classList, isAdd) {
  const wxsClsArr = []

  let checkClassList = function (cls) {
    if (isAdd) {
      checkClassList = function (cls) {
        return !classList.contains(cls)
      }
    } else {
      checkClassList = function (cls) {
        return classList.contains(cls)
      }
    }
    return checkClassList(cls)
  }

  clsArr.forEach(cls => {
    cls = cls.replace(CLASS_RE, '')
    checkClassList(cls) && wxsClsArr.push(cls)
  })
  return wxsClsArr
}

function parseStyleText (cssText) {
  const res = {}
  const listDelimiter = /;(?![^(]*\))/g
  const propertyDelimiter = /:(.+)/
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      const tmp = item.split(propertyDelimiter)
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim())
    }
  })
  return res
}

class ComponentDescriptor {
  constructor (vm) {
    this.$vm = vm
    this.$el = vm.$el
  }

  selectComponent (selector) {
    if (!this.$el || !selector) {
      return
    }
    const el = this.$el.querySelector(selector)
    return el && el.__vue__ && createComponentDescriptor(el.__vue__)
  }

  selectAllComponents (selector) {
    if (!this.$el || !selector) {
      return []
    }
    const descriptors = []
    this.$el.querySelectorAll(selector).forEach(el => {
      el.__vue__ && descriptors.push(createComponentDescriptor(el.__vue__))
    })
    return descriptors
  }

  setStyle (style) {
    if (!this.$el || !style) {
      return this
    }
    if (typeof style === 'string') {
      style = parseStyleText(style)
    }
    if (isPlainObject(style)) {
      this.$el.__wxsStyle = style
    }
    return this
  }

  addClass (...clsArr) {
    if (!this.$el || !clsArr.length) {
      return this
    }

    const wxsClsArr = getWxsClsArr(clsArr, this.$el.classList, true)
    if (wxsClsArr.length) {
      const wxsClass = this.$el.__wxsClass || ''
      this.$el.__wxsClass = wxsClass + (wxsClass ? ' ' : '') + wxsClsArr.join(' ')
      this.$vm.$forceUpdate()
    }

    return this
  }

  removeClass (...clsArr) {
    if (!this.$el || !clsArr.length) {
      return this
    }
    const oldWxsClsArr = (this.$el.__wxsClass || '').split(WXS_CLASS_RE)
    const wxsClsArr = getWxsClsArr(clsArr, this.$el.classList, false)
    if (wxsClsArr.length) {
      oldWxsClsArr.length && wxsClsArr.forEach(cls => {
        const clsIndex = oldWxsClsArr.findIndex(oldCls => oldCls === cls)
        if (clsIndex !== -1) {
          oldWxsClsArr.splice(clsIndex, 1)
        }
      })
      this.$el.__wxsClass = oldWxsClsArr.join(' ')
      this.$vm.$forceUpdate()
    }

    return this
  }

  hasClass (cls) {
    return this.$el && this.$el.classList.contains(cls)
  }

  getDataset () {
    return this.$el && this.$el.dataset
  }

  callMethod (funcName, args = {}) {
    // TODO 需跨平台
    return (this.$vm[funcName] && this.$vm[funcName](JSON.parse(JSON.stringify(args))), this)
  }

  requestAnimationFrame (callback) {
    return (global.requestAnimationFrame(callback), this)
  }

  getState () {
    return this.$el && (this.$el.__wxsState || (this.$el.__wxsState = {}))
  }

  triggerEvent (eventName, detail = {}, options = {}) {
    // TODO options
    return (this.$vm.$emit(eventName, detail), this)
  }
}

export function createComponentDescriptor (vm) {
  if (vm && vm.$el) {
    if (!vm.$el.__wxsComponentDescriptor) {
      vm.$el.__wxsComponentDescriptor = new ComponentDescriptor(vm)
    }
    return vm.$el.__wxsComponentDescriptor
  }
}
