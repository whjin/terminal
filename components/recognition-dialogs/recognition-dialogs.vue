<template>
  <neil-modal :show="isShow" @close="handleClose">
    <view class="recognition-dialogs-container"
      :class="{ 'without-header': useFor !== 'login' && useFor !== 'shopping' }">
      <!-- 顶部操作栏 -->
      <template v-if="useFor === 'login' || useFor === 'shopping' || useFor === 'rotation'
        ">
        <view class="modal-header">
          <view class="modal-title">温馨提示</view>
          <div class="modal-close" @click="handleClose">
            <image src="/static/images/common/close.png"></image>
          </div>
        </view>
        <view class="page-horizontal-divider"></view>
      </template>
      <view class="uni-flex uni-flex-item uni-column" style="justify-content: space-around; align-items: center">
        <div v-if="(useFor === 'call' ||
          useFor === 'rotation' ||
          useFor === 'shopping') &&
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
          <text v-if="useFor === 'call' ||
            useFor === 'rotation' ||
            useFor === 'shopping'
            " style="font-size: 20.83upx; font-weight: 400; color: #35fffa">{{ callConfig.callName }}</text>
          <text style="font-size: 20.83upx; font-weight: 400">{{
            faceConfig.scanTips
          }}</text>
        </template>
        <!-- 指纹认证 -->
        <template v-else>
          <template v-if="useFor === 'login'">
            <common-icons iconType="iconzhiwen" size="100" color="#fff" />
            <text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
          </template>
          <div v-else class="call-modal-box">
            <div class="call-modal-content">
              <div class="modal-fingerInit modal-fingerSuccess">
                <common-icons iconType="iconzhiwen" size="100" color="#fff" />
                <text class="finger-name">{{ callConfig.callName }}</text>
                <text v-if="useFor === 'shopping'" class="finger-tip">请进行验证</text>
                <text v-else class="finger-tip">请进行签到</text>
              </div>
            </div>
          </div>
        </template>
      </view>
      <!-- 切换按钮 -->
      <div class="switch-btn-wrapper" v-if="debounceSwitch">
        <div type="default" class="switch-type-btn" v-if="this.useFor !== 'call' ||
          (this.useFor === 'call' && !this.callConfig.isRecognitionSuccess)
          " @touchstart.stop="debounceSwitch">
          切换{{ isFaceRecognition ? "指纹" : "人脸" }}
        </div>
      </div>
    </view>
  </neil-modal>
</template>

