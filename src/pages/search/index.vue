<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-25 00:17:07
 -->
<template>
  <div class="public-index-wrap">
    <div class="home-navigation">
      <div class="home-search">
        <div>
          <img src="/static/images/search.png" />
          <input type="text" v-model="postParams.key" placeholder="请输入要搜索的内容" />
          <i v-if="postParams.key" @click.stop="postParams.key = ''">
            <img src="/static/images/close.png" mode="widthFix" />
          </i>
        </div>
        <span @click.stop="searchChang()">搜索</span>
      </div>
    </div>
    <div class="public-list">
      <ul class="public-list-ul">
        <li
          v-for="(item, index) in lists"
          :key="index"
          @click.stop="$store.dispatch('changeWorks',item)"
        >
          <div class="cover-wrap">
            <img :src="item.coverPic" class="cover" mode="aspectFill" :lazy-load="true" />
            <img
              src="/static/images/video.png"
              v-if="item.fileType == 'video'"
              class="public_video_icon"
            />
          </div>
          <div class="information">
            <div class="title">{{item.title}}</div>
            <div class="user" @click.stop="$store.dispatch('changeUser', item)">
              <div class="user-l">
                <img :src="item.avatarUrl" mode="widthFix" :lazy-load="true" />
                {{item.nickName}}
              </div>
              <div class="user-r">
                <img src="/static/images/like_gray.png" />
                {{item.like}}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      postParams: {
        key: ""
      },
      lists: [],
      pagers: {
        page: 1,
        rows: 100,
        totalPages: 1
      }
    };
  },
  filters: {},
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      locationInfo: state => state.locationInfo
    })
  },
  components: {},
  methods: {
    async searchChang() {
      let res = await this.$request.get("/api/works/search", {
        ...this.pagers,
        ...this.postParams
      });
      if (!res.errno) {
        this.lists = res.data.data;
      }
    }
  },

  created() {
    // let app = getApp()
  },
  async onShow() {
    wx.showShareMenu();
    let _this = this;
    this.getData();
    this.getWxSetting();
  }
};
</script>

<style scoped lang="less">
.home-navigation {
  padding: 5px 15px;
  position: fixed;
  background: #fff;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 14px;
  box-sizing: border-box;
  .home-search {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    div {
      width: calc(~"100% - 60px");
      display: flex;
      align-items: center;
      background: #e5e5e5;
      border-radius: 15px;
      padding: 3px 10px;
      color: #666;
      position: relative;
      img {
        width: 20px;
        height: 20px;
        display: block;
      }
      input {
        color: #333;
      }
      i {
        position: absolute;
        right: 15px;
        color: #fff;
        font-size: 14px;
        top: calc(~"50%^ - 7px");
        img {
          width: 14px;
        }
      }
    }
    span {
      color: #666;
      font-weight: bold;
    }
  }
}

.public-list {
  padding-top: 50px;
}

.public-index-wrap {
  position: relative;
}
</style>
