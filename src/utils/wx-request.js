/*
 * @Author: vinc
 * @LastEditTime: 2020-04-24 16:13:48
 */

import Store from '../store'

function request(url, method, data, header = {}) {
  wx.showLoading({
    title: '加载中' // 数据请求前loading
  })
  return new Promise((resolve, reject) => {
    wx.request({
      url: Store.state.httpUrl + url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/json', // 默认值
        'authorization': Store.state.token || ''
      },
      success: function (res) {
        if (res.data.errno == '40202') {
          wx.clearStorage()
          Store.commit("LOGOUT")
          if (res.data.errno == '40202') {
            wx.clearStorage()
            Store.commit("LOGOUT")

            var pages = getCurrentPages(); //获取加载的页面
            var currentPage = pages[pages.length - 1]; //获取当前页面的对象
            var routeUrl = currentPage.route; //当前页面url

            if (routeUrl != "pages/grant/main") {
              wx.navigateTo({ url: "../grant/main" });
            }
          }
        }
        wx.hideLoading()
        resolve(res.data)
      },
      fail: function (res) {
        wx.hideLoading()
        // reject(false)
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  })
}

function get(url, params) {
  return request(url, 'GET', params)
}

function put(url, params) {
  return request(url, 'PUT', params)
}

function post(url, params) {
  return request(url, 'POST', params)
}

function del(url, params) {
  return request(url, 'DELETE', params)
}

export default {
  request,
  get,
  post,
  del,
  put
}
