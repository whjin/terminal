export default {
  // 主页
  index: {
    // 获取缓存信息
    getAllSetting: "terminal/terSetting/all",
    // 获取分机信息
    getTerminalInfo: "terminal/terTerminalInfo/getTerminalByIp",
    // 获取主机信息
    getControlInfo: "terminal/terControlInfo/getControlByCode",
    // 获取监室管教民警信息
    getPoliceInfo: "terminal/common/getRoomSupervisor",
    // 获取在押人员数
    getPrisonerNum: "terminal/pacPersonnelAccessRoom/getRoomPrisonerNum",
    // 获取通知公告信息
    getAllNotice: "terminal/pacPublicNotice/getAllPrisonNotice",
    // 获取监室动态信息
    getDynamicInfo: "terminal/common/getDynamicInfo",
    // 获取一日生活信息
    getLifeList: "terminal/pacOneLife/all",
    // 获取指纹认证在押人员信息
    getOdsPrisonerInfo: "terminal/odsFinger/getOdsPersonInfo",
    // 获取指纹认证民警信息
    getOdsPoliceInfo: "terminal/odsFinger/getOdsPoliceInfo",
    // 获取在押人员指纹录入信息
    getPersonFingerInfo: "terminal/odsFinger/getRoomPersonFingerInfo",
    // 同步在押人员指纹信息
    syncRoomPersonFingerInfo: "terminal/odsFinger/syncRoomPersonFingerInfo",
    // 获取在押人员可用指纹mKey
    getPersonFingerKey: "terminal/odsFinger/getPersonFingerKey",
    // 保存在押人员录入指纹信息
    savePersonFingerInfo: "terminal/odsFinger/savePerson",
    // 保存指纹同步状态（成功|失败）信息
    saveFingerState: "terminal/terLog/saveLog",
    // 获取在线点名人员信息
    getRollCallRyList: "terminal/pacRollCall/getRollCallRyList",
    // 获取临时点名人员信息
    getTempRollCallRyList: "terminal/pacRollCall/getTempRollCallRyList",
    // 保存已签到人员信息
    saveRollCallInfo: "terminal/pacRollCall/saveRollCallDetail",
    // 获取一周菜谱信息
    getWeekMenuInfo: "terminal/pacKitchenWeekMenu/getWeekMenuList",
    // 获取伙食供应标准信息
    getFoodStandardInfo:
      "terminal//pacKitchenFoodStandard/getKitchenFoodStandards",
    // 获取最近外出类型列表
    getOutTypeInfo: "terminal/common/getDictionaryType/SYS_OUT_TYPE",
    // 获取最近外出类型
    getRecentOutType: "terminal/talkedu/getRecentOutTypeByRybh/",
    // 获取预约类型
    getAppointmentTypeInfo:
      "terminal/common/getDictionaryType/TER_APPOINTMENT_TYPE",
    // 获取今日心情信息
    getTodayMoodInfo: "terminal/common/getDictionaryType/SYS_MOOD_TYPE",
    // 保存谈话预约信息
    saveTalkInfo: "terminal/talkedu/saveTalkInfo",
    // 获取谈话预约记录
    getTalkRecordInfo: "terminal/talkedu/getTalkRecord",
    // 获取预约就医类型
    getIllnessTypeInfo: "terminal/pacMedicalIllness/getIllnessType",
    // 保存预约就医信息
    saveIllnessInfo: "terminal/pacMedicalIllness/saveIllness",
    // 获取预约就医记录
    getIllnessRecordInfo:
      "terminal/pacMedicalIllness/getIllnessAppointmentList",
    // 预约就医催办
    illnessUrge: "terminal/pacMedicalIllness/illnessUrge",
    // 获取在线购物人员信息
    getPrisonInfoByCode: "terminal/financeShop/getPrisonInfoByCode/",
    // 获取在线购物商品列表
    getShoppingGoodsInfo: "terminal/financeShop/listGoodsByTypeId",
    // 获取在线购物订单编号
    getOrderNoInfo: "terminal/financeShop/gainOrderNo",
    // 在线购物结算
    saveCartOrderInfo: "terminal/financeShop/order",
    // 获取在线购物消费记录
    getOrderHistoryInfo: "terminal/financeShop/getConsumptionRecord",
    // 获取在线购物消费记录详情
    getOrderDetail: "terminal/odsFinanceOrderDetail/getOrderDetail",
    // 确认收货
    confirmGoods: "terminal/odsFinanceOrderDetail/confirmGoods",
    // 一键确认收货
    shortcutConfirm: "terminal/financeShop/updateOrderConfirmStatus",
    // 获取备注类型列表
    getConfirmTypeList: "terminal/common/getDictionaryType/CONFIR_RECEPTE_TYPE",
    // 获取应急报警信息
    saveAlarmInfo: "terminal/alarm/saveAlarmInfo",
    // 获取APP升级信息
    getUpdateInfo: "terminal/update/getUpdateInfo",
    // 修改分机信息
    updateTerminal: "terminal/common/updateAppVersion",
    // 获取监室消息通知
    getNotificationInfo: "terminal/terNotification/getNotificationInfo",
    // 发起监室消息通知
    saveNotification: "terminal/terNotification/saveNotification",
    // 获取视频信息
    getVideoList: "terminal/pacVideo/getLevelRoomVideoList",
    // 获取视频点播信息
    getByVideoPlayTime: "terminal/pacVideo/getByVideoPlayTime",
    // 新增视频点播动态信息
    setDynamicInfo: "terminal/terOperationInfo/save",
    // 回传监听电教状态
    updateEduTaskStatus: "external/external/updateEduTaskStatus?devNo=",
    // 上传图片
    upload: "terminal/check/api/upload",
    // 保存按键报警拍照信息
    addAlarmPhoto: "terminal/alarm/addAlarmPhoto",
  },
  // 在押人员
  prisoner: {
    // 1:N人脸识别，用于登录
    prisonerImgOneToMany: "terminal/faceRecognition/prisonerImgOneToMany",
    // 1:1人脸比对，用于点名
    prisonerImageOneToOne: "terminal/faceRecognition/prisonerImageOneToOne",
    // 物品报修
    repairClaim: {
      // 获取物品列表
      getList: "terminal/terRoomInfoManage/list",
      // 申领/报修
      save: "terminal/terRoomInfoManage/save",
      // 确认记录
      confirmRecord: "terminal/terRoomInfoManage/updateRecord",
    },
    // 每日心情
    mood: {
      // 获取心情记录列表
      getList: "terminal/terMoodInfoManage/list",
      // 登记心情
      save: "terminal/terMoodInfoManage/save",
      // 修改心情
      update: "terminal/terMoodInfoManage/update",
    },
    // 点名
    call: {
      // 记录异常温度
      saveWarningTemperature: "terminal/pacRollCall/saveTemperature",
    },
    // 床位安排
    bed: {
      // 获取床位安排列表
      getBedsList: "terminal/pacBed/findRoomBedList",
    },
    // 体温监测
    temperatureMonitor: {
      // 测温
      saveRollCall: "terminal/terTemperatureRecords/saveRollCall",
    },
    // 服药管理
    medication: {
      // 服药计划列表
      getMedicationPlan: "terminal/terMedicineRecords/getMedicationPlan",
      // 保存服药记录
      saveMedicineRecord: "terminal/terMedicineRecords/saveMedicineRecord",
      // 服药记录列表
      getMedicineRecords: "terminal/terMedicineRecords/getMedicineRecords",
    },
    // 值班签到
    dutyCall: {
      // 保存签到记录
      saveSignRecord: "terminal/pacDOndutyLayout/saveSignRecord",
      // 获取值班计划详情
      getDutyWeekPlan: "terminal/pacDOndutyLayout/getDutyWeekPlan",
      // 提交值班登记
      updateSituation: "terminal/pacDOndutyLayout/updateSituation",
      // 查询值班记录
      findSignRecord: "terminal/pacDOndutyLayout/findSignRecord",
    },
  },
  police: {
    // 刷卡（卡号）获取民警信息
    getUserByCardNum: "terminal/sysUser/getUserByCardNum?cardNum=",
    // 获取面对面民警
    getRoomPoliceInfo: "terminal/pacRoomInfo/getRoomPoliceInfo/",
    // 获取面对面类型
    getFaceType: "terminal/common/getDictionaryType/SYS_FACE_TYPE",
    // 保存面对面登记
    saveFaceRegister: "terminal/face/api/saveFaceRecord",
    // 查询面对面记录
    getFaceRecord: "terminal/face/api/getFaceRecord",
  },

  /**
   * 封装请求（async await 封装uni.request）
   * method		post/get
   * endpoint		接口方法名
   * data			所需传递参数
   * load			是否需要loading
   */
  async apiCall(method, endpoint, data, load, hideErr) {
    const baseUrl = uni.getStorageSync("baseUrl");
    if (baseUrl) {
      let fullUrl = baseUrl + endpoint;
      let Authorization;
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        let uuid = userInfo.uuid;
        if (uuid) {
          Authorization = userInfo.uuid + " " + userInfo.terminalIP;
        }
      }
      if (endpoint == "permission/terminalCertification") {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (res.data.state.code != 200) {
          this.handleShowToast("终端认证失败！");
        }
        return res.data;
      } else {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (res.data.state.code != 200 && !hideErr) {
          this.handleShowToast(`请求出错：${res.data.state.msg}`);
        }
        let date = (res.header && res.header.Date) || 0;
        let timestamp = date ? new Date(date).getTime() : 0;
        let result = Object.assign({}, res.data, {
          date: timestamp,
        });
        return result;
      }
    } else {
      this.handleShowToast("请先设置基础baseUrl！");
    }
  },

  /**
   * 封装请求（async await 封装uni.request）（省厅财务系统对接请求）
   * method		post/get
   * endpoint		接口方法名
   * data			所需传递参数
   * load			是否需要loading
   */
  async apiCallFinance(method, endpoint, data, load) {
    const baseUrl = uni.getStorageSync("baseUrl");
    if (baseUrl) {
      if (!load) {
        uni.showLoading({
          title: "请稍候",
          mask: true,
        });
      }
      let fullUrl = baseUrl + endpoint;
      let Authorization;
      const userInfo = uni.getStorageSync("userInfo");
      if (userInfo) {
        let uuid = userInfo.uuid;
        if (uuid) {
          Authorization = userInfo.uuid + " " + userInfo.terminalIP;
        }
      }
      if (endpoint == "permission/terminalCertification") {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (!load) {
          uni.hideLoading();
        }
        if (res.data.state.code != 200) {
          this.handleShowToast("终端认证失败！");
        }
        return res.data;
      } else {
        let [error, res] = await uni.request({
          url: fullUrl,
          data: data,
          method: method,
          dataType: "json",
          header: {
            client_id: "app",
            client_secret: "app",
            "content-type": "application/json",
            Authorization: Authorization || "",
          },
        });
        if (!load) {
          uni.hideLoading();
        }
        return res;
      }
    } else {
      this.handleShowToast("请先设置基础baseUrl！");
    }
  },

  // 消息提示
  handleShowToast(title, position = "bottom", duration = 1500) {
    uni.showToast({
      title: title,
      position: position,
      duration: duration,
      icon: "none",
    });
  },
};
