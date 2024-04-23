<template>
  <neil-modal :show="isShow" @close="handleClose">
    <view class="recognition-container" :class="{ 'without-header': withoutHeader }">
      <!-- 顶部操作栏 -->
      <div v-if="useFor === 'login' || useFor === 'shopping' || useFor === 'rotation'
        ">
        <view class="modal-header">
          <view class="modal-title">{{ modalTitle }}</view>
          <div class="modal-close" @click="handleClose">
            <image src="/static/images/common/close.png"></image>
          </div>
        </view>
        <view class="page-horizontal-divider"></view>
      </div>
      <div class="uni-flex uni-flex-item uni-column" style="justify-content: space-around; align-items: center">
        <div v-if="(useFor === 'call' ||
          useFor === 'rotation' ||
          useFor === 'shopping') &&
          regConfig.isRecognitionSuccess
          " class="call-modal-box">
          <div class="call-modal-content">
            <div class="modal-fingerInit modal-fingerSuccess">
              <common-icons iconType="icondengluwancheng" size="100" color="#fff" />
              <text class="finger-name">{{ regConfig.regName }}</text>
              <text class="finger-tip">验证通过</text>
            </div>
          </div>
        </div>
        <div v-else class="recognition-main">
          <!-- 人脸识别 -->
          <div v-show="isFacing">
            <div class="face-main-body">
              <div v-show="!showVideo" class="face-image">
                <image class="loading-tips" src="/static/images/index/connect.png"></image>
              </div>
              <video v-show="showVideo" ref="videoRef" class="face-video" autoplay playsinline object-fit="fill"
                :controls="false" codec="software" :enable-progress-gesture="false" :show-center-play-btn="false"></video>
            </div>
            <text v-if="useFor === 'call' ||
              useFor === 'rotation' ||
              useFor === 'shopping'
              " class="face-scantips" style="color: #35fffa;">{{ regConfig.callName }}</text>
            <text class="face-scantips">{{
              faceConfig.scanTips
            }}</text>
          </div>
          <!-- 指纹识别 -->
          <div v-show="!isFacing">
            <template v-if="useFor === 'login'">
              <common-icons iconType="iconzhiwen" size="100" color="#fff" />
              <text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
            </template>
            <div v-else class="call-modal-box">
              <div class="call-modal-content">
                <div class="modal-fingerInit modal-fingerSuccess">
                  <common-icons iconType="iconzhiwen" size="100" color="#fff" />
                  <text class="finger-name">{{ regConfig.callName }}</text>
                  <text v-if="useFor === 'shopping'" class="finger-tip">请进行验证</text>
                  <text v-else class="finger-tip">请进行签到</text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 切换按钮 -->
      <div class="switch-btn-wrapper" v-if="currentTab != 7 && debounceSwitch">
        <div class="check-btn" v-if="isConfirm">
          <span @click="handleConfirm">{{ confirmText }}</span>
        </div>
        <div type="default" class="switch-type-btn" v-if="useFor !== 'call' ||
          (useFor === 'call' && !regConfig.isRecognitionSuccess)
          " @click="debounceSwitch">
          切换{{ isFaceRecognition ? "指纹" : "人脸" }}
        </div>
      </div>
    </view>
  </neil-modal>
</template>

