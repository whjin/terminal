<template>
  <div class="call-container">
    <div class="call-wrapper">
      <div class="call-table-container">
        <div class="call-table-title">
          <text>在线点名</text>
        </div>
        <div class="call-table-body">
          <div class="table-box">
            <div class="table-head">
              <div class="table-head-item" v-for="(item, index) in callColumns" :key="index" :style="{ flex: item.flex }">
                {{ item.title }}
              </div>
            </div>
            <scroll-view scroll-y="true" :scroll-into-view="scrollToView" :scroll-with-animation="true"
              class="call-table-scroll">
              <div class="table-content" v-for="(item, index) in rollCallList" :key="item.rybh" :id="`id${item.rybh}`"
                :class="{
                  'current-content': item.rybh == callId,
                  'signed-content': item.status == '1',
                }">
                <div class="table-content-item" style="flex: 1">
                  {{ index + 1 }}
                </div>
                <div class="table-content-item" style="flex: 1">
                  {{ item.name }}
                </div>
                <div class="table-content-item" style="flex: 2">
                  {{ item.startDate }}
                </div>
                <div class="table-content-item" style="flex: 2">
                  {{ item.endDate }}
                </div>
                <div class="table-content-item" style="flex: 2">
                  {{ item.signDate }}
                </div>
                <div class="table-content-item" style="flex: 1">
                  {{ item.statusText }}
                </div>
                <div class="table-content-item" style="flex: 2">
                  {{ item.location }}
                </div>
              </div>
            </scroll-view>
          </div>
        </div>
      </div>
    </div>
    <recognition-dialogs ref="recognitionDialogs" useFor="call" :callConfig="callConfig" :isShow="showRecognitionDialogs"
      @fingerRecognitionSuccess="fingerRecognitionSuccess" @faceRecognitionSuccess="faceRecognitionSuccess"
      @close="closeRecognitionDialogs"></recognition-dialogs>
  </div>
</template>

<script>
import neilModal from "@/components/neil-modal/neil-modal.vue";
import Api from "@/common/api.js";
import { dateFormat } from "@/common/utils/util.js";
import { mapState, mapMutations } from "vuex";
import callColumns from "@/static/mock/callColumns.json";
import recognitionDialogs from "@/components/recognition-dialogs/recognition-dialogs.vue";

