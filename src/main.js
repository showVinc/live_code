/*
 * @Author: vinc
 * @LastEditTime: 2020-04-26 16:10:43
 */
import Vue from 'vue'
import App from './App'
// import MintUI from 'mint-ui'
// import 'mint-ui/lib/style.css'
// Vue.use(MintUI)

import '../assets/css/main.less';
import Store from './store'
import WXrequest from './utils/wx-request'
Vue.prototype.$request = WXrequest
Vue.prototype.$store = Store

//判断是否本地 打包后的api 地址 根据场景设置
process.env.NODE_ENV == "development" ? Store.commit("SET_URL", "https://server.showvinc.com") : Store.commit("SET_URL", "https://server.showvinc.com");

let userInfo = mpvue.getStorageSync('userInfo');
if (userInfo) {
  Store.commit("SET_USERINFO", userInfo)
}

let token = mpvue.getStorageSync('token');
if (token) {
  Store.commit("SET_TOKEN", token)
}

//获取用户地址 按需求开关
// mpvue.getLocation({
//   success: async function (locationRes) {
//     var value = wx.getStorageSync("addressInfo");
//     if (value) {
//       value = JSON.parse(value);
//       Store.commit("SET_LOCATION", value);
//       // _this.getData(value.city_code);
//     } else {
//       let { latitude, longitude } = locationRes;
//       let bdMap = await _this.$request.get("/api/location", {
//         latitude,
//         longitude
//       });
//       if (!bdMap.errno) {
//         Store.commit("SET_LOCATION", bdMap.data);
//         // _this.getData(bdMap.data.cityCode);
//       }
//     }
//   }
// });

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue(App)
app.$mount()
