<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-26 15:51:35
 -->
<template>
  <div class="public-index-wrap">
    <div class="information">
      <div>live</div>
    </div>
    <div class="prompt">
      <div class="text">
        <p>该程序将获取以下授权：</p>
        <span>获得您的公开信息 (昵称、头像等)</span>
      </div>
      <div class="btn">
        <div class="btn-l">
          <button @click.stop="goBack()">拒绝</button>
        </div>
        <div class="btn-r">
          <button open-type="getUserInfo" @getuserinfo="bindGetUserInfo" v-if="!userInfo">登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      locationInfo: state => state.locationInfo
    })
  },
  methods: {
    goBack() {
      wx.navigateBack();
    },
    bindGetUserInfo(e) {
      this.$store.commit("SET_USERINFO", e.target.userInfo);
      this.getWxSetting();
    },
    async getWxSetting() {
      let _this = this;
      wx.getSetting({
        success(res) {
          wx.getUserInfo({
            success: function(resUser) {
              _this.$store.commit("SET_USERINFO", resUser.userInfo);
              wx.login({
                success: async loginRes => {
                  let checkRes = await _this.$request.post("/api/login", {
                    code: loginRes.code,
                    ...resUser.userInfo
                  });
                  if (!checkRes.errno) {
                    await _this.$store.commit("SET_TOKEN", checkRes.data.token);
                    wx.setStorageSync("token", checkRes.data.token);
                    wx.setStorageSync("userInfo", resUser.userInfo);
                    await _this.$store.commit("SET_USERINFO", resUser.userInfo);
                    wx.navigateBack();
                  }
                }
              });
            }
          });
        }
      });
    }
  },
  created() {},
  onShow() {}
};
</script>

<style scoped lang="less">
.information {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 50px 0 30px;
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #ff2f2f;
    width: 100px;
    height: 100px;
    font-size: 24px;
    font-weight: bold;
  }
}
.prompt {
  padding: 30px 20px;
  border-top: 1px solid #eee;
  .text {
    font-size: 14px;
    color: #999;
    margin-bottom: 30px;
    p {
      font-weight: bold;
      margin-bottom: 20px;
      color: #333;
    }
  }
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    div {
      width: calc(~"50% - 15px");
    }
    button {
      width: 100%;
      height: 40px;
      font-size: 14px;
      border-radius: 20px;
      color: #fff;
      font-weight: bold;
      line-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      &::after {
        border: none;
      }
    }
    .btn-l {
      margin-right: 30px;
      button {
        background: #666;
      }
    }
    .btn-r {
      button {
        background: #ff2f2f;
      }
    }
  }
}
</style>
