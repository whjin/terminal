const state = {
  // 当前页面
  currentTab: 1,
  // 点名类型
  rollType: "",
  // 在线点名ID
  rollId: "",
  // 临时点名信息
  rollInfo: {},
  // 人脸|指纹认证人员信息
  personInfo: {
    name: "",
    rybh: "",
    dabh: "",
    date: "",
  },
  // 播放组件显隐
  showPlayer: false,
  // 视频流地址
  playerUrl: "",
  // 首页状态栏显隐
  showBottomBar: true,
  // 返回首页状态
  homeState: true,
  // 后退状态
  backState: true,
  // 登录状态
  loginState: false,
  // 是否正在点名
  isCalling: false,
  // 是否正在对讲
  isTheIntercom: false,
  // 值班人员列表
  dutyList: [],
  // 是否对讲等待接听中
  isWaitingIntercom: false,
  // 电教视频信息
  educationVideoInfo: {
    url: "",
    type: 0,
    status: "stop",
  },
  // nodePlayer的使用状态
  nodePlayerStatus: false,
  // nodePlayer组件静音状态
  isMuted: false,
};

const mutations = {
  // 当前页面
  SET_CURRENTTAB(state, num) {
    state.currentTab = num;
  },
  // 点名类型
  SET_ROLLTYPE(state, type) {
    state.rollType = type;
  },
  // 在线点名ID
  SET_ROLLID(state, info) {
    state.rollId = info;
  },
  // 临时点名信息
  SET_ROLLINFO(state, info) {
    state.rollInfo = info;
  },
  // 指纹认证人员信息
  SET_PERSONINFO(state, info) {
    state.personInfo = info;
  },
  // 播放组件显隐
  SET_SHOWPLAYER(state, bool) {
    state.showPlayer = bool;
  },
  // 视频流地址
  SET_PLAYERURL(state, info) {
    state.playerUrl = info;
  },
  // 设置状态栏显隐
  SET_BOTTOMBAR(state, bool) {
    state.showBottomBar = bool;
  },
  // 设置返回首页状态
  SET_HOMESTATE(state, bool) {
    state.homeState = bool;
  },
  // 设置后退状态
  SET_BACKSTATE(state, bool) {
    state.backState = bool;
  },
  // 设置登录状态
  SET_LOGINSTATE(state, bool) {
    state.loginState = bool;
  },
  // 设置是否正在点名
  SET_ISCALLING(state, bool) {
    state.isCalling = bool;
  },
  // 设置是否正在对讲
  SET_ISTHEINTERCOM(state, bool) {
    state.isTheIntercom = bool;
  },
  // 值班人员列表
  SET_DUTYLIST(state, info) {
    state.dutyList = info;
  },
  // 设置是否对讲等待接听中
  SET_ISWAITINGINTERCOM(state, bool) {
    state.isWaitingIntercom = bool;
  },
  // 设置管教视频信息
  SET_EDUCATIONVIDEOINFO(state, info) {
    state.educationVideoInfo = info;
  },
  // 设置nodePlayer使用状态
  SET_NODEPLAYERSTATUS(state, bool) {
    state.nodePlayerStatus = bool;
  },
  // 设置nodePlayer组件静音状态
  SET_ISMUTED(state, bool) {
    state.isMuted = bool;
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
