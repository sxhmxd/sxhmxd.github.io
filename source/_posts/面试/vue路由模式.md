---
title: [路由模式原理]
categories: [面试, vue知识点，路由模式原理]
---

## 路由的实现

前端路由的实现：本质上是检测 url 的变化，截获 url 地址，然后解析来匹配路由规则。但是 url 每次变化都会刷新页面，页面刷新 JavaScript 怎么检测和截获 url?2014 年之前，大家是通过 hash 来实现路由 url hash 类似于 `https://ssss.com/a/#file` `#` 后面 hash 值的变化，并不会导致浏览器向服务器发出请求，也就不会刷新页面，而 hash 值的变化都会触发 `hashchange`事件，通过这个事件我们就可以知道 hash 值发生了那些改变。

14 年后，HTML5 标准发布，多了两个 API `pushState 和 replaceState`,通过两个 API 可以改变 url 地址且不会发送请求。还有 `onpopstate`事件。用了 HTMl5 的实现，单页路由的 url 就不会多出一个 `#` 变得更加美观。但没有 # 所以当用户刷新页面之类的操作时，浏览器还是会给服务器发送请求，需要后台配置支持因为是单页面应用，如果后台没有正确的配置，当用户在浏览器直接访问 `htpp://oursit.com/user/id`就会返回 404

所以要在服务端增加一个覆盖所有情况的候选资源：如果 url 匹配不到任何静态资源，则应该返回一个 `index.html` ,这个 页面就是你 app 依赖的页面。

## hash 模式

hash 模式的工作原理是 hashchange 事件，可以在 window 监听 hash 的变化。

```
window.onhashchange = function(event){
  console.log(event)
}
```

有两个属性 newURL 和 oldURL。根据 hash 值的变化加载对应的动态页面数据。

## history 模式

HTML5 新增的 API

- history.pushState():往历史记录堆栈顶部添加一条记录
- history.replaceState():更改当前的历史记录。
- history.state: 用于存储以上方法的 data 数据
- window.onpopstate : 响应 pushState 或 replaceState 的调用

当使用 history 模式时，还需要后台配置支持，因为我们的应用是单页面应用，如果后台没有正确的配置，当用户在浏览器直接访问 `http://www.xxxxxx/detail` 就会返回 404 。所以需要在服务器增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html。服务器就不在返回 404 错误页面，因为会对所有路径返回 index.html 文件。为了避免这种情况，应该在 Vue 应用里面覆盖所有的路由情况，然后给出一个 404 页面。
