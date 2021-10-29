---
title: @import 导入css
categories: [@import 导入css]
---

### @import

在使用构建工具的环境中，eg:webpack,es6 import 默认是只能加载js的。如果是其他文件就需要装对应的loader,配置对应的loader,才可以使用。import 只能在js文件中使用，或者 .vue文件中的<script>标签中，而@import 只能在 .vue文件的<style>标签中使用。而且@import 加载是全局的。


@import 是css的语法，是可以直接使用的。不过是同步的，会开辟一个新的'HTTP网络亲求线程'去请求资源文件。但是在资源文件没有请求回来之前，GUI 渲染线程会被 "阻塞",不允许其继续向下渲染。

