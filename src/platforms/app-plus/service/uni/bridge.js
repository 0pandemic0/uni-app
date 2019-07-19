import initOn from 'uni-core/service/bridge/on'

let bridge

export function initServiceJSBridge (Vue, instanceContext) {
  if (bridge) {
    return bridge
  }
  const Emitter = new Vue()

  bridge = {
    on: Emitter.$on.bind(Emitter),
    off: Emitter.$off.bind(Emitter),
    once: Emitter.$once.bind(Emitter),
    emit: Emitter.$emit.bind(Emitter)
  }

  initOn(bridge.on, instanceContext)

  return bridge
}
