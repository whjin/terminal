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
        <div class="fingerprint-list" v-for="(item, index) in prisonFingerList" :key="index">
          <div class="fingerprint-item" :class="{ disabledClick: item.fingerNum >= 6 }" @click="handleCheckChange(item)">
            <checkbox class="checkbox" :checked="
                item.fingerNum >= 6
                  ? true
                  : item.rybh == checkedId
                  ? true
                  : false
              " :disabled="item.fingerNum >= 6" :class="{ disabledCheck: item.fingerNum >= 6 }">
              <text>{{ item.name }}</text>
              <text :class="{ mark: item.fingerNum > 0 && item.fingerNum <= 6 }">{{ item.fingerNum > 0 ? item.fingerNum : "" }}</text>
            </checkbox>
          </div>
          <div class="page-horizontal-divider"></div>
        </div>
      </div>
    </div>
    <div class="neil-modal-container">
      <!-- 指纹录入 -->
      <neil-modal :show="showFingerInit">
        <div class="fingerprint-modal-container">
          <div class="fingerprint-header">
            <div class="fingerprint-title">
              <text>温馨提示</text>
            </div>
            <div class="fingerprint-close" @click="closeModal('FingerInit')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <view class="page-horizontal-divider"></view>
          <view class="uni-flex uni-flex-item uni-column" style="justify-content: center; align-items: center">
            <common-icons iconType="iconzhiwen" size="100" color="#FFFFFF" />
            <text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
          </view>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import Api from "@/common/api.js";
import neilModal from "@/components/neil-modal/neil-modal.vue";
import Log from "@/common/utils/log.js";

