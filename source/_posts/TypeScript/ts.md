---
title: TypeScript
categories: [TypeScript]
---

## TypeScript 是什么

### TS 简介
 
 Ts是微软开发的一个开源编程语言，通过在JS的基础上添加静态类型定义构建而成。TS通过TS编译器或者Babel转译为JS代码，可运行在任何浏览器，任何操作系统。

### TS 和 JS的区别
 TS 是JS 的一个超集，之间没有所属关系，ts扩展了js 弱类型语言的限制，增加更多的模块解析方式和语法糖。ts 并不是一个可以独立运行的语言，大多数时候可以被转译成js 运行。 可以认为 ts 相当于功能更丰富的编译型的js。

### 为什么要有TS 

传统的js本身已经完全满足应用打开，但是在大型项目或者插件的开发场景中，js 弱类型语言的不足便暴露出来，由于js是解释型语言，在代码编译的过程中无法轻松的实现良好的类型约束和类型推断。若开发者提供了一个解释依赖包给其他开发者来使用，使用依赖的开发者并不能显示观察依赖包的内部组成。这样导致在代码阅读上无法确定该属性的明确类型，会导致代码运行上存在风险。

  综上所述，js在代码的可维护性上存在一些弱项，所有强类型的ts正好适用于此类型开发场景。
   ts 强类型的约束性及其面向接口编程的约束性可以让ts 语言开发的应用有极强的维护性，代价是更大的代码篇幅。
   ts适用于插件提供者，依赖库提供者，基于js的服务端项目，已经大型项目的工程化开发使用。


## TypeScript 语法


### 基础数据类型
#### jS的八种内置类型
  ```ts
    let str: string = "111";
    let num: number = 123;
    let bool: boolean = false;
    let u: undefined = undefined;
    let nu: null = null;
    let obj: object = {};
    let big: bigint = 100n;
    let sym: symbol = Symbol("me");
  ```

### 其他类型

#### Array
-  对数组类型的定义有两种方式：
  
  ```js
    let arrStr: string[] = ["1", "2"];
    let arrNum: Array<string> = ["1", "2"];
  ```

-  定义联合类型数组
 
  ```ts
    let arr2: (string | number)[] = ["1", "2", 3];
    let arr1: Array<string | number> = [1, 2, 3, 4];
  ```

-  定义指定对象成员的数组
 
  ```ts
    interface ArrayObj {
      name: string;
      age: number;
    }
    let arrObj: ArrayObj[] = [{ name: "xxx", age: 12 }];
    // 任意类型的数组
    let arrAny: any[] = [1,'string',boolean,null,undefined]
    let arrAny1:Array<any> = [1,2,true,'string']
  ```

### 函数
-  函数声明
  
  ```ts
    function sum(x: number, y: number): number {
      return x + y;
    }
  ```
-  函数表达式
 
  ```ts
    let mySum: (x: number, y: number) => number = function (x: number y:number): number {
      return x + y;
    };
  ```
-  可选参数且函数有返回值
 
  ```ts
    function joinName(firstName: string, lastName?: string): string {
      return firstName + lastName;
    }
  ```

-  参数默认值

  ```ts
    function names(firstName: string, lastName: string = "Cat"): string {
      return firstName + lastName;
    }
  ```
-  剩余参数

  ```ts
  function push(arr: any[], ...items: any[]) {
    items.forEach((element) => {
      arr.push(element);
    });
  }
  ```
  - 带参数无返回值
  ```ts
   function test(name:string,age:number):void{

   }

  ```
- 函数重载
  js是一个动态语言，我们通常会使用不同类型的参数来调用同一个函数，该函数会根据不同的参数返回不同类型的调用结果;

  ```ts
    function add(x, y) {
      return x + y
    }
    add(1,2)
    add("1","2")
  ```
 * 定义联合类型 

    ``` ts
      // 定义联合类型同时为该联合类型取一个别名
      type Combinable = string | number

      // 使用联合类型
      function add(a:Combinable,b:Combinable){
        if (typeof a === 'string' || typeof b === 'string') {    
        return a.toString() + b.toString();   
        }  
        return a + b;
      }
    ```
### Tuple(元组)
- 元组定义
  元组是TypeSctipt 中特有的类型，其工作方式类似于数组元组最重要的特性是可以限制`数组元素的个数和类型`,特别适合用来实现多值返回。
  元组用于保存定长定数据类型的数据。
  ```ts
    let x: [string,number] years
    // 类型必须匹配且个数必须为2
    x = ["12",10] // ok
    x = [10,10]   // error
  

  ```
- 元组类型的解构赋值

```ts
  let employee:[number,string] = [1,'string']
  let [id,username] = employee
  console.log(`id:${id}`)   // id:1
  console.log(`username:${username}`)  // username:string
```
注意点，在解构时，如果解构数组元素的个数不能超过元组中元素的个数，否则也会出现错误。

- 元组类型的可选元素
  在定义元组类型时，可以通过 ? 号来声明元组类型的可选元素。
  ```ts
  let optionalTuple:[string,boolean?];
  optionalTuple = ['string',true]
  optionalTuple = ['string']
  ```
