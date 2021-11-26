---
title: async await,
categories: [ async await]
---

## async 

`异步编程的最高境界，就是根本不用关心它是不是异步`

`async 函数是 Generator 函数的语法糖`


async 是一个修饰符，async定义的函数会默认返回一个Promise对象resolve的值，因此对async函数可以直接进行then操作，返回的值即为then方法的传入函数

async 函数(包含函数语句，函数表达式，Lambda表达式) 会返回一个Promise 对象，如果在函数中直接返回一个直接量，async 会把这个直接量通过 Promise.resolve() 封装成Promise对象

## await 

一般来说，await 是在等待一个async 函数完成。await 等待的是一个表达式，这个表达式的计算结果是 Promise 对象或者其它值（换句话说，就是没有特殊限定）。


async 函数返回的是一个Promise 对象，所以await 可以用于等待一个async 函数的返回值，它等待的实际是一个返回值，await不仅仅用于等待Promise对象它可以等待任意表达式的结果。即await后面是可以接普通函数或者直接量的。
- awit 等到了要等东西，
  - 如果等到的是一个promise对象，await会阻塞后面的代码，等着Promise对象resolve ,然后得到resolve的值，作为await表达式的运算结果。
  - 如果不是promise 对象，那await表达式的运算结果就是它等到的东西。
  - await 等待的不是一个Promise 对象的时候，相当于 await Promise.resolve

## async await 的优势

优势在于处理then 链
