<template>
  <view class="temperature-monitor" @touchstart.stop="initCountTimer">
    <view class="main-area">
      <view class="uni-flex page-title">
        <text>体温监测</text>
      </view>
      <view class="content">
        <view class="left-box inner-glow-box">
          <view class="title">体温监测实时视频</view>
          <view class="video-box">
            <!-- <video :src="videoUrl" codec="software" autoplay muted :controls="false" style="width:100%; height:100%;" object-fit="fill">
              <cover-image class="recognition-tips" :src="`${baseUrl}terminal/static/png/recognition-tips.png`"></cover-image>
            </video> -->
          </view>
        </view>
        <view class="right-box">
          <view class="temperature-tips inner-glow-box">
            <!-- 测温步骤 -->
            <view class="measur-steps">
              <view class="title">测温步骤</view>
              <view class="details">
                <view
                  v-for="item in stepsDetails"
                  :key="item.className"
                  class="details-item"
                  :class="{ 'next-steps': item.hasNextSteps }"
                >
                  <view class="img sprite-sheet" :class="item.className"></view>
                  <view class="tips">{{ item.tips }}</view>
                </view>
              </view>
            </view>
            <!-- 分割线 -->
            <view class="parting-line"></view>
            <!-- 温度读取 -->
            <view class="cur-temperature">
              <view class="title">温度读取</view>
              <view class="details">
                <view class="details-item sprite-sheet inner-glow-box">
                  实时额头温度<text class="temperature-text">{{
                    foreheadTemperature + "℃"
                  }}</text>
                </view>
                <view class="details-item sprite-sheet inner-glow-box">
                  实时环境温度<text class="temperature-text">{{
                    environmentTemperature + "℃"
                  }}</text>
                </view>
              </view>
            </view>
          </view>
          <!-- 功能按钮 -->
          <view class="btn-box">
            <view
              v-if="debounceMeasure"
              class="btn measure-btn"
              @click="debounceMeasure"
              >测温</view
            >
            <view
              v-if="debounceApply"
              class="btn apply-btn"
              :class="{ disabled: !haveAFever }"
              @click="debounceApply"
              >报病申请</view
            >
          </view>
        </view>
      </view>
    </view>
    <div class="illness-container">
      <div class="neil-modal-container">
        <neil-modal :show="showIllnessInit" @close="closeIllnessInitModal">
          <div class="illness-modal-box">
            <view class="modal-header">
              <view class="modal-title">温馨提示</view>
              <div class="modal-close" @click="closeIllnessInitModal">
                <image src="/static/images/common/close.png"></image>
              </div>
            </view>
            <view class="modal-horizontal-divider"></view>
            <div class="illness-modal-content">
              <div v-if="showSuccess" class="modal-talkInit">
                <common-icons iconType="iconsuccess" size="100" color="#fff" />
                <text class="illness-tip">申请成功</text>
              </div>
              <div v-if="!showSuccess" class="modal-talkInit">
                <common-icons iconType="iconfail" size="100" color="#fff" />
                <text class="illness-tip">{{ failInfo }}</text>
              </div>
            </div>
          </div>
        </neil-modal>
      </div>
    </div>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Api from "@/common/api.js";
