<template>
	<div>
			<button @click="clera" class="clear-btn">清除缓存</button>
	</div>
</template>
<script>
	export default {
		data() {
			return {}
		},
		methods: {
			clera() {
				localStorage.clear();
				this.$toast("清除成功了");
			}
		},
		created() {},
	}
</script>
<style scoped>
	.clear-btn {
    background-color: #0F90F9;
    border-radius: 0.04rem;
    display: block;
    margin: .5rem auto;
    width: 2rem;
    line-height: .5rem;
    font-size: 0.18rem;
    color: #fff;

	}
</style>