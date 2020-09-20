<template>
  <div class="hk-date">
    <label>{{label}}</label>
    <div style="flex:1;display:flex;">
      <span 
        v-show="!longChecked" 
        class="text" 
        :disabled="disabled"
        :class="{ empty:!curDate, error: hasError}" 
        @click="onClick">{{ curDate || placeholder || '请选择' + label}}</span>
      <span v-if="isLong && !disabled" class="long" :class="{checked:longChecked}" @click="onLongClick">长期</span>
    </div>
    <mt-datetime-picker v-if="pickerVisible"
      type="date" 
      ref="dtPicker" 
      year-format="{value} 年" 
      month-format="{value} 月" 
      date-format="{value} 日" 
      @cancel="onDTCancel"
      @confirm="onDTConfirm" 
      :startDate="startDate" 
      :endDate="endDate"
      :closeOnClickModal="false"
      v-model="defaultDate">
    </mt-datetime-picker>
  </div>
</template>
<script>
import utils from '@/assets/js/utils'
import validators from '@/assets/js/validators.js';
export default {
  name:'hk-date',
  props: {
    type: String,
    label: String, //字段标题
    placeholder: String,
    disabled: Boolean, //是否只读
    sectionCode: String, // 当前组件实例化的父组件标识， 做数据组合验证时需要
    value: {
      type: String,
      defaul(){
        return ''
      }
    },//默认key值，可以为对象
    rules: Array, // 验证规则
    extend: {
      type: Object,
      default(){ 
        return { }; //{ startDate:String, endDate:String, isLong: boolean, expValue:'T+1|YYYY-MM-DD 00:00:00' }
      }
    }, // 数据项配置信息
  },
  data(){
    return {
      pickerVisible: false,
      curDate: this.value,
      defaultDate: '',
      startDate: null,
      endDate: '2999-12-30',
      longChecked: false,
      isLong: false,
      hasError: false,
      isLongClick: false,
    }
  },
  watch:{ // value 改变时，页面展示值也变，用于组件外给对象赋值的情况
    value(val) {
      console.log('watch',val)
      if(this.type === 'datePeriod' && val === '2999-12-30'){// 代表长期
        this.defaultDate = utils.getDateTime(); // 设置默认选中时间值
        this.curDate = '';
        this.longChecked = true;
        return;
      }
      this.curDate = val === 'T' ? '' : val;
      this.longChecked = this.isLongClick ? this.longChecked : false;
      
      let _defaultDate = val ? val.split(' ')[0] : '';
      if(val === '9999-12-31'){
        this.curDate = '终身';
        _defaultDate = '';
      }
      this.defaultDate = utils.getDateTime(_defaultDate); // 设置默认选中时间值
    },
    disabled(val){ // disabled 改变时，控件上的error标识需要清除
      if(val){
        this.hasError = false;
      } 
    }, 
    extend(val){ // 起止时间联动时，修改日历控件起止时间
      if(this.disabled){
        return;
      }
      this.startDate = new Date(utils.getDateTime(val.startDate || this.startDate));
      this.endDate = new Date(utils.getDateTime(val.endDate || this.endDate));
    }
  },
  created(){
    if(this.type === 'datePeriod' && this.value === '2999-12-30'){
      this.curDate = '';
      this.longChecked = true;
    }
    let _defaultDate = this.value ? this.value.split(' ')[0]: '';

    if(this.value === 'T'){ 
      this.curDate = '';
    }
    if(this.value === '9999-12-31'){// 9999-12-31 终身
      this.curDate = '终身';
      _defaultDate = '';
    }
    this.isLong = this.extend.isLong || false;
    this.defaultDate =  utils.getDateTime(_defaultDate);
    this.startDate = new Date(utils.getDateTime(this.extend.startDate || this.startDate));
    this.endDate = new Date(utils.getDateTime(this.extend.endDate || this.endDate));
  },
  methods:{
    getData(){ // 组件 实现 getData 接口的，可以实现多字段返回
      if(this.type === 'datePeriod'){ // 证件有效期
        return {
          identifyEndTime: this.curDate,
          identifyEndFlag: this.longChecked
        };
      }
    },
    showError(message){
      this.hasError = true;
      message && this.$toast(message);
    },
    clearError(){ // 在父组件中调用，清空出错标记
      this.hasError = false;
    },
    validate(eventType = 'change'){
      if(this.disabled) return; // 不可编辑的内容不需要验证

      if(!this.rules || this.rules.length === 0){
        return;
      }
      for(let i = 0; i < this.rules.length; i++){
        let rule = this.rules[i];
        let trigger = rule.trigger || 'change'; // 默认blur 事件触发验证
				if(trigger != eventType) continue;
        // if(rule.trigger && rule.trigger === 'click'){
        //   continue;
        // }
        if(!this.curDate){
          rule.required && !this.longChecked && this.showError(rule.message);
          return;
        }

        if(rule.validator && !validators.execute(rule, this.sectionCode)){// sectionCode 在父级组件验证时需要
          this.showError(rule.message);
          return;
        }
      }
    },
    emitEvent(eventType){
      if(!this.value){
        return;
      }
      eventType === 'change' && this.onDTConfirm(this.value);
    },
    onClick(){
      if(this.disabled) return;
      this.stopScroll();
      let dtValue = this.value && this.value.split(' ')[0];
      if(!dtValue){
        dtValue = this.extend.expValue && this.extend.expValue.split('|')[0];
      } 
      this.defaultDate = utils.getDateTime(dtValue);
      
      this.pickerVisible = true; // 点击重新创建日历控件
      this.$nextTick(() => {
        this.$refs.dtPicker.open();
      })
    },
    onLongClick(){
      this.isLongClick = true;
      setTimeout(() => {
        this.isLongClick = false;
      }, 0);
      if(this.longChecked){
        this.longChecked = false;
        this.clearError();
        this.curDate = '';
        this.$emit('input', this.curDate);
        this.$emit('change');
        return;
      }
      // 检查长期是否可选
      let rule = this.rules.find(item => item.validator === 'isLongPeriod');
      this.longChecked = true;
      // let rule = { min: 46, message:'仅46岁(含)以上可选择长期', validator:'isLongPeriod'}
      if(rule && !validators.execute(rule, this.sectionCode)){// sectionCode 在父级组件验证时需要
        this.$toast(rule.message);
        this.longChecked = false;
        return;
      }

      this.longChecked = true;
      this.clearError();
      this.curDate = '';
      this.$emit('input', this.curDate);
      this.$emit('change');
    },
    onDTConfirm(value){
      let format = '';
      if(this.extend.expValue){
        format = this.extend.expValue.split('|')[1];
      }
      this.curDate = utils.dateFormat(value, format);
      this.clearError();
      this.$emit('input', this.curDate);
      this.validate('change');
      this.$emit('change');
      this.onDTCancel();
    },
    onDTCancel(){
      this.defaultDate = utils.getDateTime(this.value && this.value.split(' ')[0]);
      this.pickerVisible = false; // 取消销毁日历控件
      this.enableScroll();
    },
  }
}
</script>
<style lang="less" scoped>
.hk-date{
  display: flex;
  text-align: right;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  .text{
    text-align: inherit;
    font-size: inherit;
    flex: 1;
    color: #333;
    margin-left: .1rem;
    position: relative;

    &.empty{color: #bbb;}
    &.error{color: #FF2F49;}

    &:after{
      content: ' ';
      position: absolute;
      display: inline-block;
      background: url(../../assets/images/icons/time_ico@2x.png) no-repeat center;
      background-size: 0.14rem 0.14rem;
      width: 0.3rem;
      height: 0.25rem;
      right:-.27rem;
    }
    &:disabled,&[disabled]{
      &:after{
        background: none;
      }
    }
  }
  .long{
    margin-left: 0.25rem;
    padding-left: 0.1rem;
    position: relative;
    &:before{
      content: ' ';
      position: absolute;
      width: 1px;
      height: 60%;
      top: 20%;
      left: 0.05rem;
      background-color: #ddd;
    }
    &:after{
      content: ' ';
      position: absolute;
      display: inline-block;
      background: url(../../assets/images/icons/radio.png) no-repeat center;
      background-size: 0.14rem 0.14rem;
      width: 0.3rem;
      height: 0.25rem;
    }
    &.checked{flex:1;}
    &.checked:before{
      width: 0px;
    }
    &.checked:after{
      background-image: url(../../assets/images/icons/radio_on.png);
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
