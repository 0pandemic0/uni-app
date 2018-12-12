const TODOS = [ // 不支持的 API 列表
  'hideTabBar',
  'hideTabBarRedDot',
  'removeTabBarBadge',
  'setTabBarBadge',
  'setTabBarItem',
  'setTabBarStyle',
  'showTabBar',
  'showTabBarRedDot',
  'startPullDownRefresh',
  'saveImageToPhotosAlbum',
  'getRecorderManager',
  'getBackgroundAudioManager',
  'createInnerAudioContext',
  'chooseVideo',
  'saveVideoToPhotosAlbum',
  'createVideoContext',
  'openDocument',
  'startAccelerometer',
  'startCompass',
  'addPhoneContact',
  'createIntersectionObserver'
]

function _handleNetworkInfo (result) {
  switch (result.networkType) {
    case 'NOTREACHABLE':
      result.networkType = 'none'
      break
    case 'WWAN':
      // TODO ?
      result.networkType = '3g'
      break
    default:
      result.networkType = result.networkType.toLowerCase()
      break
  }
  return result
}

const protocols = { // 需要做转换的 API 列表
  returnValue (methodName, res) { // 通用 returnValue 解析
    if (res.error || res.errorMessage) {
      res.errMsg = `${methodName}:fail ${res.errorMessage || res.error}`
      delete res.error
      delete res.errorMessage
    }
    return res
  },
  request: {
    name: 'httpRequest',
    args (fromArgs) {
      if (!fromArgs.header) { // 默认增加 header 参数，方便格式化 content-type
        fromArgs.header = {}
      }
      return {
        header (header = {}, toArgs) {
          const headers = {
            'content-type': 'application/json'
          }
          Object.keys(header).forEach(key => {
            headers[key.toLocaleLowerCase()] = header[key]
          })
          return {
            name: 'headers',
            value: headers
          }
        },
        method: 'method', // TODO 支付宝小程序仅支持 get,post
        responseType: false
      }
    },
    returnValue: {
      status: 'statusCode',
      headers: 'header'
    }
  },
  setNavigationBarColor: {
    name: 'setNavigationBar',
    args: {
      frontColor: false,
      animation: false
    }
  },
  setNavigationBarTitle: {
    name: 'setNavigationBar'
  },
  showModal ({
    showCancel = true
  } = {}) {
    if (showCancel) {
      return {
        name: 'confirm',
        args: {
          cancelColor: false,
          confirmColor: false,
          cancelText: 'cancelButtonText',
          confirmText: 'confirmButtonText'
        },
        returnValue (fromRes, toRes) {
          toRes.confirm = fromRes.confirm
          toRes.cancel = !fromRes.confirm
        }
      }
    }
    return {
      name: 'alert',
      args: {
        confirmColor: false,
        confirmText: 'buttonText'
      },
      returnValue (fromRes, toRes) {
        toRes.confirm = true
        toRes.cancel = false
      }
    }
  },
  showToast ({
    icon = 'success'
  } = {}) {
    const args = {
      title: 'content',
      icon: 'type',
      duration: false,
      image: false,
      mask: false
    }
    if (icon === 'loading') {
      return {
        name: 'showLoading',
        args
      }
    }
    return {
      name: 'showToast',
      args
    }
  },
  showActionSheet: {
    name: 'showActionSheet',
    args: {
      itemList: 'items',
      itemColor: false
    },
    returnValue: {
      index: 'tapIndex'
    }
  },
  uploadFile: {
    args: {
      name: 'fileName'
    }
    // 从测试结果看，是有返回对象的，文档上没有说明。
  },
  downloadFile: {
    returnValue: {
      tempFilePath: 'apFilePath'
    }
  },
  connectSocket: {
    args: {
      method: false,
      protocols: false
    }
    // TODO 有没有返回值还需要测试下
  },
  chooseImage: {
    returnValue: {
      tempFilePaths: 'apFilePaths'
    }
  },
  previewImage: {
    args (fromArgs) {
      let current = 0
      if (fromArgs.current) {
        const index = fromArgs.urls.indexOf(fromArgs.current)
        current = ~index ? index : 0
      }
      return Object.assign(fromArgs, {
        current: current,
        indicator: false,
        loop: false
      })
    }
  },
  saveFile: {
    args: {
      tempFilePath: 'apFilePath'
    },
    returnValue: {
      savedFilePath: 'apFilePath'
    }
  },
  getSavedFileInfo: {
    args: {
      filePath: 'apFilePath'
    },
    returnValue (result) {
      if (result.fileList && result.fileList.length) {
        result.fileList.forEach(file => {
          file.filePath = file.apFilePath
          delete file.apFilePath
        })
      }
      return result
    }
  },
  removeSavedFile: {
    args: {
      filePath: 'apFilePath'
    }
  },
  getLocation: {
    args: {
      type: false,
      altitude: false
    },
    returnValue: {
      speed: false,
      altitude: false,
      verticalAccuracy: false
    }
  },
  openLocation: {
    args: {
      // TODO address 参数在阿里上是必传的
    }
  },
  createMapContext: {
    // TODO
    returns: {
      translateMarker: false,
      includePoints: false,
      getRegion: false,
      getScale: false
    }
  },
  getSystemInfo: {
    returnValue: {
      brand: false,
      statusBarHeight: false,
      SDKVersion: false
    }
  },
  getSystemInfoSync: {
    returnValue: {
      brand: false,
      statusBarHeight: false,
      SDKVersion: false
    }
  },
  getNetworkType: {
    returnValue: _handleNetworkInfo
  },
  onNetworkStatusChange: {
    returnValue: _handleNetworkInfo
  },
  stopAccelerometer: {
    name: 'offAccelerometerChange'
  },
  stopCompass: {
    name: 'offCompassChange'
  },
  scanCode: {
    name: 'scan',
    args: {
      onlyFromCamera: 'hideAlbum',
      scanType: false
    }
  },
  setClipboardData: {
    name: 'setClipboard',
    args: {
      data: 'text'
    }
  },
  getClipboardData: {
    name: 'getClipboard',
    returnValue: {
      data: 'text'
    }
  },
  pageScrollTo: {
    args: {
      duration: false
    }
  }
}

TODOS.forEach(todoApi => {
  protocols[todoApi] = false
})

export default protocols
