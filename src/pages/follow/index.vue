<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-20 11:42:16
 -->
<template>
  <div class="public-index-wrap">
    <scroll-view :scroll-y="true" :style="{'height': '100vh'}" @scrolltolower="lower">
      <div class="follow-wrap">
        <ul>
          <li v-for="(item, index) in lists" :key="index">
            <div class="user-l" @click.stop="$store.dispatch('changeUser', item)">
              <img :src="item.avatarUrl" />
              <span>{{item.nickName}}</span>
            </div>
            <div
              class="user-r"
              :class="{active: item.isFollow}"
              v-if="item.showFollow"
              @click.stop="changeFollow(item)"
            >{{item.isFollow ? '已关注' : '关注'}}</div>
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
      uid: "",
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
    async changeFollow(item) {
      let res = await this.$request.post("/api/users/follow", {
        pid: item.uid || item.id
      });
      if (!res.errno) {
        item.isFollow = res.data;
      }
    },
    lower() {
      if (this.listsClose) {
        return false;
      }
      this.pagers.page += 1;
      this.getList();
    },
    async getList() {
      this.loading = true;
      let res = await this.$request.get("/api/users/follow", {
        uid: this.uid || "",
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
    this.pagers.page = 1;
    this.loading = false;
    this.listsClose = false;
    this.uid = e.id;
  },
  onShow() {
    this.getList();
  }
};
</script>

<style scoped lang="less">
.public-index-wrap {
  position: relative;
  .follow-wrap {
    padding-bottom: 50px;
    min-height: 100vh;
    ul {
      padding: 0px 10px;
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
        .user-l {
          display: flex;
          align-items: center;
          img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
          }
        }
        .user-r {
          border: 1px solid #ccc;
          padding: 3px 10px;
          border-radius: 15px;
          transition: all 0.2s;
          font-size: 12px;
          &.active {
            color: #ff2f2f;
            border-color: #ff2f2f;
          }
        }
      }
    }
  }
}
</style>
