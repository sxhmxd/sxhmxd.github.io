---
title: Vue.js 源码解读, Diff
categories: [Vue.js 源码解读, Diff]
---

# DOM-Diff

`VNode` 最大的用途就是在数据变化前后生成真实`DOM` 对应虚拟`DOM`节点，然后就可以对比新旧两份`VNode`，找出差异所在，然后更新有差异的`DOM` 节点，最终达到以最少操作真实`DOM`更新视图的目的。新旧`DOM`树的对比找出差异的过程就是所谓的`DOM-Diff`过程，该过程是整个虚拟`DOM`核心所在。

## patch

在 vue 中，把 DOM-Diff 过程叫做 patch 过程。patch 意为"补丁",即对旧的 VNode 修补，打补丁从而得到新的 VNode。
patch 的过程：
旧的 VNode(oldVNode)数据变化之前视图对应的虚拟 DOM 节点， 新的 VNode 是数据变化之后将要渲染的新的视图所对应的虚拟 DOM 节点，所以我们以新的 VNode 为基准，对比旧的 oldVNode ,如果新的 VNode 上有的节点而旧的 oldVNode 上没有，那么就在旧 oldVNode 上加上去；如果新
VNode 上没有而 oldVNode 上有，那么就在旧节点上去掉；如果新旧节点上都有，那么以新的 VNode 为基准，更新旧的 oldVNode，从而让新旧相同。

一句话：以新的 VNode 为基准改造旧的 oldVNode 使之成为跟新的 VNode 一样。

## 创建节点

VNode 类可以描述 6 种类型的节点，但是只有三种类型的节点能够被创建并插入到 DOM 中，即 元素节点、文本节点、注释节点。vue 在创建时会判断这个节点是什么类型，从而调用不同的方法创建并插入到 DOM 中。

```
function createElm(vnode,parentElm,refElm){
  const data = vnode.data
  const children = vnode.children
  const tag = vnode.tag
  if (isDef(tag)) {
  	vnode.elm = nodeOps.createElement(tag, vnode)   // 创建元素节点
    createChildren(vnode, children, insertedVnodeQueue) // 创建元素节点的子节点
    insert(parentElm, vnode.elm, refElm)       // 插入到DOM中
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text)  // 创建注释节点
    insert(parentElm, vnode.elm, refElm)           // 插入到DOM中
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text)  // 创建文本节点
    insert(parentElm, vnode.elm, refElm)           // 插入到DOM中
  }
}
```

- 判断是否是元素节点只需要判断 VNode 节点是否有 tag 标签即可。
- 判断是否是注释节点，只需要判断 VNode 的 isComment 属性是否为 true 即可。
- 如果既不是元素节点又不是注释节点，那就认为是文本节点

创建节点的流程图

![avatar](https://vue-js.com/learn-vue/assets/img/2.02d5c7b1.png)

## 删除节点

删除节点，只需要在要删除节点的父元素上调用 removeChild 方法

```
function removeNode (el) {
  cosnt parent = nodeOps.parentNode(el) // 获取父节点
  if (isDef(parent)) {
    nodeOps.removeChild(parent,el) //调用父节点的removeChild 方法
  }
}
```

## 更新节点

更新节点需要在新的 VNode 和 oldVNode 进行细致的比较，找出不一样的地方进行更新。

- 静态节点

```
<p>不会变的文字</p>

```

上面的节点只包含了纯文字，没有绑定变量，所以不管数据怎么变化，这个节点渲染后，那么它永远不会发生变化。 把这种节点称之为静态节点。

更新节点需要对三种情况进行判断并分别处理

- 如果 VNode 和 oldVNode 均为静态节点

  两者如果都是静态节点，则直接跳过，无需处理

- 如果 VNode 是文本节点

  如果 VNode 是文本节点，则表示这个节点值包含纯文本，那么只需看 oldVNode 是否也是文本节点，如果是，那就比较两个文本是否不同，如若不同则把 oldVNode 里的文本改成和 VNode 的文本一样。如果 oldVNode 不是文本节点，那么不论是什么，直接调用 setTextNode 方法把它改变成文本节点，内容跟 VNode 相同。

- 如果 VNode 是元素节点

  元素节点又分两种情况

  - 该节点包含子节点

  如果新的节点内包含子节点，那么此时就要看旧的节点是否包含子节点，如果旧的节点里也包含了子节点，那就需要递归对比更新子节点。如果旧的节点里不包含子节点，那么这个旧节点有可能是空节点或者是文本节点，如果旧的节点是空节点就把新的节点里的子节点创建一份插入到旧的节点里面。如果旧的节点是文本节点，则把文本清空，然后把新的节点里的子节点创建一份然后插入到旧的节点里面。

  - 该节点不包含子节点

  如果该节点不包含子节点，同时它又不是文本节点，那就说明该节点是个空节点不管旧节点里面有啥，直接清空即可。

```
// 更新节点
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  // vnode与oldVnode是否完全一样？若是，退出程序
  if (oldVnode === vnode) {
    return
  }
  const elm = vnode.elm = oldVnode.elm

  // vnode与oldVnode是否都是静态节点？若是，退出程序
  if (isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    return
  }

  const oldCh = oldVnode.children
  const ch = vnode.children
  // vnode有text属性？若没有：
  if (isUndef(vnode.text)) {
    // vnode的子节点与oldVnode的子节点是否都存在？
    if (isDef(oldCh) && isDef(ch)) {
      // 若都存在，判断子节点是否相同，不同则更新子节点
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    }
    // 若只有vnode的子节点存在
    else if (isDef(ch)) {
      /**
       * 判断oldVnode是否有文本？
       * 若没有，则把vnode的子节点添加到真实DOM中
       * 若有，则清空Dom中的文本，再把vnode的子节点添加到真实DOM中
       */
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    }
    // 若只有oldnode的子节点存在
    else if (isDef(oldCh)) {
      // 清空DOM中的子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    }
    // 若vnode和oldnode都没有子节点，但是oldnode中有文本
    else if (isDef(oldVnode.text)) {
      // 清空oldnode文本
      nodeOps.setTextContent(elm, '')
    }
    // 上面两个判断一句话概括就是，如果vnode中既没有text，也没有子节点，那么对应的oldnode中有什么就清空什么
  }
  // 若有，vnode的text属性与oldVnode的text属性是否相同？
  else if (oldVnode.text !== vnode.text) {
    // 若不相同：则用vnode的text替换真实DOM的文本
    nodeOps.setTextContent(elm, vnode.text)
  }
}
```

更新节点的流程

![avatar](https://vue-js.com/learn-vue/assets/img/3.7b0442aa.png)