<script>
import Api from '@/common/api.js';
import { debounce, dateFormat, currentPages } from "@/common/utils/util.js";
import { startFaceVideo, stopFaceVideo } from "@/static/js/webrtc.js";
import { mapState } from "vuex";

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
    isConfirm: {
      type: Boolean,
      default: false,
    },
    confirmText: {
      type: String,
      default: "确认",
    },
    // 人员验证信息
    regConfig: {
      type: Object,
      default() {
        return {
          regName: "某某某",
          isRecognitionSuccess: false,
          rybh: "",
        };
      },
    },
  },
  data() {
    return {
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
      // 视频预览状态
      showVideo: false,
      // 人脸定时器
      faceTimer: null,
      faceVideo: null
    };
  },
  computed: {
    ...mapState({
      // 当前页面
      currentTab: (state) => state.app.currentTab,
    }),
    // 0人脸验证，1指纹验证
    isFaceRecognition() {
      return this.defaultLoginType == 0 ? true : false;
    },
    withoutHeader() {
      return !["login", "shopping", "rotation"].includes(this.useFor);
    },
    modalTitle() {
      return this.currentTab == 7
        ? "人脸认证"
        : this.isFaceRecognition
          ? "刷卡/人脸认证"
          : "刷卡/指纹认证";
    },
    // 1:1人脸验证 or 1：N人脸验证
    useFace11() {
      return ["call", "shopping"].includes(this.useFor);
    },
  },
  watch: {
    isShow(state) {
      if (!state) {
        this.isFacing = false;
        this.stopTemperature();
        this.stopFaceRecognition();
        // this.closeFingerPrint();
      } else {
        this.defaultLoginType = uni.getStorageSync("defaultLoginType");
        this.debounceSwitch = debounce(this.switchRecognitionMode, 1500);
      }
    },
  },
  destroyed() {
    this.stopFaceRecognition();
    // this.closeFingerPrint();
  },
  methods: {
    // 开始识别
    startRecognition() {
      if (this.useFor == "call") {
        this.startTemperature();
      }
      if (this.isFaceRecognition) {
        this.faceVoice('开始人脸识别，请站好正视屏幕');
        this.startFaceRecognition();
      } else {
        this.startFingerPrint();
      }
    },
    // 切换登录方式
    switchRecognitionMode() {
      if (this.useFor == "call" && this.regConfig.isRecognitionSuccess) {
        return;
      }
      this.defaultLoginType = this.defaultLoginType == 0 ? 1 : 0;
      this.$emit("switchRecognitionMode", this.isFaceRecognition);
      if (this.isFaceRecognition) {
        this.faceVoice('开始人脸识别，请站好正视屏幕');
        this.startFaceRecognition();
      } else {
        this.startFingerPrint();
      }
    },
    // 人脸拍照
    startFaceRecognition() {
      this.isFacing = true;
      if (this.isShow) {
        this.showVideo = true;
        this.faceVideo = this.$refs.videoRef.$refs.video;
        startFaceVideo(this.faceVideo, false).then(video => {
          this.faceTimer = setTimeout(() => {
            this.getFaceBase64Img(video);
          }, 2000);
        });
      }
    },
    // 获取人脸照片base64
    getFaceBase64Img(video) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 200, 150);
      let image = canvas.toDataURL("image/jpg");
      let base64 = image.substr(image.indexOf(",") + 1);
      let base64Str = base64.replace(/[\r\n]/g, "");
      this.faceRecognition(base64Str);
    },
    // 人脸识别
    async faceRecognition(base64Str = "") {
      const { roomId } = uni.getStorageSync("terminalInfo");
      let params = {
        roomId,
        base64Str,
      };
      // 根据不同使用 调用不同接口 call点名：1:1人脸比对 login登录：1：N比对
      let url = "";
      if (this.useFace11) {
        params.rybh = this.regConfig.rybh;
        url = Api.prisoner.faceRecognition11;
      } else {
        if ([2, 9].includes(this.currentTab)) {
          url = Api.prisoner.faceRecognition1N;
        } else if ([3, 7].includes(this.currentTab)) {
          url =
            this.currentTab == 3
              ? Api.police.policeFaceOneToMany
              : Api.police.policeFaceOneToManyForSupervisor;
        }
      }
      let res = await Api.apiCall("post", url, { data: params }, true, true);
      if (!this.isShow || !this.isFaceRecognition) {
        return;
      };
      if (res.state.code == 200) {
        if (
          ["login", "rotation", "conversation", "evaluation"].includes(
            this.useFor
          )
        ) {
          if (["login", "conversation", "evaluation"].includes(this.useFor)) {
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
        let text = res.state.msg || "未检测到有效人脸，请站好正视屏幕";
        this.faceVoice(text);
        console.log("未检测到有效人脸");
        this.startFaceRecognition();
      }
    },
    // 停止人脸识别
    stopFaceRecognition() {
      clearInterval(this.faceTimer);
      console.log("停止人脸识别");
      this.isFacing = false;
      stopFaceVideo();
    },
    // 开始指纹识别
    startFingerPrint() {
      this.stopFaceRecognition();
      // 打开指纹设备
      // fingerreader.connected(() => {
      //   fingerreader.initFingerPrintRecognize((e) => {
      //     if (e == 0) {
      //       console.log("指纹设备已打开");
      //       this.isFacing = false;
      //       setTimeout(() => {
      //         this.verifyFingerPrint();
      //       }, 1500);
      //     } else {
      //       console.log("指纹设备未打开");
      //     }
      //   });
      // });
      this.verifyFingerPrint();
    },
    verifyFingerPrint() {
      this.voiceBroadcast("请按压要识别的指纹");
      // fingerreader.enableCheckPress((res) => {
      //   if (res == 0) {
      //     fingerreader.fingerPrintRecognize((code, mKey, alias) => {
      //       switch (code) {
      //         case 0:
      //           let params = {
      //             mKey,
      //             temperature: this.temperature,
      //           };
      //           currentPages().fingerRecognitionSuccess(params);
      //           break;
      //         case 307:
      //           console.log("当前指纹不存在");
      //           break;
      //         case 318:
      //           console.log("指纹库为空");
      //           break;
      //         case 319:
      //           console.log("指纹库识别失败");
      //           break;
      //         case 504:
      //           console.log("数据为空");
      //           break;
      //       }
      //     });
      //   }
      // });
      setTimeout(() => {
        let params = {
          mKey: 1,
          temperature: "36.3",
        };
        currentPages().handleFingerRecognition(params);
      }, 6000);
    },
    // 关闭指纹连接
    closeFingerPrint() {
      // getApp().globalData.FloatUniModule.syncStopFinger((e) => {
      //   if (e.code == 0) {
      //     console.log("关闭指纹");
      //     getApp().globalData.FloatUniModule.fingerModuleStop();
      //   }
      // });
    },
    // 关闭识别弹窗
    handleClose() {
      this.$emit('close');
    },
    // 开始测量体温
    startTemperature() {
      if (!this.isShow) return;
      // getApp().globalData.FloatUniModule.syncStartTemperature((res) => {
      //   if (res.code == 0) {
      //     console.log("开启测温");
      //   }
      // });
    },
    // 人脸语音播报
    faceVoice(text) {
      this.faceConfig.scanTips = text;
      this.voiceBroadcast(text);
    },
    // 开始测量体温
    startTemperatureMeasurement() {
      if (!this.isShow) return;
      getApp().globalData.thermometryModule.open();
    },
    stopTemperature() {
      if (this.useFor === 'call') {
        // getApp().globalData.thermometryModule.close();
      }
    },
    setTemperature(tem) {
      this.temperature = tem;
    },
    // 语音播放
    voiceBroadcast(voiceText) {
      // 语音播放时段
      let messagePlayTime =
        uni.getStorageSync("messagePlayTime") || "05:00,22:00";
      let interval = messagePlayTime.split(",");
      let now = dateFormat("hh:mm", new Date());
      if (now >= interval[0] && now <= interval[1]) {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(voiceText);
          speechSynthesis.speak(utterance);
        } else {
          console.error("浏览器不支持语音引擎");
        }
      }
    },
  }
};
</script>

<style lang="less">
.recognition-container {
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

  .recognition-main {
    text-align: center;

    .face-main-body {
      width: 446upx;
      height: 272upx;

      .face-image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: #000;

        .loading-tips {
          width: 60upx;
          height: 60upx;
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

      .face-video {
        width: 100%;
        height: 100%;
      }
    }

    .face-scantips {
      display: inline-block;
      font-size: 20.83upx;
      font-weight: 400;
      margin: 13.88upx 0;
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

  .switch-btn-wrapper {
    margin-bottom: 30upx;
    width: 555.55upx;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .check-btn {
      display: flex;
      flex: 1;
      justify-content: flex-start;
      margin-left: 35upx;

      span {
        display: inline-block;
        width: fit-content;
        height: 43upx;
        border-radius: 4px;
        line-height: 43upx;
        background-color: #ff9900;
        color: #fff;
        font-size: 20.83upx;
        text-align: center;
        padding: 0 13.88upx;
      }
    }

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
}
</style>
