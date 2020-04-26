<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-25 00:14:54
 -->
<template>
  <div class="public-index-wrap">
    <scroll-view :scroll-y="true" :style="{'height':'100vh'}" @scrolltolower="lower">
      <div class="home-navigation">
        <div class="home-search" @click.stop="searchChang()">
          <div>
            <img src="/static/images/search.png" />
            <span>请输入要搜索的内容</span>
          </div>
        </div>
        <div class="nav-list">
          <span
            v-for="(item, index) in navList"
            :key="index"
            @click.stop="changeNav(item)"
            :class="{active: navIndex == item.type}"
          >{{item.title}}</span>
        </div>
      </div>
      <div class="home-title" v-if="false">热门推荐</div>
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
          <li class="public-loading-more" v-if="loading">正在加载...</li>
          <li class="public-loading-more" v-if="listsClose">已加载全部</li>
        </ul>
      </div>
    </scroll-view>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      navIndex: 1,
      navList: [
        {
          title: "推荐",
          type: 1
        },
        {
          title: "热门",
          type: 2
        },
        {
          title: "最新",
          type: 3
        }
      ],
      loading: false,
      listsClose: false,
      lists: [],
      pagers: {
        page: 1,
        rows: 10,
        totalPages: 0
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
    lower() {
      if (this.listsClose) {
        return false;
      }
      this.pagers.page += 1;
      this.getList();
    },
    changeNav(item) {
      if (this.navIndex == item.type) {
        return false;
      }
      this.navIndex = item.type;
      this.listsClose = false;
      this.pagers.page = 0;
      this.lists = [];
      this.lower();
    },
    goDetail(item) {
      wx.navigateTo({ url: `../detail/main?id=${item.id}` });
    },
    searchChang() {
      wx.navigateTo({ url: "../search/main" });
    },
    async getList() {
      this.loading = true;
      let res = await this.$request.get("/api/works/hot", {
        ...this.pagers,
        type: this.navIndex
      });
      if (!res.errno) {
        if (this.pagers.page == 1) {
          this.lists = [];
        }

        if (res.data.currentPage >= res.data.totalPages) {
          this.listsClose = true;
        }
        this.lists = this.lists.concat(res.data.data);
        this.pagers.page = res.data.currentPage;
        this.pagers.totalPages = res.data.totalPages;
      }
      this.loading = false;
    }
  },

  created() {
    // let app = getApp()
  },
  async onShow() {
    wx.showShareMenu();
    this.pagers.page = 1;
    this.listsClose = false;
    this.loading = false;
    this.getList();
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
    div {
      display: flex;
      align-items: center;
      background: #e5e5e5;
      border-radius: 15px;
      padding: 3px 10px;
      color: #666;
      img {
        width: 20px;
        height: 20px;
        display: block;
      }
    }
  }
  .nav-list {
    display: flex;
    align-items: center;
    font-size: 14px;
    span {
      margin-right: 15px;
      transition: all 0.2s;
      color: #999;
      &.active {
        color: #ff2f2f;
        font-weight: bold;
      }
    }
  }
}

// .home-title {
//   font-size: 16px;
//   font-weight: bold;
//   padding: 80px 10px 15px;
//   background: #f5f5f6;
// }

.public-list {
  padding-top: 70px;
}

.public-index-wrap {
  position: relative;
  min-height: 100vh;
}
</style>
