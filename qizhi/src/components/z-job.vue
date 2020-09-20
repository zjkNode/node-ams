<template>
	<div class="hk-job">
		<label v-if="label">{{label}}</label>
		<span class="text" 
			:class="{empty:!curItem.occupationName, disabled:disabled, error: hasError }" 
			@click="onJobShow">{{curItem.occupationName || placeholder || '请选择'+ label}}</span>
		
    <popJob ref="popJob" :value='value' :extend='extend' :sectionCode='sectionCode' @complete="onJopComplete"></popJob>
	</div>
</template>
<script>
	import validators from '@/assets/js/validators.js';
  import popJob from '../popJob.vue';
	export default {
    name: 'hk-job',
    components:{
      popJob
    },
		props: {
			label: String, //字段标题
			placeholder: String,
    	sectionCode: String, // 当前组件实例化的父组件标识， 做数据组合验证时需要
			disabled: Boolean, //是否只读
			rules: Array,
			value: String | Number,//默认key值，可以为对象
			extend:Object // 扩展属性
		},
		watch:{
			value(newValue){
				this.$refs.popJob.setCheckJob(newValue);
				if(!newValue){
					// this.$emit('change');
					this.curItem = {};
					return;
				}
				this.curItem.occupationCode = newValue;
			}
		},
		data() {
			return {
				hasError: false,
				curItem: {
					occupationType: '', //职业类别
					occupationCode: '', //职业代码
					businessSource: '', //行业代码     
					occupationName:'',//职业名称
					lifeInsrat:'',//职业级别
					occupationProlevel:'',  // 职业级别 接口反参为lifeInsrat  入参为occupationProlevel
				},
			}
		},
		methods: {
			getData(){
				return {
					occupationType: this.curItem.occupationType,
					occupationCode: this.curItem.occupationCode,
					occupationName: this.curItem.occupationName,
					occupationProlevel: this.curItem.lifeInsrat,
				};
			},
			showError(message){
				this.hasError = true;
				message && this.$toast(message);
			},
			clearError(){ // 在父组件中调用，清空出错标记
				this.hasError = false;
			},
			validate(eventType = 'change'){
				this.clearError();
				if(!this.rules || this.rules.length === 0){
					return;
				}

				for(let i = 0; i < this.rules.length; i++){
					let rule = this.rules[i];
					let trigger = rule.trigger || 'change'; // 默认change 事件触发验证
					if(trigger != eventType) continue;

					if(!this.curItem.occupationName){
						rule.required && this.showError(rule.message);
						return;
					}

					if(rule.validator){// sectionCode在父级组件验证时需要
						let validFn = validators[rule.validator];
						if(validFn){ 
							if(validFn(this.curItem)) continue; // 验证通过，继续下面验证
							this.showError(rule.message);
							return;
						}
						if(validators.execute(rule, this.sectionCode, this.type)) continue;// 验证通过，继续下面验证
						this.showError(rule.message);
						return;
					}

				}
			},
			// emitEvent(eventType){
			// 	if(!this.value){
			// 		return;
			// 	}
			// 	eventType === 'change' && this.onJopComplete(this.value);
			// },
			onJobShow() {
				if(this.disabled) return;

        this.stopScroll();
        this.$refs.popJob.open();
			},
			onJopComplete(checkJobs){
				this.clearError();
				if(!checkJobs || checkJobs.length === 0){
					this.$emit('change');
					this.curItem = {};
					return;
				}
				this.curItem = checkJobs[checkJobs.length - 1];
				
				// 触发value变化后，popJob对value的watch 会起作用，选中的job会重复
				this.$emit('input', this.curItem.occupationCode);
      	this.validate('change');
				this.$emit('change');
				if(this.hasError){
					this.curItem = {};
					return
				}
				this.enableScroll();
				this.$refs.popJob.close();
			}
		}
	}
</script>
<style lang="less" scoped>
	.hk-job {
		display: flex;
		text-align: right;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		position: relative;
		.text {
			text-align: inherit;
			font-size: inherit;
			flex: 1;
			margin-left: 0.1rem;
			height: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			
			&.empty {color: #bbb;}
			&.error{color: #FF2F49;}

			&:after {
				content: ' ';
				position: absolute;
				display: inline-block;
				background: url(../../assets/images/icons/arr_right.png) no-repeat center;
				background-size: auto 0.14rem;
				width: 0.3rem;
				height: 100%;
				right: -0.3rem;
			}
			&.disabled:after {
				display: none;
			}
		}
	}
	
	.pop-picker {
		background: #fff;
		width: 100%;
		.toolbar {
			border-bottom: 1px solid #eee;
			height: 0.5rem;
			line-height: 0.5rem;
			display: flex;
			text-align: center;
		}
		.title {
			flex: 1;
		}
		.btn {
			padding: 0 0.14rem;
			color: #0F90F9;
		}
	}
</style>