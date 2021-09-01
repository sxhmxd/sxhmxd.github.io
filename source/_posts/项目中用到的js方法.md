---
title: 项目中常用的js操作,
categories: [项目中常用的js操作]
---

###  创建tag标签

```
// 创建 script 标签 绑定id 创建新的script 时对比删除之前的。
  function  createScipt(str, id) {
      let getId = document.getElementById(id);
      getId ? getId.parentNode.removeChild(getId) : "";
      let head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.text = str;
      script.id = id;
      head.appendChild(script);
      // document.getElementsByTagName("head")[0].appendChild(script);
  },

```