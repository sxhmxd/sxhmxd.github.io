let car = {}
let val = 3000
Object.defineProperty(car, 'price', {
  enumerable: true,
  configurable: true,
  get() {
    console.log('price属性被读取了')
    return val
  },
  set(newVal) {
    console.log('price 属性被修了')
    val = newVal
  },
})
