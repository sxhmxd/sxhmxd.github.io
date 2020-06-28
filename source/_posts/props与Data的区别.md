---
title: Vue.js 源码解读, 虚拟Dom
categories: [Vue.js, Props与Data的区别]
---
# Vue 中的Props 与 Data 细微差别。

Vue 提供了两种不同的存储变量: `props` 和 `data`。

## 区别

`data` 是每个组件的私有内存，可以在其中存储需要的任何变量。`props`是将数据从父组件传递到子组件的方式。

## 什么是 props

在 `Vue` 中 `props` 是我们将数据从父组件向下传递到其子组件的方式。
当我们从组件内部访问`props`时，我们并不拥有他们，我们不能更改他们。

## 什么是 Data 

`data` 是每个组件的内存，这就是存储数据和希望跟踪的任何其他变量的地方。

## props 和 data 都是响应式的




