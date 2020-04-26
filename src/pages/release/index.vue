<!--
 * @Author: vinc
 * @LastEditTime: 2020-04-25 00:41:43
 -->
<template>
  <div class="public-index-wrap">
    <div class="release-wrap">
      <ul class="files">
        <li v-for="(item, index) in postParams.imgs" :key="index">
          <img :src="item.filePath" v-if="item.type == 'image'" class="cover" />
          <video
            :src="item.filePath"
            class="cover"
            :autoplay="true"
            :loop="true"
            :muted="true"
            :controls="false"
            object-fit="cover"
            v-else
          ></video>
          <img src="/static/images/video.png" v-if="item.type == 'video'" class="video_icon" />
        </li>
        <li v-if="showAddIcon">
          <img src="/static/images/file_icon.png" class="cover" @click.stop="showSheet()" />
        </li>
      </ul>
      <div class="content">
        <div class="title">
          <input
            type="text"
            v-model.trim="postParams.title"
            placeholder="输入标题会引起更多人关注"
            maxlength="50"
          />
        </div>
        <div class="describe">
          <textarea v-model.trim="postParams.describe" placeholder="输入正文" maxlength="500" />
        </div>
        <div class="address" v-if="false">
          <div class="address-l">
            <img src="/static/images/address.png" mode="widthFix" /> 地点
          </div>
          <div class="address-r">
            <img src="/static/images/arrow_r.png" mode="widthFix" />
          </div>
        </div>
      </div>
    </div>
    <div class="public-btn-class fixed">
      <div class="common-btn mg-d-s pd" :class="{active: true}" @click.stop="postForm()">发布作品</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      postParams: {
        title: "",
        describe: "",
        imgs: [],
        address: "",
        topic: "",
        tag: []
      }
    };
  },
  filters: {},
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      locationInfo: state => state.locationInfo
    }),
    showAddIcon() {
      let flag = true;
      if (this.postParams.imgs.length > 0) {
        if (this.postParams.imgs.length >= 9) {
          flag = false;
        }

        for (let v of this.postParams.imgs) {
          if (!flag) {
            continue;
          }
          if (v.type == "video") {
            flag = false;
          }
        }
      }
      return flag;
    }
  },
  components: {},
  methods: {
    async postForm() {
      if (this.postParams.imgs.length <= 0) {
        wx.showToast({
          title: "请上传图片或视频",
          icon: "none"
        });
        return false;
      }

      let res = await this.$request.post("/api/works", this.postParams);
      if (!res.errno) {
        wx.showToast({
          title: "发布成功",
          icon: "none"
        });
        this.postParams = {
          title: "",
          describe: "",
          imgs: [],
          address: "",
          topic: "",
          tag: []
        };
      }
    },
    changeSheet({ detail }) {
      console.log(detail);
    },
    showSheet() {
      let _this = this;
      if (this.postParams.imgs.length > 0) {
        if (this.postParams.imgs[0].type == "image") {
          _this.uploadChange(0);
        }
        return false;
      }
      wx.showActionSheet({
        itemList: ["图片", "视频"],
        success: function(res) {
          _this.uploadChange(res.tapIndex);
        },
        fail: function(res) {
          console.log(res.errMsg);
        }
      });
    },
    uploadChange(index) {
      let _this = this;
      if (!index) {
        wx.chooseImage({
          count: 1, // 默认9
          // sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
          sizeType: ["compressed"], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
          success: function(res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            let tempFilePaths = res.tempFilePaths;
            wx.showLoading({
              title: "加载中" // 数据请求前loading
            });
            wx.uploadFile({
              url: `${_this.$store.state.httpUrl}/api/upload`, //此处换上你的接口地址
              name: "uploadFile",
              filePath: tempFilePaths[0],
              header: {
                "content-type": "application/json", // 默认值
                authorization: _this.$store.state.token || ""
              },
              formData: {
                method: "POST" //请求方式
              },
              success: function(res) {
                let obj = JSON.parse(res.data);
                if (!obj.errno) {
                  _this.postParams.imgs = _this.postParams.imgs.concat(
                    obj.data
                  );
                } else {
                  if (obj.errno == "40202") {
                    wx.navigateTo({ url: "../grant/main" });
                  }
                }
                wx.hideLoading();
              },
              fail: function(res) {
                console.log("fail");
                wx.hideLoading();
              }
            });
          }
        });
      } else {
        wx.chooseVideo({
          sourceType: ["album", "camera"],
          maxDuration: 60,
          camera: "back",
          success(res) {
            wx.showLoading({
              title: "加载中" // 数据请求前loading
            });
            wx.uploadFile({
              url: `${_this.$store.state.httpUrl}/api/upload`, //此处换上你的接口地址
              name: "uploadFile",
              filePath: res.tempFilePath,
              header: {
                "content-type": "application/json", // 默认值
                authorization: _this.$store.state.token || ""
              },
              formData: {
                method: "POST" //请求方式
              },
              success: function(res) {
                let obj = JSON.parse(res.data);
                if (!obj.errno) {
                  _this.postParams.imgs = _this.postParams.imgs.concat(
                    obj.data
                  );
                } else {
                  if (obj.errno == "40202") {
                    wx.navigateTo({ url: "../grant/main" });
                  }
                }
                wx.hideLoading();
              },
              fail: function(res) {
                console.log("fail");
                wx.hideLoading();
              }
            });
          }
        });
      }
    }
  },

  created() {
    // let app = getApp()
  },
  async onShow() {
    // if (!this.userInfo) {
    //   wx.navigateTo({ url: "../grant/main" });
    // }
  }
};
</script>

<style scoped lang="less">
.public-index-wrap {
  position: relative;
  .release-wrap {
    padding: 15px 10px;
    box-sizing: border-box;
  }
  .files {
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    li {
      width: calc(~"33vw - 15px");
      height: calc(~"33vw - 15px");
      margin-right: 10px;
      margin-bottom: 10px;
      position: relative;
      &:nth-child(3n) {
        margin-right: 0;
      }
      .cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .video_icon {
        position: absolute;
        right: 5px;
        top: 5px;
        width: 20px;
        height: 20px;
      }
      video {
        width: 100%;
        height: 100%;
      }
    }
  }
  .content {
    font-size: 14px;
    .title {
      border-bottom: 1px solid #eee;
      padding: 15px 0;
      font-size: 16px;
      font-weight: bold;
    }
    .describe {
      border-bottom: 1px solid #eee;
      padding: 15px 0;
      textarea {
        width: 100%;
        height: 150px;
      }
    }
    .address {
      padding: 15px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .address-l {
        display: flex;
        align-items: center;
        img {
          width: 14px;
          margin-right: 6px;
        }
      }
      .address-r {
        img {
          display: block;
          width: 8px;
        }
      }
    }
  }
}
</style>
