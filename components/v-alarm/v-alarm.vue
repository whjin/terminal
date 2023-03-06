<template>
  <view class="v-alarm-container">
    <image class="v-alarm-cycle-image" src="/static/images/rotation/circle.png"></image>
    <view class="v-alarm-cape">
      <image class="v-alarm-cape-image" src="/static/images/rotation/radar.png"></image>
    </view>
    <view class="v-alarm-box">
      <common-icons iconType="iconalarm" size="76" color="#fff" @click="closeAlarm"></common-icons>
      <view class="v-alarm-content">
        <text>请{{personName}}进行签到</text>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'v-alarm',
  computed: {
    ...mapState({
      personName: state => state.app.personName,
    }),
  },
  methods: {
    closeAlarm () {
      this.$emit('close-alarm', false);
    },
  }
}
</script>

<style lang="less">
.v-alarm-container {
  width: 600upx;
  height: 600upx;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .v-alarm-cycle-image {
    width: 600upx;
    height: 600upx;
  }
  .v-alarm-cape {
    position: absolute;
    left: 50%;
    top: 0;
    transform-origin: left bottom;
    animation: rotate 5s linear infinite;
    .v-alarm-cape-image {
      width: 244.82upx;
      height: 288.96upx;
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }
    @keyframes rotate {
      0% {
        transform: rotate(0%);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
  .v-alarm-box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    .v-alarm-content {
      display: flex;
      flex-direction: column;
      text {
        font-family: Microsoft YaHei;
        font-size: 16upx;
        font-weight: 400;
        text-align: center;
        line-height: 28upx;
      }
    }
  }
}
</style>
