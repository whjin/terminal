<template>
  <neil-modal :show="isShow" @close="handleClose">
    <view class="recognition-dialogs-container" :class="{
        'without-header':
          useFor !== 'login' && useFor !== 'shopping' && useFor !== 'rotation',
      }">
      <!-- 顶部操作栏 -->
      <template v-if="useFor == 'login' || useFor == 'shopping' || useFor == 'rotation'">
        <view class="modal-header">
          <view class="modal-title">温馨提示</view>
          <div class="modal-close" @click="handleClose">
            <image src="/static/images/common/close.png"></image>
          </div>
        </view>
        <view class="page-horizontal-divider"></view>
      </template>
      <view class="uni-flex uni-flex-item uni-column" style="justify-content: space-around; align-items: center">
        <div v-if="
            (useFor == 'call' ||
              useFor == 'rotation' ||
              useFor == 'shopping') &&
            callConfig.isRecognitionSuccess
          " class="call-modal-box">
          <div class="call-modal-content">
            <div class="modal-fingerInit modal-fingerSuccess">
              <common-icons iconType="icondengluwancheng" size="100" color="#fff" />
              <text class="finger-name">{{ callConfig.callName }}</text>
              <text class="finger-tip">验证通过</text>
            </div>
          </div>
        </div>
        <!-- 人脸认证 -->
        <template v-else-if="isFaceRecognition">
          <div class="face-recognition-bg">
            <image class="loading-tips" src="/static/images/index/connect.png"></image>
          </div>
          <text v-if="
              useFor == 'call' || useFor == 'rotation' || useFor == 'shopping'
            " style="font-size: 20.83upx; font-weight: 400; color: #35fffa">{{ callConfig.callName }}</text>
          <text style="font-size: 20.83upx; font-weight: 400">{{
            faceConfig.scanTips
          }}</text>
        </template>
        <!-- 指纹认证 -->
        <template v-else>
          <template v-if="useFor == 'login'">
            <common-icons iconType="iconzhiwen" size="100" color="#fff" />
            <text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
          </template>
          <div v-else class="call-modal-box">
            <div class="call-modal-content">
              <div class="modal-fingerInit modal-fingerSuccess">
                <common-icons iconType="iconzhiwen" size="100" color="#fff" />
                <text class="finger-name">{{ callConfig.callName }}</text>
                <text v-if="useFor == 'shopping'" class="finger-tip">请进行验证</text>
                <text v-else class="finger-tip">请进行签到</text>
              </div>
            </div>
          </div>
        </template>
      </view>
      <!-- 切换按钮 -->
      <div class="switch-btn-wrapper" v-if="debounceSwitch">
        <div type="default" class="switch-type-btn" v-if="
            this.useFor !== 'call' ||
            (this.useFor == 'call' && !this.callConfig.isRecognitionSuccess)
          " @touchstart.stop="debounceSwitch">
          切换{{ isFaceRecognition ? "指纹" : "人脸" }}
        </div>
      </div>
    </view>
  </neil-modal>
</template>

<script>
import Api from "@/common/api.js";
import { debounce } from "@/common/utils/util.js";

