---
title: Vue.js 源码解读, 更新子节点
categories: [Vue.js 源码解读, 更新子节点]
---

## 更新子节点

当新的 VNode 与旧的 oldVNode 都是元素节点并且都包含子节点时，那么这两个节点的 VNode 实例上的 children 属性就是所包含的子节点数组。我们把新的 VNode 上的子节点数组记为 newChildren，把旧的 oldVNode 上的子节点数组记为 oldChildren，我们把 newChildren 里面的元素与 oldChildren 里的元素一一进行对比，对比两个子节点数组肯定是要通过循环，外层循环 newChildren 数组，内层循环 oldChildren 数组，每循环外层 newChildren 数组里的一个子节点，就去内层 oldChildren 数组里找看有没有与之相同的子节点

以上这个过程存在四种情况: 创建子节点、删除字节点、移动子节点、更新节点。

## 创建子节点

newChildren 里面的某个子节点在 oldChildren 里找不到与之相同的子节点，说明 newChildren 里面的这个子节点是之前没有的，是需要此次新增的节点，创建这个节点，创建之后把它插入到 DOM 中合适的位置。

![avatar](https://vue-js.com/learn-vue/assets/img/4.cb62f1aa.png)

## 删除子节点

把 newChildren 里面的每一个子节点都循环一遍，能在 oldChildren 数组里找到的就处理它，找不到的就新增，直到把 newChildren 里面所有子节点都遍历一遍后，发现 oldChildren 还存在未处理的子节点，说明未处理的子节点是需要被废弃的，那么就将这些节点删除。

## 更新子节点

如果 newChildren 里面的某个子节点在 oldChildren 里找到与之相同的子节点，并且所处的位置也相同，那么就更新 oldChildren 里该节点使之与 newChildren 里的该节点相同。

## 移动子节点

如果 newChildren 里面的某个子节点在 oldChildren 里找到与之相同的子节点，但是所处的位置不同，则此次变化需要调整该子节点的位置，以 newChildren 的位置为准，调整 oldChildren 里改节点的位置。

![avatar](https://vue-js.com/learn-vue/assets/img/6.b9621b4d.png)

在上图中，绿色的两个节点是相同节点但是所处位置不同，按照上面所说的，我们应该以 newChildren 里子节点的位置为基准，调整 oldChildren 里该节点的位置，所以我们应该把真实 DOM 即 oldChildren 里面的第四个节点移动到第三个节点的位置
