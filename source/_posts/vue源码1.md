---
title: Vue.js 源码解读, 虚拟Dom
categories: [Vue.js 源码解读, 虚拟Dom]
---

# 虚拟 Dom

- 什么是虚拟 DOM ？
  虚拟 Dom,就是用一个 `JS` 对象来描述一个`DOM`节点。

```
<div class="a" id="b">内容</div>

{
  tag: 'div',   // 元素标签
  attrs:{       // 属性
    class:'a',
    id:'b'
  },
  text:'内容',  // 文本内容
  children:[]  // 子元素
}
```

把组成一个`DOM`节点的必要东西通过一个 `JS` 对象表示出来，那么这个`JS` 对象就可以用来藐视这个`DOM`节点，我们把这个`JS`对象就称为是这个真实`DOM`节点的虚拟`DOM`节点。

- 为什么要有虚拟 DOM ？
  `Vue` 是数据驱动视图的，数据发生变化视图就要随之更新，在更新视图的时候难免要操作`DOM`,操作`DOM`又是非常耗费性能的。但是我们逃不掉操作`DOM`,所以只能尽可能的减少操作`DOM` 。
  最直观的方法就是不要盲目的去更新视图，而是通过对比数据变化的前后的状态，计算出视图中那些地方需要更新，只更新需要更新的地方。就是用`JS`的计算性能来换取操作`DOM`的性能。

## Vue 中的虚拟 DOM

### VNode 类

在`Vue`中就存在一个`VNode`类，通过这个类，我们就可以实例化出不同类型的虚拟`DOM`节点

```
export default class VNode {
  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag                                /*当前节点的标签名*/
    this.data = data        /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.children = children  /*当前节点的子节点，是一个数组*/
    this.text = text     /*当前节点的文本*/
    this.elm = elm       /*当前虚拟节点对应的真实dom节点*/
    this.ns = undefined            /*当前节点的名字空间*/
    this.context = context          /*当前组件节点对应的Vue实例*/
    this.fnContext = undefined       /*函数式组件对应的Vue实例*/
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key           /*节点的key属性，被当作节点的标志，用以优化*/
    this.componentOptions = componentOptions   /*组件的option选项*/
    this.componentInstance = undefined       /*当前节点对应的组件的实例*/
    this.parent = undefined           /*当前节点的父节点*/
    this.raw = false         /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.isStatic = false         /*静态节点标志*/
    this.isRootInsert = true      /*是否作为跟节点插入*/
    this.isComment = false             /*是否为注释节点*/
    this.isCloned = false           /*是否为克隆节点*/
    this.isOnce = false                /*是否有v-once指令*/
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  get child (): Component | void {
    return this.componentInstance
  }
}
```

### VNode 的类型

- 注释节点

```
// 创建注释节点
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text          // 表示具体的注释信息，
  node.isComment = true     // 是一个标志，用来标识一个节点是否是注释节点。
  return node
}

```

- 文本节点

```
// 创建文本节点
 export function createTextVNode (val: string | number){
   return new VNode(undefined,undefined,undefined,String(val))
 }
```

- 克隆节点

克隆节点就是把一个已经存在的节点复制一份，主要是为了做模板编译优化时使用

```
// 创建克隆节点
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
```

克隆节点就是把已有节点的属性全部复制到新节点中，而现有节点和新克隆得到的节点之间唯一的不同就是克隆得到的节点`isCloned` 为 `true`。

- 元素节点
