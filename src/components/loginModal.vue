<!--
 * @Author: vinc
 * @LastEditTime: 2019-09-23 21:28:10
 -->
<template>
  <div class="loginModal" v-if="false">
    <button open-type="getUserInfo" @getuserinfo="bindGetUserInfo">授权登录</button>
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
      userInfo: state => state.userInfo
    })
  },
  components: {},

  methods: {
    bindGetUserInfo(e) {
      this.$store.commit("SET_USERINFO", e.target.userInfo);
    }
  },

  created() {
    // let app = getApp()
  },
  async onShow() {},
  watch: {}
};
</script>

<style scoped lang="less">
.loginModal {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  background: rgba(3, 3, 3, 0.5);
}
</style>
