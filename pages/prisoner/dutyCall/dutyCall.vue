<template>
  <div class="rotation-container">
    <div class="rotation-wrapper">
      <div class="rotation-content">
        <div class="rotation-title">
          <text>值班签到</text>
          <div type="default" class="start-btn" @click="startDutyCall" v-if="currentPage == 1 && highlightPersons.length">
            开始签到
          </div>
        </div>
        <div class="rotation-box">
          <div class="rotation-menu-list">
            <div class="rotation-menu-item" :class="currentPage == 1 ? 'rotation-menu-active' : ''"
              @click="switchPage(1)">
              <common-icons iconType="iconweekdate" size="38" color="#fff" />
              <text>一周值班表</text>
            </div>
            <div class="rotation-menu-item" :class="currentPage == 2 ? 'rotation-menu-active' : ''"
              @click="switchPage(2)">
              <common-icons iconType="iconregister" size="42" color="#fff" />
              <text>监室值班登记</text>
            </div>
            <div class="rotation-menu-item" :class="currentPage == 3 ? 'rotation-menu-active' : ''"
              @click="switchPage(3)">
              <common-icons iconType="iconrecord" size="48" color="#fff" />
              <text>值班签到记录</text>
            </div>
          </div>
          <div class="rotation-vertical-divider"></div>
          <div v-if="currentPage == 1" class="rotation-table-container">
            <div class="table-box">
              <div class="table-head">
                <div class="table-head-item" v-for="(item, index) in dateList" :key="index">
                  {{ item }}
                </div>
              </div>
              <div class="table-content" v-for="item in dutyWeekPlanList" :key="item.timeQuantum">
                <div class="table-content-item" style="flex: 1">
                  {{ item.timeQuantum }}
                </div>
                <div class="table-content-item" style="flex: 1" v-for="(person, index) in item.dutyList" :key="index"
                  :class="{ 'current-date': person.highlight }">
                  {{ person.names }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="currentPage == 2" class="rotation-register-container">
            <div class="register-person">
              <div class="register-title">
                值班人员：<text>{{ onDutyPerson }}</text>
              </div>
            </div>
            <div class="register-select">
              <label>值班情况：</label>
              <xfl-select :list="dutyStatusList" :clearable="false" :placeholder="'请选择值班情况'"
                @change="handleDutyStatusChange"></xfl-select>
            </div>
            <div class="register-remark">
              <label>备注：</label>
              <textarea v-model="remark" maxlength="-1" @input="handleInputChange"></textarea>
            </div>
            <div class="register-button">
              <div class="btn-cancel" @click="handleRegCancel">取消</div>
              <div class="btn-submit" @click="handleRegSubmit">提交</div>
            </div>
          </div>
          <div v-if="currentPage == 3" class="rotation-record-container">
            <div class="record-form-box">
              <div class="record-form-left">
                <div class="form-duty-date">
                  <label class="form-label">值班时间：</label>
                  <e-picker mode="date" class="picker-img" :showValue="dutyStartDate" @change="handleSelectStartDate">
                    <div class="duty-date">{{ dutyStartDate }}</div>
                  </e-picker>
                  <div class="divider-line">-</div>
                  <e-picker mode="date" class="picker-img" :showValue="dutyEndtDate" @change="handleSelectEndDate">
                    <div class="duty-date">{{ dutyEndtDate }}</div>
                  </e-picker>
                </div>
                <div class="form-duty-schedule">
                  <label class="form-label">班次：</label>
                  <xfl-select :list="timeQuantumList" :clearable="false" :placeholder="'请选择班次'"
                    @change="handleShiftChange"></xfl-select>
                </div>
              </div>
              <div class="record-form-right">
                <div class="btn-query" @click="handleRecordQuery">查询</div>
              </div>
            </div>
            <div class="record-table-box">
              <div class="table-head">
                <div class="table-head-item" v-for="(item, index) in recordColumns" :key="index"
                  :style="{ flex: item.flex }">
                  {{ item.title }}
                </div>
              </div>
              <scroll-view scroll-y="true" class="record-table-scroll" @scrolltolower="handleScrolltolower">
                <div class="table-content" v-for="(item, index) in dutyRecordList" :key="index">
                  <div class="record-table-item" style="flex: 1">
                    {{ item.roomNo }}
                  </div>
                  <div class="record-table-item" style="flex: 2">
                    {{ item.dutyDate }}
                  </div>
                  <div class="record-table-item" style="flex: 1">
                    {{ item.period }}
                  </div>
                  <div class="record-table-item" style="flex: 1">
                    {{ item.name }}
                  </div>
                  <div class="record-table-item" style="flex: 2">
                    {{ item.signTime }}
                  </div>
                </div>
              </scroll-view>
            </div>
          </div>
        </div>
      </div>
    </div>
    <recognition-dialogs ref="recognitionDialogs" useFor="rotation" :callConfig="callConfig"
      :isShow="showRecognitionDialogs" @close="recognitionDialogsClose"
      @fingerRecognitionSuccess="fingerRecognitionSuccess"
      @faceRecognitionSuccess="faceRecognitionSuccess"></recognition-dialogs>
  </div>
</template>

<script>
import neilModal from "@/components/neil-modal/neil-modal.vue";
import xflSelect from "@/components/xfl-select/xfl-select.vue";
import ePicker from "@/components/e-picker/e-picker.vue";
import Api from "@/common/api.js";
import { mapState, mapMutations } from "vuex";
import { dateFormat } from "@/common/utils/util.js";
import recordColumns from "@/static/mock/recordColumns.json";

export default {
  name: "dutyCall",
  components: {
    neilModal,
    xflSelect,
    ePicker,
  },
  data() {
    return {
      currentPage: 1,
      // 指纹识别弹框
      showFingerInit: false,
      prisonerInfo: {
        id: "",
        name: "",
      },
      // 签到记录表头
      recordColumns: recordColumns,
      // 值班情况列表
      dutyStatusList: ["无异常", "发生异常"],
      // 选择值班情况
      dutyStatus: "",
      // 值班情况备注
      remark: "",
      // 值班签到查询列表
      dutyRecordList: [],
      // 选择值班开始日期
      dutyStartDate: "",
      // 选择值班结束日期
      dutyEndtDate: "",
      // 选择班次
      dutyShift: "",
      // 认证弹框状态
      showRecognitionDialogs: false,
      // 点名认证弹框配置
      callConfig: {
        callName: "", // 当前被点名人员
        isRecognitionSuccess: false, // 是否点名认证成功
        rybh: "",
      },
      // 值班时间段列表
      timeQuantumList: ["全部"],
      // 日期列表
      dateList: [""],
      dutyWeekPlanList: [],
      // 值班人员 用于判断当前是否可点击开始签到
      highlightPersons: [],
      // 值班记录分页参数
      dutyRecordPageParam: {
        pageIndex: 1,
        pageSize: 10,
      },
      // 值班记录列表总数
      dutyRecordTotal: 999,
    };
  },
  computed: {
    ...mapState({
      // 登录状态
      loginState: (state) => state.app.loginState,
      // 登录人员
      personInfo: (state) => state.app.personInfo,
      // 值班人员列表
      dutyList: (state) => state.app.dutyList,
    }),
    // 当值人员名称
    onDutyPerson() {
      if (this.dutyList.length) {
        let arr = [];
        this.dutyList.forEach((item) => {
          arr.push(item.name);
        });
        return arr.join("、");
      } else {
        return "";
      }
    },
  },
  created() {
    // 设置返回上一页按钮显示状态
    this.setBackBtnDisplayState();
    // 获取一周值班计划
    this.getDutyWeekPlan();
    // 开启倒计时
    this.$parent.countTimer();
  },
  destroyed() {
    this.recognitionDialogsClose();
    this.setBackState(true);
  },
  methods: {
    ...mapMutations({
      // 设置标题栏状态
      setBackState: "app/SET_BACKSTATE",
    }),
    // 切换菜单
    switchPage(index) {
      this.dutyStatus = "";
      this.dutyShift = "";
      this.dutyRecordList = [];
      this.setDutyRecordPageParam(1, 10);
      this.currentPage = index;
    },
    // 获取值班列表详情
    async getDutyWeekPlan() {
      const { roomNo } = uni.getStorageSync("terminalInfo");
      let res = await Api.apiCall(
        "get",
        Api.prisoner.dutyCall.getDutyWeekPlan,
        { roomNo }
      );
      if (res.state.code == 200) {
        this.initData(res.data);
      }
    },

    // 数据初始化
    initData(data) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          this.dutyWeekPlanList.push({
            timeQuantum: key,
          });
          // 设置值班时间段列表
          let hasTimeQuantum = this.timeQuantumList.some((time) => {
            return time === key;
          });
          if (!hasTimeQuantum) {
            this.timeQuantumList.push(key);
          }
          const item = data[key];
          let dutyList = [];
          for (const i in item) {
            if (Object.hasOwnProperty.call(item, i)) {
              // 设置日期列表
              let hasDate = this.dateList.some((date) => date === i);
              if (!hasDate) {
                this.dateList.push(i);
              }
              const value = item[i];
              if (value.length) {
                let arr = [];
                let highlight = 0;
                value.forEach((element) => {
                  arr.push(element.name);
                  // highlight = element.highlight;
                  const { period, week } = element;
                  if (period == "19:00-21:00" && week == "星期三") {
                    highlight = 1;
                  }
                  if (Number(highlight)) {
                    this.highlightPersons.push(element);
                  }
                });
                dutyList.push({
                  names: arr.join("、"),
                  highlight,
                });
              } else {
                dutyList.push("");
              }
            }
          }
          this.dutyWeekPlanList.forEach((e) => {
            if (e.timeQuantum === key) {
              e.dutyList = dutyList;
            }
          });
        }
      }
    },
    // 开始签到
    startDutyCall() {
      if (this.dutyList.length) {
        this.callConfig = {
          callName: this.onDutyPerson,
          rybh: "",
          isRecognitionSuccess: false,
        };
        this.showRecognitionDialogs = true;
        this.$nextTick(() => {
          this.$refs.recognitionDialogs &&
            this.$refs.recognitionDialogs.startRecognition();
        });
      } else {
        this.$parent.handleShowToast("当前没有值班任务");
      }
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess(res) {
      this.checkCurSignStatus("mKeys", res.mKey);
    },
    // 人脸认证成功回调
    faceRecognitionSuccess(res) {
      this.checkCurSignStatus("rybhs", res.rybh);
    },
    // 当前人员是否为值班人员
    checkCurSignStatus(type, checkItem) {
      this.dutyList.forEach((item) => {
        let rybhs = [];
        rybhs.push(item.rybh);
        item.rybhs = rybhs;
        if (item[type].includes(String(checkItem))) {
          this.callConfig = {
            callName: item.name,
            rybh: "",
            isRecognitionSuccess: true,
          };
          this.saveSignRecord(item);
        }
      });
    },
    // 保存签到记录
    async saveSignRecord(item) {
      const { ondutyLayoutDateId, name } = item;
      let params = {
        data: {
          ondutyLayoutDateId,
        },
      };
      let res = await Api.apiCall(
        "post",
        Api.prisoner.dutyCall.saveSignRecord,
        params,
        true
      );
      if (res.state.code == 200) {
        this.$parent.voiceBroadcast(`${name}签到成功` || "签到成功");
        setTimeout(() => {
          this.recognitionDialogsClose();
        }, 2000);
      } else {
        this.$parent.voiceBroadcast(res.state.msg || "签到失败");
        this.showRecognitionDialogs = false;
      }
    },
    // 提交保存值班登记
    handleRegSubmit() {
      let hadAuth = this.dutyList.some(
        (item) => item.rybh === this.personInfo.rybh
      );
      if (!hadAuth) {
        this.$parent.handleShowToast("没有提交权限");
        return;
      }
      if (!this.dutyStatus) {
        this.$parent.handleShowToast("请选择值班情况");
        return;
      }
      this.updateSituation();
    },
    // 保存值班登记信息
    async updateSituation() {
      let ondutyLayoutDateId = this.dutyList.find(
        (item) => item.rybh === this.personInfo.rybh
      ).ondutyLayoutDateId;
      let params = {
        data: {
          ondutyLayoutDateId,
          rybh: this.personInfo.rybh,
          situation: `${this.dutyStatus}，${this.remark}`,
        },
      };
      let res = await Api.apiCall(
        "post",
        Api.prisoner.dutyCall.updateSituation,
        params,
        true
      );
      if (res.state.code == 200) {
        this.$parent.handleShowToast("提交成功");
      }
    },
    // 设置返回上一页按钮状态
    setBackBtnDisplayState() {
      if (this.loginState) {
        this.setBackState(true);
      } else {
        this.setBackState(false);
      }
    },
    // 选择值班情况
    handleDutyStatusChange(e) {
      this.dutyStatus = e.newVal;
    },
    // 取消值班登记
    handleRegCancel() {
      this.remark = "";
    },
    // 选择值班开始日期
    handleSelectStartDate(e) {
      this.dutyStartDate = e;
    },
    // 选择值班结束日期
    handleSelectEndDate(e) {
      this.dutyEndtDate = e;
    },
    // 选择班次
    handleShiftChange(e) {
      this.dutyShift = e.newVal == "全部" ? "" : e.newVal;
    },
    // 监听键盘事件
    handleInputChange(e) {
      this.$parent.initCountTimeout();
    },
    // 签到记录查询
    handleRecordQuery() {
      let selectList = [this.dutyStartDate, this.dutyEndtDate];
      if (!selectList[0] && selectList[1]) {
        this.$parent.handleShowToast("起始时间不能为空");
        return;
      }
      this.setDutyRecordPageParam(1, 10);
      this.findSignRecord();
    },
    // 滑动到底部触发加载
    handleScrolltolower() {
      // 已获取所有数据
      if (this.dutyRecordList.length >= this.dutyRecordTotal) {
        return this.$parent.handleShowToast("暂无更多数据");
      }
      this.dutyRecordPageParam.pageIndex += 1;
      this.findSignRecord();
    },
    // 查询值班签到记录
    async findSignRecord() {
      const { roomNo } = uni.getStorageSync("terminalInfo");
      let params = {
        data: {
          roomNo,
          startDate: this.dutyStartDate,
          endDate: this.dutyEndtDate,
          period: this.dutyShift,
        },
        pageParam: this.dutyRecordPageParam,
      };
      let res = await Api.apiCall(
        "post",
        Api.prisoner.dutyCall.findSignRecord,
        params
      );
      if (res.state.code == 200) {
        if (this.dutyRecordPageParam.pageIndex === 1 && !res.data.length) {
          this.$parent.handleShowToast("暂无更多数据");
        }
        if (this.dutyRecordPageParam.pageIndex === 1) {
          this.dutyRecordList = res.data;
        } else {
          this.dutyRecordList = this.dutyRecordList.concat(res.data);
        }
        this.dutyRecordTotal = (res.page && res.page.total) || 0;
      }
    },
    // 设置值班记录列表分页参数
    setDutyRecordPageParam(pageIndex, pageSize) {
      this.dutyRecordPageParam = {
        pageIndex,
        pageSize,
      };
    },
    // 关闭认证弹框
    recognitionDialogsClose() {
      this.showRecognitionDialogs = false;
      this.callConfig = {
        callName: this.onDutyPerson,
        rybh: "",
        isRecognitionSuccess: false,
      };
    },
  },
};
</script>

<style lang="less">
@import "../../../common/less/index.less";

.rotation-title {
  margin-top: 40upx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .start-btn {
    padding: 14upx 20upx;
    border-radius: 4px;
    background-color: #007aff;
    color: #fff;
    font-size: 20.83upx;
  }
}
</style>
