---
title: [import 和 export]
categories: [import 和 export]
---


## 模块导出 export 

  - 一个文件定义一个模块，通过 export 语句导出该模块输出的变量
  - export语句有两种语法格式: 命名导出、默认导出

### 命名导出

  命名导出就是明确导出的变量名和值

  ```
    export var PI = 3.14
    export var add = function (x,y){
      return x + y
    }
    // 导入
    import * as Math from '路径'
    Math.PI
    Math.add(1,3)

  // 重命名导出
   var PI = 3.14
   Var add = function(x,y){
     return x + y
    
   }
   
    export { PI, add as Add} //把导出的变量add 重命名为Add

  ```

### 默认导出

  通过关键字 default 修饰 export 可以指定一个模块的默认输出变量值

```
  export default 3.14
  var PI = 3.14
  export default PI
  export default function add2(x,y){
    return x + y
  }
  // 一个模块最多只能有一个默认导出
  // 默认输出可以视为名字是 default d的模块输出变量
  // 默认导出后面可以是表达式
```

## 模块导入

  通过 import 语句导入外部模块。对应 export 语句的两种导出方式，import也分别存在两种不同的模块导入语法格式。

### 导入模块的命名输出

  ```
  // 导出
    export var PI = 3.14
    export var add = function (x,y){
      return x + y
    }

  // 导入
    import { PI, add } from ' 路径'

  ```
  `导入名称必须要和导出模块的输出变量 一 一 对应，否则就是 undefined`

 - 重命名导入的变量
  
  ```
    import { PI as pi, add as Add} from '路径'
  ```

  - 通配符 *
    如果导入一个模块所有命名输出，可采用

  ```
    import * as tool from '路径'

  ```

  `表示导入模块所有命名输出变量，并通过 重新命名的变量(tool)访问所有命名导出的变量`   ` 重新命名的变量(tool) 是个特殊的对象，叫  模块对象`

### 导入模块的默认输出

  ```
    // 导出
    var PI = 3.14;
    var add = function (x, y) { 
     return x + y;
    }
    export { PI, add as Add }; // 简写格式，统一列出需要输出的变量
    export default function say(){
      console.log(' I am default export')
    }
    
    // 导入
    import say from '路径'

    say()
  ```
  - 导入模块的默认输出可以用 as 重命名，可以利用重命名方式避免导入模块的变量名和本模块变量命名冲突
  - 导入模块默认输出发名字可以任意命名。
  - 如果同时导入模块的命名输出和默认输出，可采用格式
  ```
   import say, * as tool from '路径'
   import say, { PI, add } from '路径'
  ```
 `默认导入一定放在命名导入前面`
 ```
   import * as tool, say from '路径' // 错误
   import { PI, add }, say from '路径' //错误
   
 ```
### 只导入

  如果只导入一个模块，但不引用模块输出变量，可以简写

  ` import '路径'` 此时只会触发模块的执行

## 修改导入/导出的变量值

  - 修改导入的变量值

 `import 导入的变量和变量属性都是只读的`，不能也不应该修改导入的变量值

- 修改导出的变量值
  
  ```
   // 导出
    var Count = 0;
    var increase =  function() {
        Count++;
    }
    var Person = {
        name: 'Bob'
    }
    var changeName = function() {
        Person.name = 'John';
    }

    export { Count, Person, increase, changeName }; 

    // 导入
    import * as Math from './math.js'; 

    console.log(`Person:${JSON.stringify(Math.Person)}, Count:${Math.Count}`);// 修改前
    Math.increase();
    Math.changeName();
    console.log(`Person:${JSON.stringify(Math.Person)}, Count:${Math.Count}`);//  修改后
    //输出
    Person:{"name":"Bob"}, Count:0
    Person:{"name":"John"}, Count:1
  ```

  只要修改了到处知就会影响取值。

