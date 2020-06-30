---
title: [Vue.js 源码解读, 数据的变化侦听]
categories: [Vue.js 源码解读, 变化侦测, 数据的变化侦听]
---

# 变化侦听

数据驱动视图的关键在于怎么知道数据发生了变化。`js` 为我们提供了 `Object.defineProperty` 方法。该方法可以知道数据在什么时候发生变化。

## 使 Object 数据变得可观测

```
let car = {}
let val = 3000
Object.defineProperty(car,'price',{
  enumber: true,
  configurable: true,
  get(){
    console.log('price 属性被读取')
    return val
  },
  set(newVal){
    console.log('price 属性值被修改)
    val = newVal
  }
})
car.price
  // price属性被读取了
  // 3000
car.price = 4000
  // price属性值被修改了
  // 4000
```

经过上面的方法，car 数据对象已经是 `可观测` 的了。
为了把 car 对象所有的属性都变得可观测

```
/**
 * Observer类会通过递归的方式把一个对象的所有属性都转化成可观测对象
 */
export class Observer {
  constructor (value) {
    this.value = value
    // 给value新增一个__ob__属性，值为该value的Observer实例
    // 相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作
    def(value,'__ob__',this)
    if (Array.isArray(value)) {
      // 当value为数组时的逻辑
      // ...
    } else {
      this.walk(value)
    }
  }

  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}
/**
 * 使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 */
function defineReactive (obj,key,val) {
  // 如果只传了obj和key，那么val = obj[key]
  if (arguments.length === 2) {
    val = obj[key]
  }
  if(typeof val === 'object'){
      new Observer(val)
  }
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){
      console.log(`${key}属性被读取了`);
      return val;
    },
    set(newVal){
      if(val === newVal){
          return
      }
      console.log(`${key}属性被修改了`);
      val = newVal;
    }
  })
}
```

## 依赖收集

### 什么是依赖收集

通过上面的方法，让`object`变的可观测，我们知道数据什么时候发生了变化，我们去通知视图更新，我们到底通知那个模块发生变化？ 不能一个数据发生变化，整个视图就发生更新，因此我们只更新视图中用到这个数据就发生更新。也就是 `谁依赖了这个数据`，我们为每个数据都建一个依赖数组，谁依赖这个数据，我们就将谁放入这个依赖数组中，那么当该数据发生变化时我们就去它对应的依赖数组中，把每个依赖都通知一遍，发生更新。

### 什么时候收集依赖，什么时候通知以此来更新

在 getter 中收集依赖，在 setter 中通知依赖更新

### 依赖收集到哪里

我们给每个数据都建一个依赖数组，蛋蛋用一个数组的来存放依赖的话，功能欠缺并且代码过于耦合。更好的做法是我们为每一个依赖数据都建立一个依赖管理器，将该数据的依赖都管理起来。 依赖管理器 `Dep`类

```
// 源码位置：src/core/observer/dep.js
export default class Dep {
  constructor () {
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }
  // 删除一个依赖
  removeSub (sub) {
    remove(this.subs, sub)
  }
  // 添加一个依赖
  depend () {
    if (window.target) {
      this.addSub(window.target)
    }
  }
  // 通知所有依赖更新
  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

/**
 * Remove an item from an array
 */
export function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}
```

有了依赖管理器后，在 getter 中收集依赖，在 setter 中通知依赖更新，代码

```
function defineReactive (obj,key,val){
  if (arguments.length === 2) {
    val = obj[key]
  }
  if (typeof val === 'Object') {
    new Observer(val)
  }
  cosnt dep = new Dep() // 实例化一个依赖管理器，生成一个依赖管理数组 dep
  Object.defineProperty(obj,key,{
    enumberable:true,
    configurable:true,
    get () {
      dep.depend() // 在getter中收集依赖
      return val
    },
    set (newVal) {
      if(val == newVal) {
        return
      }
      val = newVal
      dep.notify()  // 在setter中通知依赖更新
    }
  })
}
```

