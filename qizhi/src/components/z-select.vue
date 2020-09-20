<template>
	<div class="hk-select">
		<label v-if="label" :class="{help: helpVisible}" @click="onLabelClick">{{label}}</label>
		<span class="text" 
			:class="{empty:(!curItem.value && curItem.value != 0), disabled:(disabled || slots[0].values.length <= 1), error: hasError}" 
			@click="onPickerShow">{{curItem.name || placeholder || '请选择'+label}}</span>

		<mt-popup v-model="pickVisible" position="bottom" :closeOnClickModal="false" class="pop-picker">
			<div class="toolbar">
				<span class="btn" @click="onCanel">取消</span>
				<span class="title">请选择</span>
				<span class="btn" @click="onConfirm">确定</span>
			</div>
			<mt-picker v-if="pickVisible" ref="picker" :slots="slots" value-key="name"></mt-picker>
		</mt-popup>

		<mt-popup v-model="bankVisible" position="bottom" :closeOnClickModal="false" class="pop-picker">
			<div class="toolbar">
				<span class="title">银行</span>
				<span class="title">账户类型</span>
				<span class="title">限额</span>
			</div>
			<!-- <div class="tablers"> -->
				<ul class="bank-list" @touchmove.stop>
					<li v-for="(bank, index) in bankList" :key="index">
						<div>{{bank.name}}</div>
						<div>{{bank.type | bankTypeFilter}}</div>
						<div v-html="bank.desc"></div>
					</li>
				</ul>
			<!-- </div> -->
			<div class="btn full" @click="onBankClose">我知道了</div>
		</mt-popup>
	</div>
