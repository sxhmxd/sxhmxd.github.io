---
title: Symbol,
categories: [ es6, Symbol]
---

##  Symbol
  对象的属性名都是字符串，容易造成属性名冲突。ES6 引入一种新的原始数据类型 Symbol，表示独一无二的值。
  Symbol 值通过 Symobl 函数生成。凡是属性名属于 Symbol 类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

  ```
    let s = Symbol()
      typeof s 
        // 'symbol'

  ```
  `Symbol` 函数不能使用 new 命令，否则会报错，new 命令生成的是一个对象，Symbol 值不是对象，是类似字符串的数据类型。
  - js 原始类型数据，除了 `null, undefined 和 symbol`外，其他类型的数据 都可以通过 new 命令初始化值，该命令返回的是一个 typeof 类型为 object的值。
  - Symbol 函数可以接收一个字符串作为参数，表示Symbol 实例的描述，主要是为了区分生成的变量。
  ```
    let s1 = Symbol('foo')
      // Symbol(foo)
    let s2 = Symbol('bar')
      // Symbol(bar)
  ```
  * 注意点 Symbol 值不能与其他类型的值进行运算，会报错。但是，Symbol 的值可以转换为字符串。Symbol的值可以转换为布尔值，但是不能转换为数值。
  
    ```
      var sy = Symbol('mySymbol')
        'Your symbol is' + sy
        `your symbol is ${sy}`
      String(sy)
        // 'Symbol(mySymbol)'
      sy.toStirng()
        // 'Symbol(mySymbol)'
      Boolean(sy)
        // true
    ```
### 作为属性名
  Symbol值都不相等的，用于对象的属性名，就能保证不会出现同名的属性。

  ```
    var sym = Symbol()
    // 第一种写法
      var a = {}
      a[sym] = 'Hello'
    // 第二种写法
      var a = {
        [sym]: 'Hello' 
      }
    // 第三种写法 
      var a = {}
      Object.defineProperty(a,sym,{value:'Hello'})
  ```
  * 注意点：Symbol 值作为对象的属性名的时候，不能通过 点运算赋值，如果是通过点运算赋的值，是和原来的为对象添加属性一样。因为点运算符后面总是字符串，所以不会读取 mySymbol 作为标识所指代的那个值，导致a的属性名实际上是一个字符串，而不是一个Symbol 值。
  ``` 
    var mySymbol = Symbol()
    var a = {}
    a.mySymbol = 'Hello'
    a[mySymbol] 
      // undefined
    a['mySymbol']
      // Hello
  ```
