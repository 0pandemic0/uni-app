import './polyfill'

import apis from 'uni-helpers/apis'

import {
  wrapper,
  wrapperUnimplemented
} from 'uni-helpers/api'

import {
  promisify
} from 'uni-helpers/promise'

import baseApi from 'uni-core/service/api'

import platformApi from 'uni-platform/service/api'

const api = Object.create(null)

Object.assign(api, baseApi)
Object.assign(api, platformApi)

const uni = Object.create(null)

apis.forEach(name => {
  if (api[name]) {
    uni[name] = promisify(name, wrapper(name, api[name]))
  } else {
    uni[name] = wrapperUnimplemented(name)
  }
})
