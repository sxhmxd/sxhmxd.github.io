---
title: Vue.js 源码解读,
categories: [Vue.js 源码解读, 生命周期, 初始化 initState 阶段]
---

## 初始化 initState 函数

该函数是用来初始化实例状态的，例如：props、 data、 methods 、computed 、watch

### initState 函数分析

```
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

- 代码分析

  - 首先给实例增加一个属性 \_watchers,用来存储当前实例中所有的 watcher 实例，无论是使用 vm.\$watch 注册的 watcher 实例还是使用 watch 选项注册的 watcher 实例，都会保存到该属性中。

  - 先判断实例中是否有 props 选项，如果有，就调用 props 选项初始化函数 initProps 去初始化 props 选项。

  - 再判断实例中是否有 methods 选项，如果有，就调用 methods 选项初始化函数 initMethods 去初始化 methods 选项；

  - 接着再判断实例中是否有 data 选项，如果有，就调用 data 选项初始化函数 initData 去初始化 data 选项；如果没有，就把 data 当作空对象并将其转换成响应式；

  - 接着再判断实例中是否有 computed 选项，如果有，就调用 computed 选项初始化函数 initComputed 去初始化 computed 选项；

  - 最后判断实例中是否有 watch 选项，如果有，就调用 watch 选项初始化函数 initWatch 去初始化 watch 选项；

### 初始化 props

props 选项通常是由当前组件的父级组件传入的，当父组件在调用子组件的时候，通常会把 props 属性值作为标签属性添加到子组件的标签上。
在模板编译的时候，当解析到组件标签的时会将所有的标签属性都解析出来然后在子组件实例化的时候给子组件。(props 数据包含其中)

#### 规范化数据

vue 给用户提供的 props 选项写法非常自由，根据 vue 的惯例，写法虽然有多种但是最终处理的时候肯定只处理一种写法，处理之前先对数据进行规范化，将所有写法都转化成一种写法。

```
function normalizeProps (options, vm) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```

- 代码分析
  - 首先拿到实例中的 props 选项，如果不存在，则直接返回。
  - 判断如果是 props: ['name'] 这样的写法，则遍历数组中的每一项元素，如果该元素是字符串，将该元素统一转化成驼峰式命名，然后将该元素作为 key，将 {type:null} 作为 value 存入 res 中;如果该元素不是字符串，则抛出异常。
  - 判断如果不是数组，则判断是不是对象，如果是对象，那就遍历对象中的每一对键值，拿到每一对键值后，将键名统一转化成驼峰式命名，然后判断值是否还是一个对象，如果还是一个对象，那么将该键值对存入 res 中；如果值不是对象，那么就将键名作为 key,将 {type:null} 作为 value 存入 res 中。

#### initProps 函数分析

```
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}
```

- 代码分析
  - 该函数接收两个参数：当前 Vue 实例和当前实例规范化后的 props 选项。
  - 函数内部定义四个变量
    - propsData:父组件传入的真实 props 数据。
    - props: 指向 vm.\_props 的指针，所有设置到 props 变量中的属性都会保存到 vm.\_props 中。
    - keys:指向 vm.$options._propKeys 的指针，缓存 props 对象中的 key,将来更新 props 时只需遍历 vm.$options.\_propKeys 数组即可得多所有 props 的 key .
    - isRoot:当前组件是否为根组件。
  - 判断当前组件是否为根组件，如果不是不需要将 props 数组转换成响应式的，toggleObserving(false) 用来控制是否将数据转换成响应式。
  - 遍历 props 选项拿到每一对键值，先将键名添加到 keys 中然后调用 validateProp 函数校验父组件传入的 props 数据类型是否匹配并获取到传入的值 value, 然后通过将键名和值通过 defineReactive 函数添加到 props (即 vm.\_props)中。

#### validateProp 函数分析

```
export function validateProp (key,propOptions,propsData,vm) {
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)
  let value = propsData[key]
  // boolean casting
  const booleanIndex = getTypeIndex(Boolean, prop.type)
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      const stringIndex = getTypeIndex(String, prop.type)
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve
    toggleObserving(true)
    observe(value)
    toggleObserving(prevShouldObserve)
  }
  if (process.env.NODE_ENV !== 'production') {
    assertProp(prop, key, value, vm, absent)
  }
  return value
}
```

- 代码分析

  - 该函数接收四个参数
    - key:遍历 propOptions 时拿到的每个属性名。
    - propOptions:当前实例规范化后的 props 选项。
    - propsData:父组件传入的真实 props 数据。
    - vm:当前实例。
  - 函数内部定义三个变量
    - prop:当前 key 在 propOptions 中对应的值。
    - absent:当前 key 是否在 propsData 中存在，即父组件是否传入了该属性。
    - value:当前 key 在 propsData 中对应的值，即父组件对于该属性传入的真实值。
  - 判断 prop 的 type 属性是否是布尔类型(Boolean), getTypeIndex 函数用于判断 prop 的 type 属性中是否存在某种类型，如果存在则返回在 type 属性中的索引，如果不存在则返回 -1。

    - 如果是布尔类型，有两种情况需要单独处理

      - 如果 absent 为 true 即父组件没有传入该 prop 属性并且该属性也没有默认值的时候，将该属性设置为 false

      ```
      if(absent && !hasOwn(prop,'default')){
        value = false
      }
      ```

      - 如果父组件传入了该 prop 属性，那么需要满足以下几点，则将该属性值设为 true
        - 该属性值为空字符串或者属性值与属性名相等;
        - prop 的 type 属性中不存在 String 类型;
        - 如果 prop 的 type 属性中存在 String 类型，那么 Boolean 类型在 type 属性中的索引必须小于 String 类型的索引，即 Boolean 类型的优先级更高。
        ```
        if (value === '' || value === hyphenate(key)) {
          cosnt stringIndex = getTypeIndex(String, prop.type)
          if (stringIndex < 0 || booleanIndex< stringIndex) {
            value = true
          }
        }
        ```

  - 如果不是布尔类型，是其他类型则只需判断父组件是否传入该属性即可，如果没有传入，则该属性值为 undefined。

  - 如果父组件传入了该属性并且也有对应的真实值，那么在非生产环境下会调用 assertProp 函数，校验该属性值是否与要求类型匹配。

#### getPropDefaultValue 函数分析

```
function getPropDefaultValue (vm, prop, key){
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  const def = prop.default
  // warn against non-factory defaults for Object & Array
  if (process.env.NODE_ENV !== 'production' && isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    )
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}
```

- 代码分析
  - 该函数接收三个参数
    - vm:当前实例；
    - prop:子组件 props 选项中的每个 key 对应的值；
    - key:子组件 props 选项中的每个 key；
      作用是根据子组件 props 选项中的 key 获取对应的默认值。
  - 首先判断 prop 中是否有 default 属性，如果没有，则表示没有默认值，直接返回。如果有则取出 default 属性，赋值给变量 def。接着判断在非生产环境下 def 是否是一个对象，如果是，则抛出警告。
  - 接着判断如果父组件没有传入 props 属性，但是在 vm.\_props 中有该属性值，这说明 vm.\_props 中的该属性值就是默认值。
  - 最后，判断 def 是否为函数并且 prop.type 不为 Function ，如果是的话表明 def 是一个返回对象或数组的工厂函数，那么将函数的返回值作为默认值返回；如果 def 不是函数，则将 def 作为默认值返回。
