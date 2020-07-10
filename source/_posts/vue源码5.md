---
title: Vue.js 源码解读,
categories: [Vue.js 源码解读, 生命周期]
---

## 生命周期是什么

在 Vue 中，每个 Vue 实例从被创建出来到最终销毁都会经历一个过程，在这一过程里会发生许许多多的事情，如：设置数据监听，编译模板，组件挂载等，在 Vue 中，把 Vue 实例从被创建出来到最终被销毁的这一过程称为 Vue 实例的生命周期。

生命周期流程图

![生命周期流程图](https://vue-js.com/learn-vue/assets/img/1.6e1e57be.jpg)

- Vue 实例的生命周期大致可分为 4 个阶段

  - 初始阶段：为 Vue 实例上初始化一些属性，事件已经响应式数据；
  - 模板编译阶段：将模板编译成渲染函数；
  - 挂载阶段：将实例挂载到指定的 DOM 上，即将模板渲染到真实 DOM 中；
  - 销毁阶段：将实例自身从父组件中删除，并取消依赖追踪及事件监听器；

## 初始化阶段

初始化阶段所做的工作大致分为两部分: 第一部分是 new Vue(),即创建一个 Vue 实例; 第二部分是为创建好的 Vue 实例初始化一些事件、属性、响应式数据等。

### new Vue() 都做了什么事

new Vue() 实际上是执行了一个 Vue 类的构造函数，构造函数内部执行 `_init` 方法。`_init` 方法所作的事情就是 new Vue() 所作的事情。

```
export function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
    )
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

- `_init` 方法都做了些什么事情。

  - 首先把 Vue 实例赋值给变量 vm,并且把用户传递的 `options` 选项与当前构造函数的 `options` 属性及其父级构造函数的 `options` 属性进行合并，得到一个新的 `options` 选项赋值给 `$options` 属性，并将 `$options` 属性挂载到 `Vue` 实例上。

  ```
  vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
  )
  ```

  - 接着，通过调用一些初始化函数来为 `Vue` 实例初始化一些属性，事件，响应是数据等。

  ```
  initLifecycle(vm)       // 初始化生命周期
  initEvents(vm)        // 初始化事件
  initRender(vm)         // 初始化渲染
  callHook(vm, 'beforeCreate')  // 调用生命周期钩子函数
  initInjections(vm)   //初始化injections
  initState(vm)    // 初始化props,methods,data,computed,watch
  initProvide(vm) // 初始化 provide
  callHook(vm, 'created')  // 调用生命周期钩子函数
  ```

  除了调用初始化函数来进行相关数据的初始化之外，还会再合适的时机调用了 callHook 函数来触发生命周期的钩子。

  ```
  if (vm.$options.el) {
      vm.$mount(vm.$options.el)
  }
  ```

  最后，会判断用户是否传入了 el 选项，如果传入了则调用 $mount 函数进入模板编译与挂载阶段，如果没有传入 el 选项，则不进入下一个生命周期阶段，需要用户手动执行 vm.$mount 方法才进入下一个生命周期阶段。

### 合并属性

## 初始化阶段 initLifecycle 函数分析

```
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```

- 代码分析
  - 首先是给实例上挂载 `$parent` 属性。
    - 逻辑：如果当前组件不是抽象组件并且存在父级，就通过 while 循环来向上循环，如果当前组件的父级是抽象组件并且也存在父级，那就继续向上查找当前组件的父级，直到找到第一个不是抽象类型的父级时，将其赋值 vm.$parent 同时把该实例自身添加进找到的父级的 $children 属性中。
  - 接着是给实例挂载 `$root` 属性。
    - 实例的 $root 属性表示当前实例的根实例，挂载该属性时，首先会判断如果当前实例存在于父级，那么当前实例的根实例 $root 属性就是其父级根实例 $root 属性，如果不存在，那么根实例 $root 属性就是它自己。
    - 最后，在初始化一些其它属性，

## 初始化阶段 initEvents 函数分析

initEvents 是生命周期初始化阶段所调用的第二个初始化函数。这个初始化函数是初始化实例的事件系统。在 `Vue` 中，当我们在父组件中使用子组件时可以给子组件上注册一些事件，即 v-on 或 @ 注册的自定义事件，也包括注册的浏览器原生事件。

```
<child @select="selectHandler" 	@click.native="clickHandler"></child>
```

### 解析事件

模板编译解析中，当遇到开始标签的时候，除了会解析开始标签，会调用 processAttrs 方法解析标签中的属性，

```
export const onRE = /^@|^v-on:/
export const dirRE = /^v-|^@|^:/

