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
            <scroll-view scroll-y="true" class="call-table-scroll">
              <div class="table-content" v-for="(item, index) in rollCallList" :key="index" :class="{
                  'current-content': item.rybh == callId,
                  'signed-content': item.status == '已签到',
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
                  {{ item.status }}
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
    <recognition-dialogs ref="recognitionDialogs" useFor="call" :callConfig="callConfig" :isShow="showRecognitionDialogs" @fingerRecognitionSuccess="fingerRecognitionSuccess" @faceRecognitionSuccess="faceRecognitionSuccess"></recognition-dialogs>
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
    recognitionDialogs
  },
  data () {
    return {
      // 认证弹框
      showRecognitionDialogs: false,
      // 表头信息
      callColumns: callColumns,
      // 在线点名人员列表
      rollCallList: [],
      // 签到成功人员信息
      callName: "",
      // 第一次点名计时器
      rollCallTimer: null,
      // 第二次点名计时器
      secondCallTimer: null,
      // 当前点名ID
      callId: "",
      // 点名索引
      callIndex: 0,
      // 点名轮次
      callRound: 1,
      // 点名时长
      duration: 0,
      // 点名间隔时间
      timeSpace: 0,
      // 已签到人员列表
      signedList: [],
      // 未签到人员列表
      unSignCallList: [],
      // 签到开始时间
      startTime: "",
      // 签到结束时间
      endTime: "",
      // 点名认证弹框配置
      callConfig: {
        callName: '', // 当前被点名人员
        isRecognitionSuccess: false, // 是否点名认证成功
        rybh: ''
      },
      // 当前时间
      nowDate: new Date()
    };
  },
  computed: {
    ...mapState({
      // 点名类型
      rollType: (state) => state.app.rollType,
      // 在线点名ID
      rollId: (state) => state.app.rollId,
      // 临时点名信息
      rollInfo: (state) => state.app.rollInfo,
      // 是否正在点名
      isCalling: (state) => state.app.isCalling
    }),
  },
  created () {
    // 设置点名状态
    this.setIsCalling(true);
    // 开始点名
    this.startRollCall();
  },
  methods: {
    ...mapMutations({
      // 设置当前页面
      setCurrentTab: "app/SET_CURRENTTAB",
      // 设置点名状态
      setIsCalling: 'app/SET_ISCALLING'
    }),
    startRollCall () {
      if (this.rollType == "0") {
        // 获取在线点名人员列表
        this.getRollCallInfo();
      }
      if (this.rollType == "1") {
        // 临时点名
        this.duration = this.rollInfo.duration;
        this.timeSpace = this.rollInfo.callSpace * 1000;
        let params = {
          duration: this.duration,
          callSpace: this.timeSpace,
          roomId: uni.getStorageSync("terminalInfo").roomId,
        };
        // 获取临时点名人员列表
        this.getTempRollCallInfo(params);
      }
    },
    // 重新点名
    restartRollCall () {
      this.showRecognitionDialogs = false;
      this.rollCallTimer && clearInterval(this.rollCallTimer);
      this.rollCallTimer = null;
      this.startRollCall();
    },
    // 对讲中止点名
    discontinueCall () {
      this.showRecognitionDialogs = false;
      this.rollCallTimer && clearInterval(this.rollCallTimer);
      this.rollCallTimer = null;
      setTimeout(() => {
        this.setCurrentTab(1);
      }, 3000);
    },
    // 获取在线点名人员列表
    async getRollCallInfo () {
      let params = {
        rollId: this.rollId,
        roomId: uni.getStorageSync("terminalInfo").roomId,
      };
      let res = await Api.apiCall("get", Api.index.getRollCallRyList, params);
      if (res.state.code == 200) {
        this.rollCallList = res.data.rollCallRyList;
        this.rollCallList.map((item, index) => {
          item.index = index;
          item.status = this.status ? "已签到" : "未签到";
        });
        this.duration = res.data.rollCall.duration;
        this.timeSpace = res.data.rollCall.callSpace * 1000;
        this.startTime = res.data.rollCall.startTime;
        this.endTime = res.data.rollCall.endTime;
        this.unSignCallList = this.rollCallList;

        this.nowDate = res.date ? new Date(res.date) : new Date();
        this.handleRollCall();
      }
    },
    // 获取临时点名人员列表
    async getTempRollCallInfo (params) {
      let res = await Api.apiCall("get", Api.index.getTempRollCallRyList, params);
      if (res.state.code == 200) {
        this.rollCallList = res.data.rollCallRyList;
        this.rollCallList.map((item, index) => {
          item.index = index;
          item.status = this.status ? "已签到" : "未签到";
        });
        this.startTime = res.data.rollCall.startTime;
        this.endTime = res.data.rollCall.endTime;
        this.unSignCallList = this.rollCallList;

        this.nowDate = res.date ? new Date(res.date) : new Date();
        this.handleRollCall();
      }
    },
    // 在线点名
    handleRollCall () {
      if (!this.unSignCallList.length) {
        clearInterval(this.rollCallTimer);
        this.setIsCalling(false);
        this.setCurrentTab(1);
        return;
      }
      let curIndex = 0;
      this.showRecognitionDialogs = false;
      this.voiceBroadcast(`请${this.unSignCallList[curIndex].name}进行签到`);
      this.callIndex = this.unSignCallList[curIndex].index;
      this.callId = this.unSignCallList[curIndex].rybh;
      this.callConfig.rybh = this.callId;
      this.callConfig.callName = `${this.unSignCallList[curIndex].name}`;
      setTimeout(() => {
        this.showRecognitionDialogs = true;
        this.$nextTick(() => {
          this.$refs.recognitionDialogs && this.$refs.recognitionDialogs.startRecognition(6);
        });
      }, 2000);
      this.rollCallTimer = setInterval(() => {
        curIndex++;
        this.showRecognitionDialogs = false;
        if (curIndex < this.unSignCallList.length) {
          this.voiceBroadcast(`请${this.unSignCallList[curIndex].name}进行签到`);
          this.callIndex = this.unSignCallList[curIndex].index;
          this.callId = this.unSignCallList[curIndex].rybh;
          this.callConfig.rybh = this.callId;
          this.callConfig.callName = `${this.unSignCallList[curIndex].name}`;
          setTimeout(() => {
            this.showRecognitionDialogs = true;
            this.$nextTick(() => {
              this.$refs.recognitionDialogs && this.$refs.recognitionDialogs.startRecognition(6);
            });
          }, 2000);
        } else {
          clearInterval(this.rollCallTimer);
          if (this.callRound == 1) {
            this.voiceBroadcast("第一轮点名结束");
            this.showRecognitionDialogs = false;
          }
          if (this.callRound == 2) {
            this.voiceBroadcast("第二轮点名结束");
            this.showRecognitionDialogs = false;
            return;
          }
          this.unSignCallList = [];
          this.rollCallList.map((item, index) => {
            if (item.status != "已签到") {
              item.index = index;
              this.unSignCallList.push(item);
            }
          });
          if (this.unSignCallList.length > 0) {
            this.callRound = 2;
            this.handleRollCall();
          } else {
            this.showRecognitionDialogs = false;
          }
        }
      }, this.timeSpace);
    },
    // 在线点名结束
    stopRollCall () {
      clearInterval(this.rollCallTimer);
      this.showRecognitionDialogs = false;
      this.voiceBroadcast("点名结束");
      this.setIsCalling(false);
      this.$parent.receiveTask("rollCall", "stop");
      this.$parent.handleCallOver();
      this.setCurrentTab(1);
    },
    // 签到时间
    setSignDate () {
      return dateFormat("YYYY-MM-DD hh:mm", this.nowDate);
    },
    // 签到成功
    signSuccess (temperature) {
      let params = {
        rybh: this.rollCallList[this.callIndex].rybh,
        temperature
      };
      if (temperature > uni.getStorageSync('normalTemperature')) {
        this.saveWarningTemperature(params);
      }
      this.rollCallList[this.callIndex].signDate = this.setSignDate();
      this.rollCallList[this.callIndex].status = "已签到";
      this.callConfig.isRecognitionSuccess = true;
      this.signedList.push(params);
      this.voiceBroadcast(`${this.rollCallList[this.callIndex].name}签到成功`);
      setTimeout(() => {
        this.showRecognitionDialogs = false;
      }, 2000);
      setTimeout(() => {
        this.callConfig.isRecognitionSuccess = false;
      }, 5000);
      this.updateRollCall(temperature);
    },
    async updateRollCall (temperature) {
      let roomId = uni.getStorageSync("terminalInfo").roomId;
      let rybh = this.rollCallList[this.callIndex].rybh;
      let params = {
        data: {
          rollId: this.rollId,
          roomId,
          rybh,
          temperature,
          status: 1
        }
      };
      let res = await Api.apiCall("post", Api.prisoner.call.updateRollCallRes, params);
      if (res.state.code == 200) {
        this.$parent.handleShowToast("签到信息保存成功");
      }
    },
    // 保存体温超出预警值的人员
    async saveWarningTemperature (params) {
      let res = await Api.apiCall("post", Api.prisoner.call.saveWarningTemperature, params);
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess (res) {
      if (this.rollCallList[this.callIndex].mKeys.includes(String(res.mKey))) {
        this.signSuccess(res.temperature);
      } else {
        this.voiceBroadcast(`识别失败，请${this.rollCallList[this.callIndex].name}进行签到`);
      }
      this.callConfig.callName = this.rollCallList[this.callIndex].name;
    },
    // 人脸认证成功回调
    faceRecognitionSuccess (res) {
      this.signSuccess(res.temperature);
      this.callConfig.callName = this.rollCallList[this.callIndex].name;
    },
    setTemperature (tem) {
      this.$refs.recognitionDialogs && this.$refs.recognitionDialogs.setTemperature(tem);
    },
    // 语音播放
    voiceBroadcast (voiceText) {
      // 语音播放时段
      let messagePlayTime =
        uni.getStorageSync("messagePlayTime") || "05:00,22:00";
      let interval = messagePlayTime.split(",");
      let now = dateFormat("hh:mm", new Date());
      if (now >= interval[0] && now <= interval[1]) {
        let options = {
          content: voiceText,
        };
        let res = getApp().globalData.Base.speech(options);
        if (res.code == 0) {
          // console.log("播报成功");
        } else {
          console.log("播报失败");
        }
      }
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