export default {
  props: {
    // 人脸识别登录弹窗显示状态
    isShow: {
      type: Boolean,
      default: false,
    },
    // 认证弹框的用途：login登录 call点名 rotation值班签到 shopping购物
    useFor: {
      type: String,
      default: "call",
    },
    // 点名配置
    callConfig: {
      type: Object,
      default () {
        return {
          callName: "某某某", // 当前被点名人员
          isRecognitionSuccess: false, // 是否点名认证成功
          rybh: "", // 人员编号 用于获取库存照片
        };
      },
    },
  },
  data () {
    return {
      // 人脸比对socket
      faceRecognitionSocket: null,
      // 人脸 or 指纹登录
      defaultLoginType: uni.getStorageSync("defaultLoginType") || 0,
      // 人脸登录需要的配置
      faceConfig: {
        pics: "",
        // 扫描提示
        scanTips: "请站好正视屏幕，识别验证中...",
      },
      temperature: 0,
      // 切换按钮防抖
      debounceSwitch: null,
      // 正在人脸识别
      isFacing: false,
      temperatureTimer: null,
      // 指纹开启状态
      isOpen: false,
      currentTab: 2,
      // 禁止重复操作
      isRepeatState: false,
    };
  },
  computed: {
    // 0人脸验证，1指纹验证
    isFaceRecognition () {
      return this.defaultLoginType == 0 ? true : false;
    },
    // 1:1人脸验证 or 1：N人脸验证
    useFace11 () {
      return ["call", "shopping"].includes(this.useFor);
    },
    // 预览画面位置top
    topPos () {
      if (["rotation", "shopping"].includes(this.useFor)) {
        return 223;
      } else if (this.useFor == 'call') {
        return 243;
      } else {
        return 232;
      }
    }
  },
  watch: {
    isShow (state) {
      if (!state) {
        this.isFacing = false;
        this.stopFacePreview();
        this.closeFingerPrint();
        this.stopTemperature();
        this.closeCardModule();
      } else {
        this.defaultLoginType = uni.getStorageSync("defaultLoginType");
        this.debounceSwitch = debounce(this.switchRecognitionMode, 1500);
        getApp().globalData.FloatUniModule.initFrame();
        getApp().globalData.FloatUniModule.takePictureCallBack(res => {
          let base64Str = res.bytes.replace(/[\r\n]/g, "");
          this.faceRecognition(base64Str);
        });
      }
    },
  },
  beforeDestroy () {
    this.stopTemperature();
    this.stopFacePreview();
    this.closeFingerPrint();
  },
  methods: {
    // 开始识别
    startRecognition (currentTab = 2) {
      this.currentTab = currentTab;
      if (this.useFor == "call") {
        this.startTemperature();
      }
      if (this.isFaceRecognition) {
        this.faceVoice("开始人脸识别，请站好正视屏幕");
        this.isFacing = true;
        this.handleFaceRecognition(true);
      } else {
        this.verifyFingerPrint();
      }
    },
    // 切换登录方式
    switchRecognitionMode () {
      if (this.useFor == "call" && this.callConfig.isRecognitionSuccess) return;
      this.$emit("switchRecognitionMode", this.isFaceRecognition);
      this.defaultLoginType = this.defaultLoginType == 0 ? 1 : 0;
      if (this.isFaceRecognition) {
        this.faceVoice("开始人脸识别，请站好正视屏幕");
        this.isFacing = true;
        this.handleFaceRecognition(true);
        this.closeFingerPrint();
      } else {
        this.verifyFingerPrint();
      }
    },
    // 人脸拍照
    handleFaceRecognition (state = true) {
      if (this.isShow && this.isFacing) {
        if (state) {
          this.startFacePreview();
        }
        setTimeout(() => {
          this.snapshotPreview();
        }, 2000);
      }
    },
    // 人脸识别
    async faceRecognition (base64Str = "") {
      let roomId = uni.getStorageSync("terminalInfo").roomId;
      let params = {
        roomId,
        base64Str,
      };
      // 根据不同使用 调用不同接口 call点名：1:1人脸比对 login登录：1：N比对
      let url = "";
      if (this.useFace11) {
        params.rybh = this.callConfig.rybh;
        url = Api.prisoner.faceRecognition11;
      } else {
        if ([2, 9].includes(this.currentTab)) {
          url = Api.prisoner.faceRecognition1N;
        } else if (this.currentTab == 3) {
          url = Api.police.policeFaceOneToMany;
        }
      }
      let res = await Api.apiCall(
        "post",
        url,
        {
          data: params,
        },
        true,
        true
      );
      if (!this.isShow || !this.isFaceRecognition) return;
      if (res.state.code == 200) {
        if (["login", "rotation"].includes(this.useFor)) {
          if (this.useFor == 'login') {
            this.faceVoice("人脸识别成功");
            console.log("人脸识别成功");
          }
          this.$emit(
            "faceRecognitionSuccess",
            Object.assign({}, res.data, {
              temperature: this.temperature,
            })
          );
        } else {
          // call 点名返回体温
          this.faceConfig.scanTips = "验证通过";
          this.$emit("faceRecognitionSuccess", {
            temperature: this.temperature,
          });
        }
      } else {
        let text =
          (res.state && res.state.msg) || "未检测到有效人脸，请站好正视屏幕";
        this.faceVoice(text);
        this.isFacing = true;
        this.handleFaceRecognition(false);
      }
    },
    // 开始人脸视频预览
    startFacePreview () {
      getApp().globalData.FloatUniModule.setLocalVideoViewPosition(420, this.topPos, 440, 268);
      getApp().globalData.FloatUniModule.hideLocalPreView(false);
      getApp().globalData.FloatUniModule.setViewWidthHeight(440, 268);
      getApp().globalData.FloatUniModule.startTakeFrame();
    },
    // 人脸认证快照
    snapshotPreview () {
      getApp().globalData.FloatUniModule.takePicture();
    },
    // 停止人脸视频预览
    stopFacePreview () {
      getApp().globalData.FloatUniModule.hideLocalPreView(true);
      getApp().globalData.FloatUniModule.stopTakeFrame();
    },
    // 关闭人脸识别弹窗
    handleClose () {
      this.stopFacePreview();
      this.$emit("close");
    },
    // 人脸语音播报
    faceVoice (text) {
      this.faceConfig.scanTips = text;
      this.$parent.voiceBroadcast(text);
    },
    // 开始指纹识别
    verifyFingerPrint () {
      this.isFacing = false;
      this.stopFacePreview();
      if (!this.isOpen) {
        // 打开指纹设备
        this.isOpen = true;
        getApp().globalData.FloatUniModule.fingerModuleStop();
        getApp().globalData.FloatUniModule.syncStartFinger((e) => {
          if (e.code == 0) {
            console.log("指纹设备已打开");
            this.$parent.voiceBroadcast("请按压要识别的指纹");
            getApp().globalData.FloatUniModule.fingerprintRecognition();
          } else {
            this.$parent.voiceBroadcast("指纹设备未打开");
            console.log("指纹设备未打开");
          }
        });
      }
    },
    // 关闭指纹连接
    closeFingerPrint () {
      this.isOpen = false;
      getApp().globalData.FloatUniModule.syncStopFinger((e) => {
        if (e.code == 0) {
          console.log("指纹设备已关闭");
          getApp().globalData.FloatUniModule.fingerModuleStop();
        }
      });
    },
    // 开始测温
    startTemperature () {
      if (!this.isShow) return;
      getApp().globalData.FloatUniModule.syncStartTemperature((res) => {
        if (res.code == 0) {
          console.log("开启测温");
        }
      });
    },
    // 停止测温
    stopTemperature () {
      if (this.useFor == "call") {
        getApp().globalData.FloatUniModule.syncStopTemperature((res) => {
          if (res.code == 0) {
            console.log("关闭测温");
          }
        });
      }
    },
    setTemperature (tem) {
      this.temperature = tem;
    },
    // 关闭刷卡模块
    closeCardModule () {
      if (this.currentTab == 3) {
        getApp().globalData.FloatUniModule.syncStopCard((res) => {
          if (res.code == 0) {
            console.log("刷卡已关闭");
          }
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.recognition-dialogs-container {
  width: 555.55upx;
  min-height: 520upx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  &.without-header {
    padding-top: 88upx;
  }
  .modal-header {
    height: 61.11upx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 27.77upx;
    .modal-title {
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 22.22upx;
      font-weight: 500;
      color: #35fffa;
    }
    .modal-close {
      height: 100%;
      width: 22upx;
      display: flex;
      justify-content: center;
      align-items: center;
      image {
        height: 22upx;
        width: 22upx;
      }
    }
  }
  .face-recognition-bg {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 13.88upx;
    margin-bottom: 10.88upx;
    width: 446upx;
    height: 272upx;
    background-color: #000;
    .loading-tips {
      width: 50upx;
      height: 50upx;
      animation: tipsRotate 3s ease 0s infinite;
      @keyframes tipsRotate {
        0% {
          transform: rotate(0);
        }
        50% {
          transform: rotate(180deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    }
  }
  .switch-btn-wrapper {
    margin-bottom: 30upx;
    width: 555.55upx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .switch-type-btn {
      margin-right: 35upx;
      width: 125upx;
      height: 43upx;
      border-radius: 4px;
      line-height: 43upx;
      background-color: #007aff;
      color: #fff;
      font-size: 20.83upx;
      text-align: center;
    }
  }
  .call-modal-content {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    .modal-fingerInit,
    .modal-fingerSuccess {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .finger-image {
        height: 122.22upx;
        width: 141.66upx;
      }
      .finger-name {
        font-size: 27.77upx;
        font-weight: bold;
        color: #35fffa;
        line-height: 41.66upx;
        margin-top: 50upx;
      }
      .finger-tip {
        color: #fff;
      }
    }
  }
}
</style>
