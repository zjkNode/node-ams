<template>
  <div class="hk-buttons">
    <label v-if="label" v-html="label"></label>
    <div class="group">
      <template v-for="item in options" >
      <span :key="item.value"
        v-if="!item.hidden"
        :class="{on: item.checked, error: hasError}"
        @click="onItemClick(item)">{{ item.name }}</span>
      </template>
    </div>
  </div>
</template>
<script>
import validators from '@/assets/js/validators.js';
export default {
  name:'hk-buttons',
  props: {
    label: String, //字段标题
    placeholder: String,
    disabled: Boolean, //是否只读
    value: String | Number | Array,
    rules: Array,
    multiple: Boolean, // 是否多选
    sectionCode: String, // 所属模块代码
    options: {
      type: Array,
      default(){ return []; }
    } //下拉的选项
  },
  data(){
    return {
      hasError: false,
      itemLength: 0
    }
  },
 
  watch:{
    value(val){
      if(this.multiple){
        this.options.forEach(opt => opt.checked = val.includes(opt.value));
        return;
      }
      this.options.forEach(opt => opt.checked = opt.value === val);
    },
  },
  created(){
    if(this.options.length === 0) return;
    if(this.multiple){
      let values = this.value || [];
      this.options.forEach(opt => {
        opt.hidden = opt.hidden || false;
        opt.checked = values.includes(opt.value);
      });
      return;
    }
    this.options.forEach(opt => {
      opt.hidden = opt.hidden || false;
      opt.checked = opt.value === this.value;
    });
  },
  methods:{
    showError(message){
      this.hasError = true;
      message && this.$toast(message); 
    },
    clearError(){ // 在父组件中调用，清空出错标记
      this.hasError = false;
    },
    validate(eventType = 'click'){
      if(!this.rules || this.rules.length === 0){
        return;
      }
      // 多选验证只支持 require 至少选中一个的情况
      let tmpItems = this.options.filter(opt => opt.checked);
      for(let i = 0; i < this.rules.length; i++){
        let rule = this.rules[i];
        let trigger = rule.trigger || 'click'; // 默认blur 事件触发验证
        if(trigger != eventType) continue;
          
        if((this.multiple && tmpItems.length < 1) || 
          (!this.multiple && tmpItems.length === 0)){
          rule.required && this.showError(rule.message);
          return;
        }
        if(rule.validator){// sectionCode在父级组件验证时需要
          let validFn = validators[rule.validator];
          if(validFn){ // isEmail, isPhone, isIdCard, isIdName
            if(validFn(tmpItems[0].value)) continue; // 验证通过，继续下面验证 这里只处理了单选的验证

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
      if(!this.value){
        return;
      }
      eventType === 'change' && this.$emit('change');;
    },
    onItemClick(item){
      if(this.disabled) return;
      if(!this.multiple && item.checked) return; // 单选，且选中状态再次点击
      
      this.clearError();
      item.oldChecked = item.checked; // 记录变化前状态，因为验证失败后，按钮状态不能改变
      

      if(this.multiple){
        item.checked = !item.oldChecked;
        this.$emit('input', this.options.filter(opt => opt.checked).map(opt => opt.value));
        this.validate();
        if(this.hasError){
          item.checked = item.oldChecked;
          this.$emit('input', this.options.filter(opt => opt.checked).map(opt => opt.value));
          return;
        }
        this.$emit('change');
        return;
      }
      
      let oldCheckItem = this.options.find(opt => opt.checked);
      item.checked = true;
      this.$emit('input', item.value);
      this.validate()
      if(this.hasError){
        this.$emit('input', oldCheckItem.value);
        return;
      }
      this.$emit('change');
    }
  }
}
</script>
<style lang="less" scoped>
.hk-buttons{
  display: flex;
  text-align: right;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  .group{
    flex: 1;
    // margin-left: 0.1rem;
    margin-top: -0.05rem;
  }
  span{
    border: 1px solid #dddddd;
    border-radius: 2px;
    padding: 0.065rem 0.14rem;
    box-sizing: border-box;
    margin-left: 0.1rem;
    margin-top: 0.05rem;
    line-height: 100%;
    font-size: 0.12rem;
    display: inline-block;
    &.on{
      color: #10a2fa;
      border-color: #10a2fa;
      background:  rgba(15, 144, 249, 0.05);
    }
    &.error{color: #FF2F49; border-color: #FF2F49;}
  }
}
</style>