export default {
  components: {
    neilModal,
  },
  data () {
    return {
      // 指纹认证弹框
      showFingerInit: false,
      // 指纹已录入不可选
      disabled: false,
      // 在押人员指纹信息
      prisonFingerList: [],
      // 已选人员信息
      checkedInfo: {},
      // 已选人员ID
      checkedId: "",
      // 设备连接状态
      isOpen: false,
      // 建档ID(0-249)
      paramInt: 1,
      // 第一次建档定时器
      enroll1Timer: null,
      // 第一次松开指纹
      raise1Timer: null,
      // 第二次建档定时器
      enroll2Timer: null,
      // 第二次松开指纹
      raise2Timer: null,
      // 第三次建档定时器
      enroll3Timer: null,
      // 第三次松开指纹
      raiseThreeTimer: null,
    };
  },
  created () {
    // 获取人员指纹信息
    this.getPersonFingerInfo();
    // 开启倒计时
    this.$parent.countTimer();
  },
  destroyed () {
    this.closeFingerPrint();
  },
  methods: {
    // 重置倒计时
    initCountTimer () {
      // this.$parent.initCountTimeout();
    },
    // 在押人员指纹录入信息
    async getPersonFingerInfo () {
      let params = {
        roomNo: uni.getStorageSync("terminalInfo").roomNo,
      };
      let res = await Api.apiCall("get", Api.index.getPersonFingerInfo, params);
      if (res.state.code == "200") {
        this.prisonFingerList = res.data;
      }
    },
    // 选择人员
    handleCheckChange (item) {
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
    // 指纹录入，获取建档ID
    async getPersonFingerKey () {
      let params = {
        roomNo: uni.getStorageSync("terminalInfo").roomNo,
        rybh: this.checkedInfo.rybh,
      };
      let res = await Api.apiCall("get", Api.index.getPersonFingerKey, params);
      if (res.state.code == "200") {
        if (res.data.mKey != -1) {
          this.paramInt = res.data.mKey;
        }
      }
    },
    // 在押人员指纹录入
    fingerprintInit () {
      if (this.showFingerInit) {
        return;
      }
      if (!Object.keys(this.checkedInfo).length) {
        this.$parent.handleShowToast("请先选择人员列表", "center");
        return;
      }
      this.showFingerInit = true;
      // 获取建档ID
      this.getPersonFingerKey();
      this.startFingerPrint();
    },
    // 开始指纹录入
    startFingerPrint () {
      this.initFingerPrint();
      setTimeout(() => {
        this.entryFingerPrint();
      }, 1500);
    },
    // 设备连接
    initFingerPrint () {
      if (!this.isOpen) {
        getApp().globalData.Fingerprint.init((result) => {
          if (result == 0) {
            this.isOpen = true;
            console.log("设备已连接");
          } else {
            console.log("设备连接失败");
          }
        });
      }
    },
    // 指纹录入
    entryFingerPrint () {
      if (this.isOpen) {
        if (!getApp().globalData.Fingerprint.enrollStart(this.paramInt)) {
          this.$parent.voiceBroadcast(`建档成功，请按压指纹1`);
          // 第一次建档
          this.enroll1Timer = setInterval(() => {
            if (getApp().globalData.Fingerprint.isPressFinger() == 0) {
              // this.$parent.initCountTimeout();
              if (getApp().globalData.Fingerprint.enroll1((rt) => { }) == 0) {
                clearInterval(this.enroll1Timer);
                Log.writeLog(
                  `关闭在押人员指纹录入第一次建档按压指纹定时器,enroll1Timer=>${this.enroll1Timer}`,
                  false
                );
                this.$parent.voiceBroadcast("登记1成功，请松开指纹");
                this.raise1Timer = setInterval(() => {
                  if (getApp().globalData.Fingerprint.isPressFinger() != 0) {
                    clearInterval(this.raise1Timer);
                    Log.writeLog(
                      `关闭在押人员指纹录入第一次建档松开指纹定时器,raise1Timer=>${this.raise1Timer}`,
                      false
                    );
                    console.log("松开指纹成功，请按压指纹2");
                    // 第二次建档
                    this.enroll2Timer = setInterval(() => {
                      if (
                        getApp().globalData.Fingerprint.isPressFinger() == 0
                      ) {
                        // this.$parent.initCountTimeout();
                        if (getApp().globalData.Fingerprint.enroll2() == 0) {
                          clearInterval(this.enroll2Timer);
                          Log.writeLog(
                            `关闭在押人员指纹录入第二次建档按压指纹定时器,enroll2Timer=>${this.enroll2Timer}`,
                            false
                          );
                          this.$parent.voiceBroadcast("登记2成功，请松开指纹");
                          this.raise2Timer = setInterval(() => {
                            if (
                              getApp().globalData.Fingerprint.isPressFinger() !=
                              0
                            ) {
                              clearInterval(this.raise2Timer);
                              Log.writeLog(
                                `关闭在押人员指纹录入第二次建档松开指纹定时器,raise2Timer=>${this.raise2Timer}`,
                                false
                              );
                              console.log("松开指纹成功，请按压指纹3");
                              // 第三次建档
                              this.enroll3Timer = setInterval(() => {
                                if (
                                  getApp().globalData.Fingerprint.isPressFinger() ==
                                  0
                                ) {
                                  // this.$parent.initCountTimeout();
                                  let res =
                                    getApp().globalData.Fingerprint.enroll3(
                                      this.paramInt
                                    );
                                  switch (res.code) {
                                    case 0:
                                      clearInterval(this.enroll3Timer);
                                      Log.writeLog(
                                        `关闭在押人员指纹录入第三次建档按压指纹定时器,状态:指纹录入成功!,enroll3Timer=>${this.enroll3Timer}`,
                                        false
                                      );
                                      this.$parent.voiceBroadcast("指纹录入成功!");
                                      this.savePersonFingerInfo(
                                        String(res.result)
                                      );
                                      this.closeFingerPrint();
                                      break;
                                    case 4101:
                                      clearInterval(this.enroll3Timer);
                                      Log.writeLog(
                                        `关闭在押人员指纹录入第三次建档按压指纹定时器,状态:当前指纹特征值已存在!,enroll3Timer=>${this.enroll3Timer}`,
                                        false
                                      );
                                      this.$parent.voiceBroadcast(
                                        "当前指纹特征值已存在!"
                                      );
                                      this.closeFingerPrint();
                                      break;
                                    case 4109:
                                      clearInterval(this.enroll3Timer);
                                      Log.writeLog(
                                        `关闭在押人员指纹录入第三次建档按压指纹定时器,状态:指纹录入失败，请重新录入!,enroll3Timer=>${this.enroll3Timer}`,
                                        false
                                      );
                                      this.$parent.voiceBroadcast(
                                        "指纹录入失败，请重新录入!"
                                      );
                                      this.closeFingerPrint();
                                      break;
                                    default:
                                      console.log("登记3失败，请重新按压指纹3");
                                      break;
                                  }
                                } else {
                                  console.log("请按压指纹");
                                }
                              }, 2000);
                              Log.writeLog(
                                `在押人员指纹录入第三次建档按压指纹定时器,enroll3Timer=>${this.enroll3Timer}`,
                                false
                              );
                            } else {
                              console.log("请松开指纹");
                            }
                          }, 1000);
                          Log.writeLog(
                            `在押人员指纹录入第二次建档松开指纹定时器,raise2Timer=>${this.raise2Timer}`,
                            false
                          );
                        } else {
                          console.log("登记2失败，请重新按压指纹2");
                        }
                      } else {
                        console.log("请按压指纹");
                      }
                    }, 1000);
                    Log.writeLog(
                      `在押人员指纹录入第二次建档按压指纹定时器,enroll2Timer=>${this.enroll2Timer}`,
                      false
                    );
                  } else {
                    console.log("请松开指纹");
                  }
                }, 1000);
                Log.writeLog(
                  `在押人员指纹录入第一次建档松开指纹定时器,raise1Timer=>${this.raise1Timer}`,
                  false
                );
              } else {
                console.log("登记1失败，请重新按压指纹1");
              }
            } else {
              console.log("请按压指纹");
            }
          }, 1000);
          Log.writeLog(
            `在押人员指纹录入第一次建档按压指纹定时器,enroll1Timer=>${this.enroll1Timer}`,
            false
          );
        } else {
          this.$parent.voiceBroadcast("建档失败");
        }
      } else {
        console.log("请先连接设备");
      }
    },
    // 录入成功后保存指纹信息
    async savePersonFingerInfo (pHint) {
      let params = {
        mKey: this.paramInt,
        rybh: this.checkedInfo.rybh,
        pHint: pHint,
      };
      let res = await Api.apiCall(
        "post",
        Api.index.savePersonFingerInfo,
        params
      );
      if (res.state.code == "200") {
        this.$parent.handleShowToast("指纹信息保存成功", "center");
        // 更新人员指纹信息
        this.getPersonFingerInfo();
      }
    },
    // 关闭指纹连接
    closeFingerPrint () {
      if (this.isOpen) {
        let res = getApp().globalData.Fingerprint.close();
        if (res == 0) {
          clearInterval(this.enroll1Timer);
          Log.writeLog(
            `关闭在押人员指纹录入第一次建档按压指纹定时器,状态:设备关闭成功!,enroll1Timer=>${this.enroll1Timer}`,
            false
          );
          this.isOpen = false;
          this.showFingerInit = false;
          console.log("设备关闭成功");
          Log.writeLog("设备关闭成功", false);
        } else {
          console.log("设备关闭失败");
          Log.writeLog("设备关闭失败", false);
          this.$parent.handleShowToast("设备关闭失败", "bottom", 5000);
        }
      }
    },
    openModal (type) {
      this[`show${type}`] = true;
    },
    closeModal (type) {
      this[`show${type}`] = false;
      clearInterval(this.enroll2Timer);
      clearInterval(this.enroll3Timer);
      Log.writeLog(
        `关闭在押人员指纹录入第三次建档按压指纹定时器,状态:关闭指纹录入弹框!,enroll3Timer=>${this.enroll3Timer}`,
        false
      );
      this.closeFingerPrint();
    },
  },
};
</script>

<style lang="less">
@import '../../../common/less/index.less';
</style>
