<script>
import Api from "@/common/api.js";
import Log from "@/common/utils/log.js";

// 基础模块
const Base = uni.requireNativePlugin("GK-Base");
// 设备控制
const Utils = uni.requireNativePlugin("Utils");
// 升级APP
const UpdateApp = uni.requireNativePlugin("GK-UpdateApp");
// 看门狗
const CrashHandle = uni.requireNativePlugin("CrashHandle");
// 双屏异显
const DoubleDisplays = uni.requireNativePlugin("DoubleDisplays");
// 烽火系统控制
// const SystemModule = uni.requireNativePlugin("peakfire-nexus_SystemModule");
// 烽火指纹模块
// const FingerPrintModule = uni.requireNativePlugin("peakfire-nexus_FingerPrintModule");
// 来邦对讲模块
const FloatUniModule = uni.requireNativePlugin("FloatUniModule");

export default {
  onLaunch: function () {
    // #ifdef APP-PLUS	
    if (process.env.NODE_ENV == "production") {
      FloatUniModule.openGuard(1);
    }
    // 关闭防拆监听
    // SystemModule.disListen(68);
    // 设置通话音量
    // FloatUniModule.setStreamVolumeTypeVoiceCall(uni.getStorageSync("mediaDefaultVolume"));
    // 设置媒体音量
    // FloatUniModule.setStreamVolumeTypeMusic(uni.getStorageSync("mediaDefaultVolume"));
    CrashHandle.startGather(0); //开启日志，参数无效，默认保存着
    // 设置全屏
    plus.navigator.setFullscreen(true);
    // 添加week自定义字体规则
    let domModule = weex.requireModule("dom");
    domModule.addRule("fontFace", {
      fontFamily: "uniicons",
      src: "url('./static/uni.ttf')",
    });
    if (!!uni.getStorageSync("baseUrl")) {
      // 开启防拆监听
      // SystemModule.listen(68);
      // 初始化语音播报
      Base.speechInit();
      // 修改分机信息
      this.setTerminalInfo();
    }
    // #endif
  },
  onError (err) {
    Log.writeLog(`代码错误${err}`, false);
  },
  methods: {
    // 修改分机信息
    async setTerminalInfo () {
      let params = {
        data: {
          id: uni.getStorageSync("terminalInfo").id,
          code: uni.getStorageSync("terminalInfo").code,
          version: plus.runtime.version,
        }
      };
      let res = await Api.apiCall("post", Api.index.updateTerminal, params);
      if (res.state.code == "200") {
        console.log("修改信息成功");
      }
    },
  },
  globalData: {
    Base,
    Utils,
    UpdateApp,
    // SystemModule,
    DoubleDisplays,
    // FingerPrintModule,
    FloatUniModule,
    webSocketConnected: false,
  },
};
</script>

<style>
/* #ifndef APP-PLUS-NVUE */
@import './common/css/uni.css';
@import './static/icons/iconfont.css';
@import './common/css/home-img.css';
@import './common/css/header-img.css';
@import './common/css/navbar-img.css';
@import './common/css/police-img.css';
@import './common/css/prisoner-img.css';
@import './common/css/bgStyle-img.css';
@import './common/css/alarm-img.css';
@import './common/css/shopping-img.css';
@import './common/css/kitchen-img.css';
@import './common/css/notice-img.css';
@import './common/css/neilModal-img.css';
@import './common/css/picker-img.css';
@import './common/css/mood-img.css';
@import './common/css/keyboard-img.css';
@import './common/css/input-img.css';
@import './common/css/media-img.css';
@import './common/css/btn-img.css';
/* #endif*/
</style>
