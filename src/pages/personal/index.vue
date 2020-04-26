<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-26 15:55:08
 -->
<template>
  <div class="public-index-wrap" v-if="dataObj">
    <scroll-view :scroll-y="true" :style="{'height':'100vh'}" @scrolltolower="lower">
      <div class="user-wrap">
        <div class="user-l">
          <img :src="dataObj.avatarUrl" />
          <div>{{dataObj.nickName}}</div>
        </div>
        <div
          class="user-r"
          :class="{active: dataObj.isFollow}"
          v-if="dataObj.showFollow"
          @click.stop="changeFollow(dataObj)"
        >{{dataObj.isFollow ? '已关注' : '关注'}}</div>
      </div>
      <div class="user-focus">
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
                <img
                  :src="item.imgs[0].filePath"
                  class="cover"
                  mode="aspectFill"
                  :lazy-load="true"
                  v-if="item.imgs[0].type == 'image'"
                />
                <video
                  :src="item.imgs[0].filePath"
                  class="cover"
                  :autoplay="true"
                  :loop="true"
                  :muted="true"
                  :controls="false"
                  object-fit="cover"
                  v-else
                ></video>
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
      lists: [],
      uid: "",
      dataObj: null,
      loading: false,
      listsClose: false,
      focusObj: {
        collection: 0,
        like: 0,
        fans: 0,
        follow: 0
      },
      collectionList: [],
      collectionPagers: {
        page: 1,
        rows: 10,
        totalPages: 1
      },
      pagers: {
        page: 1,
        rows: 10,
        totalPages: 1
      }
    };
  },
  components: { NoData },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      locationInfo: state => state.locationInfo
    })
  },
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
    goDetail(item) {
      wx.navigateTo({ url: `../detail/main?id=${item.id}` });
    },
    changeNav(index) {
      if (this.navIndex == index) {
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
    async changeFollow(item) {
      let res = await this.$request.post("/api/users/follow", {
        pid: item.id
      });
      if (!res.errno) {
        this.getPersonal(this.dataObj.id);
        this.getUserFocus(this.dataObj.id);
      }
    },
    async getCollectionList() {
      let res = await this.$request.get("/api/works/collection", {
        ...this.collectionPagers,
        uid: this.uid
      });
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
    changeFocus(index) {
      if (!this.userInfo) {
        wx.navigateTo({ url: "../grant/main" });
        return false;
      }
      switch (index) {
        case 1:
          this.$store.dispatch("changeUserFollow", this.dataObj);
          break;
        case 2:
          this.$store.dispatch("changeUserFans", this.dataObj);
          break;
      }
    },
    async getPersonal(id) {
      let res = await this.$request.get("/api/users", { id });
      if (!res.errno) {
        this.dataObj = res.data;
        wx.setNavigationBarTitle({
          title: this.dataObj.nickName
        });
      }
    },
    async getUserFocus(id) {
      let res = await this.$request.get("/api/users/focus", { uid: id });
      if (!res.errno) {
        this.focusObj = res.data;
      }
    },
    async getList() {
      let res = await this.$request.get("/api/works", {
        ...this.pagers,
        uid: this.uid
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
  created() {},
  async onLoad(e) {
    this.uid = e.id;
  },
  onShow() {
    this.getPersonal(this.uid);
    this.getUserFocus(this.uid);
    this.getList();
  }
};
</script>

<style scoped lang="less">
.public-index-wrap {
  min-height: 100vh;
  .user-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    background: #ff2f2f;
    padding: 15px 10px 0;
    font-weight: bold;
    font-size: 14px;
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
      border: 1px solid #ccc;
      padding: 3px 10px;
      border-radius: 15px;
      transition: all 0.2s;
      &.active {
        // color: #ff2f2f;
        // border-color: #ff2f2f;
      }
    }
  }
  .user-focus {
    display: flex;
    color: #fff;
    background: #ff2f2f;
    padding: 15px 0 0;
    position: relative;
    margin-bottom: 30px;
    &:before {
      content: "";
      position: absolute;
      left: -20%;
      bottom: -15px;
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
