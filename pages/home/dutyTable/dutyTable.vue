<template>
  <div class="dutyTable-container">
    <div class="dutyTable-wrapper">
      <div class="dutyTable-title">
        <text>一周值班表</text>
      </div>
      <div class="dutyTable-box">
        <div class="dutyTable-header">
          <div class="header-item" v-for="(item, index) in dateList" :key="index">
            {{ item }}
          </div>
        </div>
        <scroll-view scroll-y="true" class="dutyTable-table-scroll">
          <div class="dutyTable-content" v-for="item in dutyTableList" :key="item.dutyTime">
            <div class="content-item" style="flex: 1">{{ item.dutyTime }}</div>
            <div class="content-item" style="flex: 1" v-for="(person, index) in item.personList" :key="index"
              :class="{ 'current-date': person.highlight }">
              {{ person.names }}
            </div>
          </div>
        </scroll-view>
      </div>
    </div>
  </div>
</template>

<script>
import Api from "@/common/api.js";
export default {
  name: "dutyTable",
  data() {
    return {
      // 日期列表
      dateList: ["值班时间"],
      // 值班列表
      dutyTableList: [],
      // 值班人员列表
      personList: [],
    };
  },
  created() {
    // 获取一周值班计划
    this.getDutyWeekPlan();
    // 开启倒计时
    this.$parent.countTimer();
  },
  methods: {
    // 获取值班列表详情
    async getDutyWeekPlan() {
      const { roomNo } = uni.getStorageSync("terminalInfo");
      let params = {
        roomNo,
      };
      let res = await Api.apiCall(
        "get",
        Api.prisoner.dutyCall.getDutyWeekPlan,
        params
      );
      if (res.state.code == 200) {
        let data = res.data;
        for (const key in data) {
          if (Object.hasOwnProperty.call(data, key)) {
            this.dutyTableList.push({
              dutyTime: key,
            });
            const item = data[key];
            let personList = [];
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
                    highlight = element.highlight;
                  });
                  personList.push({
                    names: arr.join("、"),
                    highlight,
                  });
                } else {
                  personList.push("");
                }
              }
            }
            this.dutyTableList.forEach((e) => {
              if (e.dutyTime === key) {
                e.personList = personList;
              }
            });
          }
        }
      }
    },
  },
};
</script>

<style lang="less">
@import "../../../common/less/index.less";
</style>