export default {
  components: {
    neilModal,
    recognitionDialogs,
  },
  data() {
    return {
      // 认证弹框
      showRecognitionDialogs: false,
      // 表头信息
      callColumns: callColumns,
      // 在线点名人员列表
      rollCallList: [],
      // 签到成功人员信息
      callName: "",
      // 点名倒计时
      callTimer: null,
      // 第一次点名计时器
      rollCallTimer: null,
      // 当前点名ID
      callId: "",
      // 点名索引
      callIndex: 0,
      // 点名轮次
      callRound: 1,
      // 点名时长
      duration: 0,
      // 点名间隔时间
      callSpace: 0,
      // 已签到人员列表
      signedList: [],
      // 未签到人员列表
      unSignCallList: [],
      // 当前点名人员索引
      curIndex: 0,
      // 签到开始时间
      startTime: "",
      // 签到结束时间
      endTime: "",
      // 点名认证弹框配置
      callConfig: {
        callName: "", // 当前被点名人员
        isRecognitionSuccess: false, // 是否点名认证成功
        rybh: "",
      },
      // 当前时间
      nowDate: new Date(),
      // 自动滚动
      scrollToView: "",
      temperature: 0,
      // 执行下一个定时器
      nextTimer: null,
    };
  },
  computed: {
    ...mapState({
      // 是否正在点名
      isCalling: (state) => state.app.isCalling,
      // 点名类型
      rollType: (state) => state.app.rollType,
      // 在线点名ID
      rollId: (state) => state.app.rollId,
      // 临时点名信息
      rollInfo: (state) => state.app.rollInfo,
    }),
  },
  created() {
    if (!this.isCalling) {
      this.setIsCalling(true);
      // 开始点名
      this.$parent.receiveTask("rollCall", "start");
      // 获取在线点名人员列表
      this.startRollCall();
    }
  },
  beforeDestroy() {
    this.discontinueCall(false);
  },
  methods: {
    ...mapMutations({
      // 设置当前页面
      setCurrentTab: "app/SET_CURRENTTAB",
      // 设置点名状态
      setIsCalling: "app/SET_ISCALLING",
    }),
    // 获取在线点名人员列表
    startRollCall() {
      if (this.rollType == "0") {
        // 获取在线点名人员列表
        this.getRollCallInfo();
      }
      if (this.rollType == "1") {
        // 临时点名
        this.duration = this.rollInfo.duration || 120;
        this.callSpace = this.rollInfo.callSpace || 30;
        let params = {
          duration: this.duration,
          callSpace: this.callSpace,
          roomId: uni.getStorageSync("terminalInfo").roomId,
        };
        // 获取临时点名人员列表
        this.getTempRollCallInfo(params);
      }
    },
    // 获取在线点名人员列表
    async getRollCallInfo() {
      let params = {
        rollId: this.rollId,
        roomId: uni.getStorageSync("terminalInfo").roomId,
      };
      let res = await Api.apiCall("get", Api.index.getRollCallRyList, params);
      this.requestRollCallInfo(res);
    },
    // 获取临时点名人员列表
    async getTempRollCallInfo(params) {
      let res = await Api.apiCall(
        "get",
        Api.index.getTempRollCallRyList,
        params
      );
      this.requestRollCallInfo(res);
    },
    // 校验请求数据
    requestRollCallInfo(res) {
      if (res.state.code == 200 && Reflect.has(res, "data")) {
        this.rollCallInfoHanlder(res);
      } else {
        setTimeout(() => {
          this.stopRollCall();
        }, 1500);
      }
    },
    // 处理点名人员信息
    rollCallInfoHanlder(res) {
      this.nowDate = res.date ? new Date(res.date) : new Date();
      this.duration = res.data.rollCall.duration || 120;
      this.callSpace = res.data.rollCall.callSpace || 30;
      this.startTime = res.data.rollCall.startTime;
      this.endTime = res.data.rollCall.endTime;
      let rollCallInfo = uni.getStorageSync("rollCallInfo");
      if (!rollCallInfo) {
        this.rollCallList = res.data.rollCallRyList;
        this.rollCallList.map((item) => {
          item.called = false;
          item.round = 1;
          item.temperature = 0;
        });
        uni.setStorageSync("rollCallInfo", this.rollCallList);
      } else {
        this.rollCallList = rollCallInfo;
      }
      this.rollCallList.map((item, index) => {
        this.callRound = item.round;
        item.index = index;
        item.statusText = item.status == "1" ? "已签到" : "未签到";
      });
      this.unSignCallList = this.rollCallList.filter(
        (item) => item.status == "0"
      );
      if (this.unSignCallList.length) {
        let flag = this.unSignCallList.every((item) => item.called);
        if (flag) {
          this.curIndex =
            this.callRound == 2 ? this.unSignCallList.length - 1 : 0;
        } else {
          this.curIndex = this.unSignCallList.findIndex((item) => {
            return !item.called;
          });
        }
      }
      this.handleRollCall();
      this.startRollCallTimer();
    },
    // 在线点名
    handleRollCall() {
      if (!this.unSignCallList.length) {
        this.stopRollCall();
        return;
      }
      this.rollCallHandler();
      clearInterval(this.rollCallTimer);
      this.rollCallTimer = setInterval(() => {
        // 缓存人员信息
        this.setRollCallStorage(this.unSignCallList[this.curIndex]);
        this.nextSignHandler(this.rollCallHandler);
      }, this.callSpace * 1000);
    },
    rollCallHandler() {
      this.showRecognitionDialogs = false;
      this.callIndex = this.unSignCallList[this.curIndex].index;
      this.callId = this.unSignCallList[this.curIndex].rybh;
      this.scrollToView = `id${this.callId}`;
      this.callConfig.rybh = this.callId;
      this.callConfig.callName = `${this.unSignCallList[this.curIndex].name}`;
      let { location, name, } = this.unSignCallList[this.curIndex];
      if (!!location) {
        this.voiceBroadcast(
          `${name}${location}，跳过。`
        );
        this.nextTimer = setTimeout(() => {
          this.nextSignHandler(this.rollCallHandler);
        }, 5000);
      } else {
        this.voiceBroadcast(
          `请${this.unSignCallList[this.curIndex].name}进行签到`
        );
        setTimeout(() => {
          this.showRecognitionDialogs = true;
          this.$nextTick(() => {
            this.$refs.recognitionDialogs &&
              this.$refs.recognitionDialogs.startRecognition();
          });
        }, 3000);
      }
    },

    unSignCallHandler() {
      this.showRecognitionDialogs = false;
      clearInterval(this.rollCallTimer);
      this.curIndex = 0;
      if (this.callRound == 1) {
        this.$parent.handleShowToast("第一轮点名结束");
      }
      if (this.callRound == 2) {
        this.$parent.handleShowToast("第二轮点名结束");
        setTimeout(() => {
          this.stopRollCall();
        }, 0);
        return;
      }
      this.callRound = 2;
      this.unSignCallList = [];
      this.rollCallList.map((item, index) => {
        item.round = 2;
        if (item.status == "0") {
          item.index = index;
          this.unSignCallList.push(item);
        }
      });
      setTimeout(() => {
        if (this.unSignCallList.length) {
          // 开始第二轮点名
          this.handleRollCall();
        } else {
          this.stopRollCall();
        }
      }, 0);
    },
    // 缓存点名人员信息
    setRollCallStorage(curCallInfo) {
      this.rollCallList.map((item) => {
        item.round = this.callRound;
        if (item.rybh == curCallInfo.rybh) {
          item.called = true;
          item.temperature = this.temperature;
        }
      });
      uni.setStorageSync("rollCallInfo", this.rollCallList);
    },
    // 签到成功
    signSuccess(temperature) {
      this.temperature = temperature;
      clearInterval(this.rollCallTimer);
      this.rollCallList[this.callIndex].signDate = dateFormat(
        "YYYY-MM-DD hh:mm",
        new Date()
      );
      this.rollCallList[this.callIndex].status = "1";
      this.rollCallList[this.callIndex].statusText = "已签到";
      this.rollCallList[this.callIndex].temperature = temperature;
      this.setRollCallStorage(this.unSignCallList[this.curIndex]);
      this.callConfig.isRecognitionSuccess = true;
      this.voiceBroadcast(`${this.rollCallList[this.callIndex].name}签到成功`);
      let params = {
        rybh: this.rollCallList[this.callIndex].rybh,
        temperature,
      };
      if (temperature > uni.getStorageSync("normalTemperature")) {
        this.saveWarningTemperature(params);
      }
      setTimeout(() => {
        this.showRecognitionDialogs = false;
      }, 2000);
      this.nextTimer = setTimeout(() => {
        this.callConfig.isRecognitionSuccess = false;
        this.nextSignHandler(this.handleRollCall);
      }, 5000);
    },
    // 执行下一个点名
    nextSignHandler(Func) {
      clearTimeout(this.nextTimer);
      this.curIndex++;
      if (this.curIndex < this.unSignCallList.length) {
        Func();
      } else {
        this.unSignCallHandler();
      }
    },
    // 签到时长倒计时
    startRollCallTimer() {
      this.callTimer = setInterval(() => {
        this.duration--;
        if (this.duration <= 0) {
          this.stopRollCall();
        }
      }, 1000);
    },
    // 点名结束
    stopRollCall() {
      this.showRecognitionDialogs = false;
      clearInterval(this.callTimer);
      clearInterval(this.rollCallTimer);
      this.voiceBroadcast("签到结束");
      this.setIsCalling(false);
      this.saveSignedCallInfo();
    },
    // 保存已签到人员信息
    async saveSignedCallInfo() {
      this.rollCallList.map((item) => {
        if (item.status == "0") {
          item.temperature = 0;
        }
      });
      let callTime = dateFormat("YYYY-MM-DD", this.nowDate);
      let startTime = this.startTime ? this.startTime : callTime;
      let endTime = this.endTime ? this.endTime : callTime;
      let roomId = uni.getStorageSync("terminalInfo").roomId;
      let params = {
        callTime,
        startTime,
        endTime,
        roomId,
        rollCallRes: this.rollCallList,
      };
      let res = await Api.apiCall("post", Api.index.saveRollCallDetail, params);
      uni.removeStorageSync("rollCallInfo");
      this.$parent.receiveTask("rollCall", "stop");
      if (res.state.code == 200) {
        this.$parent.handleShowToast("签到信息保存成功");
      }
      setTimeout(() => {
        this.$parent.handleCallOver();
        this.setCurrentTab(1);
      }, 0);
    },
    // 保存体温超出预警值的人员
    async saveWarningTemperature(params) {
      await Api.apiCall(
        "post",
        Api.prisoner.call.saveWarningTemperature,
        params
      );
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess(res) {
      if (this.rollCallList[this.callIndex].mKeys.includes(String(res.mKey))) {
        this.signSuccess(res.temperature);
      } else {
        this.voiceBroadcast(
          `指纹识别失败，请${this.rollCallList[this.callIndex].name}进行签到`
        );
      }
      this.callConfig.callName = this.rollCallList[this.callIndex].name;
    },
    // 人脸认证成功回调
    faceRecognitionSuccess(res) {
      this.signSuccess(res.temperature);
      this.callConfig.callName = this.rollCallList[this.callIndex].name;
    },
    // 认证弹框关闭回调
    closeRecognitionDialogs() {
      this.showRecognitionDialogs = false;
    },
    // 对讲中止点名
    discontinueCall(state) {
      this.showRecognitionDialogs = false;
      clearInterval(this.callTimer);
      clearInterval(this.rollCallTimer);
      this.setIsCalling(false);
      if (state) {
        this.$parent.receiveTask("rollCall", "0");
      }
      setTimeout(() => {
        this.setCurrentTab(1);
      }, 0);
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

<style lang="less">
@import "../../../common/less/index.less";
</style>
