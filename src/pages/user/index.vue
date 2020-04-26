<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-25 00:17:57
 -->
<template>
  <div class="public-index-wrap">
    <scroll-view :scroll-y="true" :style="{'height':'100vh'}" @scrolltolower="lower">
      <div class="user-wrap" v-if="!userInfo">
        <div class="user-l" @click.stop="login()">
          <img src="/static/images/user.png" />
          <div>登录</div>
        </div>
        <div class="user-r">
          <img src="/static/images/setting_icon.png" mode="widthFix" />
        </div>
      </div>
      <div class="user-wrap" v-else>
        <div class="user-l">
          <img :src="userInfo.avatarUrl" />
          <div>{{userInfo.nickName}}</div>
        </div>
        <div class="user-r">
          <img src="/static/images/setting_icon.png" mode="widthFix" />
        </div>
      </div>
      <div class="user-focus" ref="informationMain">
        <div @click.stop="changeFocus(1)">
          <span>{{focusObj.follow}}</span>
          <p>关注</p>
        </div>
        <div @click.stop="changeFocus(2)">
          <span>{{focusObj.fans}}</span>
          <p>粉丝</p>
        </div>
        <div>
          <span>{{focusObj.collection + focusObj.like || 0 }}</span>
          <p>获赞/收藏</p>
        </div>
      </div>
      <div class="user-list">
        <div class="list-nav">
          <div :class="{active: navIndex == 1}" @click.stop="changeNav(1)">作品</div>
          <div :class="{active: navIndex == 2}" @click.stop="changeNav(2)">收藏</div>
        </div>
        <div class="public-list pd-b auto" v-if="lists.length > 0 && navIndex == 1">
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
                    <img :src="item.avatarUrl" mode="widthFix" />
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
        <div class="public-list pd-b auto" v-if="collectionList.length > 0 && navIndex == 2">
          <ul class="public-list-ul">
            <li
              v-for="(item, index) in collectionList"
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
        <no-data
          v-if="lists.length <= 0 && navIndex == 1 || collectionList.length <= 0 && navIndex == 2"
        ></no-data>
      </div>
    </scroll-view>
  </div>
</template>

<script>
import { mapState } from "vuex";
import NoData from "../../components/noData.vue";
export default {
  data() {
    return {
      navIndex: 1,
      loading: false,
      listsClose: false,
      lists: [],
      pagers: {
        page: 1,
        rows: 10,
        totalPages: 1
      },
      focusObj: {
        collection: 0, //被赞
        like: 0, //被喜欢
        fans: 0, //粉丝
        follow: 0 //关注
      },
      collectionList: [],
      collectionPagers: {
        page: 1,
        rows: 10,
        totalPages: 1
      }
    };
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      locationInfo: state => state.locationInfo
    })
  },
  components: { NoData },
  methods: {
    lower() {
      if (this.listsClose) {
        return false;
      }
      if (this.navIndex == 1) {
        this.pagers.page += 1;
        this.getList();
      } else {
        this.collectionPagers.page += 1;
        this.getCollectionList();
      }
    },
    addressChange(item) {
      console.log(item);
    },
    async getCollectionList() {
      let res = await this.$request.get(
        "/api/works/collection",
        this.collectionPagers
      );
      if (!res.errno) {
        if (this.collectionPagers.page == 1) {
          this.collectionList = [];
        }

        if (res.data.currentPage >= res.data.totalPages) {
          this.listsClose = true;
        }
        this.collectionList = this.collectionList.concat(res.data.data);
        this.collectionPagers.page = res.data.currentPage;
        this.pagers.collectionPagers = res.data.totalPages;
      }
      this.loading = false;
    },
    async getList() {
      let res = await this.$request.get("/api/works", this.pagers);
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
    },
    async getUserFocus() {
      let res = await this.$request.get("/api/users/focus");
      if (!res.errno) {
        this.focusObj = res.data;
      }
    },
    changeNav(index) {
      if (this.navIndex == index || !this.userInfo) {
        return false;
      }
      this.navIndex = index;
      this.listsClose = false;
      this.loading = false;
      this.pagers.page = 1;
      if (this.navIndex == 1) {
        //作品
        this.lists = [];
        this.getList();
      } else {
        // 收藏
        this.collectionList = [];
        this.getCollectionList();
      }
    },
    changeFocus(index) {
      if (!this.userInfo) {
        wx.navigateTo({ url: "../grant/main" });
        return false;
      }
      switch (index) {
        case 1:
          this.$store.dispatch("changeUserFollow", {});
          break;
        case 2:
          this.$store.dispatch("changeUserFans", {});
          break;
      }
    },
    login() {
      if (!this.userInfo) {
        wx.navigateTo({ url: "../grant/main" });
      }
    }
  },
  created() {},
  onShow() {
    if (this.userInfo) {
      this.getList();
      this.getUserFocus();
    }
  }
};
</script>

<style scoped lang="less">
.public-index-wrap {
  min-height: 100vh;
  .user-wrap {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    background: #ff2f2f;
    padding: 15px 10px 0;
    .user-l {
      display: flex;
      align-items: center;
      img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 10px;
      }
      div {
        font-size: 16px;
        font-weight: bold;
      }
    }
    .user-r {
      img {
        width: 20px;
      }
    }
  }
  .user-focus {
    display: flex;
    color: #fff;
    position: relative;
    padding-bottom: 15px;
    overflow: hidden;
    margin-bottom: 10px;
    &:before {
      content: "";
      position: absolute;
      left: -20%;
      bottom: 0;
      width: 140%;
      height: 100%;
      background: #ff2f2f;
      border-radius: 0 0 50% 50%;
      z-index: -1;
    }
    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      background: #ff2f2f;
      padding: 10px 0;
      flex: 1;
      span {
        font-weight: bold;
      }
    }
  }
  .user-list {
    .list-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      div {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 16px;
        transition: all 0.2s;
        position: relative;
        font-weight: bold;
        height: 100%;
        padding: 0 10px;
        &:first-child {
          margin-right: 100px;
        }
        &:before {
          content: "";
          position: absolute;
          width: 0;
          height: 2px;
          border-radius: 5px;
          background: #ff2f2f;
          bottom: 0;
          left: 0;
          transition: all 0.2s;
        }
        &.active {
          color: #ff2f2f;
          &:before {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
