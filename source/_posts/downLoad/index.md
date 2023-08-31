---
title: 常用的下载方法

---

###   通用下载，后端给文件的链接通过浏览器下载

```javaScript
/**
 * 
 * @param {String} url 文件在服务器的路径
 * @param {String} fileName 文件命名
 */
export const urlDownload = (url, fileName = '下载文件') => {
  // 创建隐藏的可下载链接
  let eleLink = document.createElement('a')
  eleLink.download = fileName
  eleLink.style.display = 'none'
  eleLink.href = url
  // 触发点击
  document.body.appendChild(eleLink)
  eleLink.click()
  // 然后移除
  document.body.removeChild(eleLink)
}


```

### 下载多个文件

```javaScript 
/**
 * 
 * @param {Array} urls 文件路径列表

 */
export function dowanLoadUrls(urls: Array<string>) {
  urls.forEach((item) => {
    if (item) {
      const iframe = document.createElement('iframe')

      iframe.style.display = 'none'
      iframe.src = baseURL + item
      document.body.appendChild(iframe)
      // elink.click()
      setTimeout(() => {
        iframe.remove()
      }, 50 * 1000)
    }
  })
}
```
 
### 返回的是二进制文件流下载


```javaScript
/**
 * 
 * @param {string} url 文件路径
 * @param {Object} params 请求携带的参数
 * @param {string} filename 请求携带的参数

 */
export function download(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({
    text: '正在下载数据，请稍候',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  return service
    .post(baseURL + url, params, {
      transformRequest: [
        (params) => {
          return tansParams(params)
        },
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config,
    })
    .then(async (data) => {
      const isLogin = await blobValidate(data)
      if (isLogin) {
        const blob = new Blob([data])
        saveAs(blob, filename)
      } else {
        const resText = await data.text()
        const rspObj = JSON.parse(resText)
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
        ElMessage.error(errMsg)
      }
      downloadLoadingInstance.close()
    })
    .catch((r) => {
      console.error(r)
      ElMessage.error('下载文件出现错误，请联系管理员！')
      downloadLoadingInstance.close()
    })
}
/**
* 参数处理
* @param {*} params  参数
*/
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result
}
  download('/template/downloadTemplateFile', { schemaKey: row.schemaKeyName }, name, '')
```

###  下载xml,txt 下载后是在浏览器打开的情况

``` javaScript
/**
 * @param {String} url 文件在服务器的路径
 * 
 */
export function downLoadXM(url: string) {
  const name = url.replace(/\/\w{1,}\/|\w{1,}\//g, '')
  const createUrl = baseURL + url
  axios
    .get(createUrl, {
      responseType: 'blob',
      headers: {
        'Content-Disposition': 'attachment',  // 解决 下载后是在浏览器打开的问题
      },
    })
    .then((res) => {
      // const blob = new Blob([res.data])
      const blobUrl = window.URL.createObjectURL(res.data)
      // download(blobUrl, name)
      let eleLink = document.createElement('a')
      eleLink.download = name
      eleLink.style.display = 'none'
      eleLink.href = blobUrl
      // 触发点击
      document.body.appendChild(eleLink)
      eleLink.click()
      // 然后移除
      document.body.removeChild(eleLink)
    })

}
```

###  下载 zip 文件

```javaScript
const mimeMap = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip'
}

const baseUrl =   process.env.VUE_APP_SERVER_ID == 1
? window.$BaseUrl.BASE_API
: process.env.VUE_APP_BASE_API
export function downLoadZip(str, filename) {
  var url = baseUrl + str
  axios({
    method: 'get',
    url: url,
    responseType: 'blob',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  }).then(res => {
    resolveBlob(res, mimeMap.zip)
  })
}
/**
 * 解析blob响应内容并下载
 * @param {*} res blob响应内容
 * @param {String} mimeType MIME类型
 */
export function resolveBlob(res, mimeType) {
  const aLink = document.createElement('a')
  var blob = new Blob([res.data], { type: mimeType })
  // //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
  var patt = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
  var contentDisposition = decodeURI(res.headers['content-disposition'])
  var result = patt.exec(contentDisposition)
  var fileName = result[1]
  fileName = fileName.replace(/\"/g, '')
  aLink.href = URL.createObjectURL(blob)
  aLink.setAttribute('download', fileName) // 设置下载文件名称
  document.body.appendChild(aLink)
  aLink.click()
  document.body.appendChild(aLink)
}
```

###  使用 file-saver 保存

```javaScript
npm install file-saver --save
/**
 *  @param {string} param 要保存的字符串
 *  @param {string} name  文件名称
 * 
 */
import { saveAs } from 'file-saver'

  var blob = new Blob([param], { type: 'application/json;charset=utf-8' })
  saveAs(blob, name)
```

### 读取本地文件

```Html
<el-upload
          action="#"
          :on-change="handleChange"
          :show-file-list="false"
          :auto-upload="false"
          accept="json"
        >
          <template #trigger>
            <el-button type="success" plain>读取JSON文件</el-button>
          </template>
</el-upload>
```
```javascript
 javaScript const handleChange = (uploadFile, uploadFiles) => {
  console.log('uploadFile', uploadFile)

  let fileExtension = ''
  if (uploadFile.name.lastIndexOf('.') > -1) {
    fileExtension = uploadFile.name.slice(uploadFile.name.lastIndexOf('.') + 1)
  }
  const isTypeOk = fileExtension === 'json' ? true : false
  if (!isTypeOk) {
    proxy.$modal.msgError(`文件格式不正确, 请上传JSON格式文件!`)
    return
  }
  const file = uploadFile
  const raw = file?.raw
  const reader = new FileReader()
  reader.readAsText(raw, 'UTF-8')
  reader.onload = (event) => {
    if (event.target?.result) {
      const fileData = event.target.result
      codeEditRef.value.setCode(fileData)
    }
  }
}
```