function processAttrs (el) {
const list = el.attrsList
let i, l, name, value, modifiers
for (i = 0, l = list.length; i < l; i++) {
  name  = list[i].name
  value = list[i].value
  if (dirRE.test(name)) {
    // 解析修饰符
    modifiers = parseModifiers(name)
    if (modifiers) {
      name = name.replace(modifierRE, '')
    }
    if (onRE.test(name)) { // v-on
      name = name.replace(onRE, '')
      addHandler(el, name, value, modifiers, false, warn)
    }
  }
}
}
```

在对标签属性进行解析的时，判断如果属性时指令，首先通过 parseModifiers 解析出属性的修饰符，然后判断如果时事件的指令，则执行 addHandler(el,name,value,modifiers.false,warn) 方法

```
export function addHandler (el,name,value,modifiers) {
 modifiers = modifiers || emptyObject

 // check capture modifier 判断是否有capture修饰符
 if (modifiers.capture) {
   delete modifiers.capture
   name = '!' + name // 给事件名前加'!'用以标记capture修饰符
 }
 // 判断是否有once修饰符
 if (modifiers.once) {
   delete modifiers.once
   name = '~' + name // 给事件名前加'~'用以标记once修饰符
 }
 // 判断是否有passive修饰符
 if (modifiers.passive) {
   delete modifiers.passive
   name = '&' + name // 给事件名前加'&'用以标记passive修饰符
 }

 let events
 if (modifiers.native) {
   delete modifiers.native
   events = el.nativeEvents || (el.nativeEvents = {})
 } else {
   events = el.events || (el.events = {})
 }

 const newHandler: any = {
   value: value.trim()
 }
 if (modifiers !== emptyObject) {
   newHandler.modifiers = modifiers
 }

 const handlers = events[name]
 if (Array.isArray(handlers)) {
   handlers.push(newHandler)
 } else if (handlers) {
   events[name] = [handlers, newHandler]
 } else {
   events[name] = newHandler
 }

 el.plain = false
}
```

- 该方法做了三件事

  - 根据 modifier 修饰符对事件名 name 做处理。
  - 根据 modifier.native 判断事件是一个浏览器原生事件还是自定义事件，分别对应 el.nativeEvents 和 el.events。
  - 按照 name 对事件做归类，并把回调函数的字符串保留到对应的事件中。

```
    // 形成的事件对象
    el.events = {
      select: {
        value:'selectHandler'
      }
    }

    el.nativeEvents = {
      click: {
        value: 'clickHandler'
      }
    }

```

在模板编译的代码生成阶段，会 genData 函数中根据 AST 元素节点上的 events 和 nativeEvents 生成 \_c(tagName,data,children) 函数中所需要的 data 数据

```
export function genData (el state) {
  let data = '{'
  // ...
  if (el.events) {
    data += `${genHandlers(el.events, false,state.warn)},`
  }
  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true, state.warn)},`
  }
  // ...
  return data
}
```

通过上面的方法生成的 data 数据

```
{
  // ...
  on: {"select": selectHandler},
  nativeOn: {"click": function($event) {
      return clickHandler($event)
    }
  }
  // ...
}
```

可以看到，最开始的模板中标签上注册的事件最终会被解析成用于创建元素型 VNode 的 \_c(tagName,data,children) 函数中 data 数据中的两个对象，自定义事件对象 on，浏览器原生事件 nativeOn。

模板编译的最终目的是创建 render 函数供挂载的时候调用生成虚拟 DOM, 那么在挂载阶段，如果被挂载的节点是一个组件节点，则通过 createComponent 函数创建一个组件 vnode 源码如下

```
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  // ...
  const listeners = data.on

  data.on = data.nativeOn

  // ...
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  return vnode
}
```

`父组件给子组件的注册事件中，把自定义事件传给子组件，在子组件实例化的时候进行初始化；而浏览器原生事件是在父组件中处理。`

`实例初始化阶段调用的初始化事件函数 initEvents 实际上初始化的是父组件在模板中使用 v-on 或 @ 注册的监听子组件内触发的事件。`

### initEvents 函数分析

```
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```

- 代码分析
  - 在 vm 上新增 `_events` 属性并将其赋值为空对象，用来存储事件。
  - 然后、获取父组件注册的事件赋值给 listeners，如果 listeners 不为空，则调用 updataComponentsListeners 函数，将父组件向子组件注册的事件注册到子组件的实例中。

```
export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, vm)
  target = undefined
}

function add (event, fn, once) {
  if (once) {
    target.$once(event, fn)
  } else {
    target.$on(event, fn)
  }
}

function remove (event, fn) {
  target.$off(event, fn)
}
```

- 代码分析
  - 内部调用 updataListeners 函数，并把 listeners 以及 add 和 remove 这两个函数传入。

```
export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  vm: Component
) {
  let name, def, cur, old, event
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur)
      }
      add(event.name, cur, event.once, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
```

- 代码分析
  - 对比 listeners 和 oldListeners 的不同，并调用参数中提供的 add 和 remove 进行相应的注册事件和卸载事件。
    对比的思想：如果 listeners 对象中存在某个 key 而 oldListeners 中不存在，则说明这个事件是需要新增的；反之，如果 oldListeners 对象中存在某个 key(事件名) 而 listeners 中不存在，则说明这个事件是需要从事件系统中卸载。
  - 函数接收 5 个参数，分别是 on、oldOn、add、remove、vm,其中 on 对应 listeners, oldOn 对应 oldListeners。
  - 首先对 on 进行遍历， 获得每一个事件名，然后调用 normalizeEvent 函数（关于该函数下面会介绍）处理， 处理完事件名后， 判断事件名对应的值是否存在，如果不存在则抛出警告，
  ```
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    }
  }
  ```
  - 如果存在，则继续判断该事件名在 oldOn 中是否存在，如果不存在，则调用 add 注册事件
  ```
  if (isUndef(old)) {
  if (isUndef(cur.fns)) {
    cur = on[name] = createFnInvoker(cur)
  }
  add(event.name, cur, event.once, event.capture, event.passive, event.params)
  }
  export function createFnInvoker (fns) {
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments)
      }
    } else {
      // return handler return value for single handlers
      return fns.apply(null, arguments)
    }
  }
  invoker.fns = fns
  return invoker
  }
  ```
