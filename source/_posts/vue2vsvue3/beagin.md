---
title: vue2 VS vue3,
categories: [vue2 与 vue3 ]
---

# 区别 

## 组合API 

vue2 是 `选项式API(Option API)`，一个逻辑会散落在文件的不同位置(data、props、computed、watch、生命周期函数等)，导致代码的可读性变差，需要上下来回滚动跳转文件位置。Vue3 `组合式 API(Composition API)`则很好地解决这个问题，可将同一逻辑的内容写到一起。增强了代码的可读性、内聚性，还提供了较为完美的逻辑复用方案，
例子🌰
  ```vue3
    <template>
       <span> mouse position {{x}}  {{y}}</span>
    </template>
    <script setup>
      import { ref } from 'vue'
      import useMousePosition from './useMousePosition'
      const {x,y}  = useMousePosition()
    </script>
  
    // useMousePosition.js
    
    import { ref, onMounted, onUnmounted } from 'vue'
    function useMousePosition() {
      let x = ref(0)
      let y = ref(0)

       function update(e) {
        x.value = e.pageX
        y.value = e.pageY
      }
      
      onMounted(() => {
        window.addEventListener('mousemove', update)
      })
      
      onUnmounted(() => {
        window.removeEventListener('mousemove', update)
      })
      
      return {
        x,
        y
      }
    }
  ```
  `解决vue2 mixin 的存在命名冲突隐患，依赖不明确，不同组件间配置化不够灵活`

## 响应式原理

vue2 响应式原理基础是 Object.defineProperty; Vue3 响应式原理基础是 Proxy 

### Object.defineProperty

直接在对象上定义一个新的属性或者修改现有的属性，并返回对象。存在的缺陷是：无法监听对象或者数组新增、删除元素。Vue2 方案针对常用数组原型方法 push、pop、shuift、unshift、splice、 sort、reverse进行了封装处理

