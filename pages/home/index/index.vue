<template>
  <div class="home-container">
    <!-- 视频组件 -->
    <bgVideo :url="bgVideoUrl" :videoStyle="bgVideoStyle"></bgVideo>
    <nav-bar :homeState="homeState && showHomeState" :backState="backState && showBackState" @click-init="onClickInitSet"
      @click-home="onClickHome" @click-back="onClickBack" />
    <div class="home-wrapper">
      <div class="home-tabs" v-if="currentTab < 3">
        <text :class="currentTab == 1 ? 'tab-active' : ''" @click="switchModule(1)">首页</text>
        <text :class="currentTab == 2 ? 'tab-active' : ''" @click="switchModule(2)">在押人员</text>
      </div>
      <div v-if="currentTab == 1" class="home-content-wrapper">
        <div class="home-content-box">
          <div class="home-content-top">
            <div class="home-content-list">
              <div class="home-police-item police" @touchstart.stop="openRoomLevelModal">
                <div class="home-police-box">
                  <text class="title">监室号</text>
                  <div class="room-box">
                    <text class="roomNo">{{ roomNo }}</text>
                    <text class="roomNo" :class="{
                      'civilized-room': roomLevel == '文明监室',
                      'strict-room': roomLevel == '严管监室',
                    }">{{ roomLevel }}</text>
                  </div>
                </div>
              </div>
              <div class="home-police-item police">
                <div class="home-police-box">
                  <text class="title">主管民警</text>
                  <text class="charge-name">{{ chargePoliceInfo.name }}</text>
                </div>
              </div>
              <div class="home-police-item police">
                <div class="home-police-box">
                  <text class="title">协管民警</text>
                  <div class="assist-police-box">
                    <text class="assist-name" v-for="(item, index) in assistPoliceList" :key="index">{{ item.name
                    }}</text>
                  </div>
                </div>
              </div>
            </div>
            <div class="home-content-list">
              <div class="home-prisoner-box prisoner-num-box">
                <div class="home-prisoner-item prisoner-num">
                  <text class="title">总人数(人)</text>
                  <text class="count">{{ prisonerNum.totalNum }}</text>
                </div>
                <div class="home-prisoner-item prisoner-num">
                  <text class="title">目前人数(人)</text>
                  <text class="count">{{ prisonerNum.existNum }}</text>
                </div>
                <div class="home-prisoner-item prisoner-num">
                  <text class="title">外出人数(人)</text>
                  <text class="count">{{ prisonerNum.outsideNum }}</text>
                </div>
              </div>
            </div>
          </div>
          <div class="home-content-bottom">
            <scroll-view scroll-y="true" class="home-bottom-scroll">
              <uni-grid :column="6" :show-border="false" :square="false">
                <uni-grid-item class="home-bottom-item" v-for="(item, index) in homeList" :key="index">
                  <view class="home-bottom-list" :class="index % 2 ? 'bgStyle-two' : 'bgStyle-one'"
                    @click="handleHomeClick(index)">
                    <image :src="item.image" mode="aspectFill"></image>
                    <text>{{ item.name }}</text>
                    <text v-if="index == 5 && noticeMark" class="home-mark">{{
                      noticeMark
                    }}</text>
                  </view>
                </uni-grid-item>
              </uni-grid>
            </scroll-view>
          </div>
        </div>
        <div class="page-vertical-divider"></div>
        <div class="home-sidebar">
          <view class="home-sidebar-title">监室动态</view>
          <view class="home-sidebar-news">
            <scroll-view scroll-y="true" class="home-sidebar-scroll">
              <view class="home-sidebar-item" v-for="(item, index) in dynamicInfos" :key="index">
                <text>{{ item.idx }}</text>
                <text>【{{ item.type }}】</text>
                <text class="content">{{ item.content }}</text>
                <text class="date">{{ item.date }}</text>
              </view>
            </scroll-view>
          </view>
        </div>
      </div>
      <div v-else-if="currentTab == 2" class="prisoner-container">
        <div class="prisoner-content">
          <scroll-view scroll-y="true" class="prisoner-scroll">
            <uni-grid :column="6" :show-border="false" :square="false">
              <uni-grid-item class="prisoner-item" v-for="(item, index) in prisonerList" :key="index">
                <div class="prisoner-list" :class="index % 2 ? 'bgStyle-two' : 'bgStyle-one'"
                  @click="handlePrisonerClick(index)">
                  <image :src="item.image"></image>
                  <text>{{ item.name }}</text>
                </div>
              </uni-grid-item>
            </uni-grid>
          </scroll-view>
        </div>
      </div>
      <terminal-life v-else-if="currentTab == 3" ref="life"></terminal-life>
      <terminal-kitchen v-else-if="currentTab == 4" ref="kitchen"></terminal-kitchen>
      <terminal-notice v-else-if="currentTab == 5" ref="notice"></terminal-notice>
      <terminal-call v-else-if="currentTab == 6" ref="call"></terminal-call>
      <prisoner-fingerprint v-else-if="currentTab == 7" ref="prisonerFingerprint"></prisoner-fingerprint>
      <terminal-shopping v-else-if="currentTab == 8" ref="shopping"></terminal-shopping>
      <terminal-dutyCall v-else-if="currentTab == 9" ref="dutyCall"></terminal-dutyCall>
      <terminal-talk v-else-if="currentTab == 10" ref="talk"></terminal-talk>
      <terminal-illness v-else-if="currentTab == 11" ref="illness"></terminal-illness>
      <terminal-repairClaim v-else-if="currentTab == 12" ref="repairClaim"></terminal-repairClaim>
      <terminal-mood v-else-if="currentTab == 13" ref="mood"></terminal-mood>
      <terminal-bed v-else-if="currentTab == 14" ref="bed"></terminal-bed>
      <terminal-temperatureMonitor v-else-if="currentTab == 15" ref="temperatureMonitor"></terminal-temperatureMonitor>
      <terminal-message v-else-if="currentTab == 16" ref="life"></terminal-message>
      <terminal-medicationTips v-else-if="currentTab == 17" ref="medicationTips"></terminal-medicationTips>
      <terminal-video v-else-if="currentTab == 18" ref="video" @closeVideo="closeVideo"></terminal-video>
      <terminal-face v-else-if="currentTab == 19" ref="face"></terminal-face>
      <terminal-dutyTable v-else-if="currentTab == 20" ref="dutyTable"></terminal-dutyTable>
      <bottom-bar :loginState="loginState" :name="person.name" :countdown="loginTimeout" @click-logout="handleLogout"
        @click-set="handleSetUp" />
    </div>
    <div class="neil-modal-container">
      <!-- APP配置-基础URL -->
      <neil-modal class="setting-modal-container" :show="showUrlConfig" @close="closeModal('UrlConfig')">
        <view style="width: 600upx; height: 400upx">
          <view class="uni-flex model-bar">
            <view class="uni-flex-item model-bar-title">
              APP配置-基础URL
              <text style="font-size: 20upx; font-weight: 400; color: #ff0000">(非专业人员请勿操作)</text>
            </view>
          </view>
          <view class="modal-horizontal-divider"></view>
          <view style="padding: 15upx 50upx; height: 100%">
            <view class="uni-flex" style="align-items: center; height: 100upx">
              <text style="flex: 1; font-size: 20upx; font-weight: 400">基础Url：</text>
              <input style="flex: 4" class="input-baseurl" v-model="baseUrl" placeholder="http://ip:port/" />
            </view>
            <view class="uni-flex" style="
                align-items: center;
                justify-content: center;
                height: 100upx;
              ">
              <view class="page-button" @click="setBaseUrl">下一步</view>
            </view>
            <view style="
                color: rgba(220, 220, 220, 0.3);
                font-size: 14upx;
                text-align: center;
                margin-top: 80upx;
              " @click="clearALLCache">
              广州市高科通信技术股份有限公司版权所有
            </view>
          </view>
        </view>
      </neil-modal>
      <!-- APP配置-系统缓存 -->
      <neil-modal class="setting-modal-container" :show="showCacheConfig" @close="closeModal('CacheConfig')">
        <view style="width: 600upx; height: 400upx">
          <view class="uni-flex model-bar">
            <view class="uni-flex-item model-bar-title">
              APP配置-系统缓存
              <text style="font-size: 20upx; font-weight: 400; color: #ff0000"
                @click="closeModal('CacheConfig')">(非专业人员请勿操作)</text>
            </view>
          </view>
          <view class="modal-horizontal-divider"></view>
          <view style="padding: 15upx 35upx; height: 100%">
            <view class="uni-flex" style="align-items: center; height: 50upx">
              <text style="flex: 1; font-size: 20upx; font-weight: 400">系统缓存：{{ sysCacheInfo }}</text>
            </view>
            <view class="uni-flex" style="align-items: center; height: 50upx">
              <text style="flex: 1; font-size: 20upx; font-weight: 400">终端服务：{{ sysWebSocketInfo }}</text>
            </view>
            <view class="uni-flex" style="align-items: center; height: 50upx">
              <text style="flex: 1; font-size: 20upx; font-weight: 400">本机Ip：</text>
              <input style="flex: 4" class="input-baseurl" v-model="terminalIP" placeholder="ip" disabled />
            </view>
            <view class="uni-flex" style="
                align-items: center;
                justify-content: center;
                height: 100upx;
              ">
              <view class="page-button" style="margin-right: 60upx; width: 135upx" @click="setAllSettingCache">加载系统缓存
              </view>
              <view class="page-button" style="margin-right: 60upx; width: 135upx" @click="setAllBindInfo">认证终端信息</view>
              <view class="page-button-empty" @click="closeCacheConfig">关闭</view>
            </view>
          </view>
        </view>
      </neil-modal>
      <!-- 视频通话弹框 -->
      <neil-modal :show="showVideoCall">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>确认发起视频通话？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('VideoCall')">取消</div>
            <div class="btn-confirm" @touchstart.stop="handleVideoConnect">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 通话连接弹框 -->
      <neil-modal :show="showVideoConnect">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <image class="content-rotate" src="/static/images/index/connect.png"></image>
            <text>正在通话中...</text>
          </div>
        </div>
      </neil-modal>
      <!-- 应急报警弹框 -->
      <neil-modal :show="showAlarmInit">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>确认发起应急报警？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('AlarmInit')">取消</div>
            <div class="btn-confirm" @touchstart.stop="handleAlarmConfirm">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 密码验证 -->
      <keyboard :show="showSystemPwd" :failSystemPwd="failSystemPwd" ref="keyboard" @getPassword="getPassword"
        @hideKey="hideKeyModel"></keyboard>
      <!-- 系统菜单 -->
      <neil-modal :show="showSystemMenu">
        <div class="system-modal-container">
          <div class="modal-header">
            <div class="modal-title">
              <text>系统设置</text>
            </div>
            <div class="modal-close" @click="closeModal('SystemMenu')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <scroll-view scroll-y="true" class="system-menu-scroll">
            <ul>
              <li @click="prisonerFingerprint">在押人员指纹录入</li>
              <div class="page-horizontal-divider"></div>
              <li @click="prisonerFingerModel">同步在押人员指纹</li>
              <div class="page-horizontal-divider"></div>
              <!-- <li @click="showStatusBar">显示状态栏</li>
							<div class="page-horizontal-divider"></div>
							<li @click="hideStatusBar">隐藏状态栏</li>
							<div class="page-horizontal-divider"></div> -->
              <li @click="restartDevModel">设备重启</li>
              <div class="page-horizontal-divider"></div>
              <li @click="restartAppModel">应用重启</li>
              <div class="page-horizontal-divider"></div>
              <li @click="configInfoModel">同步配置信息</li>
              <div class="page-horizontal-divider"></div>
              <li @click="getUpdateAppInfo(0)">升级APP</li>
              <div class="page-horizontal-divider"></div>
              <li @click="echoCalibrate">回声校准</li>
              <div class="page-horizontal-divider"></div>
              <li @click="openCrashHandle">开启守护</li>
              <div class="page-horizontal-divider"></div>
              <li @click="closeCrashHandle">关闭守护</li>
              <div class="page-horizontal-divider"></div>
              <li @click="setTemperatureRange(0)">设置测温距离</li>
              <div class="page-horizontal-divider"></div>
            </ul>
          </scroll-view>
        </div>
      </neil-modal>
      <recognition-dialogs ref="recognitionDialogs" useFor="login" :isShow="showRecognitionDialogs"
        @switchRecognitionMode="switchRecognitionMode" @fingerRecognitionSuccess="fingerRecognitionSuccess"
        @faceRecognitionSuccess="faceRecognitionSuccess" @recognitionFail="recognitionFail"
        @close="closeRecognitionDialogs"></recognition-dialogs>
      <!-- 指纹认证弹框 -->
      <neil-modal :show="showFingerInit">
        <view class="finger-modal-container">
          <view class="modal-header">
            <view class="modal-title">温馨提示</view>
            <div class="modal-close" @click="closeModal('FingerInit')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </view>
          <view class="page-horizontal-divider"></view>
          <view class="uni-flex uni-flex-item uni-column" style="justify-content: center; align-items: center">
            <common-icons iconType="iconzhiwen" size="100" color="#fff" />
            <text style="font-size: 20.83upx; font-weight: 400">验证指纹，进行登录...</text>
          </view>
        </view>
      </neil-modal>
      <!-- 同步在押人员指纹弹框 -->
      <neil-modal :show="showPrisonerFinger">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否同步在押人员指纹？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('PrisonerFinger')">
              取消
            </div>
            <div class="btn-confirm" @touchstart.stop="prisonerFingerSync">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 同步民警指纹弹框 -->
      <neil-modal :show="showPoliceFinger">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否同步民警指纹？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('PoliceFinger')">
              取消
            </div>
            <div class="btn-confirm" @touchstart.stop="policeFingerSync">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 设备重启弹框 -->
      <neil-modal :show="showRestartDev">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否重启设备？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('RestartDev')">取消</div>
            <div class="btn-confirm" @touchstart.stop="handleRestartDev">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 应用重启弹框 -->
      <neil-modal :show="showRestartApp">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否重启应用？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('RestartApp')">取消</div>
            <div class="btn-confirm" @touchstart.stop="handleRestartApp">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 同步配置信息弹框 -->
      <neil-modal :show="showConfigInfo">
        <div class="common-modal-container">
          <div class="common-modal-content">
            <text>是否同步配置信息？</text>
          </div>
          <div class="common-modal-button">
            <div class="btn-cancel" @click="closeModal('ConfigInfo')">取消</div>
            <div class="btn-confirm" @touchstart.stop="configInfoSync">
              确定
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 升级APP弹框 -->
      <neil-modal :show="showUpdateApp">
        <div class="update-modal-container">
          <div class="modal-header">
            <div class="modal-title">当前版本V{{ appVersion }}</div>
          </div>
          <div class="page-horizontal-divider"></div>
          <scroll-view scroll-y="true" class="update-table-scroll">
            <div class="update-note">{{ updateNote }}</div>
          </scroll-view>
          <div class="update-modal-button">
            <div class="btn-cancel" @click="closeModal('UpdateApp')">取消</div>
            <div class="btn-confirm" :class="{ 'btn-disabled': disabledClick }" @touchstart.stop="handleUpdateApp">
              下载更新
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 监室等级时间周期弹框 -->
      <neil-modal :show="showLevelTimeModal">
        <div class="common-modal-container">
          <view class="modal-header">
            <view class="modal-title">监室等级时段</view>
          </view>
          <view class="modal-horizontal-divider"></view>
          <div class="common-modal-content">
            <p>
              开始时间：<text style="color: #35fffa">{{ beginTime }}</text>
            </p>
            <p>
              结束时间：<text style="color: #35fffa">{{ endTime }}</text>
            </p>
          </div>
          <div class="common-modal-button">
            <div class="btn-confirm" @touchstart.stop="closeModal('LevelTimeModal')">
              关闭
            </div>
          </div>
        </div>
      </neil-modal>
      <!-- 设备离线弹框 -->
      <neil-modal :show="showDevOffline">
        <div class="offline-modal-container">
          <div class="modal-header">
            <div class="modal-title">温馨提示</div>
            <div class="modal-close" @click="closeModal('DevOffline')">
              <image src="/static/images/common/close.png"></image>
            </div>
          </div>
          <div class="page-horizontal-divider"></div>
          <div class="offline-modal-box">
            <common-icons iconType="iconalarm" size="86" color="#fff"></common-icons>
            <text class="offline-content">网络异常，设备连接失败！({{ reconnectCount }})</text>
          </div>
        </div>
      </neil-modal>
    </div>
  </div>