#### 依赖到底是 Who

一直在说 `谁用到了这个数据谁就是依赖`，在代码层面上该如何来描述这个`谁`。
在 `Vue` 中有一个叫 `Watcher` 的类，该类的实例就是我们上面说的那个`谁`，也就是谁用到了数据，谁就是依赖，我们为谁创建一个`Watcher`实例，在之后数据发生变化时，我们不直接通知依赖更新，而是通知依赖对应的 `watch` 实例，由 `Watchr`实例去通知真正的视图。

```
export default class Watcher {
  constructor (vm,expOrFn,cb) {
    this.vm = vm;
    this.cb = cb;
    this.getter = parsePath(expOrFn)
    this.value = this.get()
  }
  get () {
    window.target = this;
    const vm = this.vm
    let value = this.getter.call(vm,vm)
    window.target = undefined;
    return value
  }
  update () {
    const oldVlaue = this.value
    this.value = this.get()
    this.cb.call(this.vm,this.value,oldValue)
  }
}
const bailRE = /[^\w.$]/
export function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
```

`Watcher`类代码实现逻辑

- 当实例化`Watcher`类时，会先执行其构造函数；

- 在构造函数中调用了`this.get()`实例方法

- 在`get()`方法中，首先通过 `window.target = this` 把实例自身赋值给了一个全局
  的一个唯一对象`window.target` 上，然后通过 `let value = this.getter.call(vm,vm)` 获取一下被依赖的数据，获取被依赖数据的目的是触发该数据上面的`getter`,在`getter` 里会调用`dep.depend()` 收集依赖，而在`dep.depend()`中取到挂`window.target` 上的值并将其存入依赖数组中，在`get()`方法最后将`window.target`释放掉。

