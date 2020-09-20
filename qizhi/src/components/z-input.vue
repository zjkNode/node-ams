<template>
	<div class="hk-input" :class="{percent: type === 'percent' && !(curValue && active)}">
		<label v-if="label">{{label}}</label>
		<label v-if="disabled" class="text" :class="{empty:!value}" >{{value || placeholder || '请输入'+ label}}</label>
		<input v-else
			ref="input"
			:type="inputTypes[type] || 'text'" 
			@change="handleChange" 
			@focus="handleFocus" 
			@blur="handleBlur"
			@keyup="handleKeyup"
			
			@keyup.up="moveUp" 
			@keyup.down="moveDown"
			@keyup.enter="onEmailSelect()" 
			
			class="text" 
			:class="{error: hasError, active: active}" 
			:maxlength="type === 'phone' ? 11 : maxlength" 
			:placeholder="placeholder || '请输入'+ label" 
			v-model.trim="curValue" />
		<span v-show="curValue && active" class="del" @click="handleClear"></span>
		<template v-if="type === 'email'">
			<dl v-show="popEmailShow && emailList.length > 0 " class="pop-email" >
				<template v-for="(item, index) in emailList" >
					<dd v-if="item" :key='index' :class="{on: emailIndex === index}" @click="onEmailSelect(index)"><span>{{item.emailValue}}</span>{{item.suffix}}</dd>
				</template>
			</dl>
		</template>
	</div>
</template>
<script>
	import validators from '@/assets/js/validators';
	import utils from '@/assets/js/utils';

	export default {
		name: 'z-input',
		props: {
			type: {
				type: String,
				default: 'text' // text phone email password idCard
			},
    	sectionCode: String, // 当前组件实例化的父组件标识， 做数据组合验证时需要
			maxlength:{
				type: Number,
				default: 999				
			},
			label: String,
			placeholder: String,
			disabled: Boolean,
			rules: Array,
			value: String | Number,
			needUpCase:{
				type: Boolean,
				default: false				
			},
		},
		data() {
			return {
				active: false,
				hasError: false,
				inputTypes:{
					password: 'password',
					// phone: 'number',
					percent: 'number'
				},
				curValue: this.value,
				emailIndex: -1,
				popEmailShow: false,
				emailSuffix:['@163.com','@126.com','@qq.com','@sina.com']
			}
		},
		computed:{
			emailList(){
				if(this.type !== 'email') return [];
				let emailValue = this.curValue,
						suffix = '', 
						_index = this.curValue.indexOf('@'), 
						suffixList = this.emailSuffix;

				if(_index !== -1){
						emailValue = this.curValue.substring(0, _index);
						suffix = this.curValue.substring(_index);
						suffixList = this.emailSuffix.filter(item => item.startsWith(suffix));
				}
				
				return suffixList.map(suffix =>  { return {emailValue, suffix}; });
			}
		},
		watch:{
			value(val){ // 非初始化，在组件外部给组件赋值是用到 如联动效果
				this.curValue = val;
			},
			popEmailShow(value){
				this.emailIndex = value ? 0 : -1;
			},
			disabled(value){
				if(value){
					this.hasError = false;
				}
			}
		},
		methods: {
			getData(){
				if(this.type === 'idcard'){
					return this.idNoFormat(this.curValue);
				}
				return;
			},
			showError(message){
				this.hasError = true;
				message && this.$toast(message); 
			},
			clearError(){ // 在父组件中调用，清空出错标记
				this.hasError = false;
			},
			validate(eventType = 'blur'){
				this.clearError();
				if(this.disabled) return;

				if(!this.rules || this.rules.length === 0){
					return;
				}
				for(let i = 0; i < this.rules.length; i++){
					let rule = this.rules[i];
					let trigger = rule.trigger || 'blur'; // 默认blur 事件触发验证
					if(trigger != eventType) continue;
					
					if(!this.curValue){
						rule.required ? this.showError(rule.message) : this.clearError();
						return;
					}
					if(rule.validator){// sectionCode在父级组件验证时需要
						let validFn = validators[rule.validator];
						if(validFn){ // isEmail, isPhone, isIdCard, isIdName
							if(validFn(this.curValue)) continue; // 验证通过，继续下面验证

							this.showError(rule.message);
							return;
						}
						if(validators.execute(rule, this.sectionCode, this.type)) continue;// 验证通过，继续下面验证
							this.showError(rule.message);
							return;
					}
					
					// 长度验证
					let min = rule.min || 0;
					let max = rule.max || this.maxlength; 
					if(this.curValue && (this.curValue.length < min || this.curValue.length > max)){
						this.showError(rule.message);
						return;
					}
				}
			},
			emitEvent(eventType){ // 组件联动时触发的联动事件
				if(!this.value){
					return;
				}
				eventType === 'blur' && this.handleBlur();
				eventType === 'change' && this.handleChange();
			},
			handleFocus(){
				this.active = true;
				this.popEmailShow = true;
			},
			handleBlur(){
				setTimeout(() => {
					this.popEmailShow = false;
					this.active = false;
				}, 150);
				if(this.type === 'email' && this.emailList.length > 1){
					return;
				}
				this.$emit('input', this.curValue);
				this.$nextTick(() => { // 在点击clear 时 会先触发blur 这时this.curValue 还有值，再验证时还会提示错误
					this.validate('blur');
				});
				
				// 移动端 nextTick好用，但在pc端 点清除时会清不掉 待查原因
				// this.$nextTick(() => {
				// setTimeout(() => {
				// 	this.active = false;
				// 	this.popEmailShow = false;
				// 	this.$emit('input', this.curValue);
				// 	this.validate('blur');
				// }, 150)
				// });
			},
			handleChange(){
				this.$emit('input', this.curValue);
				this.validate('change');
				this.$emit('change');
				
				// this.$nextTick(() => {
				// 	this.validate('change');
				// 	this.$emit('change');
				// 	// !this.hasError && this.$emit('change')
				// });
			},
			handleKeyup(){
				if(this.needUpCase){
					this.curValue = this.curValue.toUpperCase()
				}
				this.popEmailShow = true;
				this.active = true;
				if(this.curValue){
					this.clearError();
				}
			},
			handleClear() {
				this.curValue = '';
				this.$emit('input', '');
				this.$emit('change');

				this.$refs.input.focus();
				// clear 也会触发 change事件
				// this.$emit('clear', '');
			},
			moveUp(){
				if(!this.popEmailShow || this.emailList.length === 0) return;

				if(this.emailIndex === 0){
					this.emailIndex = this.emailList.length - 1;
					return;
				}
				this.emailIndex--;
			},
			moveDown(){
				if(!this.popEmailShow || this.emailList.length === 0) return;

				if(this.emailIndex === this.emailList.length -1){
					this.emailIndex = 0;
					return;
				}
				this.emailIndex++;
			},
			onEmailSelect(index){
				this.clearError();
				if(!this.popEmailShow || this.emailList.length === 0) return;
				this.emailIndex = index || this.emailIndex;
				if(this.curValue) {
					let selEmail = this.emailList[this.emailIndex];
					this.curValue = selEmail.emailValue + selEmail.suffix;
				}
				this.$emit('input', this.curValue);
				this.validate('blur');
				this.popEmailShow = false;
			},
			idNoFormat(idNo){
				let idObj = {
					identifyNumber: idNo,
					birthday: '',
					// age: 0,
					sex: 1 // 1男  2女
				};
				if(!idNo || !validators.isIdCard(idNo)) return idObj;

				// const moment = require("moment");
				idObj.birthday = idNo.substr(6,4) +'-'+ idNo.substr(10,2) +'-'+ idNo.substr(12,2);
				idObj.sex = idNo.substr(16,1) % 2 === 1 ? 1 : 2; 
				// idObj.age = moment().diff(moment(idObj.birthday), 'years'); // 这里计算出来的age 不能用，因为业务上，age = 保时间-出生时间

				return idObj;
			},
		}
	}