</template>

<script>
import terminalLife from "@/pages/home/life/life.vue";
import terminalKitchen from "@/pages/home/kitchen/kitchen.vue";
import terminalNotice from "@/pages/home/notice/notice.vue";
import terminalCall from "@/pages/prisoner/call/call.vue";
import prisonerFingerprint from "@/pages/prisoner/fingerprint/fingerprint.vue";
import terminalShopping from "@/pages/prisoner/shopping/shopping.vue";
import terminalDutyCall from "@/pages/prisoner/dutyCall/dutyCall.vue";
import terminalTalk from "@/pages/prisoner/talk/talk.vue";
import terminalIllness from "@/pages/prisoner/illness/illness.vue";
import terminalRepairClaim from "@/pages/prisoner/repairClaim/repairClaim.vue";
import terminalMood from "@/pages/prisoner/mood/mood.vue";
import terminalBed from "@/pages/home/bed/bed.vue";
import terminalTemperatureMonitor from "@/pages/prisoner/temperatureMonitor/temperatureMonitor.vue";
import terminalMessage from "@/pages/home/message/message.vue";
import terminalMedicationTips from "@/pages/prisoner/medicationTips/medicationTips.vue";
import terminalVideo from "@/pages/home/video/video.vue";
import terminalFace from "@/pages/police/face/face.vue";
import terminalDutyTable from "@/pages/home/dutyTable/dutyTable.vue";
import navBar from "@/components/nav-bar/nav-bar.vue";
import bottomBar from "@/components/bottom-bar/bottom-bar.vue";
import uniGrid from "@/components/uni/uni-grid/uni-grid.vue";
import uniGridItem from "@/components/uni/uni-grid-item/uni-grid-item.vue";
import neilModal from "@/components/neil-modal/neil-modal.vue";
import commonIcons from "@/components/common-icons/common-icons.vue";
import keyboard from "@/components/dt-keyboard/dt-keyboard.vue";
import recognitionDialogs from "@/components/recognition-dialogs/recognition-dialogs.vue";
import { isNullStr, dateFormat, str2Array, convertTimeToSeconds } from "@/common/utils/util.js";
import Api from "@/common/api.js";
import Log from "@/common/utils/log.js";
import { mapState, mapMutations } from "vuex";
import homeList from "@/static/mock/homeList.json";
import prisonerList from "@/static/mock/prisonerList.json";

// 指纹认证
const utils = uni.requireNativePlugin("Utils");
const sip = uni.requireNativePlugin("Sip");
// 升级APP
const updateApp = uni.requireNativePlugin("GK-UpdateApp");
const innerAudioContext = uni.createInnerAudioContext();
innerAudioContext.autoplay = false;

