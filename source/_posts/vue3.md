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

## 依赖收集

### 什么是依赖收集

通过上面的方法，让`object`变的可观测，我们知道数据什么时候发生了变化，我们去通知视图更新，我们到底通知那个模块发生变化？ 不能一个数据发生变化，整个视图就发生更新，因此我们只更新视图中用到这个数据就发生更新。也就是 `谁依赖了这个数据`，我们为每个数据都建一个依赖数组，谁依赖这个数据，我们就将谁放入这个依赖数组中，那么当该数据发生变化时我们就去它对应的依赖数组中，把每个依赖都通知一遍，发生更新。

### 什么时候收集依赖，什么时候通知以此来更新

在 getter 中收集依赖，在 setter 中通知依赖更新

### 依赖收集到哪里
