<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-25 00:20:25
 -->
<template>
  <div class="public-index-wrap" v-if="dataObj">
    <scroll-view :scroll-y="true" :style="{'height':'100vh'}" @scrolltolower="lower">
      <div class="public-swiper">
        <swiper
          :indicator-dots="indicatorDots"
          :autoplay="autoplay"
          :interval="interval"
          :duration="duration"
          v-if="dataObj.fileType == 'image'"
        >
          <block v-for="(item, index) in dataObj.imgs" :key="index">
            <swiper-item>
              <img :src="item.filePath" mode="aspectFill" />
            </swiper-item>
          </block>
        </swiper>
        <video
          :src="dataObj.imgs && dataObj.imgs[0].filePath"
          :poster="dataObj.coverPic"
          :loop="true"
          object-fit="cover"
          v-else
        ></video>
      </div>
      <div class="information">
        <div class="user-head">
          <div class="head-l" @click.stop="$store.dispatch('changeUser', dataObj)">
            <img :src="dataObj.avatarUrl" />
            <p>{{dataObj.nickName}}</p>
          </div>
          <div
            class="head-r"
            :class="{active: dataObj.isFollow}"
            v-if="dataObj.showFollow"
            @click.stop="changeFollow(dataObj)"
          >{{dataObj.isFollow ? '已关注' : '关注'}}</div>
        </div>
        <div class="content">
          <div class="title">{{dataObj.title}}</div>
          <div class="desc">{{dataObj.describe}}</div>
          <div class="time">{{dataObj.createTime}}</div>
        </div>
      </div>
      <div class="comment-list">
        <div class="comment-title">评论专区</div>
        <ul>
          <li v-for="(item, index) in lists" :key="index">
            <div class="comment-l">
              <img :src="item.uimg" />
              <div class="user">
                <div>{{item.uname}}</div>
                <p>
                  {{item.content}}
                  <span>{{item.createTime}}</span>
                </p>
              </div>
            </div>
            <div class="comment-r"></div>
          </li>
          <li class="public-loading-more" v-if="loading">正在加载...</li>
          <li class="public-loading-more" v-if="listsClose">已加载全部</li>
        </ul>
      </div>
    </scroll-view>

    <div class="method-btn">
      <div class="comment-text">
        <input type="text" placeholder="写评论" v-model.trim="postParams.key" maxlength="100" />
        <img src="/static/tabs/release-active.png" @click.stop="sendComment()" />
      </div>
      <div class="btn">
        <div :class="{'active': dataObj.isCollection}" @click.stop="changeMethod(1)">
          <img
            :src="dataObj.isCollection ? '/static/images/markActive.png':'/static/images/mark.png'"
            mode="widthFix"
          />
          {{dataObj.collection}}
        </div>
        <div :class="{'active': dataObj.isLike}" @click.stop="changeMethod(2)">
          <img
            :src="dataObj.isLike ? '/static/images/likeActive.png':'/static/images/like.png'"
            mode="widthFix"
          />
          {{dataObj.like}}
        </div>
        <div class="comment">
          <img src="/static/images/message.png" mode="widthFix" />
          {{pagers.count}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      id: "",
      indicatorDots: true,
      vertical: false,
      autoplay: false,
      interval: 2000,
      duration: 500,
      dataObj: null,
      loading: false,
      listsClose: false,
      postParams: {
        id: "",
        key: ""
      },
      loading: false,
      listsClose: false,
      lists: [],
      pagers: {
        page: 1,
        rows: 10,
        totalPages: 1,
        count: 0
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
    async sendComment() {
      if (!this.userInfo) {
        wx.navigateTo({ url: "../grant/main" });
        return false;
      }

      if (!this.postParams.key) {
        wx.showToast({
          title: "请输入评论内容",
          icon: "none"
        });
        return false;
      }
      let res = await this.$request.post("/api/comment", this.postParams);
      if (!res.errno) {
        this.loading = false;
        this.listsClose = false;
        this.pagers.page = 1;
        this.postParams.key = "";
        this.getList();
      }

      wx.showToast({
        title: "评论成功",
        icon: "none"
      });
    },
    async changeFollow(item) {
      let res = await this.$request.post("/api/users/follow", {
        pid: item.uid
      });
      if (!res.errno) {
        this.getData();
      }
    },
    async changeMethod(index) {
      let url = "";
      switch (index) {
        case 1:
          url = "/api/works/collection";
          break;
        case 2:
          url = "/api/works/like";
          break;
      }

      let res = await this.$request.post(url, {
        id: this.dataObj.id,
        pid: this.dataObj.uid
      });
      if (!res.errno) {
        this.getData(this.dataObj.id);
      }
    },
    async getData() {
      let res = await this.$request.get("/api/works/detail", { id: this.id });
      if (!res.errno) {
        this.dataObj = res.data;
      }
    },
    async getList() {
      let res = await this.$request.get("/api/comment", {
        id: this.id,
        ...this.pagers
      });
      if (!res.errno) {
        if (this.pagers.page == 1) {
          this.lists = [];
        }

        if (res.data.currentPage >= res.data.totalPages) {
          this.listsClose = true;
        }
        this.lists = this.lists.concat(res.data.data);
        this.pagers.count = res.data.count;
        this.pagers.page = res.data.currentPage;
        this.pagers.totalPages = res.data.totalPages;
      }
      this.loading = false;
    }
  },
  created() {
    // let app = getApp()
  },
  onLoad(e) {
    this.id = e.id;
    this.postParams.id = e.id;
  },
  async onShow() {
    wx.showShareMenu();
    this.getData();
    this.getList();
  },
  onShareAppMessage: function(ops) {
    if (ops.from === "button") {
      console.log("button");
    }
    return {
      title: this.dataObj.title,
      path: `pages/detail/main?id=${this.dataObj.id}`,
      success: function(res) {
        // 转发成功
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
      }
    };
  }
};
</script>