export default {
  components: {
    navBar,
    bottomBar,
    uniGrid,
    uniGridItem,
    neilModal,
    commonIcons,
    keyboard,
    recognitionDialogs,
    terminalLife,
    terminalKitchen,
    terminalNotice,
    terminalCall,
    prisonerFingerprint,
    terminalShopping,
    terminalDutyCall,
    terminalTalk,
    terminalIllness,
    terminalRepairClaim,
    terminalMood,
    terminalBed,
    terminalTemperatureMonitor,
    terminalMessage,
    terminalMedicationTips,
    terminalVideo,
    terminalFace,
    terminalDutyTable,
  },
  data() {
    return {
      // 登录用户信息
      person: {
        id: "",
        name: "",
      },
      // 点击设置栏次数
      clickNums: 0,
      // 配置baseUrl弹框
      showUrlConfig: false,
      // 配置系统缓存弹框
      showCacheConfig: false,
      baseUrl: "",
      // 系统缓存
      sysCacheInfo: "",
      // WebSocket连接提示信息
      sysWebSocketInfo: "",
      // 是否关闭WebSocket
      isWebSocketDisable: false,
      // WebSocket连接定时器
      socketTimer: null,
      // 监室等级
      roomLevel: "",
      // 严管监室开始时间
      beginTime: "",
      // 严管监室结束时间
      endTime: "",
      // 民警主管信息
      chargePoliceInfo: {},
      // 民警协管信息列表
      assistPoliceList: [],
      // 监室人员数
      prisonerNum: {},
      // 首页菜单
      homeList: homeList,
      // 监室公告角标
      noticeMark: 0,
      // 视频通话确认弹框
      showVideoCall: false,
      // 视频对讲弹框
      showVideoConnect: false,
      // 登录弹框
      showRecognitionDialogs: false,
      // 通话时间
      voiceTime: "",
      // 应急告警弹框
      showAlarmInit: false,
      // 首页应急报警计时器
      alarmTimer: null,
      // 首页应急报警计数
      alarmCount: 0,
      // 按键应急报警计时器
      keyAlarmTimer: null,
      // 按键应急报警计数
      keyAlarmCount: 0,
      // 按键报警间隔时长
      keyAlarmTime: uni.getStorageSync("keyAlarmTime"),
      // 动态信息
      dynamicList: [],
      // 在押人员菜单信息
      prisonerList: prisonerList,
      // 视频通话名称
      bgVideoName: "",
      // 音频名称
      BGAudioName: "",
      // 广播流地址
      broadcastUrl: "",
      // 播放视频地址
      bgVideoUrl: "",
      // 播放视频样式
      bgVideoStyle: {
        width: "1px",
        height: "1px",
      },
      // 音频列表
      audioList: [],
      // 音频信息
      audioInfo: {},
      // 视频信息
      videoInfo: {},
      // 终端配置状态
      initState: false,
      // 底栏设置状态
      setupState: false,
      // 密码验证弹框
      showSystemPwd: false,
      // 密码验证失败
      failSystemPwd: false,
      // 指纹登录弹框
      showFingerInit: false,
      // 同步在押人员指纹弹框
      showPrisonerFinger: false,
      // 同步民警指纹弹框
      showPoliceFinger: false,
      // 设备重启弹框
      showRestartDev: false,
      // 应用重启弹框
      showRestartApp: false,
      // 同步配置信息弹框
      showConfigInfo: false,
      // 升级APP弹框
      showUpdateApp: false,
      // APP版本
      appVersion: "",
      // APP更新内容
      updateNote: "",
      // 禁用按钮
      disabledClick: false,
      // APP下载地址
      downloadUrl: "",
      // 设备连接状态
      isOpen: false,
      // 指纹登录定时器
      loginTimer: null,
      // 倒计时定时器
      timer: null,
      // 开启倒计时
      loginTimeout: uni.getStorageSync("loginTimeout") || 30,
      // 系统菜单弹框
      showSystemMenu: false,
      // 监室等级时间周期弹框
      showLevelTimeModal: false,
      // 监室等级弹框定时器
      levelTimer: null,
      // 设备离线提示弹框
      showDevOffline: false,
      // 网络异常监听定时器
      heartbeatTimer: null,
      // 网络异常计时
      heartBeatTimeOut: uni.getStorageSync("heartBeatTimeOut"),
      // 音频倒计时
      audioTimer: null,
      // 视频倒计时
      videoTimer: null,
      // 视频对讲状态
      intercomState: false,
      // 禁止重复提交
      isRepeatState: false,
      // webSocket 会话对象
      socketTask: null,
      setStorageSyncNumber: 0,
      // 设置测温距离的值
      temRangeValue: 0,
      // 值班签到定时器 => 单次值班时间段内需要签到多次
      dutyTimer: null,
      // 值班签到定时器间隔
      dutyTimerInterval: 0,
      // 单次值班时间段内需要签到的总次数
      dutyTotalCount: 0,
      // 已签到次数
      dutyCount: 1,
      // socket重连次数
      reconnectCount: 0,
      // 文件资源路径前缀
      fileUrlPrefix: uni.getStorageSync("fileUrlPrefix"),
      // 电教播放错误状态
      errorStatus: false,
      // 广播播放状态
      radioPlayState: false,
      // 音频播放状态
      audioPlayState: false,
      // 视频播放状态
      videoPlayState: false,
      // 卡号
      cardNo: "",
      // 拍照定时器
      faceTimer: null,
      // 拍照上传入参
      faceParams: {
        alarmId: "",
        image: "",
        rybh: "",
      },
      // 抓拍状态
      isTakingPic: false,
    };
  },
  computed: {
    ...mapState({
      // 当前页面
      currentTab: (state) => state.app.currentTab,
      // 登录人员信息
      personInfo: (state) => state.app.personInfo,
      // 菜单状态
      menuState: (state) => state.app.menuState,
      // 返回首页状态
      homeState: (state) => state.app.homeState,
      // 后退状态
      backState: (state) => state.app.backState,
      // 登录状态
      loginState: (state) => state.app.loginState,
      // 是否正在点名
      isCalling: (state) => state.app.isCalling,
      // 是否正在对讲
      isIntercom: (state) => state.app.isIntercom,
      // 值班人员列表
      dutyList: (state) => state.app.dutyList,
      // 是否对讲等待接听中
      isWaitingIntercom: (state) => state.app.isWaitingIntercom,
      // 电教视频信息
      educationVideoInfo: (state) => state.app.educationVideoInfo,
    }),
    // 监室动态日期格式化
    dynamicInfos() {
      this.dynamicList.map((item, index) => {
        item.idx = `${index + 1 >= 10 ? index + 1 : "0" + (index + 1)}.`;
        item.date = dateFormat("MM-DD hh:mm", new Date(item.date));
      });
      return this.dynamicList;
    },
    // 监室号
    roomNo() {
      return uni.getStorageSync("terminalInfo").roomName;
    },
    // 返回首页状态
    showHomeState() {
      return this.currentTab > 1 && this.currentTab != 6;
    },
    // 页面回退状态
    showBackState() {
      return (
        this.currentTab > 7 && ![14, 16, 18, 19, 20].includes(this.currentTab)
      );
    },
    // 重连定时器间隔
    websocketTime() {
      let count = this.reconnectCount;
      if (count >= 0 && count < 360) {
        return 10000;
      } else if (count >= 360 && count < 960) {
        return 30000;
      } else if (count >= 960 && count < 2040) {
        return 60000;
      } else if (count >= 2040 && count < 2760) {
        return 120000;
      } else {
        return 240000;
      }
    },
    // 分机IP
    terminalIP() {
      return (
        getApp().globalData.Base.getIpAddress().ip || this.$config.terminalIP
      );
    },
  },
  onLoad() {
    this.reconnectCount = 0;
    // #ifdef APP-PLUS
    const _this = this;
    plus.globalEvent.removeEventListener("设置距离");
    plus.globalEvent.addEventListener("设置距离", function (e) {
      this.handleShowToast(`设置测温距离成功：${_this.temRangeValue}`);
      getApp().globalData.Temperature.stop();
    });
    // 监听电教播放事件
    plus.globalEvent.removeEventListener("setOnInfoListener");
    plus.globalEvent.addEventListener("setOnInfoListener", function (info) {
      console.log("电教播放状态：" + JSON.stringify(info));
      const { infoCode } = info;
      if (infoCode == 3 || infoCode == 702) {
        // 电教准备播放监听
        _this.receiveTask("edu", "start");
        _this.errorStatus = false;
        _this.closeAudioOutput();
      }
    });
    // 监听电教播放事件
    plus.globalEvent.removeEventListener("onMediaErrorListener");
    plus.globalEvent.addEventListener("onMediaErrorListener", function (code) {
      console.log("电教播放状态：" + JSON.stringify(code));
      // 回传电教播放信息
      if (!_this.errorStatus) {
        _this.errorStatus = true;
        _this.callbackEduVideoInfo(0);
      }
    });
    // 监听电教SDK运行错误
    plus.globalEvent.removeEventListener("exceptionListener");
    plus.globalEvent.addEventListener("exceptionListener", function (e) {
      console.log("电教SDK运行错误：" + JSON.stringify(e));
      let eventContent = "";
      eventContent = `${uni.getStorageSync("terminalInfo").code
        }：电教SDK运行错误${JSON.stringify(e)}，`;
      _this.setDynamicInfo(eventContent);
    });
    // 监听刷卡事件
    getApp().globalData.CardManager.startReadCard((result) => {
      let res = JSON.parse(result);
      console.log("刷卡状态：" + JSON.stringify(res));
      if (res.code == 0) {
        _this.cardNo = res.cardData.cardNum.replace(/\s/g, "");
        _this.handleShowToast("刷卡成功，请稍候");
        _this.getPoliceByCardNum(_this.cardNo);
      }
    });
    // #endif
    //初始化配置-基础Url
    if (isNullStr(uni.getStorageSync("baseUrl"))) {
      this.baseUrl = this.$config.baseUrl;
      this.openModal("UrlConfig");
    } else {
      this.videoContext = uni.createVideoContext("bgVideo");
      this.baseUrl = uni.getStorageSync("baseUrl");
      // 同步配置信息
      this.configInfoSync();
      //websocket连接
      if (!getApp().globalData.webSocketConnected) {
        if (!isNullStr(uni.getStorageSync("terminalInfo").code)) {
          //初始化配置WS服务
          this.connectWebSocketInit(uni.getStorageSync("terminalInfo").code);
        } else {
          this.setAllBindInfo();
        }
      }
    }
  },
  mounted() {
    // 获取首页数据
    this.initHomeData(false);
  },
  destroyed() {
    this.clickNums = 0;
    clearInterval(this.videoTimer);
    this.stopVideo();
    innerAudioContext.stop();
    innerAudioContext.destroy();
    uni.hideToast();
  },
  methods: {
    ...mapMutations({
      // 设置当前页面
      setCurrentTab: "app/SET_CURRENTTAB",
      // 点名类型
      setRollType: "app/SET_ROLLTYPE",
      // 在线点名
      setRollId: "app/SET_ROLLID",
      // 临时点名
      setRollInfo: "app/SET_ROLLINFO",
      // 设置登录人员信息
      setPersonInfo: "app/SET_PERSONINFO",
      // 媒体播放组件显隐
      setShowMediaPlayer: "app/SET_SHOWMEDIAPLAYER",
      // 设置媒体流地址
      setMediaPlayerUrl: "app/SET_MEDIAPLAYERURL",
      // 设置登录状态
      setLoginState: "app/SET_LOGINSTATE",
      // 设置是否正在对讲
      setIsIntercom: "app/SET_ISINTERCOM",
      // 值班人员列表
      setDutyList: "app/SET_DUTYLIST",
      // 设置是否对讲等待接听中
      setIsWaitingIntercom: "app/SET_ISWAITINGINTERCOM",
      // 设置电教视频信息
      setEducationVideoInfo: "app/SET_EDUCATIONVIDEOINFO",
      // 设置媒体组件静音状态
      setIsMediaMuted: "app/SET_ISMEDIAMUTED",
    }),
    // 获取警官信息
    async getPoliceInfo() {
      let params = {
        roomId: uni.getStorageSync("terminalInfo").roomId,
      };
      let res = await Api.apiCall("get", Api.index.getPoliceInfo, params, true);
      if (res.state.code == "200") {
        if (Object.keys(res.data).length) {
          this.chargePoliceInfo = res.data.roomSupervisor;
          this.assistPoliceList = res.data.coordinatingPolice;
          this.roomLevel = res.data.roomLevel;
          this.beginTime = res.data.beginTime
            ? dateFormat("YYYY-MM-DD hh:mm:ss", new Date(res.data.beginTime))
            : "";
          this.endTime = res.data.endTime
            ? dateFormat("YYYY-MM-DD hh:mm:ss", new Date(res.data.endTime))
            : "";
        }
      }
    },
    // 获取监室人数
    async getPrisonerNum() {
      let params = {
        code: uni.getStorageSync("terminalInfo").code,
      };
      let res = await Api.apiCall(
        "get",
        Api.index.getPrisonerNum,
        params,
        true
      );
      if (res.state.code == "200") {
        this.prisonerNum = res.data;
      }
    },
    // 获取监室动态
    async getDynamicInfo(state) {
      let code = uni.getStorageSync("terminalInfo").code;
      let res = await Api.apiCall(
        "get",
        Api.index.getDynamicInfo + `?terminalCode=${code}`,
        null,
        true
      );
      if (res.state.code == "200") {
        if (state) {
          this.handleShowToast("刷新成功！");
        }
        this.dynamicList = res.data;
        this.noticeMark = this.dynamicList.length;
        if (this.noticeMark) {
          if (this.dynamicList[0].level != "0") {
            this.controlDoubleDisplays("pause");
            setTimeout(() => {
              if (this.educationVideoInfo.status === "play") {
                this.controlDoubleDisplays("show", this.educationVideoInfo.url);
              }
            }, 60000);
          }
        }
      }
    },
    // 刷卡获取民警信息
    async getPoliceByCardNum(cardNo) {
      let res = await Api.apiCall(
        "get",
        Api.police.getUserByCardNum + cardNo,
        null
      );
      if (res.state.code == 200) {
        if (Object.keys(res.data).length) {
          if (res.data.idProperty == "1") {
            this.closeModal("RecognitionDialogs");
            this.showVideoCall = false;
            this.showAlarmInit = false;
            this.setPersonInfo(res.data);
            this.person.id = res.data.accountName;
            this.person.name = res.data.name;
            this.setLoginState(true);
            this.setCurrentTab(19);
          } else {
            this.handleShowToast("没有操作权限");
          }
        }
      }
    },
    // 切换主页面
    switchModule(index) {
      if (!this.intercomState) {
        this.intercomState = true;
        setTimeout(() => {
          this.intercomState = false;
        }, 3000);
        this.setCurrentTab(index);
        clearInterval(this.timer);
        if (index == 1) {
          this.handleLogout();
        } else {
          // 开启倒计时
          this.countTimer();
          if (index == 2 && this.person.id) return;
          if (this.person.id !== "0999") {
            this.openModal("RecognitionDialogs");
            this.$nextTick(() => {
              this.$refs.recognitionDialogs &&
                this.$refs.recognitionDialogs.startRecognition();
            });
          }
        }
      }
    },
    // 重置倒计时长
    initCountTimeout() {
      this.loginTimeout = uni.getStorageSync("loginTimeout") || 30;
    },
    // 重置其他倒计时长
    initSpecialTimeout() {
      this.loginTimeout = uni.getStorageSync("specialLoginTimeout") || 120;
    },
    // 开启倒计时
    countTimer() {
      // this.initCountTimeout();
      this.loginTimeout = uni.getStorageSync("loginTimeout") || 150;
      this.timer = setInterval(() => {
        this.loginTimeout--;
        if (this.loginTimeout <= 0) {
          this.closeCountTimer();
        }
      }, 1000);
    },
    // 关闭倒计时
    closeCountTimer() {
      clearInterval(this.timer);
      clearInterval(this.loginTimer);
      this.initCountTimeout();
      if (this.person.id !== "0999") {
        this.loginStatusHanlder({});
      }
      this.showFingerInit = false;
      this.closeModal("RecognitionDialogs");
      if (![6].includes(this.currentTab)) {
        this.setCurrentTab(1);
      }
    },
    // 对讲挂断|取消|超时
    resetIntercom() {
      this.intercomState = false;
      this.showVideoConnect = false;
      this.setIsIntercom(false);
    },
    // 点名结束
    handleCallOver() {
      if (this.educationVideoInfo.status === "play") {
        if (this.educationVideoInfo.type == "1") {
          this.controlDoubleDisplays("resume");
        } else {
          this.controlDoubleDisplays("show", this.educationVideoInfo.url);
        }
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
    // 首页子模块
    handleHomeClick(index) {
      this.handleHomeModal(this.homeList[index]);
    },
    // 在押人员子模块
    handlePrisonerClick(index) {
      this.handleHomeModal(this.prisonerList[index]);
    },
    // 子模块路由跳转
    handleHomeModal(item) {
      if (
        (this.educationVideoInfo.status === "play" ||
          this.educationVideoInfo.status === "pause") &&
        item.index === 18
      )
        return;
      if (item.url === "OnlineCall") return;
      if (!this.intercomState) {
        this.intercomState = true;
        setTimeout(() => {
          this.intercomState = false;
        }, 1000);
        if (!isNullStr(item.isModal) && item.isModal) {
          clearInterval(this.timer);
          this.openModal(item.url);
        } else {
          if (isNullStr(item.name)) {
            this.handleShowToast("Developing");
          } else {
            clearInterval(this.timer);
            if (!isNullStr(item.index)) {
              this.setLoginState(this.loginState);
              this.setCurrentTab(item.index);
            }
          }
        }
      }
    },
    // 管理员密码验证
    getPassword(e) {
      let adminPassword = uni.getStorageSync("adminPassword");
      if (e == adminPassword) {
        this.showSystemPwd = false;
        if (this.initState) {
          this.openModal("UrlConfig");
          this.initState = false;
        }
        if (this.setupState) {
          this.showSystemMenu = true;
          this.setupState = false;
        }
      } else {
        this.failSystemPwd = true;
        this.$refs.keyboard.clear();
        setTimeout(() => (this.failSystemPwd = false), 600);
      }
    },
    // 关闭密码验证弹框
    hideKeyModel() {
      this.initState = false;
      this.setupState = false;
      this.showSystemPwd = false;
    },
    // 在押人员指纹录入页面
    prisonerFingerprint() {
      this.setCurrentTab(7);
      this.showSystemMenu = false;
    },
    // 同步在押人员指纹弹框
    prisonerFingerModel() {
      this.showPrisonerFinger = true;
    },
    // 同步在押人员指纹
    prisonerFingerSync() {
      this.syncPrisonerFinger();
    },
    // 设备重启弹框
    restartDevModel() {
      this.showRestartDev = true;
    },
    // 重启设备
    handleRestartDev() {
      uni.closeSocket();
      utils.reboot();
    },
    // 应用重启弹框
    restartAppModel() {
      this.showRestartApp = true;
    },
    // 重启应用
    handleRestartApp() {
      // #ifdef APP-PLUS
      plus.runtime.restart();
      // #endif
    },
    // 显示状态栏
    showStatusBar() {
      getApp().globalData.HarUtils.showStatusBar();
    },
    //隐藏状态栏
    hideStatusBar() {
      getApp().globalData.HarUtils.hideStatusBar();
    },
    // 配置信息弹框
    configInfoModel() {
      this.showConfigInfo = true;
    },
    // 同步配置信息
    configInfoSync() {
      // 先清空sysCacheInfo再setAllSettingCache 否则会设置失败
      this.sysCacheInfo = "";
      // 加载系统缓存
      this.setAllSettingCache();
      // 同步认证终端信息
      this.AllBindInfoSync();
      this.showConfigInfo = false;
    },
    // 升级APP
    async getUpdateAppInfo(type) {
      let params = {
        data: {
          versionCode: plus.runtime.versionCode,
          deviceType: 2,
        },
      };
      let res = await Api.apiCall("post", Api.index.getUpdateInfo, params);
      if (res.state.code == "200") {
        switch (type) {
          case 0:
            this.appVersion = plus.runtime.version;
            if (res.data.status == 0) {
              this.updateNote = `当前已是最新版本！`;
              this.disabledClick = true;
            } else {
              this.updateNote = res.data.note;
              this.downloadUrl = res.data.url;
            }
            this.showUpdateApp = true;
            break;
          case 1:
            if (res.data.status == 0) {
              console.log("当前已是最新版本！");
            } else {
              this.downloadUrl = res.data.url;
              this.handleUpdateApp();
            }
            break;
        }
      }
    },
    // 下载更新APP
    handleUpdateApp() {
      plus.io.resolveLocalFileSystemURL(
        "/sdcard/Download/update.apk",
        (entry) => {
          console.log("安装包已存在");
          plus.io.resolveLocalFileSystemURL(
            "/sdcard/Download/update.apk",
            (entry) => {
              entry.remove(
                (res) => {
                  console.log("删除文件成功");
                  this.updateControl();
                },
                (err) => {
                  console.log("删除文件失败");
                }
              );
            }
          );
        },
        (err) => {
          console.log("文件夹为空");
          this.updateControl();
        }
      );
    },
    // 下载安装APP
    updateControl() {
      plus.nativeUI.showWaiting("安装包下载中，请稍候...");
      plus.downloader
        .createDownload(
          this.downloadUrl,
          { filename: "/sdcard/Download/update.apk" },
          (d, status) => {
            plus.nativeUI.closeWaiting();
            if (status == 200) {
              console.log("下载成功：" + d.filename);
              updateApp.install(d.filename, (res) => {
                Log.writeLog("【安装APP，updateApp.install()】", false);
                if (res.state) {
                  console.log("APP安装成功");
                } else {
                  console.log("APP安装失败");
                  Log.writeLog("APP安装失败", false);
                }
              });
            } else {
              console.log("安装包下载失败");
              Log.writeLog("安装包下载失败", false);
            }
          }
        )
        .start();
    },
    // 回声校准
    echoCalibrate() {
      sip.startEchoCancellerCalibration();
      console.log("【回声校准成功，echoCalibrate()】");
    },
    // 开启守护
    openCrashHandle() {
      getApp().globalData.CrashHandle.startGuard(10000); //启动守护，0-不轮询
      console.log("【开启守护成功，openCrashHandle()】");
    },
    // 关闭守护
    closeCrashHandle() {
      getApp().globalData.CrashHandle.startGuard(0); //启动守护，0-不轮询
      console.log("【关闭守护成功，openCrashHandle()】");
    },
    // 设置测温距离
    setTemperatureRange(range) {
      let tRange = range || uni.getStorageSync("temperatureRange");
      let res = getApp().globalData.Temperature.init();
      if (res == 0) {
        this.temRangeValue = tRange;
        getApp().globalData.Temperature.setRange(tRange);
      } else {
        Log.writeLog(`测量体温初始化失败，code：${res}`, false);
      }
    },
    // 点击打开设置
    onClickInitSet() {
      if (this.currentTab == 1) {
        if (this.clickNums == 3) {
          this.clickNums = 0;
          this.initState = true;
          this.showSystemPwd = true;
        } else {
          this.clickNums = this.clickNums + 1;
        }
      }
    },
    // 返回首页
    onClickHome() {
      this.handleLogout();
    },
    // 页面回退
    onClickBack() {
      this.handleFallBack();
    },
    // 下一步设置baseUrl
    setBaseUrl() {
      if (!isNullStr(this.baseUrl)) {
        uni.setStorageSync("baseUrl", this.baseUrl);
        this.closeModal("UrlConfig");
        this.openModal("CacheConfig");
        if (!uni.getStorageSync("adminPassword")) {
          uni.setStorageSync("adminPassword", "654321");
        }
      } else {
        uni.showToast({
          title: "url不能为空！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      }
    },
    // 加载系统缓存
    async setAllSettingCache() {
      if (!isNullStr(this.sysCacheInfo)) {
        return;
      }
      let res = await Api.apiCall("get", Api.index.getAllSetting, null, true);
      if (res.state.code == "200") {
        let data = res.data;
        data.map((item) => {
          if (item.skey) {
            let key = item.skey;
            uni.setStorageSync(`${key}`, item.svalue);
          }
        });
        this.sysCacheInfo = "配置系统缓存成功！";
        console.log("配置系统缓存成功！");
        this.handleShowToast("配置系统缓存成功！");
      } else {
        console.log("配置系统缓存失败！");
        this.handleShowToast("配置系统缓存失败！");
      }
    },
    // 认证终端信息
    async setAllBindInfo() {
      if (this.isWebSocketDisable) {
        this.handleShowToast("请勿重复认证！");
        return;
      }
      let params = {
        ip: this.terminalIP,
        terminalType: 0,
      };
      uni.setStorageSync("authTerminalIP", this.terminalIP);
      let res = await Api.apiCall(
        "get",
        Api.index.getTerminalInfo,
        params,
        true
      );
      if (res.state.code == "200") {
        if (!isNullStr(res.data)) {
          // 设置本地缓存公共方法
          this.setTerminalStorage(res.data);
          if (!isNullStr(uni.getStorageSync("terminalInfo").code)) {
            //初始化配置WS服务
            this.connectWebSocketInit(uni.getStorageSync("terminalInfo").code);
          } else {
            uni.showToast({
              title: "缓存设置失败！！",
              image: "../../../static/images/common/error.png",
              icon: "none",
            });
          }
        } else {
          uni.showToast({
            title: "请先添加终端！",
            image: "../../../static/images/common/error.png",
            icon: "none",
          });
        }
      } else {
        uni.showToast({
          title: "认证终端信息失败！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      }
    },
    // 同步认证终端信息
    async AllBindInfoSync() {
      // 获取分机信息
      let params = {
        ip: this.terminalIP,
        terminalType: 0,
      };
      let res = await Api.apiCall(
        "get",
        Api.index.getTerminalInfo,
        params,
        true
      );
      if (res.state.code == "200") {
        if (!isNullStr(res.data)) {
          // 设置本地缓存公共方法
          this.setTerminalStorage(res.data);
          this.handleShowToast("绑定终端信息成功！");
        } else {
          uni.showToast({
            title: "请先添加终端！",
            image: "../../../static/images/common/error.png",
            icon: "none",
          });
        }
      } else {
        uni.showToast({
          title: "认证终端信息失败！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      }
    },
    // 设置本地缓存公共方法
    setTerminalStorage(data) {
      let terminalInfo = {
        ...data,
        code: data.terminalCode,
        name: data.terminalName,
        ip: data.terminalIp,
        id: data.terminalId,
      };
      uni.setStorageSync("terminalInfo", terminalInfo);
    },
    // 关闭终端配置弹框
    closeCacheConfig() {
      if (isNullStr(this.sysCacheInfo)) {
        uni.showToast({
          title: "系统缓存为空！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      } else if (isNullStr(uni.getStorageSync("terminalInfo"))) {
        uni.showToast({
          title: "终端信息为空！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      } else if (!getApp().globalData.webSocketConnected) {
        this.showVideoConnect = false;
        uni.showToast({
          title: "终端服务连接失败！",
          image: "../../../static/images/common/error.png",
          icon: "none",
        });
      } else {
        this.closeModal("CacheConfig");
        // 应用重启
        // #ifdef APP-PLUS
        plus.runtime.restart();
        // #endif
      }
    },
    // 发送WebSocket数据
    sendWebsocket(data) {
      this.socketTask.send({
        data: data,
        success(res) {
          console.log("消息发送成功:" + JSON.stringify(data));
        },
        fail(err) {
          console.log("消息发送失败:" + JSON.stringify(err));
          this.webSocketReConnct();
        },
      });
    },
    // 开始视频推流
    startLivePusher(pushUrl) {
      let subNVue = uni.getSubNVueById("livePusher");
      subNVue.show("fade-in", 200, () => {
        uni.$emit("live-push", {
          status: "start",
          url: pushUrl,
        });
      });
    },
    // 停止监视监听|广播推流
    stopLivePusher() {
      let subNVue = uni.getSubNVueById("livePusher");
      subNVue.show("fade-in", 200, () => {
        uni.$emit("live-push", {
          status: "stop",
        });
      });
      uni.$emit("node-mediaPlayer", "stop");
      this.setMediaPlayerUrl("");
    },
    // 开始拍照
    startTakePicture() {
      this.isTakingPic = true;
      uni.$on("media-preview-base64", (base64) => {
        let base64Str = base64.replace(/[\r\n]/g, "");
        this.faceRecognition(base64Str);
      });
      this.startFacePreview();
    },
    startFacePreview() {
      this.setShowMediaPlayer(true);
      uni.getSubNVueById("nodeMediaPlayer").show();
      uni.getSubNVueById("nodeMediaPlayer").setStyle({
        width: "1",
        height: "1",
        left: "-1920",
        top: "-1080",
      });
      let videostream = `${uni.getStorageSync("rtspUrl")}@${uni.getStorageSync("terminalInfo").embeddedIp
        }/stream0`;
      this.setMediaPlayerUrl(videostream);
      this.setIsMediaMuted(true);
      // 视频镜像
      setTimeout(() => {
        uni.$emit("node-mediaPlayer", "mirror");
      }, 1000);
      this.faceTimer = setTimeout(() => {
        uni.$emit("node-mediaPlayer", "preview");
      }, 3000);
    },
    // 人脸识别
    async faceRecognition(base64Str = "") {
      // 结束人脸拍照
      this.stopTakePicture(false);
      const { roomId } = uni.getStorageSync("terminalInfo");
      let params = {
        data: {
          roomId,
          base64Str,
        },
      };
      let res = await Api.apiCall(
        "post",
        Api.prisoner.faceRecognition1N,
        params,
        true,
        true
      );
      this.faceParams.image = `data:image/png;base64,${base64Str}`;
      if (res.state.code == 200) {
        const { rybh } = res.data;
        this.faceParams.rybh = rybh;
        this.saveAlarmPicInfo();
      } else {
        this.$nextTick(() => {
          this.startTakePicture();
        });
      }
    },
    // 保存拍照信息
    async saveAlarmPicInfo() {
      this.isTakingPic = false;
      let params = {
        data: this.faceParams,
      };
      let res = await Api.apiCall("post", Api.index.addAlarmPhoto, params);
      if (res.state.code == 200) {
        console.log("抓拍信息保存成功");
      }
    },
    // 结束人脸拍照
    stopTakePicture(state = true) {
      clearTimeout(this.faceTimer);
      uni.$off("media-preview-base64");
      this.setMediaPlayerUrl("");
      uni.$emit("node-mediaPlayer", "stop");
      this.setShowMediaPlayer(false);
      this.clearPictures();
      if (state && this.isTakingPic) {
        this.saveAlarmPicInfo();
      }
    },
    // 清空照片
    clearPictures() {
      // #ifdef APP-PLUS
      const dir = "_doc/uniapp_temp";
      plus.io.resolveLocalFileSystemURL(dir, (entry) => {
        entry.removeRecursively(() => {
          console.log("清理照片成功");
        });
      });
      // #endif
    },
    // WebSocket初始连接
    connectWebSocketInit(code) {
      // 设备离线状态
      if (!getApp().globalData.webSocketConnected) {
        this.showVideoConnect = false;
        if (this.currentTab == 2) {
          this.closeRecognitionDialogs();
        }
        this.showDevOffline = true;
      } else {
        this.showDevOffline = false;
        return;
      }
      this.socketTask = uni.connectSocket({
        url: uni.getStorageSync("webSocketUrl") + code,
        success(res) {
          // 这里是接口调用成功的回调，不是连接成功的回调，成功逻辑放在 onOpen 中
        },
        fail(err) {
          // 这里是接口调用失败的回调，不是连接失败的回调，失败逻辑放在 onError 中
        },
      });
      this.socketTask.onOpen((res) => {
        this.handleShowToast("绑定终端信息成功！");
        this.webSocketOn();
        clearTimeout(this.socketTimer);
        clearTimeout(this.heartbeatTimer);
        console.log("WebSocket连接成功！");
        // 数据为空，重新加载
        if (isNullStr(this.prisonerNum.totalNum)) {
          setTimeout(() => {
            this.initHomeData(false);
          }, 60000);
        }
      });
      this.socketTask.onError((err) => {
        console.log(
          "连接失败，可能是websocket服务不可用，正在发起重连",
          JSON.stringify(err)
        );
        this.webSocketReConnct();
      });
      // 关闭WebSocket
      this.socketTask.onClose((res) => {
        console.log("检测到WebSocket连接关闭，正在发起重连！！");
        clearTimeout(this.heartbeatTimer);
        this.webSocketReConnct();
      });
      // 获取主机websocket数据
      this.socketTask.onMessage((res) => {
        let info = JSON.parse(res.data);
        console.log(JSON.stringify(info));
        if (info.type == this.$config.controlType.HEARTBEAT) {
          const { code } = uni.getStorageSync("terminalInfo");
          this.sendWebsocket(
            `{maindevno:'', devno:'${code}', type:'000', msg:'1',extend:{'ip':'${this.terminalIP}'}}`
          );
          if (!isNullStr(this.heartbeatTimer)) {
            clearTimeout(this.heartbeatTimer);
          }
          this.heartbeatTimer = setTimeout(() => {
            this.webSocketReConnct();
          }, this.heartBeatTimeOut * 1000);
        } else if (info.type == this.$config.controlType.INTERCOM) {
          if (info.msg == "1" || info.msg == "24") {
            this.voiceBroadcast("对讲已挂断！");
            // 挂断视频对讲
            this.resetIntercom();
            this.setIsWaitingIntercom(false);
            if (this.isCalling) {
              return this.setCurrentTab(6);
            }
            if (this.educationVideoInfo.status === "play") {
              return this.controlDoubleDisplays(
                "show",
                this.educationVideoInfo.url
              );
            }
            if (this.audioPlayState) {
              // 继续播放音频
              innerAudioContext.play();
            }
            if (this.videoPlayState) {
              // 继续播放视频
              this.videoContext.play();
            }
          } else if (info.msg == "2") {
            // 开启监视监听
          } else if (info.msg == "6") {
            // 视频通话无应答
            this.voiceBroadcast("对方正忙，请稍后再拨");
            // 取消视频对讲
            this.resetIntercom();
            this.setIsWaitingIntercom(false);
            // 结束人脸拍照
            this.stopTakePicture();
            if (this.isCalling) {
              return this.setCurrentTab(6);
            }
            if (this.educationVideoInfo.status === "play") {
              return this.controlDoubleDisplays(
                "show",
                this.educationVideoInfo.url
              );
            }
          } else if (info.msg == "10" || info.msg == "13") {
            this.voiceBroadcast("对方正忙，请稍后再拨");
            // 主机离线，分机对讲请求超时
            this.resetIntercom();
            this.setIsWaitingIntercom(false);
            if (this.isCalling) {
              return this.setCurrentTab(6);
            }
            if (this.educationVideoInfo.status === "play") {
              return this.controlDoubleDisplays(
                "show",
                this.educationVideoInfo.url
              );
            }
          } else if (info.msg == "11") {
            this.controlDoubleDisplays("pause");
            // 分机发起对讲请求（对讲声道占用，设备问题）
            this.voiceBroadcast("正在发起视频通话");
            this.setIsWaitingIntercom(true);
            // 停止播放视频
            clearInterval(this.videoTimer);
            this.stopVideo();
          } else if (info.msg == "12") {
            // 主机拨通仓内
            this.setIsIntercom(true);
            // 结束人脸拍照
            this.stopTakePicture();
            this.voiceBroadcast("请注意，已经开启视频对讲");
            this.controlDoubleDisplays("pause");
            if (this.radioPlayState) {
              this.stopRadioHandler("0");
            }
            if (this.audioPlayState) {
              // 暂停播放音频
              innerAudioContext.pause();
            }
            if (this.videoPlayState) {
              // 暂停播放视频
              this.videoContext.pause();
            }
            if (this.isCalling && this.currentTab == 6) {
              this.$refs.call.discontinueCall(true);
            }
          } else if (info.msg == "27") {
            // 分机对讲中
            this.voiceBroadcast("正在对讲中，请勿重复操作");
            this.showVideoConnect = false;
          }
        } else if (info.type == this.$config.controlType.RADIO) {
          if (info.msg == "0") {
            if (this.isIntercom || this.isWaitingIntercom) {
              return;
            }
            if (this.audioPlayState) {
              // 停止播放音频
              this.stopAudioHandler("stop");
            }
            if (this.videoPlayState) {
              // 停止播放视频
              this.stopVideoHandler("stop");
            }
            this.radioPlayState = true;
            this.audioPlayState = false;
            this.videoPlayState = false;
            this.controlDoubleDisplays("pause");
            this.setIsMediaMuted(false);
            // 开始广播
            console.log("开始广播");
            this.broadcastUrl = uni.getStorageSync("rtmpUrl") + info.maindevno;
            this.setMediaPlayerUrl(this.broadcastUrl);
            this.setShowMediaPlayer(true);
            // 分机回传音量
            this.radioVolumeHandler(info, "4");
            this.receiveTask("radio", "start");
          } else if (info.msg == "1") {
            // 停止播放广播
            this.stopRadioHandler("stop");
          } else if (info.msg == "3") {
            if (info.extend == "0") {
              getApp().globalData.HarUtils.setVolume(3, 15);
            } else if (info.extend == "1") {
              // 开启静音
              getApp().globalData.HarUtils.setVolume(3, 0);
            }
          } else if (info.msg == "5") {
            // 回传主机音量
            let { volumeList } = JSON.parse(info.extend);
            volumeList.forEach((item) => {
              if (item.terminalCode == info.devno) {
                getApp().globalData.HarUtils.setVolume(3, item.volume);
              }
            });
            // 分机回传音量
            this.radioVolumeHandler(info, "6");
          }
        } else if (info.type == this.$config.controlType.AUDIO) {
          if (info.msg == "0") {
            if (this.isCalling) {
              return;
            }
            this.audioPlayState = true;
            if (this.educationVideoInfo.status === "play") return;
            // 开始播放音频
            let extend = JSON.parse(info.extend);
            this.audioList = extend.audioList;
            let audioIndex = 0;
            let terminalObj = {
              maindevno: info.maindevno,
              devno: uni.getStorageSync("terminalInfo").code,
              type: "300",
              msg: "3",
              extend: {},
            };
            if (this.audioList.length == 1) {
              innerAudioContext.loop = true;
            } else {
              innerAudioContext.loop = false;
            }
            clearInterval(this.audioTimer);
            this.audioInfo = this.audioList[audioIndex];
            innerAudioContext.src = this.fileUrlPrefix + this.audioInfo.url;
            if (extend.hasOwnProperty("duration")) {
              // 后台控制音频
              let duration = extend.duration;
              this.audioTimer = setInterval(() => {
                duration--;
                if (duration == 0) {
                  // 停止播放音频
                  clearInterval(this.audioTimer);
                  duration = extend.duration;
                  innerAudioContext.stop();
                }
              }, 1000);
            } else {
              // 主机播放音频
              terminalObj.extend = {
                devno: uni.getStorageSync("terminalInfo").code,
                audio: this.audioInfo.name,
                volume: getApp().globalData.HarUtils.getVolume(3),
              };
              this.sendWebsocket(JSON.stringify(terminalObj));
            }
            innerAudioContext.play();
            innerAudioContext.onEnded(() => {
              audioIndex++;
              if (audioIndex >= this.audioList.length) {
                // 列表循环播放
                audioIndex = 0;
              }
              this.audioInfo = this.audioList[audioIndex];
              innerAudioContext.src = this.fileUrlPrefix + this.audioInfo.url;
              innerAudioContext.play();
              if (!extend.hasOwnProperty("duration")) {
                terminalObj.extend = {
                  devno: uni.getStorageSync("terminalInfo").code,
                  audio: this.audioInfo.name,
                  volume: getApp().globalData.HarUtils.getVolume(3),
                };
                this.sendWebsocket(JSON.stringify(terminalObj));
              }
            });
            this.receiveTask("audio", "start");
          } else if (info.msg == "1") {
            // 停止播放音频
            this.stopAudioHandler("stop");
          } else if (info.msg == "4") {
            if (info.extend == "0") {
              // 继续播放音频
              innerAudioContext.play();
            } else if (info.extend == "1") {
              // 暂停播放音频
              innerAudioContext.pause();
            }
          } else if (info.msg == "5") {
            // 回传主机音量
            let { volumeList } = JSON.parse(info.extend);
            volumeList.forEach((item) => {
              if (item.terminalCode == info.devno) {
                getApp().globalData.HarUtils.setVolume(3, item.volume);
              }
            });
            let volume = getApp().globalData.HarUtils.getVolume(3);
            uni.setStorageSync("mediaDefaultVolume", volume);
            let terminalCode = uni.getStorageSync("terminalInfo").code;
            let terminalObj = {
              maindevno: info.maindevno,
              devno: terminalCode,
              type: "300",
              msg: "6",
              extend: volume,
            };
            this.sendWebsocket(JSON.stringify(terminalObj));
          }
        } else if (info.type == this.$config.controlType.VIDEO) {
          if (info.msg == "0") {
            if (this.isCalling) {
              return;
            }
            if (this.educationVideoInfo.status === "play") {
              return;
            }
            this.videoPlayState = true;
            // 开始播放视频
            let extend = JSON.parse(info.extend);
            if (extend.videoList.length) {
              this.videoInfo = extend.videoList[0];
              this.bgVideoUrl = this.videoInfo.url;
              this.startVideo();
              clearInterval(this.videoTimer);
              if (extend.hasOwnProperty("duration")) {
                // 后台控制视频
                let { endTime } = extend;
                let seconds = convertTimeToSeconds(endTime);
                if (!!seconds) {
                  this.videoTimer = setInterval(() => {
                    seconds--;
                    if (seconds <= 0) {
                      // 停止播放视频
                      this.stopVideoHandler("stop");
                    }
                  }, 1000);
                  this.receiveTask("video", "start");
                } else {
                  // 停止播放视频
                  this.stopVideoHandler("stop");
                }
              } else {
                // 主机播放视频
                let volume = getApp().globalData.HarUtils.getVolume(3);
                let terminalObj = {
                  maindevno: info.maindevno,
                  devno: uni.getStorageSync("terminalInfo").code,
                  type: "400",
                  msg: "3",
                  extend: {
                    devno: uni.getStorageSync("terminalInfo").code,
                    video: this.videoInfo.name,
                    volume,
                  },
                };
                this.sendWebsocket(JSON.stringify(terminalObj));
                this.receiveTask("video", "start");
              }
            } else {
              this.handleShowToast("当前视频列表为空");
            }
          } else if (info.msg == "1") {
            // 停止播放视频
            this.stopVideoHandler("stop");
          } else if (info.msg == "4") {
            if (info.extend == "0") {
              // 开始播放视频
              this.videoContext.play();
            } else if (info.extend == "1") {
              // 暂停播放视频
              this.videoContext.pause();
            }
          } else if (info.msg == "5") {
            // 电教播放
            this.closeVideo();
            if (this.currentTab == 18) {
              this.$refs.video.stopPlayVideo(false);
            }
            let extend = JSON.parse(info.extend);
            if (extend.msgType == "0") {
              this.setEducationVideoInfo({
                url:
                  extend.videoType == 1
                    ? this.fileUrlPrefix + extend.videoUrl
                    : extend.videoUrl,
                type: extend.videoType,
                status: "play",
              });
              this.controlDoubleDisplays("show", this.educationVideoInfo.url);
              this.setDynamicInfo("播放");
            } else if (extend.msgType == "1") {
              this.setEducationVideoInfo({
                url: "",
                type: 0,
                status: "stop",
              });
              this.controlDoubleDisplays("hide");
              this.receiveTask("edu", "stop");
              this.setDynamicInfo("停止");
            } else if (extend.msgType == "2") {
              this.setEducationVideoInfo({
                url: this.educationVideoInfo.url,
                type: this.educationVideoInfo.type,
                status: "pause",
              });
              if (this.educationVideoInfo.type == 1) {
                this.controlDoubleDisplays("pause");
              } else {
                this.controlDoubleDisplays("hide");
              }
              this.setDynamicInfo("暂停");
            } else if (extend.msgType == "3") {
              this.setEducationVideoInfo({
                url: this.educationVideoInfo.url,
                type: this.educationVideoInfo.type,
                status: "play",
              });
              if (this.isCalling) return;
              if (this.educationVideoInfo.type == 1) {
                this.controlDoubleDisplays("resume");
              } else {
                this.controlDoubleDisplays("show", this.educationVideoInfo.url);
              }
              this.setDynamicInfo("继续播放");
            }
          } else if (info.msg == "6") {
            // 回传主机音量
            let { volumeList } = JSON.parse(info.extend);
            volumeList.forEach((item) => {
              if (item.terminalCode == info.devno) {
                getApp().globalData.HarUtils.setVolume(
                  3,
                  parseInt(item.volume)
                );
              }
            });
            let volume = getApp().globalData.HarUtils.getVolume(3);
            uni.setStorageSync("mediaDefaultVolume", volume);
            let terminalCode = uni.getStorageSync("terminalInfo").code;
            let terminalObj = {
              maindevno: info.maindevno,
              devno: terminalCode,
              type: "400",
              msg: "7",
              extend: volume,
            };
            this.sendWebsocket(JSON.stringify(terminalObj));
          }
        } else if (info.type == this.$config.controlType.ALARM) {
          // 声光报警线路输出
          let alarmHighLowOut = uni.getStorageSync("alarmHighLowOut");
          if (info.msg == "2" || info.msg == "3") {
            this.voiceBroadcast("对方正忙，请稍后再拨");
            this.intercomState = false;
            this.setIsWaitingIntercom(false);
            // 结束人脸拍照
            this.stopTakePicture();
            if (this.isCalling) {
              return this.setCurrentTab(6);
            }
            if (this.educationVideoInfo.state === "play") {
              this.controlDoubleDisplays("show", this.educationVideoInfo.url);
            }
          } else if (info.msg == "4") {
            // 报警超时
            this.intercomState = false;
            this.setIsWaitingIntercom(false);
            // 结束人脸拍照
            this.stopTakePicture();
            if (this.isCalling) {
              return this.setCurrentTab(6);
            }
            if (this.educationVideoInfo.state === "play") {
              this.controlDoubleDisplays("show", this.educationVideoInfo.url);
            }
          } else if (info.msg == "7") {
            this.setIsWaitingIntercom(true);
            // 开启声光报警
            if (alarmHighLowOut == "1") {
              // 输入低电平，旧线路
              getApp().globalData.HarUtils.switchCtrl(0, 0);
            } else if (alarmHighLowOut == "2") {
              // 输入高电平，新线路
              getApp().globalData.HarUtils.switchCtrl(1, 1);
            }
          } else if (info.msg == "8") {
            // 关闭声光报警
            if (alarmHighLowOut == "1") {
              // 输入低电平，旧线路
              getApp().globalData.HarUtils.switchCtrl(0, 1);
            } else if (alarmHighLowOut == "2") {
              // 输入高电平，新线路
              getApp().globalData.HarUtils.switchCtrl(1, 0);
            }
          } else if (info.msg == "9") {
            // 分机报警中
            this.voiceBroadcast("正在报警中，请勿重复操作");
          } else if (info.msg == "10") {
            this.voiceBroadcast("正在发起应急报警");
            this.controlDoubleDisplays("pause");
            this.setIsWaitingIntercom(true);
            if (Reflect.has(info, "extend")) {
              // 开始报警按键人脸拍照
              const { alarmId } = JSON.parse(info.extend);
              this.faceParams.alarmId = alarmId;
              this.startTakePicture();
            }
            // 停止播放视频
            clearInterval(this.videoTimer);
            this.stopVideo();
            if (this.isCalling) {
              if (this.currentTab == 6) {
                this.$refs.call.discontinueCall(true);
              }
            }
          }
        } else if (info.type == this.$config.controlType.ROLLCALL) {
          if (this.isIntercom || this.isWaitingIntercom) {
            return;
          }
          this.closeModal("RecognitionDialogs");
          this.handleLogout();
          this.closeVideo();
          if (this.audioPlayState) {
            this.stopAudioHandler("0");
          }
          if (this.videoPlayState) {
            this.stopVideoHandler("0");
          }
          this.setRollType(info.msg);
          if (info.msg == "0") {
            // 在线点名
            this.setRollId(info.extend);
          }
          if (info.msg == "1") {
            // 临时点名
            let rollInfo = JSON.parse(info.extend);
            this.setRollInfo(rollInfo);
          }
          if (this.currentTab == 18) {
            this.$refs.video.stopPlayVideo(false);
          }
          if (this.educationVideoInfo.status === "play") {
            this.videoContext.pause();
            this.closeVideo();
            this.controlDoubleDisplays("pause");
          }
          this.setCurrentTab(6);
        } else if (info.type == this.$config.controlType.DEVICE) {
          let content = {
            content: info.extend,
          };
          if (info.msg == "0") {
            this.controlDoubleDisplays("pause");
            console.log("开始语音播报");
            this.voiceBroadcast(content);
            setTimeout(() => {
              if (this.educationVideoInfo.status === "play") {
                this.controlDoubleDisplays("show", this.educationVideoInfo.url);
              }
            }, 60000);
          } else if (info.msg == "1") {
            console.log("停止语音播报");
            getApp().globalData.Base.speechStop();
            if (this.educationVideoInfo.status === "play") {
              this.controlDoubleDisplays("show", this.educationVideoInfo.url);
            }
          } else if (info.msg == "2") {
            console.log("设备校时");
            utils.setTime(info.extend);
          } else if (info.msg == "3") {
            // 关闭视频
            clearInterval(this.videoTimer);
            this.stopVideo();
            sip.logout();
            // 设备重启
            uni.closeSocket();
            utils.reboot();
          } else if (info.msg == "4") {
            if (!!info.extend) {
              let ids = info.extend;
              // 删除在押人员指纹ID
              this.delPrisonerFingerId(ids);
            } else {
              // 同步在押人员指纹
              this.syncPrisonerFinger();
            }
          } else if (info.msg == "5") {
            // 同步民警指纹
          } else if (info.msg == "6") {
            // 同步配置信息
            this.configInfoSync();
          } else if (info.msg == "7") {
            // 自动升级APP
            this.getUpdateAppInfo(1);
          } else if (info.msg == "8") {
            this.closeModal("RecognitionDialogs");
            // 关闭电教
            this.controlDoubleDisplays("hide");
            // 关闭视频
            clearInterval(this.videoTimer);
            this.stopVideo();
            sip.logout();
            // 应用重启
            // #ifdef APP-PLUS
            plus.runtime.restart();
            // #endif
          } else if (info.msg == "9") {
            if (this.currentTab == 1) {
              this.initHomeData(true);
            }
          } else if (info.msg == "10") {
            // 回声消除
            sip.startEchoCancellerCalibration();
          } else if (info.msg == "11") {
            // 开启守护
            getApp().globalData.CrashHandle.startGuard(10000); //启动守护，0-不轮询
          } else if (info.msg == "12") {
            // 关闭守护
            getApp().globalData.CrashHandle.startGuard(0); //启动守护，0-不轮询
          } else if (info.msg == "13") {
            Log.uploadLogFile(content.content);
          } else if (info.msg == "14") {
            this.setTemperatureRange(content.content);
          } else if (info.msg == "15") {
            // 打开设备ADB
            updateApp.shell(
              {
                command: "start adbd",
                root: true,
              },
              (res) => {
                console.log("打开ADB：", JSON.stringify(res));
              }
            );
          } else if (info.msg == "16") {
            // 关闭设备ADB
            updateApp.shell(
              {
                command: "stop adbd",
                root: true,
              },
              (res) => {
                console.log("关闭ADB：", JSON.stringify(res));
              }
            );
          } else if (info.msg == "17") {
            // 停止电教视频播放
            this.setEducationVideoInfo({
              url: "",
              type: 0,
              status: "stop",
            });
            this.setDynamicInfo("调试工具停止");
            this.controlDoubleDisplays("hide");
          } else if (info.msg == "18") {
            if (Reflect.has(info, "extend")) {
              let extend = JSON.parse(info.extend);
              if (Object.keys(extend).length) {
                this.loginStatusHanlder(extend);
                this.setCurrentTab(2);
              }
            } else {
              let admin = {
                name: "管理员",
                dabh: "099",
                rybh: "0999",
              };
              this.loginStatusHanlder(admin);
            }
          } else if (info.msg == "19") {
            clearInterval(this.timer);
            this.loginStatusHanlder({});
            this.setCurrentTab(1);
          }
        } else if (info.type == this.$config.controlType.DUTY) {
          if (info.msg === "2") {
            this.resetDutyTimer();
            let dutyData = JSON.parse(info.extend);
            this.setDutyList(dutyData.personList);
            let signSpace = dutyData.signSpace ?? 15;
            let totalTime = dutyData.totalTime ?? "120";
            this.dutyTimerInterval = Number(signSpace);
            this.dutyTotalCount = parseInt(
              Number(totalTime) / this.dutyTimerInterval
            );
            this.saveNotification();
            this.setDutyTimer();
          }
        }
      });
    },
    // 停止播放广播
    stopRadioHandler(status) {
      this.radioPlayState = false;
      if (this.educationVideoInfo.status === "play") {
        this.controlDoubleDisplays("show", this.educationVideoInfo.url);
      }
      this.setIsMediaMuted(true);
      console.log("停止广播");
      this.stopLivePusher();
      this.setShowMediaPlayer(false);
      this.receiveTask("radio", `${status}`);
    },
    // 停止播放音频
    stopAudioHandler(status) {
      this.audioPlayState = false;
      clearInterval(this.audioTimer);
      innerAudioContext.stop();
      this.receiveTask("audio", `${status}`);
    },
    // 停止播放视频
    stopVideoHandler(status) {
      this.videoPlayState = false;
      clearInterval(this.videoTimer);
      this.stopVideo();
      this.receiveTask("video", `${status}`);
    },
    // 分机广播回传音量
    radioVolumeHandler(info, msg) {
      let volume = getApp().globalData.HarUtils.getVolume(3);
      uni.setStorageSync("mediaDefaultVolume", volume);
      let terminalCode = uni.getStorageSync("terminalInfo").code;
      let terminalObj = {
        maindevno: info.maindevno,
        devno: terminalCode,
        type: "200",
        msg,
        extend: volume,
      };
      this.sendWebsocket(JSON.stringify(terminalObj));
    },
    // 设置值班签到定时器
    setDutyTimer() {
      this.dutyTimer = setInterval(() => {
        this.dutyCount += 1;
        this.saveNotification();
        if (this.dutyCount === this.dutyTotalCount) {
          this.resetDutyTimer();
          return;
        }
      }, this.dutyTimerInterval * 1000);
    },
    // 重置值班签到定时器
    resetDutyTimer() {
      this.dutyTimer && clearInterval(this.dutyTimer);
      this.dutyTimer = null;
      this.dutyCount = 1;
    },
    // 发起监室消息通知
    async saveNotification() {
      let namesArr = [];
      this.dutyList.forEach((item) => {
        namesArr.push(item.name);
      });
      let params = {
        roomId: uni.getStorageSync("terminalInfo").roomId,
        msgType: 5, // 4 服药提醒、5值班提醒
        content: `请${namesArr.join("、")}进行值班签到`,
      };
      let res = await Api.apiCall(
        "post",
        Api.index.saveNotification,
        params,
        true
      );
    },
    // 获取首页数据
    initHomeData(state) {
      // 获取警官信息
      this.getPoliceInfo();
      // 获取监室人数
      this.getPrisonerNum();
      // 获取动态信息
      this.getDynamicInfo(state);
    },
    // 打开监室等级时间周期弹框
    openRoomLevelModal() {
      if (this.roomLevel == "严管监室") {
        this.showLevelTimeModal = true;
        this.levelTimer = setTimeout(() => {
          clearTimeout(this.levelTimer);
          this.showLevelTimeModal = false;
        }, 8000);
      }
    },
    webSocketReConnct() {
      clearTimeout(this.socketTimer);
      // 重置会话，如不重置，重复创建会话对象，不知资源是否会释放
      if (this.socketTask != null) {
        this.socketTask.close({
          success: (res) => {
            console.log(JSON.stringify(res), "关闭WebSocket成功！");
          },
          fail: (err) => {
            console.log(JSON.stringify(err), "关闭WebSocket失败！");
          },
        });
        this.socketTask = null;
      }
      this.webSocketOff();
      this.showVideoConnect = false;
      this.reconnectCount++;
      this.socketTimer = setTimeout(() => {
        console.log(
          "create，清除this.socketTimer定时器，触发重连机制",
          uni.getStorageSync("terminalInfo").code
        );
        this.connectWebSocketInit(uni.getStorageSync("terminalInfo").code);
      }, this.websocketTime);
    },
    webSocketOff() {
      // 离线标记
      this.showDevOffline = true;
      // websocket 断开标记
      getApp().globalData.webSocketConnected = false;
      // 系统配置信息
      this.sysWebSocketInfo = "";
      // 打开重复认证终端
      this.isWebSocketDisable = false;
    },
    webSocketOn() {
      getApp().globalData.webSocketConnected = true;
      this.sysWebSocketInfo = "已连接";
      this.sysCacheInfo = "配置系统缓存成功！";
      // 禁用重复认证终端
      this.isWebSocketDisable = true;
      this.showDevOffline = false;
      this.reconnectCount = 0;
    },
    delPrisonerFingerId(ids) {
      this.initFingerPrint();
      setTimeout(() => {
        if (this.isOpen) {
          let res = 0;
          for (let i = 0; i < ids.length; i++) {
            getApp().globalData.Fingerprint.deleteID(ids[i]);
            res++;
          }
          if (res > 0) {
            console.log("删除在押人员指纹成功！");
          } else {
            console.log("删除在押人员指纹失败！");
            this.handleShowToast("删除在押人员指纹失败！");
          }
          getApp().globalData.Fingerprint.close();
          this.isOpen = false;
        } else {
          console.log("请先连接设备！");
        }
      }, 1500);
    },
    // 同步在押人员指纹
    syncPrisonerFinger() {
      this.initFingerPrint();
      setTimeout(() => {
        if (this.isOpen) {
          let res = getApp().globalData.Fingerprint.deleteAll();
          if (res == 0) {
            console.log("删除全部指纹成功");
            // 同步在押人员信息
            this.syncPersonFingerInfo();
          } else {
            console.log("删除全部指纹失败");
            this.handleShowToast("删除全部指纹失败");
          }
        } else {
          console.log("请先连接设备");
        }
      }, 1500);
    },
    // 同步在押人员指纹信息
    async syncPersonFingerInfo() {
      let { roomNo } = uni.getStorageSync("terminalInfo");
      let res = await Api.apiCall(
        "get",
        Api.index.syncRoomPersonFingerInfo,
        { roomNo }
      );
      if (res.state.code == "200") {
        let successNum = 0,
          failNum = 0,
          successList = [],
          failList = [];
        res.data.map((item) => {
          if (!!item.mKey) {
            let result = getApp().globalData.Fingerprint.setTemplate(
              item.mKey,
              str2Array(item.pHint)
            );
            if (!result) {
              successNum++;
              successList.push(item.mKey);
            } else {
              failNum++;
              failList.push(item.mKey);
            }
          }
        });
        this.closeModal("PrisonerFinger");
        console.log(`同步在押人员指纹成功${successNum}个，失败${failNum}个`);
        this.handleShowToast(
          `同步在押人员指纹成功${successNum}个，失败${failNum}个`
        );
        getApp().globalData.Fingerprint.close();
        this.isOpen = false;
        let content = `设备指纹特征同步结果：监室号：${roomNo}，成功：${successList}，失败：${failList}`;
        this.saveFingerStateInfo(content, "06");
      }
    },
    // 保存指纹同步状态（成功|失败）信息
    async saveFingerStateInfo(content, type) {
      let res = await Api.apiCall(
        "post",
        Api.index.saveFingerState + `?content=${content}&logType=${type}`,
        null
      );
      if (res.state.code == "200") {
        this.handleShowToast("保存同步指纹信息成功");
      }
    },
    // 设备连接
    initFingerPrint() {
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
    // 获取指纹认证登录人员信息
    async getLoginPersonInfo(mKey) {
      let params = {
        roomNo: uni.getStorageSync("terminalInfo").roomNo,
        mKey,
      };
      let url =
        this.currentTab == 2
          ? Api.index.getOdsPrisonerInfo
          : Api.index.getOdsPoliceInfo;
      let res = await Api.apiCall("get", url, params, true);
      if (!this.showRecognitionDialogs) return;
      if (res.state.code == "200") {
        this.closeModal("RecognitionDialogs");
        // this.initCountTimeout();
        this.loginStatusHanlder(res.data);
      }
    },
    // 设置人脸认证登录人员信息
    async faceVerificationLogin(res) {
      this.closeModal("RecognitionDialogs");
      // this.initCountTimeout();
      this.loginStatusHanlder(res);
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
    // 关闭指纹连接
    closeFingerPrint() {
      if (this.isOpen) {
        let res = getApp().globalData.Fingerprint.close();
        if (res == 0) {
          clearInterval(this.timer);
          this.isOpen = false;
          this.showFingerInit = false;
          // this.initCountTimeout();
          console.log("设备关闭成功");
        } else {
          console.log("设备关闭失败");
          this.handleShowToast("设备关闭失败");
        }
      }
    },
    // 视频通话弹框
    handleVideoConnect() {
      if (!this.isRepeatState) {
        this.isRepeatState = true;
        setTimeout(() => {
          this.isRepeatState = false;
        }, 3000);
        if (!getApp().globalData.webSocketConnected) {
          this.showVideoCall = false;
          this.showVideoConnect = false;
          this.showDevOffline = true;
          return;
        }
        this.voiceBroadcast("正在发起视频通话");
        this.showVideoCall = false;
        this.showVideoConnect = true;
        let code = uni.getStorageSync("terminalInfo").code;
        this.sendWebsocket(
          `{maindevno:'', devno:'${code}', type:'100', msg:'4'}`
        );
      }
    },
    // 应急报警弹框
    handleAlarmConfirm() {
      if (!this.isRepeatState) {
        this.isRepeatState = true;
        setTimeout(() => {
          this.isRepeatState = false;
        }, 3000);
        if (!getApp().globalData.webSocketConnected) {
          this.showAlarmInit = false;
          this.showVideoConnect = false;
          this.showDevOffline = true;
          return;
        }
        if (this.alarmCount == 0) {
          this.voiceBroadcast("正在发起应急报警");
          this.saveAlarmInfo();
        } else {
          this.showAlarmInit = false;
          return;
        }
        this.alarmTimer = setInterval(() => {
          this.alarmCount++;
          if (this.alarmCount == this.keyAlarmTime) {
            clearInterval(this.alarmTimer);
            this.alarmCount = 0;
          }
        }, 1000);
      }
    },
    // 获取应急报警信息
    async saveAlarmInfo() {
      let terminalId = uni.getStorageSync("terminalInfo").id;
      let params = {
        alarmEvents: "1",
        alarmLevel: "1",
        status: "n",
        terminalId: terminalId,
      };
      let res = await Api.apiCall(
        "post",
        Api.index.saveAlarmInfo,
        params,
        true
      );
      if (res.state.code == "200") {
        let code = uni.getStorageSync("terminalInfo").code;
        let roomName = uni.getStorageSync("terminalInfo").roomName;
        let alarmId = res.data.id;
        this.sendWebsocket(
          `{maindevno:'', devno:'${code}', type:'500', msg:'0',extend:{'roomName':'${roomName}', 'alarmId':'${alarmId}'}}`
        );
        this.closeModal("AlarmInit");
      }
    },
    // 登出
    handleLogout() {
      clearInterval(this.timer);
      // this.initCountTimeout();
      this.loginStatusHanlder({});
      if (![6].includes(this.currentTab)) {
        this.setCurrentTab(1);
      }
    },
    // 登录状态处理方法
    loginStatusHanlder(info = {}) {
      if (Object.keys(info).length) {
        this.setPersonInfo(info);
        this.person.id = info.rybh;
        this.person.name = info.name;
        this.setLoginState(true);
      } else {
        this.setPersonInfo({});
        this.person.id = "";
        this.person.name = "";
        this.setLoginState(false);
      }
    },
    // 页面回退
    handleFallBack() {
      // this.initCountTimeout();
      this.setCurrentTab(2);
    },
    // 底栏设置
    handleSetUp() {
      if (this.currentTab == 1) {
        if (this.clickNums == 3) {
          this.clickNums = 0;
          this.setupState = true;
          this.showSystemPwd = true;
        } else {
          this.clickNums = this.clickNums + 1;
        }
      }
    },
    // 清理缓存
    clearALLCache() {
      uni.showModal({
        title: "提示",
        content: "是否确定清除App所有数据存储缓存？",
        success: res => {
          if (res.confirm) {
            uni.clearStorageSync();
            uni.removeStorageSync("saveCartList");
            this.sysCacheInfo = "";
            this.webSocketOff();
            if (this.socketTask) {
              this.socketTask.close({
                success: (res) => {
                  console.log(JSON.stringify(res), "关闭WebSocket成功！");
                },
                fail: (err) => {
                  console.log(JSON.stringify(err), "关闭WebSocket失败！");
                },
              });
            }
          } else if (res.cancel) {
          }
        },
      });
    },
    // 切换登录模式回调
    switchRecognitionMode(mode) {
      // this.initCountTimeout();
    },
    // 指纹认证成功回调
    fingerRecognitionSuccess(res) {
      if (!this.showRecognitionDialogs) return;
      this.getLoginPersonInfo(res.mKey);
    },
    // 人脸认证成功回调
    faceRecognitionSuccess(res) {
      if (!this.showRecognitionDialogs) return;
      this.faceVerificationLogin(res);
    },
    // 认证失败回调
    recognitionFail() {
      this.closeRecognitionDialogs();
    },
    // 登录弹框关闭回调
    closeRecognitionDialogs() {
      clearInterval(this.timer);
      // this.initCountTimeout();
      this.closeModal("RecognitionDialogs");
      if (![6].includes(this.currentTab)) {
        this.setCurrentTab(1);
      }
    },
    // 新增视频点播操作动态
    async setDynamicInfo(state) {
      if (this.isCalling) return;
      let params = {
        controlId: uni.getStorageSync("terminalInfo").controlId,
        type: "402",
        content: `${state}${uni.getStorageSync("terminalInfo").name}电教视频`,
        operationTime: dateFormat("YYYY-MM-DD", new Date()),
      };
      let res = await Api.apiCall(
        "post",
        Api.index.setDynamicInfo,
        JSON.stringify(params)
      );
      if (res.state.code == "200") {
        this.handleShowToast("保存视频播放动态成功！");
      } else {
        this.handleShowToast("保存视频播放动态错误！");
      }
    },
    // 回传电教播放信息
    async callbackEduVideoInfo(status) {
      let code = uni.getStorageSync("terminalInfo").code;
      await Api.apiCall(
        "get",
        Api.index.updateEduTaskStatus + `${code}` + `&status=${status}`,
        null
      );
    },
    // 开始视频播放
    startVideo() {
      if (this.currentTab == 2) {
        this.closeRecognitionDialogs();
      }
      this.bgVideoStyle = {
        width: "1920px",
        height: "1080px",
      };
      this.videoContext.play();
    },
    // 停止视频播放
    stopVideo() {
      this.videoContext.stop();
      this.closeVideo();
      this.bgVideoUrl = "";
    },
    // 最小化视频
    closeVideo() {
      this.videoContext.exitFullScreen();
      this.bgVideoStyle = {
        width: "1px",
        height: "1px",
      };
    },
    // 开启双屏异显
    controlDoubleDisplays(type, url = "") {
      let num = getApp().globalData.DoubleDisplays.getDisplayNums();
      if (Number(num) > 1) {
        switch (type) {
          case "show":
            if (this.isCalling) return;
            getApp().globalData.DoubleDisplays.show(url);
            break;
          case "hide":
            this.errorStatus = false;
            getApp().globalData.DoubleDisplays.hide();
            this.openAudioOutput();
            break;
          case "pause":
            getApp().globalData.DoubleDisplays.pause();
            this.openAudioOutput();
            break;
          case "resume":
            if (this.isCalling) return;
            getApp().globalData.DoubleDisplays.resume();
            break;
          default:
            getApp().globalData.DoubleDisplays.hide();
            this.openAudioOutput();
            break;
        }
      } else {
      }
    },
    // 打开自身设备音频输出
    openAudioOutput() {
      let logTxt = "";
      try {
        // Speaker Channel Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 2 1 1",
            root: true,
          },
          (res) => {
            logTxt += "【open tinymix -D 1 2 1 1 -> ";
          }
        );

        //  OUT Playback Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 6 1 1",
            root: true,
          },
          (res) => {
            logTxt += "open tinymix -D 1 6 1 1 -> ";
          }
        );
        // OUT Channel Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 7 1 1",
            root: true,
          },
          (res) => {
            logTxt += "open tinymix -D 1 7 1 1 -> ";
          }
        );
        // Speaker L Playback Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 89 1",
            root: true,
          },
          (res) => {
            logTxt += "open tinymix -D 1 89 1 <-】";
            Log.writeLog(logTxt, false);
          }
        );

        // Speaker L Playback Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 90 1",
            root: true,
          },
          (res) => {
            logTxt += "open tinymix -D 1 90 1 <- 】";
            Log.writeLog(logTxt, false);
          }
        );
      } catch (error) { }
    },
    // 关闭自身设备音频输出
    closeAudioOutput() {
      setTimeout(() => {
        let logTxt = "";
        // Speaker Channel Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 2 0 0",
            root: true,
          },
          (res) => {
            logTxt += "【close tinymix -D 1 2 0 0 -> ";
          }
        );

        //  OUT Playback Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 6 0 0",
            root: true,
          },
          (res) => {
            logTxt += "close tinymix -D 1 6 0 0 -> ";
          }
        );

        // OUT Channel Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 7 0 0",
            root: true,
          },
          (res) => {
            logTxt += "close tinymix -D 1 7 0 0 -> ";
          }
        );

        // Speaker L Playback Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 89 0",
            root: true,
          },
          (res) => {
            logTxt += "close tinymix -D 1 89 0 -> ";
            Log.writeLog(logTxt, false);
          }
        );

        // Speaker R Playback Switch
        updateApp.shell(
          {
            command: "tinymix -D 1 90 0",
            root: true,
          },
          (res) => {
            logTxt += "close tinymix -D 1 90 0 <- 】";
            Log.writeLog(logTxt, false);
          }
        );
      }, 5000);
    },
    // 通知后端当前任务状态
    receiveTask(task, status) {
      let terminalCode = uni.getStorageSync("terminalInfo").code;
      this.sendWebsocket(
        `{maindevno:'', devno:'${terminalCode}', type:'000', msg:'1',extend:{'task':${task},'status':${status}}}`
      );
    },
    // 打开弹框
    openModal(type) {
      this[`show${type}`] = true;
    },
    // 关闭弹框
    closeModal(type) {
      this[`show${type}`] = false;
      if (type == "FingerInit") {
        clearInterval(this.timer);
        clearInterval(this.loginTimer);
        this.closeFingerPrint();
        if (![6].includes(this.currentTab)) {
          this.setCurrentTab(1);
        }
      }
      if (type == "UpdateApp") {
        this.disabledClick = false;
      }
      if (type == "VideoCall") {
        this.intercomState = false;
      }
      if (type == "RestartDev") {
        this.intercomState = false;
      }
      if (type == "LevelTimeModal") {
        clearTimeout(this.levelTimer);
      }
    },
  },
};
</script>

<style lang="less">
@import "../../../common/less/index.less";
</style>