</script>
<style lang="less" scoped>
	.hk-input {
		position: relative;
		display: flex;
		text-align: right;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		height: 100%;
		.text {
			margin-left: 0.1rem;
			text-align: inherit;
			font-size: inherit;
			flex: 1;
			border: none;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			color: #333;
			&.empty{color: #bbb;}
			&.error{color: #FF2F49;}
			&.error:-ms-input-placeholder{color: #FF2F49;}/* ie 10+  */
			&.error:-moz-placeholder{color: #FF2F49;}/* Firefox 18- */
			&.error::-moz-placeholder{color: #FF2F49;}/* Firefox 19+ */
			&.error::-webkit-input-placeholder{ color: #FF2F49;}
			&.active{color: initial;}
			&:disabled,&[disabled]{
				background:transparent;
				color: #333;
				-webkit-text-fill-color:#333; /*disabled 在ios下颜色变浅问题*/
				-webkit-opacity:1; 
				opacity: 1; 
			}
		}
		&.percent:after{
			content: '%';
			position: absolute;
			display: inline-block;
			width: 0.3rem;
			height: 0.25rem;
			right: -0.17rem;
		}
		.del {
			position: absolute;
			display: inline-block;
			background: url(../assets/images/icons/del_ico@2x.png) no-repeat center;
			background-size: 0.14rem 0.14rem;
			width: 0.3rem;
			height: 100%;
			right: -0.3rem;
		}
	}

	.pop-email{
		position: absolute;
		top: 0.28rem;
		left: 0;
		right: -0.18rem;
		box-sizing: border-box;
		max-height: 2rem;
		overflow-y: auto;
		background: #f5f8ff;
		box-shadow: 0 0.05rem 0.05rem rgba(0,0,0,0.2);
		padding: .05rem 0;
		z-index: 100;
		dd {
			line-height: .2rem;
			padding: 0.05rem 0.1rem;
			display: flex;
			span{
				text-align: right;
				flex: 1;
				display: inline-block;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space:nowrap;
			}
			&.on, &:hover{
				background:#f2f1f8;
			}
		}
	}
</style>