<style scoped lang="less">
.public-index-wrap {
  position: relative;
  padding-bottom: 50px;
  .information {
    padding: 20px 10px;
    .user-head {
      font-weight: bold;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      .head-l {
        display: flex;
        align-items: center;
        width: 100%;
        img {
          height: 40px;
          width: 40px;
          border-radius: 50%;
          margin-right: 6px;
        }
      }
      .head-r {
        border: 1px solid #ccc;
        padding: 3px 10px;
        border-radius: 15px;
        transition: all 0.2s;
        height: 26px;
        width: 60px;
        padding: 0;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        &.active {
          color: #ff2f2f;
          border-color: #ff2f2f;
        }
      }
    }
    .content {
      .title {
        font-size: 16;
        font-weight: bold;
        margin-bottom: 15px;
      }
      .desc {
        font-size: 14px;
      }
      .time {
        font-size: 12px;
        color: #999;
        margin-top: 10px;
      }
    }
  }
  .comment-list {
    padding-bottom: 50px;
    .comment-title {
      font-size: 16px;
      font-weight: bold;
      padding: 0 10px;
      margin-bottom: 20px;
    }
    ul {
      padding: 0 10px;
      li {
        font-size: 12px;
        border-bottom: 1px solid #eee;
        padding: 10px 0;
        .comment-l {
          display: flex;
          img {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 10px;
          }
          .user {
            div {
              color: #333;
              margin-bottom: 10px;
              font-size: 14px;
            }
            p {
              color: #666;
              span {
                margin-left: 5px;
                color: #999;
              }
            }
          }
        }
        .comment-r {
        }
      }
    }
  }
  .method-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    box-sizing: border-box;
    font-size: 12px;
    font-weight: bold;
    border-top: 1px solid #eee;
    background: #fff;
    .comment-text {
      width: 180px;
      border-radius: 15px;
      overflow: hidden;
      font-weight: normal;
      position: relative;
      input {
        background: #f5f5f6;
        padding: 0 32px 0 10px;
        height: 28px;
      }
      img {
        position: absolute;
        top: calc(~"50% - 8px");
        right: 10px;
        width: 20px;
        height: 20px;
      }
    }
    .btn {
      display: flex;
      align-items: center;
      div {
        display: flex;
        align-items: center;
        margin-right: 10px;
        transition: all 0.2s;
        &.active {
          color: #ff2f2f;
        }
        img {
          width: 30px;
        }
      }
    }
  }
}
</style>
