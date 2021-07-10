---
title: [ JS代码执行过程分析]
categories: [js知识体系, js 代码执行过程分析]
---


## 解释型语言和编译型语言

  - 编译型语言，编译步骤分为：词法分析、语法分析、语义检查、代码优化和字节生成。
  - 解释型语言：通过词法分析和语法分析得到抽象语法树后，就开始解释执行，

## js 的解释执行

js  作为一门解释性语言，其运行过程分为 `预解析` 和 `自上而下逐行解释执行` 两个过程。包括的步骤
  词法分析、语法分析、预编译、执行

### 词法分析
  词法分析器的作用，是将一行行的源码拆解成一个个词义单位(token)，词义单位指的是语法上不可能再分的、最小的单个字符或字符组合。

```
  var a = 2 
  function addA(){
    return a 
  }
  // 词法分析后的结果
  [
    {"type":"Keyword","value":"var"},
    {"type":"Identifier","value":"a"},
    {"type":"Punctuator","value":"="},
    {"type":"Numeric","value":"2"},
    {"type":"Punctuator","value":";"},
    {"type":"Keyword","value":"function"},
    {"type":"Identifier","value":"addA"},
    {"type":"Punctuator","value":"("},
    {"type":"Punctuator","value":")"},
    {"type":"Punctuator","value":"{"},
    {"type":"Keyword","value":"return"},
    {"type":"Identifier","value":"a"},
    {"type":"Punctuator","value":";"},
    {"type":"Punctuator","value":"}"}
  ] 
```
### 语法分析
  js引擎要读的是抽象语法树
  语法分析将上一步生成的数组，根据语法规则，转为抽象语法树(AST)。如果源码符合语法规则，这一步就会顺利完成，生成一个抽象语法树；如果源码存在语法错误，这一步就会终止，抛出一个"语法错误"，并结束整个代码块的解析。

这个阶段主要做了两件事情
  - 确定作用域，根据静态作用域的特点，这个时候每个变量的作用域已经很明确了，不会再改变
  - 记录每个作用域的所有变量和内嵌函数。
  
  ```
    var a = 2
    function addA() {
      return a 
    }
    // 生成的抽象语法树
  
  {
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "a"
                    },
                    "init": {
                        "type": "Literal",
                        "value": 2,
                        "raw": "2"
                    }
                }
            ],
            "kind": "var"
        },
        {
            "type": "FunctionDeclaration",
            "id": {
                "type": "Identifier",
                "name": "addA"
            },
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "ReturnStatement",
                        "argument": {
                            "type": "Identifier",
                            "name": "a"
                        }
                    }
                ]
            },
            "generator": false,
            "expression": false,
            "async": false
        }
    ],
    "sourceType": "scr
  ```
  ### 预编译

    预编译是指 JS 引擎再执行一个函数时，会创建对应的 `执行上下文` ，它根据抽象语法树做的一些'准备工作'。这个过程包括
      - 创建变量对象
        - 创建 arguments 对象，同名的实参，形参和变量之间是 引用 关系。
        - 从语法分析树中复制作用域内的内嵌函数作为属性，key 为函数name,属性值为函数的内存地址。
        - 从语法分析树中复制作用域内所有变量 作为属性，key 为变量名称，此时变量值全部为 undefined ，若变量和函数存在同名，则跳过
      - 创建作用域链，根据语法分析树中函数对应的作用域，结合当前环境的变量对象和上层环境的一系列变量对象组成
      - 确定this 指向。
    全局上下文的时候，变量对象就是全局对象 window,this也指向 window 
  
  ### 执行

    开始执行后，执行上下文中的变量对象转换为活动对象，可以执行一些列的操作。
    - 变量赋值，查找规则是先找自身作用域，找不到就在作用域上查找
    - 函数作用域
    - 执行其他代码
    - 执行结束，内存回收
`代码执行结束后，函数内变量的生存周期取决于函数实例是否存在引用，如果没有就销毁活动对象`

### 执行上下文
  
  执行上下文就是当前 JavaScript 代码被解析和执行时所在环境的抽象概念，JavaScript 中运行任何的代码都是在执行上下文中运行。
  每当控制器转到可执行代码的时候，就会进入一个执行上下文。执行上下文可以理解为当前代码的执行环境，它会形成一个作用域。JavaScript 中的运行环境大概包括三种情况
    - 全局执行上下文: JavaScript 代码运行起来会首先进入该环境，是最基础的执行上下文。不在任何函数中的代码都位于全局执行上下文中。
      做了两件事
        - 创建全局对象，在浏览器中这个全局对象就是 window 对象
        - 将this指针指向这个全局对象。一个程序中只能存在一个全局执行上下文。
    - 函数执行上下文: 每次调用函数时，都会为该函数创建一个新的执行上下文。每个函数都拥有自己的执行上下文，
    - eval
#### 执行上下文的生命周期
  执行上下文的生命周期包括三个阶段：创建阶段 --> 执行阶段 --> 回收阶段
  
  - 创建阶段
    - 创建变量对象：首先初始化函数的参数 arguments，提升函数声明和变量声明。
    - 创建作用域链：在执行期上下文的创建阶段，作用域链是在变量对象之后创建的。作用域链本身包含变量对象。作用域链拥有解析变量。当被要求解析变量时，JavaScript 始终从代码嵌套的最内层开始，如果最内层没有找到变量，就会跳到上一层父作用域中查找，直到找到该变量。
    - 确定this指向
-  变量对象(Variable Object)
  在执行上下文创建阶段会生成变量对象，生成变量对象主要有三个过程
  - 检索当前上下文中的参数。该过程生成Arguments 对象，并建立以形参变量名为属性名，形参变量值为属性值的属性
  - 检索当前上下文中的函数声明，该过程建立以函数名为属性名，函数所在内存地址引用为属性的值的属性
  - 检索当前上下文中的变量声明。该过程建立以变量名为属性名，undefined 为属性值的
  
  ```
    VO = {
      Arguments:{},
      ParamVariable: 具体值  // 形参变量
      Function: <Function reference>,
      Variable: undefined
    }
  ```
  当执行上下文进入执行阶段后，变量对象会变为`活动对象(Active Object)`此时原先声明的变量会被赋值。
   
