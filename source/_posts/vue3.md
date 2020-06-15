---
title: Vue.js 源码解读
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

###