### 枚举 interFace
 是一个完全抽象的对象，一个interface 可以对应多个class 对其内部的未实现方法进行实现，ts 中，interface 主要用于类型描述。

  ```ts 
    interface User{
      name:string
      age:number
      sex:string
    }
    let obj:User ={
      name:string
      age:number
      sex:string
    }
    //是强约束 约定该对象必须包含name,age,sex 这几个属性，不能有其他对象
    interface Us{
      readonly name:string,  // 表示该属性只读，不可以修改
      age:number,
      [props:string]:any
    }
    // 可以有约定以外的其他属性
    interface Func{
      (name):string
    }
    // 定义函数的接口
    let fun:Func = function(name:string):string {
      return name
    }

    interface User {
      name:string,
      age:number,
      sex:string
    }
    interface Admin{
      name:string,
      age:number
    }
    type Person = User | Admin
    let userobj =  Array<Person> = [
      {name:'',age:'',sex:''},
      {name:"",age:""}
    ]

  ``` 

### 泛型
 泛型是静态类型语言的另一灵魂工具，这里体现于静态类型的语言在定义类型时必须明确类型而造成的问题。
 当函数的参数和返回类型明确时，相同结构的函数需要根据不同的类型定义多个，这种情况很容易将代码的复杂度提高降低可维护性

  ``` ts
  function test<T>(arg:T):T{
    return arg
  }

  ```

### 类型推断

在很多情况下，Typescript会根据上下文环境自动推断出变量的类型，无需我们再写明类型注解。
  ```ts
    let str = 'ss'
    let num = 1
    let bool = true
  ```
我们把TypeScript 这种基于赋值表达式推断类型的能力称之为 `类型推断`

### 类型断言

  有时候会遇到这样的情况，你会比ts 更了解某个值的详细信息通常这会发生在你清楚的知道一个实体具有比它现有类型更确切的类型。
  通过类型断言这种方式告诉编辑器 ，"相信我，我知道自己在干什么"。类型断言好比其他语言里的类型转换，但是不进行特殊的数据检查和解构。它没有运行时的影响，只是在编译阶段起作用。
```ts
  // 尖括号语法
  let someValue:any = 'this is a string'
  let strLength:number = (<string>someValue).length
  // as 语法
  let someValue:any = 'this is a string'
  let strLength:number = (someValue as string).length
```
### 非空断言
  在上下文中当类型检查器无法判定类型时，一个新的后缀表达式操作符! 可以用于断言操作对象是非 null 和undefined 类型，`x! 将从x值域中排除 null 和undefined `
  ```ts
    let value:null | undefined | string 
    value!.toString() 
    value.toString()  // 报错
  ```
### 确定赋值断言
  允许实例属性和变量声明后面放置一个! 号，从而告诉 ts 该属性会被明确地赋值。
  ```ts
    let x: number;
    initialize();

    // Variable 'x' is used before being assigned.(2454)
    console.log(2 * x); // Error
    function initialize() { 
      x = 10;
    }
    // 使用确定赋值断言
    let x!:number
    initialize()
    console.log(2*x)
    function initialize(){
      x=10
    }
  ```
  通过 `let x!:number` 确定赋值类型断言，ts编辑器就会知道该属性会被明确地赋值。
### 字面量类型
  在ts 中字面量不仅可以表示值，还可以表示类型，即所谓的字面量类型。目前ts支持三种字面量类型：`字符串字面量类型、数字字面量类型、布尔字面量类型`。
  ```ts
    let str: '1' ='string'
    let num: 1 = 124
    let bool: true = false
  ```
### 联合类型
  联合类型表示取值可以为多种类型中的一种，使用 | 分割每个类型

  ```ts
    let strNum: string | number 
    strNum = 'ss'
    strNum = 123
  ```
### 类型别名
  类型别名用来给一个类型起一个新名字。类型别名常用于联合类型

  ```ts
    type Message = string | string[]

  ```
  注意：类型别名是给类型起一个新的名字，并不是创建一个新的类型。
### 交叉类型
  交叉类型是将多个类型合并为一个类型。我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性，使用`&` 定义交叉类型。
  如果我们仅仅是把原始类型，字面量类型，函数类型等原始类型合并成为交叉类型是没有任何用处的。它的用处是将多个接口类型合并成一个类型，从而实现等同接口继承的效果，也就是所谓的合并接口类型。
  ```ts
    type  IntersectionType = {id:number,name:string}&{age:number}
    const user:IntersectonType = {
      id:1,
      name:'name',
      age:18
    }
  ```
  上面例子，我们通过交叉类型，使得IntersectionType 同时拥有了id name age 所有属性，这里我们可以试着将合并接口类型理解为求并集。


## object Object 和 {}

小 `object` 代表的是所有非原始类型，也就是我们不能把 `number string boolean ` 等原始类型赋值给`object` 。在严格模式下 `null` 和`undefined` 类型也不能赋给 `object`

大 `Object` 代表所有拥有 `toString hasOwnProperty` 方法的类型，所以所有原始类型、非原始类型都可以赋给 `Object`。 在严格模式下 `null` 和`undefined` 类型也不能赋给 `object`
  大 Object 保护你原始类型，小object 仅包含非原始类型，所以大Object 似乎是小 object的父类型。实际上， 大Object 不仅是 小object的父类型，同时也是小object的子类型。
  注意点：尽管官方文档说可以使用小object代替 大Object，但是我们仍要明白大Object 并不完全等于小object。

`{}` 空对象类型和大Object一样，也是表示原始类型和非原始类型的集合，并且在严格模式下，`null` 和 `undefined` 也不能赋给 `{}`
`综上结论：{}、大 Object 是比小 object 更宽泛的类型（least specific），{} 和大 Object 可以互相代替，用来表示原始类型（null、undefined 除外）和非原始类型；而小 object 则表示非原始类型。`