- 当数据变化时，会触发数据的`setter`，在`setter`中调用`dep.notify()`方法，在`dep.notify()` 方法中，遍历所有依赖(即 watcher 实例)，执行依赖的`update()`方法，也就时 `Watcher`类中的`update()`实例方法，在`update()` 方法中调用数据变化的更新回调函数，从而更新视图。

  ![avatar](https://vue-js.com/learn-vue/assets/img/3.0b99330d.jpg)

以上的流程是

- `Data` 通过 `observer` 转换成了 `getter/setter`的形式来追踪变化

- 当外界通过`Watcher`读取数据时，会触发`getter`从而将 `Watcher` 添加到依赖中。

- 当数据发生了变化时，会触发`setter`, 从而向 `Dep` 中的依赖(即 Watcher) 发送通知。

- `Watcher` 接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等。

## Array 的变化侦测

### 收集依赖的地方

`Array` 型数据的依赖收集方式和 `Object` 数据的依赖收集方式相同，都是在`getter`中收集。

```
data(){
  return {
    arr:[1,2,3]
  }
}
```

在组件`data`中，`arr`这个数据始终存在于一个`Object`数据对象中，谁用到了数据谁就是依赖，那么用到`arr`这个数据，得先从`Object`数据对象中获取一下，从`Object`数据对象中获取`arr`数据自然会触发 `arr`的 `getter`
`Array型数据还是在getter中收集依赖`

### 使 Array 型数据可观测

- 实现思路
  要想让`Array` 型数据发生变化，必然是操作了 `Array` , 而 `js` 中提供的操作数组的方法是固定的，可以将这些方法都重写一遍，在不改变原有功能的前提下，为其新增一些其他功能，

```
let arr = [1,2,3]
arr.push(4)
Array.prototype.newPush = function(val){
  console.log('arr 数组被改变了')
  this.push(val)
}
arr.newPush(4) // [1,2,3,4]
```

- 数组方法拦截器

在`Vue`中创建一个数组方法拦截器，拦截在数组实例与`Array.prototype`之间，在拦截器内部重写操作数组的一些方法，当数组实例使用操作数组方法时，其实使用的是拦截器中重写的方法，不再使用`Array.prototype` 上的原生方法

![avatar](https://vue-js.com/learn-vue/assets/img/2.b446ab83.png)

源码中的拦截器代码

```
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

// 改变数组自身内容的7个方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  const original = arrayProto[method]      // 缓存原生方法
  Object.defineProperty(arrayMethods, method, {
    enumerable: false,
    configurable: true,
    writable: true,
    value:function mutator(...args){
      const result = original.apply(this, args)
      return result
    }
  })
})

```

- 拦截器的使用

源码实现

```
export default Observer {
  constructor (value) {
    this.value = value
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment
      augment(value,arrayMethods,arrayKeys)
    } else {
      this.walk(value)
    }
  }
}
// 能力检测： 判断 __proto__ 是否可用，有浏览器不支持该属性
export const hasProto = '__proto__' in {}
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object, keys: any) {
  target.__proto__ = src
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
```

### 依赖收集

数组的依赖收集也在`getter` 中收集，而给数组数据添加`getter/setter` 都是在`Observer`类中完成的，在`Observer`类中收集依赖。

```
export class Observer {
  constructor (value) {
    this.value = value
    this.dep = new Dep()
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
    } else {
      this.walk(value)
    }
  }
}
```

- 怎样收集依赖

依赖管理器定义在`Observer` 类中，而我们需要在`getter`中收集依赖，也就是说我们必须在`getter`中能够访问到`Observer`类中的依赖管理器，才能把依赖存进去。

```
function defineReactive (obj,key,val) {
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){
      if (childOb) {
        childOb.dep.depend()
      }
      return val;
    },
    set(newVal){
      if(val === newVal){
        return
      }
      val = newVal;
      dep.notify()   // 在setter中通知依赖更新
    }
  })
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 * 尝试为value创建一个0bserver实例，如果创建成功，直接返回新创建的Observer实例。
 * 如果 Value 已经存在一个Observer实例，则直接返回它
 */
export function observe (value, asRootData){
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
```

- 怎样通知依赖

要想通知依赖，首先能访问到依赖，即只要能访问到被转化成响应式的数据 `value` 即可，因为`value` 上的 `__ob__`就是其对应的`Observer` 类实例，有了该实例我们就能访问到它上面的依赖管理器，然后只需要调用依赖管理的 `dep.notify()` 方法，

```
// 源码
methodsToPatch.forEach(function (method) {
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    // notify change
    ob.dep.notify()
    return result
  })
})
```

### 深度侦测

在前文所有讲的 Array 型数据的变化侦测都仅仅说的是数组自身变化的侦测，比如给数组新增一个元素或删除数组中一个元素，而在 Vue 中，不论是 Object 型数据还是 Array 型数据所实现的数据变化侦测都是深度侦测，所谓深度侦测就是不但要侦测数据自身的变化，还要侦测数据中所有子数据的变化。

```
let arr = [
  {
    name:'NLRX'，
    age:'18'
  }
]

```

数组中包含一个对象，如果该对象的某个属性发生了变化也应该被侦测到，就是深度侦测。
实现逻辑

```
export class Observer {
  value: any;
  dep: Dep;

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)   // 将数组中的所有元素都转化为可被侦测的响应式
    } else {
      this.walk(value)
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

export function observe (value, asRootData){
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
```

### 数组新增元素的侦测

向数组内新增的方法有 3 个，分别是：push、unshift、splice。我们只需对这 3 中方法分别处理，拿到新增的元素，再将其转化即可

```
/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args   // 如果是push或unshift方法，那么传入参数就是新增的元素
        break
      case 'splice':
        inserted = args.slice(2) // 如果是splice方法，那么传入参数列表中下标为2的就是新增的元素
        break
    }
    if (inserted) ob.observeArray(inserted) // 调用observe函数将新增的元素转化成响应式
    // notify change
    ob.dep.notify()
    return result
  })
})
```
