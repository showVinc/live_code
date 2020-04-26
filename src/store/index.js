/*
 * @Author: vinc
 * @LastEditTime: 2020-04-26 15:55:48
 */

import Vue from 'vue'
import Vuex from 'vuex'
// import MintUI from 'mint-ui'
// import 'mint-ui/lib/style.css'
// Vue.use(MintUI)

Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    httpUrl: 'http://127.0.0.1:8351',
    userInfo: null,
    token: null,
    locationInfo: null
  },
  mutations: {
    //设置token
    SET_TOKEN(state, payload) {
      state.token = payload;
    },
    //设置个人信息
    SET_USERINFO(state, payload) {
      state.userInfo = payload
    },
    //用户地址
    SET_LOCATION(state, payload) {
      state.locationInfo = payload
    },
    //退出登录
    LOGOUT(state, payload) {
      state.token = '';
      state.userInfo = '';
    },
    //设置url
    SET_URL(state, payload) {
      state.httpUrl = payload
    }
  },
  actions: {
    async changeUser({ commit }, params) {
      if (params.uid || params.id) { 
        mpvue.navigateTo({ url: `../personal/main?id=${params.uid || params.id}` });
      }
    },
    async changeUserFollow({ commit }, params) {
      mpvue.navigateTo({ url: `../follow/main?id=${params.uid || params.id || ''}` });
    },
    async changeUserFans({ commit }, params) {
      mpvue.navigateTo({ url: `../fans/main?id=${params.uid || params.id || ''}` });
    },
    async changeWorks({ commit }, params) {
      mpvue.navigateTo({ url: `../detail/main?id=${params.id}` });
    }
  },
  getters: {
    isLogin(state) {
      return Boolean(state.userInfo);
    }
  }

})

export default store;
