<template>
  <div class="fingerprint-container" @touchstart.stop="initCountTimer">
    <div class="fingerprint-wrapper">
      <div class="fingerprint-header">
        <div class="fingerprint-title">在押人员指纹录入</div>
        <div class="fingerprint-btn-box">
          <div class="fingerprint-button" @click="fingerprintInit">
            指纹录入
          </div>
        </div>
      </div>
      <div class="fingerprint-box">
        <div
          class="fingerprint-list"
          v-for="(item, index) in fingerList"
          :key="index"
        >
          <div
            class="fingerprint-item"
            :class="{ disabledClick: item.fingerNum >= 6 }"
            @click="handleCheckChange(item)"
          >
            <checkbox
              class="checkbox"
              :checked="
                item.fingerNum >= 6
                  ? true
                  : item.rybh == checkedId
                  ? true
                  : false
              "
              :disabled="item.fingerNum >= 6"
              :class="{ disabledCheck: item.fingerNum >= 6 }"
            >
              <text>{{ item.name }}</text>
              <text
                :class="{ mark: item.fingerNum > 0 && item.fingerNum <= 6 }"
                >{{ item.fingerNum > 0 ? item.fingerNum : "" }}</text
              >
            </checkbox>
          </div>
          <div class="page-horizontal-divider"></div>
        </div>
      </div>
    </div>
    <div class="neil-modal-container">
      <!-- 指纹录入 -->
      <neil-modal :show="showFinger">
        <div class="fingerprint-modal-container">
          <div class="fingerprint-header">
            <div class="fingerprint-title">
              <text>温馨提示</text>
            </div>
            <div class="fingerprint-close" @click="closeModal('Finger')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <view class="page-horizontal-divider"></view>
          <view
            class="uni-flex uni-flex-item uni-column"
            style="justify-content: center; align-items: center"
          >
            <common-icons iconType="iconzhiwen" size="100" color="#FFFFFF" />
            <text style="font-size: 20.83upx; font-weight: 400"
              >验证指纹，进行登录...</text
            >
          </view>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import Api from "@/common/api.js";
import neilModal from "@/components/neil-modal/neil-modal.vue";

export default {
  components: {
    neilModal,
  },
  data() {
    return {
      // 指纹认证弹框
      showFinger: false,
      // 在押人员指纹信息
      fingerList: [],
      // 已选人员信息
      checkedInfo: {},
      // 已选人员ID
      checkedId: "",
      // 建档ID
      paramInt: 1,
      // 指纹开启状态
      isOpen: false,
      // 禁止重复操作
      isRepeatState: false,
    };
  },
  mounted() {
    // 获取人员指纹信息
    this.getPersonFingerInfo();
    // 开启倒计时
    this.$parent.countTimer();
    // 指纹录入监听
    this.setFingerCallBack();
  },
  beforeDestroy() {
    // 关闭指纹连接
    this.closeFingerPrint();
  },
  methods: {
    // 重置倒计时
    initCountTimer() {
      this.$parent.initCountTimeout();
    },
    // 指纹录入监听
    setFingerCallBack() {
      // 指纹采集
      getApp().globalData.FloatUniModule.setFingerprintFeatureLeftNumCallBack(
        (e) => {
          if (e.code == "0") {
            if (e.leftCounts == "0") {
              console.log("指纹采集成功");
            }
          }
        }
      );
      // 指纹入库
      getApp().globalData.FloatUniModule.setFingerprintFeatureCallBack((e) => {
        if (e.code == "0") {
          if (!this.isRepeatState) {
            this.isRepeatState = true;
            setTimeout(() => {
              this.isRepeatState = false;
            }, 1500);
            this.savePersonFingerInfo(e.id, e.feature);
            getApp().globalData.FloatUniModule.fingerprintFeatureInput(
              e.id,
              e.feature
            );
            this.closeModal("Finger");
            this.$parent.voiceBroadcast("指纹录入成功");
          }
        }
      });
    },
    // 在押人员指纹录入信息
    async getPersonFingerInfo() {
      let params = {
        roomNo: uni.getStorageSync("terminalInfo").roomNo,
      };
      let res = await Api.apiCall("get", Api.index.getPersonFingerInfo, params);
      if (res.state.code == "200") {
        this.fingerList = res.data;
      }
    },
    // 选择人员
    handleCheckChange(item) {
      if (Object.keys(this.checkedInfo).length) {
        if (item.rybh == this.checkedInfo.rybh) {
          this.checkedInfo = {};
        } else {
          this.checkedInfo = item;
          this.checkedId = this.checkedInfo.rybh;
        }
      } else {
        this.checkedInfo = item;
        this.checkedId = this.checkedInfo.rybh;
      }
    },
    // 在押人员指纹录入
    fingerprintInit() {
      if (!Object.keys(this.checkedInfo).length) {
        this.$parent.handleShowToast("请先选择人员列表", "center");
        return;
      } else {
        for (let value of this.fingerList.values()) {
          if (value.rybh == this.checkedInfo.rybh && value.fingerNum >= 6) {
            return;
          }
        }
      }
      if (!this.isOpen) {
        // 打开指纹设备
        getApp().globalData.FloatUniModule.fingerModuleStop();
        getApp().globalData.FloatUniModule.syncStartFinger((e) => {
          if (e.code == 0) {
            this.isOpen = true;
            this.openModal("Finger");
            console.log("指纹设备已打开");
            // 获取建档ID
            this.getFingerKey();
          } else {
            this.$parent.voiceBroadcast("指纹设备未打开");
            console.log("指纹设备未打开");
            // 关闭指纹连接
            this.closeFingerPrint();
          }
        });
      }
    },
    // 获取建档ID
    async getFingerKey() {
      let roomNo = uni.getStorageSync("terminalInfo").roomNo;
      let rybh = this.checkedInfo.rybh;
      let params = { roomNo, rybh };
      let res = await Api.apiCall("get", Api.index.getPersonFingerKey, params);
      if (res.state.code == "200") {
        if (res.data.mKey != -1) {
          this.paramInt = res.data.mKey;
          getApp().globalData.FloatUniModule.fingerprintCollect(this.paramInt);
          this.$parent.voiceBroadcast("建档成功，请按压指纹");
        }
      }
    },
    // 录入成功后保存指纹信息
    async savePersonFingerInfo(mKey, pHint) {
      let params = {
        mKey,
        rybh: this.checkedInfo.rybh,
        pHint,
      };
      let res = await Api.apiCall(
        "post",
        Api.index.savePersonFingerInfo,
        params
      );
      if (res.state.code == "200") {
        // 更新人员指纹信息
        this.getPersonFingerInfo();
        this.$parent.handleShowToast("指纹保存成功");
      }
    },
    // 关闭指纹连接
    closeFingerPrint() {
      this.isOpen = false;
      getApp().globalData.FloatUniModule.syncStopFinger((e) => {
        if (e.code == 0) {
          console.log("指纹设备已关闭");
          getApp().globalData.FloatUniModule.fingerModuleStop();
        }
      });
    },
    openModal(type) {
      this[`show${type}`] = true;
    },
    closeModal(type) {
      this[`show${type}`] = false;
      this.closeFingerPrint();
    },
  },
};
</script>

<style lang="less">
@import "../../../common/less/index.less";
</style>
