---
title: Vue 的理解
---

# 变化侦测

## 对象的单个属性值实现可观测

通过 Object.defineProperty 实现对象数据变化的 可观测

```
let car = {
   price:3000
}
let val = 3000
Object.defineProperty(car, 'price', {
  enumerable: true,
  configurable: true,
  get(){
    console.log('price属性被读取了')
    return val
  },
  set(newVal){
    console.log('price属性被修改了')
    val = newVal
  }
})
```

## 使对象的所有属性变的可观测

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

function defineReactive (obj,key,val) { // 将传进来的某个属性变成可侦测的
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

通过定义了 Observer 类，将一个正常的 object 转换成可观测的 object
并且给 value 增加 `__ob__` 属性值为该 value 的 Observer 实例。 该操作相当于是为 value 打上一个标志，标识已经转换成响应式了，避免重复操作。
然后判断数据的类型：(数组和对象的数据监测方式不一样，数组是通过修改数组的操作方法来实现数据变化的监测) object 类型的数据调用 walk 将每一个属性转换成 getter/setter 的形式来侦测变化，当 defineReactive 中当传入的属性值还是一个 object 时使用 new observer（val）来递归子属性，这样我们就可以把 obj 中的所有属性（包括子属性）都转换成 getter/seter 的形式来侦测变化。

通过一个 observer 类，我们将一个对象传入到里面，这个对象就变成可观测的。

## 收集依赖

### 为什么要有收集依赖

数据变的可观测以后，我们知道数据什么时候发生了变化，当数据变化时，通知视图更新。但是我们不知道该通知谁去发生变化，但是也不能一个数据变化，就整个视图就更新。

解决思路: 就是对每个数据建立一个依赖数组，谁依赖了这个数据，就把谁放入到这个依赖数组中，当该数据发生变化的时候，就去对应的依赖数组，通知数组中的依赖，更新。

什么时候收集依赖?什么时候通知依赖更新？

`在 getter中收集依赖，在setter中通知依赖更新`。

### 依赖收集的地方

创建依赖管理器 `Dep` 类

```
export default class Dep {
  constructor () {
    this.subs = []
  }
  addSub (sub) {
    this.subs.push(sub)
  }
  // 删除一个依赖
  removeSub (sub) {
    remove(this.subs,sub)
  }
  // 添加一个依赖
  depend () {
    if (window.target) {
      this.addSub(window.target)
    }
  }
  // 通知所有的依赖更新
  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i<l; i++) {
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

有了 Dep 类依赖收集，可以在 getter 中收集依赖，在 setter 中通知依赖更新

```
function defineReactive (obj,key,val) {
  if (arguments.length === 2) {
    val = obj[key]
  }
  if(typeof val === 'object'){
    new Observer(val)
  }
  const dep = new Dep()  //实例化一个依赖管理器，生成一个依赖管理数组dep
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get(){
      dep.depend()    // 在getter中收集依赖
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

```

### 我们所说的依赖到底是谁

我们说 `谁用到了这个数据谁就是依赖`，在代码上的体现，在 vue 中还有一个 Watcher 类，这个 `Watcher` 就是我们所说的 `谁`。
谁用到了数据，谁就是依赖，我们就为谁创建一个 Watcher 实例。之后当数据发生变化的时，我们不直接通知依赖跟新，而是通知依赖对应的 Watch 实例，由 Watcher 实例去通知真正的视图。
Watcher 类的具体实现：

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
    let value = this.getter.call(vm, vm)
    window.target = undefined;
    return value
  }
  update () {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}

/**
 * Parse simple path.
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 */
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

在创建 Watcher 实例的过程中会自动的把自己添加到这个数据对应的依赖管理器中，以后这个 Watcher 实例就代表这个依赖，当数据变化时，我们就通知 Watcher 实例，由 Watcher 实例再去通知真正的依赖。

Watcher 类实现的逻辑

- 当实例化 Watcher 类时，会先执行其构造函数；

- 在构造函数中调用了 this.get()实例方法；

- 在 get()方法中，首先通过 window.target = this 把实例自身赋给了全局的一个唯一对象 window.target 上，然后通过 let value = this.getter.call(vm, vm)获取一下被依赖的数据，获取被依赖数据的目的是触发该数据上面的 getter，上文我们说过，在 getter 里会调用 dep.depend()收集依赖，而在 dep.depend()中取到挂载 window.target 上的值并将其存入依赖数组中，在 get()方法最后将 window.target 释放掉。

- 而当数据变化时，会触发数据的 setter，在 setter 中调用了 dep.notify()方法，在 dep.notify()方法中，遍历所有依赖(即 watcher 实例)，执行依赖的 update()方法，也就是 Watcher 类中的 update()实例方法，在 update()方法中调用数据变化的更新回调函数，从而更新视图。

## 总结

我们通过 Object.defineProperty 实现了对 Object 数据的可观测，并且封装成 Observer 类，我们能够方便的把 Object 数据中的所有属性(子属性)转换成 getter/setter 的形式来侦测变化。

- Data 通过 observer 转换成了 getter/setter 的形式来追踪变化。
- 当外界通过 Watcher 读取数据时，会触发 getter 从而将 Watcher 添加到依赖中。
- 当数据发生了变化时，会触发 setter，从而向 Dep 中的依赖（即 Watcher）发送通知。
- Watcher 接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等
