<template>
  <div class="notice-container" @touchstart.stop="initCountTimer">
    <div class="notice-wrapper">
      <div class="notice-left">
        <scroll-view scroll-y="true" class="notice-left-scroll" @scrolltolower="scrollToLower">
          <div v-for="(item, index) in noticeList" :key="index" class="notice-menu-item" :class="
              selectInfo.id == item.id ? 'notice-selected-img' : 'notice-img'
            " @click="selectMenuItem(item)">
            <text :class="selectInfo.id == item.id ? 'select-item' : ''">{{
              item.title
            }}</text>
          </div>
        </scroll-view>
      </div>
      <div class="notice-vertical-divider" v-if="noticeList.length"></div>
      <div class="notice-right">
        <div class="notice-head">
          <div class="notice-title">{{ selectInfo.title }}</div>
          <div class="notice-date" v-if="noticeList.length">
            发布时间：<span>{{ selectInfo.date }}</span>
          </div>
        </div>
        <scroll-view scroll-y="true" class="notice-right-scroll">
          <div class="notice-content" v-html="content"></div>
        </scroll-view>
      </div>
    </div>
  </div>
</template>

<script>
import Api from "@/common/api.js";
import { isNullStr, dateFormat } from "@/common/utils/util.js";

export default {
  data () {
    return {
      // 通知公告列表
      noticeList: [],
      // 已选菜单项
      selectInfo: {},
      // 页面索引
      pageIndex: 1,
      // 页面总数
      totalPage: 1,
    };
  },
  computed: {
    // 通知公告详情
    content () {
      if (this.selectInfo.details != undefined) {
        return String(this.selectInfo.details).replace(
          /\s+/g,
          "&nbsp;&nbsp;&nbsp;&nbsp;"
        );
      }
    },
  },
  created () {
    // 获取通知公告信息
    this.getNoticeInfo(this.pageIndex);
    // 开启倒计时
    this.$parent.countTimer();
  },
  methods: {
    // 重置倒计时
    initCountTimer () {
      // this.$parent.initCountTimeout();
    },
    // 选择菜单
    selectMenuItem (item) {
      this.selectInfo = item;
    },
    // 获取仓内通知公告信息
    async getNoticeInfo (index) {
      let params = {
        data: {
          type: 6,
        },
        pageParam: {
          pageIndex: index,
          pageSize: 8,
        },
      };
      let res = await Api.apiCall("post", Api.index.getAllNotice, params);
      if (res.state.code == "200") {
        if (!isNullStr(res.data)) {
          this.totalPage = res.page.totalPage;
          let result = res.data;
          result.map((item) => {
            item.date = dateFormat("YYYY-MM-DD hh:mm", new Date(item.date));
          });
          this.noticeList = this.noticeList.concat(result);
          this.selectInfo = this.noticeList[0];
        }
      }
    },
    // 下拉刷新
    scrollToLower (e) {
      // this.$parent.initCountTimeout();
      if (this.pageIndex < this.totalPage) {
        this.pageIndex++;
        this.getNoticeInfo(this.pageIndex);
      }
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