import Log from "@/common/utils/log.js";
import { debounce } from "@/common/utils/util.js";
export default {
  components: {},
  data() {
    return {
      baseUrl: uni.getStorageSync("baseUrl"),
      stepsDetails: [
        {
          className: "steps-one",
          tips: "请距离仓内屏一只手臂宽度",
          hasNextSteps: true,
        },
        {
          className: "steps-two",
          tips: "请正视屏幕站直",
          hasNextSteps: true,
        },
        {
          className: "steps-three",
          tips: "请点击“测温”按钮",
          hasNextSteps: false,
        },
      ],
      debounceMeasure: null, // 测温
      debounceApply: null, // 报病申请
      haveAFever: false, // 是否发烧
      savedTemperature: false, // 是否已经测温
      foreheadTemperature: 36.3, // 实时额头温度
      foreheadTemperatureList: [],
      environmentTemperature: 0, // 实时环境温度
      normalTemperature: uni.getStorageSync("normalTemperature"), // 发烧体温
      lowTemperature: uni.getStorageSync("lowTemperature"), // 最低温度
      thermometryTimer: null, // 测温定时器
      showIllnessInit: false, // 报病结果弹框
      showSuccess: true, // 报病成功
      failInfo: "", // 报病错误信息
      videoUrl: "", // 实时视频
    };
  },
  computed: {
    ...mapState({
      // 登录人员信息
      personInfo: (state) => state.app.personInfo,
      // 播放组件显隐
      showPlayer: (state) => state.app.showPlayer,
    }),
  },
  created() {
    // 开启倒计时
    this.$parent.countTimer();
    if (!this.debounceMeasure) {
      this.debounceMeasure = debounce(this.handleMeasure);
    }
    if (!this.debounceApply) {
      this.debounceApply = debounce(this.handleApply);
    }
    this.showNodePlayer();
    let _this = this;
    // #ifdef APP-PLUS
    plus.globalEvent.removeEventListener("人体温度");
    plus.globalEvent.addEventListener("人体温度", function (e) {
      let temperature = e.人体温度.toFixed(1);
      _this.foreheadTemperature = temperature < 36.0 ? 36.3 : temperature;
      if (temperature > _this.lowTemperature) {
        _this.foreheadTemperatureList.push(temperature);
      }
    });
    plus.globalEvent.removeEventListener("环境温度");
    plus.globalEvent.addEventListener("环境温度", function (e) {
      _this.environmentTemperature = e.环境温度.toFixed(1);
    });
    // #endif
    this.initTemperature();
  },
  destroyed() {
    this.hideNodePlayer();
    // 清空体温定时器
    this.clearThermometryTimer();
    getApp().globalData.Temperature.stop();
  },
  methods: {
    ...mapMutations({
      // 设置监视监听显隐
      setShowPlayer: "app/SET_SHOWPLAYER",
      // 设置视频流地址
      setPlayerUrl: "app/SET_PLAYERURL",
    }),
    // 重置倒计时
    initCountTimer() {
      // this.$parent.initCountTimeout();
    },
    // 测温控件初始化
    initTemperature() {
      let res = getApp().globalData.Temperature.init();
      if (res == 0) {
        this.setThermometryTimer();
      } else {
        Log.writeLog(`测量体温初始化失败，code：${res}`, false);
      }
    },
    // 点击测温
    handleMeasure() {
      this.clearThermometryTimer();
      // 显示最后一次有效值
      let len = this.foreheadTemperatureList.length;
      if (len) {
        this.foreheadTemperature = this.foreheadTemperatureList[len - 1];
      } else {
        this.foreheadTemperature = 36.3;
      }
      // 发烧
      if (this.foreheadTemperature > this.normalTemperature) {
        this.haveAFever = true;
        let params = {
          rybh: this.personInfo.rybh,
          temperature: this.foreheadTemperature,
        };
        this.saveWarningTemperature(params);
      }
      // 保存测温结果
      this.saveTemperature();
    },
    // 测温
    async saveTemperature() {
      if (this.savedTemperature) return;
      let params = {
        rybh: this.personInfo.rybh,
        forehead: this.foreheadTemperature,
        environment: this.environmentTemperature,
      };
      let res = await Api.apiCall(
        "post",
        Api.prisoner.temperatureMonitor.saveRollCall,
        params,
        true
      );
      if (res.state.code == "200") {
        this.savedTemperature = true;
        uni.showToast({
          title: "体温提交成功",
        });
      } else {
        this.initTemperature();
      }
    },
    // 保存体温超出预警值的人员
    async saveWarningTemperature(params) {
      let res = await Api.apiCall(
        "post",
        Api.prisoner.call.saveWarningTemperature,
        params
      );
    },
    //点击报病申请
    handleApply() {
      this.saveIllnessInfo();
    },
    // 报病申请
    async saveIllnessInfo() {
      let params = {
        rybh: this.personInfo.rybh,
        commonSymptom: "118",
        selfCondition: "体温：" + this.foreheadTemperature + "℃",
      };
      let res = await Api.apiCall("post", Api.index.saveIllnessInfo, params);
      if (res.state.code == "200") {
        this.foreheadTemperatureList = [];
      } else {
        this.failInfo = res.state.msg;
        this.showSuccess = false;
      }
      this.haveAFever = false;
      this.handleShowIllnessInit();
      setTimeout(() => {
        this.$parent.onClickBack();
      }, 5000);
    },
    // 报病申请结果弹框
    handleShowIllnessInit() {
      this.showIllnessInit = true;
    },
    // 关闭报病申请结果弹框
    closeIllnessInitModal() {
      this.showIllnessInit = false;
    },
    // 设置测温定时器
    setThermometryTimer() {
      getApp().globalData.Temperature.start(1);
      this.thermometryTimer = setInterval(() => {
        getApp().globalData.Temperature.start(1);
      }, 2000);
    },
    // 清除测温定时器
    clearThermometryTimer() {
      this.thermometryTimer && clearInterval(this.thermometryTimer);
      this.thermometryTimer = null;
    },
    // 显示视频流预览
    showNodePlayer() {
      this.setShowPlayer(true);
      uni.getSubNVueById("nodePlayer").show();
      uni.getSubNVueById("coverImage").show();
      uni.getSubNVueById("nodePlayer").setStyle({
        top: "400px",
        left: "95px",
        width: "810px",
        height: "545px",
      });
      uni.getSubNVueById("coverImage").setStyle({
        top: "400px",
        left: "95px",
      });
      this.videoUrl = `${uni.getStorageSync("rtspUrl")}@${
        uni.getStorageSync("terminalInfo").embeddedIp
      }/stream0`;
      this.setPlayerUrl(this.videoUrl);
      // 视频镜像
      setTimeout(() => {
        uni.$emit("node-player", "mirror");
      }, 1000);
    },
    // 关闭视频流预览
    hideNodePlayer() {
      if (this.showPlayer) {
        this.setPlayerUrl("");
        uni.$emit("node-player", "stop");
        this.setShowPlayer(false);
        uni.getSubNVueById("coverImage").hide();
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../../common/less/index.less";
.temperature-monitor /deep/ .neil-modal__container {
  transform: translate(9%, -50%) !important;
}
.inner-glow-box {
  box-sizing: border-box;
  border: 1px solid #00c6ff;
  border-radius: 4px;
  box-shadow: inset 0upx 0upx 5upx 5upx rgba(25, 106, 190, 0.5);
}
.temperature-monitor {
  .sprite-sheet {
    background-image: url("../../../static/images/temperatureMonitor/temperature_monitor.png");
    background-repeat: no-repeat;
  }
  .content {
    margin: 0 48.61upx;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .title {
      margin-bottom: 20.83upx;
      width: 100%;
      font-size: 20.83upx;
      text-align: center;
      color: #35fffa;
    }
    .left-box {
      padding: 20.83upx;
      width: 625upx;
      box-sizing: border-box;
      .video-box {
        position: relative;
        width: 583.33upx;
        height: 388.89upx;
        background-color: #000;
        .recognition-tips {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 266upx;
          height: 328.5upx;
        }
      }
    }
    .right-box {
      width: 583.33upx;
      .temperature-tips {
        margin-bottom: 15.83upx;
        padding: 15.83upx;
        box-sizing: border-box;
        .measur-steps {
          .details {
            padding: 0 20.83upx 10.83upx;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            .details-item {
              .img {
                margin-bottom: 13.89upx;
                width: 111.22upx;
                height: 125upx;
                border: 2px dashed #91b7f2;
              }
              .steps-one {
                background-position: -8.95upx -8.95upx;
              }
              .steps-two {
                background-position: -195.5upx -8.95upx;
              }
              .steps-three {
                background-position: -380.06upx -8.95upx;
              }
              .tips {
                width: 111.11upx;
                font-size: 16.67upx;
                line-height: 25upx;
                text-align: center;
              }
            }
            .next-steps {
              position: relative;
              &::after {
                position: absolute;
                bottom: 11.806upx;
                right: -62.5upx;
                content: " ";
                display: inline-block;
                width: 36.806upx;
                height: 25upx;
                background-image: url("../../../static/images/temperatureMonitor/temperature_monitor.png");
                background-repeat: no-repeat;
                background-position: -6.95upx -158.78upx;
              }
            }
          }
        }
        .parting-line {
          margin-bottom: 10.83upx;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            90deg,
            rgba(0, 198, 255, 0),
            #00c6ff,
            rgba(0, 198, 255, 0)
          );
        }
        .cur-temperature {
          .details {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            .details-item {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 259.73upx;
              height: 76.39upx;
              background-position: -10.95upx -215.25upx;
              font-size: 16.67upx;
              .temperature-text {
                margin-left: 13.89upx;
                font-size: 33.33upx;
                font-weight: 400;
                color: #35fffa;
              }
            }
          }
        }
      }
      .btn-box {
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        .btn {
          margin-left: 13.89upx;
          padding: 10upx 0;
          width: 108.12upx;
          text-align: center;
          font-size: 18.06upx;
          background: #007aff;
          border-radius: 4px;
          &.disabled {
            opacity: 0.5;
            pointer-events: none;
          }
        }
      }
    }
  }
}
</style>
