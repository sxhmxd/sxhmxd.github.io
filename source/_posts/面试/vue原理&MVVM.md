---
title: [双向数据绑定原理& MVVM]
categories: [面试, vue知识点，双向数据绑定原理& MVVM]
---

## 几种实现双向数据绑定的做法

实现数据绑定的做法有大致有：

- 发布者-订阅者模式
  一般通过 sub、pub 的方式实现数据和视图的绑定监听，更新数据的方式通常做法是 vm.set('property',value)
- 脏值检查 (angular.js)
  是通过脏值检测的方式比对数据是否有变更，来决定是否更新视图，最简单的方式是通过 setInterval() 定时轮询检测数据变动，angular 只有在指定的事件触发时进入脏值检测，大致流程
  - DOM 事件，例如用户输入文本点击按钮等
  - XHR 响应事件($http)
  - 浏览器 Location 变更事件($location)
  - Timer 事件($timeout,$interval)
  - 执行 $digest() 或 $apply()
- 数据劫持 (vue.js)
  vue.js 是数据劫持结合发布者-订阅者模式的方式，通过 Object.defineProperty() 来劫持各个属性的 setter，getter,在数据变动时发布消息给订阅者，触发相应的监听回调。

## 实现思路

要实现 mvvm 的双向绑定，就必须要实现以下几点：

- 实现一个数据监听 Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
- 实现一个指令解析器 Compile,对每一个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数。
- 实现一个 Watcher,作为连接 Observer 和 Compile 的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图。

![](https://segmentfault.com/img/bVBQYu?w=730&h=390)

### 实现 Observer

利用 Object.defineProperty() 来监听属性变动，那么将需要监听的数据对象进行递归遍历，包括子属性对象的属性，都加上 setter 和 getter, 这样给这个对象的某个值赋值，就会触发 setter，那么就能监听到了数据变化

```
  function observe(data) {
      if (!data || typeof data !== 'object') {
          return;
      }
      // 取出所有属性遍历
      Object.keys(data).forEach(function(key) {
          defineReactive(data, key, data[key]);
      });
  };

  function defineReactive(data, key, val) {
      observe(val); // 监听子属性
      Object.defineProperty(data, key, {
          enumerable: true, // 可枚举
          configurable: false, // 不能再define
          get: function() {
              return val;
          },
          set: function(newVal) {
              console.log('哈哈哈，监听到值变化了 ', val, ' --> ', newVal);
              val = newVal;
          }
      });
  }
```

这样我们就可以监听每个数据的变化了，监听到变化之后就是怎么通知订阅者了，接下来我们需要实现一个消息订阅器，就是维护一个数组，用来收集订阅者，数据变动触发 notify,再调用订阅者的 update 方法。

```
  function defineReactive(data, key, val) {
    var dep = new Dep();
    observe(val); // 监听子属性

    Object.defineProperty(data, key, {
        // ... 省略
        set: function(newVal) {
            if (val === newVal) return;
            console.log('哈哈哈，监听到值变化了 ', val, ' --> ', newVal);
            val = newVal;
            dep.notify(); // 通知所有订阅者
        }
    });
}

function Dep() {
    this.subs = [];
}
Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
};
```

who 是订阅者？怎么往订阅器添加订阅者？
订阅者就是 Watcher 而且 var dep = new Dep() 是在 defineReactive 方法内部定义的，所以想通过 dep 添加订阅者，是在 getter 里面

```
  Object.defineProperty(data, key, {
    get: function() {
        // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
        Dep.target && dep.addSub(Dep.target);
        return val;
    }
    // ... 省略
});

// Watcher.js
Watcher.prototype = {
    get: function(key) {
        Dep.target = this;
        this.value = data[key];    // 这里会触发属性的getter，从而添加订阅者
        Dep.target = null;
    }
}
```

### 实现 Compile

compile 主要做的事情是解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图。
![](https://segmentfault.com/img/bVBQY3?w=625&h=259)

```
  function Compile(el) {
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if (this.$el) {
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}
Compile.prototype = {
    init: function() { this.compileElement(this.$fragment); },
    node2Fragment: function(el) {
        var fragment = document.createDocumentFragment(), child;
        // 将原生节点拷贝到fragment
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }
};a
```

### 实现 Watcher

Watcher 订阅者作为 Observer 和 Compile 之间的通信的桥梁，主要做的事情是：

- 在自身实例化时往属性订阅器(dep)里添加自己
- 自身必须有一个 updata()方法
- 待属性变动 dep.notice() 时，能调用自身的 update() 方法并触发 Compile 中绑定的函数。

### MVVM

View: 视图层(UI 用户界面)
ViewModel: 业务逻辑层(一切 js 可视为业务逻辑层)
Model: 数据层(存储数据及对数据的处理如增删改查)

- MVVM 将数据双向绑定作为核心思想，View 和 Model 之间没有联系它们通过 ViewModel 这个桥梁进行交互。
- Model 和 ViewModel 之间的交互是双向的，因此 View 的变化会自动同步到 Model，而 Model 的变化也会立即反映到 View 上显示。
- 用户操作 View， ViewModel 感知到变化，然后通知 Model 发生相应改变；反之当 Model 发生改变，ViewModel 也能感知到变化，使 View 做出相应更新。
- ViewModel 通过双向数据绑定把 View 层和 Model 层连接起来，而 View 和 Model 之间的同步完全是自动的，无需人为干涉，开发者只需关注业务逻辑，不需要手动操作 DOM。
