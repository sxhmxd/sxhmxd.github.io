---
title: js 数据类型
---

ECMAScript 变量有两种不同的数据类型: 基本类型，引用类型。

## 基本类型

数据类型有 `undefined 、Boolean 、Number 、String 、null`

### 基本数据类型的特点

基本数据类型是按值传递，存储在栈区的数据，无法添加属性，删除属性，直接赋值给另一个变量，两个变量互不影响，修改其中任意一个变量的值，另外一个的值不发生变化。

- 、值是不可变的

```
let a = 'abc'
let b = a
b = '456'
console.log(a) // abc
console.log(b) // 456
```

- 、基本类型的比较是值的比较

```
let num = 1
let boolean = true

num == boolean  // true
 // ==  比较会进行隐式类型转换   true 转换成 1  false 转换成 0


```

- 、 基本类型的变量是存放在栈内存

```
let name = '张三'
let age = '12'

```

## 引用类型

引用类型有：`Object 、Array`

### 引用数据类型的特点

引用数据类型的赋值，是按引用传递，复制的是指针。是浅拷贝。

- 引用类型的值是可变的

```
let obj = {}
obj.name = '张三'
obj.age = '12'
function fun(o){
  let newObj = o
  newObj.name='李四'

}
console.log(obj.name)   // 张三
fun(obj)
console.log(obj.name)  // 李四

```

- 引用类型的值是同时保存在栈内存和堆内存中的对象

  javaScript 不允许直接访问内存中的位置，也就是不能直接操作对象的内存空间，实际上是操作对象的引用。引用类型的存储需要堆内存，和栈内存，栈内存保存变量标识符和指向堆内存中该对象的指针。

- 引用类型的比较是引用的比较

两个对象的比较是比较两个对象的堆内存中的地址是否相同。

```
let person1 = {}
let person2 = {}
console.log(person1 == person2 )  // false


```
