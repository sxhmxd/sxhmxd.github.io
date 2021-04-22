---
title: [elementUI奇怪问题解决办法]
categories: [elementUI奇怪问题解决办法]
---
##  el-tabs 切换窗口或者重新编译会有蓝色阴影
```
// 需要在全局添加以下样式
.el-tabs__item:focus.is-active.is-focus:not(:active) {
    -webkit-box-shadow: none !important;
    box-shadow: none !important;
  }
```