</template>
<script>
	import validators from '@/assets/js/validators';
	export default {
		name: 'hk-select',
		props: {
			type: String,
			label: String, //字段标题
			placeholder: String,
			disabled: Boolean, //是否只读
			sectionCode: String, // 当前组件实例化的父组件标识， 做数据组合验证时需要
			rules: Array,
			value: String | Number,
			options: {
				type: Array,
				default(){ return []; }
			}, //下拉的选项
			extend: {
				type: Object,
				default(){ 
					return { }; 
				}
			}, // 数据项配置信息
		},
		filters:{
			bankTypeFilter(type){
				let typeKeys = type.split(',');
				let bankType = {1:'借记卡', 2: '存折', 3: '贷记卡'}
				let typeNames = typeKeys.map(key => bankType[key]);
				return typeNames.join('/');
			}
		},
		data() {
			return {
				pickVisible: false,
				slots: [{
					flex: 1,
					values: [],
					textAlign: 'center'
				}],
				curItem: {},
				tmpItem: {},
				hasError: false,

				helpVisible: false, // 开户行
				bankVisible: false,
				bankList: [],
			}
		},
		watch:{
			value(val) { // 非初始化，在组件外部给组件赋值是用到 如联动效果
				// console.log('watch', this.label, this.value)
				// options里是全的数据 this.slots[0].values 是过滤hidden后数据，再重新显示时会报错，eg:03
				if(this.type === 'bank'){
					this.tmpItem = this.curItem = this.bankList.find(item => item.value === val) || {};
					return;
				}
				this.tmpItem = this.curItem = this.options.find(item => item.value === val) || {};
			},
			options(newOptions){ // 控制可选项显隐，在投保详情页用到， eg:04 产品
				this.slots[0].values = newOptions.filter(opt => !opt.hidden) || [];
			}
		},
		created() {
			if(this.type === 'bank'){
				this.loadBanks();
				return;
			}
			if(this.options.length === 0) return;
			this.slots[0].values = this.options.filter(opt => !opt.hidden);
			let _selItem = this.options.find(item => item.value === this.value);
			this.tmpItem = this.curItem = _selItem || this.curItem;
		},
		methods: {
			getData(){
				return;
			},
			showError(message){
				this.hasError = true;
				message && this.$toast(message);
			},
			clearError(){ // 在父组件中调用，清空出错标记
				this.hasError = false;
			},
			validate(){
				if(!this.rules || this.rules.length === 0){
					return;
				}
				for(let i = 0; i < this.rules.length; i++){
					let rule = this.rules[i];
					if(!this.tmpItem.name){
						rule.required && this.showError(rule.message);
						return;
					}
					if(rule.validator){// sectionCode在父级组件验证时需要
						let validFn = validators[rule.validator];
						if(validFn){
							if(validFn(this.tmpItem)) continue; // 验证通过，继续下面验证

							this.showError(rule.message);
							return;
						}
						if(validators.execute(rule, this.sectionCode)) continue;// 验证通过，继续下面验证
						this.showError(rule.message);
						return;
					}
				}
			},
			emitEvent(eventType){ // 组件联动时触发的联动事件
				// if(!this.value){
				// 	return;
				// }
				eventType === 'change' && this.$emit('change');
			},
			onPickerShow() {
				if(this.disabled || this.slots[0].values.length <= 1) return;

				this.pickVisible = true;
				this.stopScroll();
				this.$nextTick(() => {
					this.$refs.picker.setSlotValue(0, this.curItem.value ? this.curItem : this.slots[0].values[0]);
				});
			},
			onCanel() {
				this.pickVisible = false;
				this.enableScroll();
			},
			onConfirm() {
				this.onCanel();
				this.clearError();
				this.tmpItem = this.$refs.picker.getSlotValue(0);
				this.$emit('input', this.tmpItem.value); // 给控件传参，方便后面的验证逻辑
				this.validate();
				if(this.hasError){
					this.clearError();// 模拟选不中的状态
					this.$emit('input', this.curItem.value);// 回滚选中值
					return;
				}
				this.curItem = this.tmpItem;
				this.$emit('change')
			},
			onLabelClick(){
				if(!this.helpVisible){
					return;
				}

				this.bankVisible = true;
				this.stopScroll();
			},
			onBankClose(){
				this.bankVisible = false;
				this.enableScroll();
			},
			loadBanks(){
				this.$axios.post('/hk-insurance-shop/bankDetail/queryBankByInsurerCode',{
					saleItemId: this.$route.params.code || this.extend.proCode
				}).then(res => {
					if(!res.responseBody) return;

					this.bankList = res.responseBody.bankInfo.map(bank => {
						return {
							value: bank.bankCode,
							name: bank.bankName,
							type: bank.bankType || '1',
							desc: bank.singleDesc
						}
					});
					console.log(this.bankList)
					this.helpVisible = this.bankList.filter(item => !!item.desc).length > 0;
					this.slots[0].values = this.bankList;
					let _selItem = this.bankList.find(item => item.value === this.value);
					this.tmpItem = this.curItem = _selItem || this.curItem;
				});
			}
		}
	}
</script>
<style lang="less" scoped>
	.hk-select {
		display: flex;
		text-align: right;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		position: relative;

		.help{
			padding-right: 0.24rem;
			position: relative;
			&:after{
				content:' ';
				background: url(../../assets/images/icons/help_ico.png) no-repeat center;
				background-size: 100%;
				width: 0.16rem;
				height: 0.16rem;
				position: absolute;
				display: inline-block;
				right: 0.04rem;
				top:0.07rem;
			}
		}
		.text {
			text-align: inherit;
			font-size: inherit;
			// flex: 1;
			margin-left: 0.1rem;
			height: 100%;
			color: #333;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			&.empty{color: #bbb;}
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
			&.full{
				background: #0F90F9;
				color: #fff;
				text-align: center;
				font-size: 0.15rem;
				height: 0.5rem;
				line-height: 0.5rem;
			}
		}
		.bank-list {
			border-collapse: collapse;
			height: 3.7rem;
			display: block;
			overflow: auto;
				li{ display: flex; 
					div {
						border-bottom: 1px solid #eee;
						height: 0.5rem;
						color: #666;
						flex: 1;
						display: flex;
						align-items: center;
						justify-content: center;
					}
				}
		}

	}
</style>