import {
  hasOwn,
  isPlainObject
} from 'uni-shared'

function parseProperty (name, property, watch) {
  if (!isPlainObject(property)) {
    property = {
      type: property
    }
  }
  const type = [property.type]
  if (Array.isArray(property.optionalTypes)) {
    type.push(...property.optionalTypes)
  }
  const prop = Object.create(null)
  prop.type = type.filter(sType => sType !== null) // remove null
  if (!prop.type.length) {
    delete prop.type
  }
  if (hasOwn(property, 'value')) {
    prop['default'] = property.value
  }
  if (hasOwn(property, 'observer')) {
    watch[name] = {
      mounted: true, // 调整小程序的 observer 首次触发时机,放到 mounted 之后再触发
      handler: property.observer
      // immediate: true
    }
  }
  return prop
}

export function parseProperties (properties, vueComponentOptions) {
  if (!properties) {
    return
  }
  const props = Object.create(null)
  const {
    watch
  } = vueComponentOptions
  Object.keys(properties).forEach(name => {
    props[name] = parseProperty(name, properties[name], watch)
  })
  vueComponentOptions.props = props
}
