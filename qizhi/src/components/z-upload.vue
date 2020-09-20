<template>
  <div class="hk-upload">
    <div class="uploader" :class="{error: hasError}">
      <i class="tl"></i>
      <i class="tr"></i>
      <i class="bl"></i>
      <i class="br"></i>
      <input type="file" :id="id" @change="onFileChanged" accept="image/*" multiple="false" />
      <label :for="!disabled ? id : ''">
        <img :src="curValue"/>
      </label>
      <span v-if="!isDefault" class="preview" @click="isPreview = true">预览</span>
    </div>
		<div class="label" v-if="label">{{label}}</div>

    <div v-show="isPreview" class="mask">
      <span class="close" @click="isPreview = false"></span>
      <img :src="curValue" />
    </div>
    <slot name="mark"></slot>
  </div>
</template>
<script>
import utils from '@/assets/js/utils'

export default {
  name: 'hk-upload',
  props: {
    type: String,
    label: String,
    value: String,
		disabled: Boolean, //是否只读
    rules: Array,
  },
  data(){
    return {
      id: new Date().getTime(),
      hasError: false,
      isDefault: false,
      isPreview: false,
      curValue:'',
    }
  },
  created(){
    this.curValue = this.value;
    if(this.value.includes('/static/')){// 包含 base64 是默认图
      this.isDefault = true; 
			this.$emit('input', ''); 
    }
  },
  methods:{
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
        if(!this.value){
          rule.required && this.showError(rule.message);
          return;
        }
        if(rule.validator){// sectionCode在父级组件验证时需要
          let validFn = validators[rule.validator];
          if(validFn){
            if(validFn(this.value)) continue; // 验证通过，继续下面验证

            this.showError(rule.message);
            return;
          }
          this.showError(rule.message);
          return;
        }
      }
    },
    onFileChanged(sender){
      let file = sender.target.files[0];
      if(!/image\/\w+/.test(file.type)) {
        this.showError("上传的图片格式不正确！");
        return;
      } 
      if(file.size >  1024*1024*15) {
        this.showError("请将图片大小控制在15M以下");
        return;
      }

      let $formData = new FormData();
      $formData.append("multipartFile", file)
      this.$indicator.open();
      this.$axios.post("/hk-insurance-shop/api/insuranceCommon/uploadImage", $formData, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'} // "multipart/form-data"
      }).then(res => {
        this.$indicator.close();
        if(res.retCode != '0000'){
          this.showError("上传失败");
          return;
        }
        this.clearError();
        this.isDefault = false;
        this.curValue = res.responseBody.url;
				this.$emit('input', this.curValue); 
      }).catch(() => { 
        this.$indicator.close();
      });
    }
  }
}
</script>
<style lang="less" scoped>
.hk-upload{
  text-align: center;
  align-items: center;
  position: relative;
  padding:.2rem 0 .1rem;
  box-shadow: 0px 0px 10px #eee;
  border-radius: .05rem;
 
  .label{color:#787AA3;}
  .uploader{
    display: inline-block;
    padding: .1rem;
    line-height: 0;
    border: 1px solid transparent;
    overflow: hidden;
    position: relative;
    i{
      position: absolute;
      width: 15px;
      height: 15px;
      &.tl{top: 0;left: 0;border-left: 2px solid #1890FF;border-top: 2px solid #1890FF;}
      &.tr{top: 0;right: 0;border-right: 2px solid #1890FF;border-top: 2px solid #1890FF;}
      &.bl{bottom: 0;left: 0;border-left: 2px solid #1890FF;border-bottom: 2px solid #1890FF;}
      &.br{bottom: 0;right: 0;border-right: 2px solid #1890FF;border-bottom: 2px solid #1890FF;}
    }
    &.error i{border-color: #FF2F49;}
    input[type=file]{
      display: none;
    }
    label{font-size: 0;}
    img{
      display: inline-block;
      height: 1.78rem;
      width: 2.5rem;
    }
    .preview{
      display: inline-block;
      position: absolute;
      width:.5rem;
      height: .5rem;
      top:50%;
      margin-top: -.25rem;
      left: 50%;
      margin-left: -.25rem;
      border-radius: .5rem;
      line-height: .5rem;
      text-align: center;
      background: rgba(0,0,0,0.5);
      color:#fff;
    }
  }
  
  .mark{
    color: #697FD5;
    font-size: .12rem;
    text-align: center;
    margin-top: .1rem;
  }
}

.mask{
  .close{
    position: absolute;
    top: -.5rem;
    right: -.5rem;
    width: 1rem;
    height: 1rem;
    border-radius: .5rem;
    background: rgba(0,0,0,0.5);
    z-index: 1;
    &:before, &:after{
      content: ' ';
      position: absolute;
      width: 1px;
      height: 0.25rem;
      background: #e5e5e5;
      top: .6rem;
      left: .3rem;
      transform: rotate(45deg);
    }
    &:after{
      transform: rotate(-45deg);
    }
  }
  img{
    position: absolute;
    top:50%;
    left: 50%;
    width: 95%;
    transform: translate(-50%,-50%);
  }
}
</style>