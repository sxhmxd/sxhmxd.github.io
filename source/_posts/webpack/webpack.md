---
title: webpack
categories: [webpack]
---

### webpack 是什么
 * Webpack是一个模块打包工具，在Webpack里一切文件皆模块。通过loader转换文件，通过plugin注入钩子，最后输出由多个模块组合的文件。Webpack专注构建模块化项目。
 * Webpack可以看作是模块打包机：它做的事情是，分析你的项目结构，找到JavaScript模块以及其他一些不能被浏览器直接运行的扩展语音(如：Scss,TypeScript等)，并将其打包为合适的格式以供浏览器使用。

###  Webpack的构建流程是怎么样的？

Webpack的运行流程是一个串行的过程，从启动到结束会依次执行以下步骤：

- 初始化参数：从配置文件和shell语句中读取与合并参数，得到最终参数；
- 开始编译：用上一步得到的参数初始化Compiler对象，加载所有配置的插件，执行对象的run方法开始执行编译；
- 确定入口：根据配置中的entry找出所有的入口文件；
- 编译模块：从入口文件出发，调用所有配置的loader对模块进行编译。再找出该模块依赖的模块，再递归本步骤，直到所有入口依赖的文件都经过本步骤的处理；
- 完成模块编译：在经过第四个步骤使用loader编译完所有模块后，得到每个模块被编译后的最终内容以及它们之间的依赖关系；
- 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的Chunk，再把每个Chunk转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
- 输出完成：在确认好输出内容后，根据配置确定输出的路径和文件名，把文件内容写进到文件系统中；
在以上过程中，Webpack会在特定的的时间点广播特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑。并且插件可以调用Webpack提供的API改变Webpack的运行结果。
### 分别介绍bundle，chunk，module是什么？
* bundle：由Webpack打包出来的文件
* chunk：代码块，webpack在进行模块的依赖分析的时候，代码分割出来的代码块
* module：是开发中的单个模块，在Webpack中，一切皆模块，一个模块对应一个文件
### 什么是Loader?什么是Plugin?
* loader: 模块转换器，用于对模块的源代码进行转换
* plugin: 自定义webpack打包过程的方式，插件含有apply属性的JavaScript对象，apply属性会被webpack compiler调用，并且compiler对象可以在整个编译生命周期内访问
###  loader和plugin有哪些不同？
 #### 不同的作用
loader直译为“加载器"，Webpack将一切文件视为模块，但是Webpack原生只能解析JavaScript和JSON类型文件。如果想加载解析其他类型文件，就会用到loader。所以loader是让Webpack拥有加载和解析非JavaScript文件的能力
plugin直译为”插件“，plugin可以扩展Webpack的功能，让Webpack具有更多的灵活性。在Webpack运行的生命周期中会广播许多事件，plugin可以监听这些事件，在合适的时机通过Webpack提供的API改变输出结果
#### 不同的用法
loader在module rules中配置，也就说它作为模块解析规则存在。类型为Array，每一项都是一个Object，里面描述了什么类型的文件(test)，使用什么加载(loader)和使用的参数(options)
plugin单独在plugins中单独配置。类型为Array，每项都是一个plugin的实例，参数是通过构造函数传入
###  有哪些常见的Loader？
file-loader: 将文件输出到一个文件夹中，在代码中通过相对路径(url)去引用输出的文件
url-loader: 和file-loader类似，但是能在文件很小的情况下，以base64的方式将内容注入到代码中
image-loader: 加载并压缩图片文件
babel-lodader: 将ES6转成ES5
css-loader: 加载CSS，支持模块化/压缩/文件导入等特性
style-loader：把CSS代码注入到JavaScript中，通过DOM操作去加载CSS
eslint-loader: 通过ESlint检查JavaScript代码
###  有哪些常见的Plugin？
define-plugin: 定义环境变量
html-webpack-pulgin: 生成创建html入口文件，并引用对应的外部资源
uglifyjs-plugin: 通过Uglifyjs压缩JavaScript代码
mini-css-extract-plugin: 分离CSS文件
clean-webpack-plugin: 删除打包文件
happypack: 实现多线程加速编译
