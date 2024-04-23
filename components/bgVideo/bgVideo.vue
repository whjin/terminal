<template>
	<div class="bgVideo-container">
		<video id="bgVideo" class="bgVideo" :src="url" codec="software" :controls="false" :enable-play-gesture="false" :enable-progress-gesture="false" :vslide-gesture="false" :vslide-gesture-in-fullscreen="false" autoplay loop :style="videoStyle"></video>
	</div>
</template>

<script>
export default {
	name: "bgVideo",
	props: {
		url: {
			type: String,
			default: "",
		},
		videoStyle: {
			type: Object,
			default () {
				return {
					width: '1px',
					height: '1px'
				};
			}
		}
	},
};
</script>

<style lang="less">
.bgVideo-container {
	z-index: 999;
	width: 100%;
	height: 100%;
	position: fixed;
	left: 0;
	top: 0;
	pointer-events: none;
	background-color: transparent;
	.bgVideo {
		width: 100%;
		height: 100%;
		background-color: transparent;
	}
}
</style>
