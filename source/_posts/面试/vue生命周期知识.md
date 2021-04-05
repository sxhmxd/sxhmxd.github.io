---
title: [生命周期知识]
categories: [面试, vue知识点, 生命周期知识]
---

var app = new Vue({})

第一个钩子函数就是 beforeCreate，在这之前组件还没有真正的初始化。
在 beforeCreate 之后，Vue 对 data 对象作了 getter/setter 处理，并且将对象放在一个 Observe 里面以便监控对象。还使用 initEvents 绑定事件。

`此时不能访问data的属性以及绑定的事件`

组件初始化完成后，遇到 created。在这个阶段我们可以访问到了 data 的属性以及绑定的事件。

通过 created 阶段后组件的生命周期到了 beforemount,在这个阶段 DOM 结构还没有生成。但是已经创建了 el，组件挂载的根节点。在 beforemount 执行之后开始渲染 DOM。执行\_render 方法，\_mount 方法，然后会有 new 出一个 watcher 对象，形成 VNode 节点，然后更新 DOM。

渲染完毕后组件就会到下一个声明周期 mounted，一般的异步请求都会写在这里。这个阶段 DOM 已经渲染出来了。

Q: 什么是生命周期

A: Vue 实例从创建到销毁的过程，就是生命周期。也就是从开始创建、初始化数据、编译模板、挂载 DOM->渲染、更新->渲染、卸载等一系列过程。
