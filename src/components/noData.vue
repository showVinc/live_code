<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-15 09:17:05
 -->
<template>
  <div class="noDataModal">
    <img src="/static/images/no_data.png" mode="widthFix" />
    <div>暂无数据</div>
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

  methods: {},

  created() {
    // let app = getApp()
  },
  async onShow() {},
  watch: {}
};
</script>

<style scoped lang="less">
.noDataModal {
  width: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999;
  img {
    width: 150px;
    margin-bottom: 10px;
  }
}
</style>
