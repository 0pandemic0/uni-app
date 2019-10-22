const {
  ID,
  GET_DATA,
  isVar,
  getForEl,
  updateForEleId,
  processForKey,
  traverseNode
} = require('./util')

const {
  parseIf,
  parseFor,
  parseText,
  parseDirs,
  parseAttrs,
  parseProps,
  parseBinding
} = require('./parser/base-parser')

const parseTag = require('./parser/tag-parser')
const parseEvent = require('./parser/event-parser')
const parseBlock = require('./parser/block-parser')
const parseComponent = require('./parser/component-parser')

const basePreTransformNode = require('./pre-transform-node')

function createGenVar (id) {
  return function genVar (name) {
    return `${GET_DATA}(${id},'${name}')`
  }
}

function parseKey (el) {
  // add default key
  processForKey(el)

  if (el.key) { // renderList key
    const forEl = getForEl(el)
    if (forEl) {
      if (!isVar(forEl.for)) {
        return
      }
      if (forEl === el) { // <view v-for="item in items" :key="item.id"></view>
        el.key = forEl.alias
      } else { // <template v-for="item in items"><view :key="item.id+'1'"></view><view :key="item.id+'2'"></view></template>
        const keyIndex = forEl.children.indexOf(el)
        el.key = `${forEl.alias}['k${keyIndex}']`
      }
    } else {
      isVar(el.key) && (el.key = createGenVar(el.attrsMap[ID])('a-key'))
    }
  }
}

function transformNode (el, parent, state) {
  if (el.type === 3) {
    return
  }
  parseBlock(el)
  parseComponent(el)
  parseEvent(el)
  // 更新 id
  updateForEleId(el, state)

  if (el.type === 2) {
    return parseText(el, parent, {
      index: 0,
      view: true,
      // <uni-popup>{{content}}</uni-popup>
      genVar: createGenVar(parent.attrsMap[ID])
    })
  }

  const genVar = createGenVar(el.attrsMap[ID])

  if (parseFor(el, createGenVar)) {
    if (el.alias[0] === '{') { // <div><li v-for=" { a, b }  in items"></li></div>
      el.alias = '$item'
    }
  }
  parseKey(el)

  parseIf(el, createGenVar)
  parseBinding(el, genVar)
  parseDirs(el, genVar)
  parseAttrs(el, genVar)
  parseProps(el, genVar)
}

function postTransformNode (el) {
  if (!el.parent) { // 从根节点开始递归处理
    traverseNode(el, false, {
      forIteratorId: 0,
      transformNode
    })
  }
}

function handleViewEvents (events) {
  Object.keys(events).forEach(name => {
    const modifiers = Object.create(null)

    let type = name
    const isPassive = type.charAt(0) === '&'
    type = isPassive ? type.slice(1) : type

    const isOnce = type.charAt(0) === '~'
    type = isOnce ? type.slice(1) : type

    const isCapture = type.charAt(0) === '!'
    type = isCapture ? type.slice(1) : type

    isPassive && (modifiers.passive = true)
    isOnce && (modifiers.once = true)
    isCapture && (modifiers.capture = true)

    const eventOpts = events[name]
    if (Array.isArray(eventOpts)) {
      eventOpts.forEach(eventOpt => {
        eventOpt.modifiers && Object.assign(modifiers, eventOpt.modifiers)
      })
    } else {
      eventOpts.modifiers && Object.assign(modifiers, eventOpts.modifiers)
    }
    if (Object.keys(modifiers).length) {
      events[name] = {
        value: `$handleViewEvent($event,${JSON.stringify(modifiers)})`
      }
    } else {
      events[name] = {
        value: `$handleViewEvent($event)`
      }
    }
  })
}

function genData (el) {
  delete el.$parentIterator3

  if (el.model) {
    el.model.callback = `function ($$v) {}`
  }

  // 放在 postTransformNode 中处理的时机太靠前，v-model 等指令会新增 event
  el.events && handleViewEvents(el.events)
  el.nativeEvents && handleViewEvents(el.nativeEvents)
  return ''
}

module.exports = {
  preTransformNode: function (el, options) {
    parseTag(el)
    return basePreTransformNode(el, options)
  },
  postTransformNode,
  genData
}