<script>
import Api from "@/common/api.js";
import { debounce, dateFormat } from "@/common/utils/util.js";
import { mapMutations } from "vuex";

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
      default() {
        return {
          callName: "某某某", // 当前被点名人员
          isRecognitionSuccess: false, // 是否点名认证成功
          rybh: "", // 人员编号 用于获取库存照片
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
      // 指纹登录需要的配置
      frigerConfig: {
        // 指纹设备开启状态
        isFrigerOpen: false,
        loginTimer: null,
      },
      temperature: 0,
      // 切换按钮防抖
      debounceSwitch: null,
      // 正在人脸识别
      isFacing: false,
      // 人脸预览定时器
      faceTimer: null,
      temperatureTimer: null,
    };
  },
  computed: {
    // 0人脸验证，1指纹验证
    isFaceRecognition() {
      return this.defaultLoginType == 0 ? true : false;
    },
    // 1:1人脸验证 or 1：N人脸验证
    useFace11() {
      return ["call", "shopping"].includes(this.useFor) ? true : false;
    },
  },
  watch: {
    isShow(state) {
      if (!state) {
        this.hideNodePlayer(true);
        this.closeFingerPrint();
        this.stopTemperature();
      } else {
        this.defaultLoginType = uni.getStorageSync("defaultLoginType");
        this.debounceSwitch = debounce(this.switchRecognitionMode, 1500);
        uni.$on("preview-base64", (base64) => {
          this.faceRecognition(base64);
        });
        if (this.useFor === "call") {
          // #ifdef APP-PLUS
          let _this = this;
          plus.globalEvent.removeEventListener("人体温度");
          plus.globalEvent.addEventListener("人体温度", function (e) {
            let tem = e.人体温度.toFixed(1);
            if (tem < 0) {
              _this.temperatureTimer = setTimeout(() => {
                getApp().globalData.Temperature.start(1);
              }, 3000);
            }
            _this.temperature = tem;
          });
          // #endif
        }
      }
    },
  },
  destroyed() {
    this.hideNodePlayer(true);
    this.closeFingerPrint();
    this.stopTemperature();
  },
  methods: {
    ...mapMutations({
      // 视频播放组件
      setShowPlayer: "app/SET_SHOWPLAYER",
      // 设置视频流地址
      setPlayerUrl: "app/SET_PLAYERURL",
      // 设置nodePlayer组件静音状态
      setIsMuted: "app/SET_ISMUTED",
    }),
    // 开始识别
    startRecognition() {
      if (this.useFor === "call") {
        this.startTemperature();
      }
      if (this.isFaceRecognition) {
        this.faceVoice("开始人脸识别，请站好正视屏幕");
        this.handleFaceRecognition(true);
      } else {
        this.verifyFingerPrint();
      }
    },
    // 切换登录方式
    switchRecognitionMode() {
      if (
        (this.useFor === "call" && this.callConfig.isRecognitionSuccess) ||
        this.isFacing
      )
        return;
      clearTimeout(this.faceTimer);
      this.defaultLoginType = this.defaultLoginType == 0 ? 1 : 0;
      this.$emit("switchRecognitionMode", this.isFaceRecognition);
      if (this.isFaceRecognition) {
        // 关闭指纹识别定时器
        clearInterval(this.frigerConfig.loginTimer);
        this.faceVoice("开始人脸识别，请站好正视屏幕");
        this.handleFaceRecognition(true);
      } else {
        this.verifyFingerPrint();
      }
    },
    // 开始人脸识别
    handleFaceRecognition(status) {
      if (status) {
        this.showNodePlayer();
      }
      clearTimeout(this.faceTimer);
      this.faceTimer = setTimeout(() => {
        uni.$emit("node-player", "preview");
      }, 3000);
    },
    // 显示视频流预览
    showNodePlayer() {
      this.setShowPlayer(true);
      uni.getSubNVueById("nodePlayer").show();
      uni.getSubNVueById("nodePlayer").setStyle({
        top: this.useFace11 ? "268px" : "282px",
        left: "610px",
        width: "640px",
        height: "400px",
      });
      let videostream = `${uni.getStorageSync("rtspUrl")}@${uni.getStorageSync("terminalInfo").embeddedIp
        }/stream0`;
      this.setPlayerUrl(videostream);
      this.setIsMuted(true);
      // 视频镜像
      setTimeout(() => {
        uni.$emit("node-player", "mirror");
      }, 1000);
    },
    // 人脸识别
    async faceRecognition(base64Str = "") {
      if (this.isShow && !this.isFacing) {
        this.isFacing = true;
        const { roomId } = uni.getStorageSync("terminalInfo");
        let params = { roomId, base64Str };
        let url = "";
        // 根据不同使用 调用不同接口 call点名：1:1人脸比对 login登录：1：N比对
        if (this.useFace11) {
          params.rybh = this.callConfig.rybh;
          url = Api.prisoner.prisonerImageOneToOne;
        } else {
          url = Api.prisoner.prisonerImgOneToMany;
        }
        let res = await Api.apiCall("post", url, { data: params, }, true, true);
        this.isFacing = false;
        if (!this.isShow || !this.isFaceRecognition) return;
        if (res.state.code == 200) {
          if (this.useFace11) {
            // call 点名返回体温
            this.faceConfig.scanTips = "验证通过";
            this.$emit("faceRecognitionSuccess", {
              temperature: this.temperature,
            });
          } else {
            if (this.useFor === "login") {
              this.faceVoice("人脸识别成功");
            }
            // 登录返回登录人员信息
            this.$emit(
              "faceRecognitionSuccess",
              Object.assign({}, res.data, {
                temperature: this.temperature,
                operate: this.isFaceRecognition ? 0 : 1
              })
            );
          }
        } else {
          let text =
            (res.state && res.state.msg) || "未检测到有效人脸，请站好正视屏幕";
          this.faceVoice(text);
          this.handleFaceRecognition(false);
        }
      }
    },
    // 关闭视频流预览
    hideNodePlayer(state) {
      this.isFacing = false;
      clearTimeout(this.faceTimer);
      clearTimeout(this.temperatureTimer);
      if (state) {
        uni.$off("preview-base64");
      }
      this.setPlayerUrl("");
      uni.$emit("node-player", "stop");
      this.setShowPlayer(false);
    },
    // 开始指纹识别
    verifyFingerPrint() {
      this.hideNodePlayer(false);
      this.initFingerPrint();
      setTimeout(() => {
        this.identifyFingerPrint();
      }, 1500);
    },
    // 指纹设备连接
    initFingerPrint() {
      if (!this.frigerConfig.isFrigerOpen) {
        getApp().globalData.Fingerprint.init((result) => {
          if (result == 0) {
            this.frigerConfig.isFrigerOpen = true;
            console.log("设备已连接");
          } else {
            this.frigerConfig.isFrigerOpen = false;
            console.log("设备连接失败");
          }
        });
      }
    },
    // 指纹登录
    identifyFingerPrint() {
      clearTimeout(this.faceTimer);
      this.isFacing = false;
      if (
        this.frigerConfig.isFrigerOpen &&
        !this.isFaceRecognition &&
        this.isShow
      ) {
        this.voiceBroadcast("请按压要识别的指纹");
        // 关闭指纹识别定时器
        clearInterval(this.frigerConfig.loginTimer);
        this.frigerConfig.loginTimer = setInterval(() => {
          if (this.isFaceRecognition || !this.isShow) {
            // 关闭指纹识别定时器
            clearInterval(this.frigerConfig.loginTimer);
          }
          if (getApp().globalData.Fingerprint.isPressFinger() == 0) {
            let res = getApp().globalData.Fingerprint.identify();
            switch (res.code) {
              case 0:
                if (this.useFor === "login") {
                  this.voiceBroadcast("指纹识别成功");
                }
                this.$emit("fingerRecognitionSuccess", {
                  mKey: res.result,
                  temperature: this.temperature,
                  operate: this.isFaceRecognition ? 0 : 1
                });
                break;
              case 4104:
                this.voiceBroadcast("指纹识别失败，没有录入该指纹");
                this.$emit("recognitionFail");
                break;
              case 4106:
                this.voiceBroadcast("指纹识别失败，指纹库为空");
                this.$emit("recognitionFail");
                break;
              default:
                this.voiceBroadcast("指纹识别失败");
                this.$emit("recognitionFail");
                break;
            }
          } else {
            console.log("请按压指纹");
          }
        }, 3000);
      } else {
        console.log("请先连接设备");
      }
    },
    // 关闭指纹连接
    closeFingerPrint() {
      // 关闭指纹识别定时器
      clearInterval(this.frigerConfig.loginTimer);
      if (this.frigerConfig.isFrigerOpen) {
        let res = getApp().globalData.Fingerprint.close();
        if (res == 0) {
          this.frigerConfig.isFrigerOpen = false;
          console.log("设备关闭成功");
        } else {
          console.log("设备关闭失败");
          this.$parent.handleShowToast("设备关闭失败");
        }
      }
    },
    // 开始测量体温
    startTemperature() {
      if (!this.isShow) return;
      let res = getApp().globalData.Temperature.init();
      if (res == 0) {
        getApp().globalData.Temperature.start(1);
      }
    },
    // 停止测量体温
    stopTemperature() {
      if (this.useFor === "call") {
        plus.globalEvent.removeEventListener("人体温度");
        clearTimeout(this.temperatureTimer);
        getApp().globalData.Temperature.stop();
      }
    },
    // 关闭人脸识别弹窗
    handleClose() {
      this.$emit("close");
    },
    // 人脸语音播报
    faceVoice(text) {
      this.faceConfig.scanTips = text;
      this.voiceBroadcast(text);
    },
    // 语音播放
    voiceBroadcast(voiceText) {
      // 语音播放时段
      let messagePlayTime =
        uni.getStorageSync("messagePlayTime") || "05:00,22:00";
      let interval = messagePlayTime.split(",");
      let now = dateFormat("hh:mm", new Date());
      if (now >= interval[0] && now <= interval[1]) {
        let options = {
          content: voiceText,
        };
        getApp().globalData.Base.speech(options);
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
    margin: 13.88upx 0;
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
        margin-top: 20upx;
      }

      .finger-tip {
        color: #fff;
      }
    }
  }
}
</style>
