---
title: [css, 项目中常用到的 ]
categories: [css, 项目中常用到的]
---

## 文字超长省略

```
.span{
   overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis
}
```
## 修改滚动条样式

```
slide_box::-webkit-scrollbar{
  width:10px;
  height:10px;
  /**/
}
.slide_box::-webkit-scrollbar {
  /*滚动条整体样式*/
  width : 10px;  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
  }
  .slide_box::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  background   : #ddd;
  }
  .slide_box::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  background   : #ededed;
  }

```