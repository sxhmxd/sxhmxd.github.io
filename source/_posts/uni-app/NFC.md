---
title: NFC
categories: [NFC 识别功能]
---


### 创建NFC.js 文件

```JavaScript

// 包路径
const package_NdefRecord = "android.nfc.NdefRecord";
const package_NdefMessage = "android.nfc.NdefMessage";
const package_TECH_DISCOVERED = "android.nfc.action.TECH_DISCOVERED";
const package_Intent = "android.content.Intent";
const package_Activity = "android.app.Activity";
const package_PendingIntent = "android.app.PendingIntent";
const package_IntentFilter = "android.content.IntentFilter";
const package_NfcAdapter = "android.nfc.NfcAdapter";
const package_Ndef = "android.nfc.tech.Ndef";
const package_NdefFormatable = "android.nfc.tech.NdefFormatable";
const package_Parcelable = "android.os.Parcelable";
const package_String = "java.lang.String";

let NfcAdapter;
let NdefRecord;
let NdefMessage;
let readyRead = true; //开启读
let noNFC = false;
let techListsArray = [
 ["android.nfc.tech.IsoDep"],
 ["android.nfc.tech.NfcA"],
 ["android.nfc.tech.NfcB"],
 ["android.nfc.tech.NfcF"],
 ["android.nfc.tech.Nfcf"],
 ["android.nfc.tech.NfcV"],
 ["android.nfc.tech.NdefFormatable"],
 ["android.nfc.tech.MifareClassi"],
 ["android.nfc.tech.MifareUltralight"]
];
// 要写入的数据
let text = "{id:8888,name:nfc,stie:wangqin.com}";
let readResult = "";

export default {
 listenNFCStatus: function() {
  console.log("---------listenNFCStatus--------------")
  let that = this;
  try {
   let main = plus.android.runtimeMainActivity();
   let Intent = plus.android.importClass("android.content.Intent");
   let Activity = plus.android.importClass("android.app.Activity");
   let PendingIntent = plus.android.importClass("android.app.PendingIntent");
   let IntentFilter = plus.android.importClass("android.content.IntentFilter");
   NfcAdapter = plus.android.importClass("android.nfc.NfcAdapter");
   let nfcAdapter = NfcAdapter.getDefaultAdapter(main);
   if (nfcAdapter == null) {
    uni.showToast({
     title: "设备不支持NFC！",
     icon: "none"
    })
    noNFC = true;
    return;
   }
   if (!nfcAdapter.isEnabled()) {
    uni.showToast({
     title: "请在系统设置中先启用NFC功能！",
     icon: "none"
    });
    noNFC = true;
    return;
   } else {
    noNFC = false;
   }

   let intent = new Intent(main, main.getClass());
   intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
   let pendingIntent = PendingIntent.getActivity(main, 0, intent, 0);
   let ndef = new IntentFilter("android.nfc.action.TECH_DISCOVERED");
   ndef.addDataType("*/*");
   let intentFiltersArray = [ndef];

   //重点部分代码
   const promise = new Promise((resolve, reject) => {
    plus.globalEvent.addEventListener("newintent", function() {
     // 轮询调用 NFC
     // setTimeout(that.nfcRuning(resolve), 1000);
     setTimeout(() => {
         that.nfcRuning(resolve)
     }, 1000);
    });
   })
   
   nfcAdapter.enableForegroundDispatch(main, pendingIntent, intentFiltersArray, techListsArray);
   return promise
  } catch (e) {
  }
 },
 nfcRuning: function(resolve) {
  // console.log("--------------nfcRuning---------------")
  NdefRecord = plus.android.importClass("android.nfc.NdefRecord");
  NdefMessage = plus.android.importClass("android.nfc.NdefMessage");
  let main = plus.android.runtimeMainActivity();
  let intent = main.getIntent();
  let that = this;
  if (package_TECH_DISCOVERED == intent.getAction()) {
    if (readyRead) {
     //这里通过read方法拿到NFC数据
    const id = that.read(intent);
    // readyRead = false;
    //将数据返回出去
    resolve(id)
   }
  }
 },
 
 read(intent) {
  // toast("请勿移开标签正在读取数据");
  let that = this;
  // NFC id
  let bytesId = intent.getByteArrayExtra(NfcAdapter.EXTRA_ID);
  let nfc_id = that.byteArrayToHexString(bytesId);

  return nfc_id;
 },
 byteArrayToHexString: function(inarray) { // converts byte arrays to string  
  let i, j, inn;
  let hex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
  let out = "";

  for (j = 0; j < inarray.length; ++j) {
   inn = inarray[j] & 0xff;
   i = (inn >>> 4) & 0x0f;
   out += hex[i];
   i = inn & 0x0f;
   out += hex[i];
  }
  return out;
 },

}

function toast(content) {
 uni.showToast({
  title: content,
  icon: "none"
 })
}
```

### 页面使用

```Javascript
<view class="flex nfc-ewm">
  <view class="nfc-ewm-item"  @click="testNFC">
   <image src="@/assets/images/application/icon-nfc.png" alt=""></image>NFC感应
  </view>
  <view class="nfc-ewm-item" @click="openScanCode">
   <image src="@/assets/images/application/icon-ewm.png" alt=""></image>二维码扫描
  </view>
</view>

 
// 页面引入nfc.js文件  


import testtest from "nfc.js"

 methods：{
  async testNFC() {
   //这里用异步获取读取到的NFC数据
   const nfcId = await testtest.listenNFCStatus();
   //console.log(nfcId )
  if(nfcId){
     uni.showToast({
     icon: "none",
     title: "识别成功!",
     duration: 2000
    });
  }
   
  },
}

```