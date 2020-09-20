<template>
  <div class="page">
    <div class="title">启智教育</div>
    <ul class="login_form">
      <li>
        <z-input ref="phone" label="手机号" type="phone" :rules="rules.phone" v-model="formData.phone"></z-input>
      </li>
      <li>
        <z-input ref="pwd" label="登录密码" type="password" :rules="rules.pwd" v-model="formData.pwd"></z-input>
      </li>
      <li>
        <mt-button type="primary" class="btn" @click="onLogin">登录</mt-button>
      </li>
    </ul>
  </div>
</template>
<script>
import utils from '@/assets/js/utils'
export default {
  components: {
    "z-input": resolve => require(["@/components/z-input.vue"], resolve)
  },
  data(){
    return {
      formData:{
        pwd:'123456',
        phone:'18200000000'
      },
      rules:{
        pwd:[{ required: true, message:''},],
        phone:[
          { required: true, message:''},
					{ message:'手机号码格式错误', validator:'isPhone' }
        ]
      }
    }
  },
  methods:{
    onLogin(){
      for(let key in this.$refs){
        this.$refs[key].validate();
      }
      this.$nextTick(() => {
        this.onSubmit();
      });
    },
    onSubmit(){
      let hasError = document.getElementsByClassName('error').length > 0;
      if(hasError){
        return;
      }

      let formData = Object.assign({}, this.formData);
      formData.pwd = utils.encrypt(formData.pwd);

      this.$indicator.open();
      this.$axios.post("/qizhi/user/signIn", formData).then(res => {
        this.$indicator.close();
        this.$store.dispatch('setUserInfo', res.data);
        let redirect = (this.$route.query||{}).redirect;
        this.$router.push({
          path: redirect || '/'
        });
      }).catch( () => {
        this.$indicator.close();
      });
    }
  }
}
</script>
<style lang="less" scoped>
.title{
  margin: 1rem 0;
  font-size: 25px;
  font-weight: 700;
  color: #F56C6C;
  text-align: center;
}
.login_form{
  background: #fff;
  padding-left:0.14rem;
  position: relative;
  &:after{
    content: ' ';
    width: 100%;
    height: 2px;
    left: 0;
    bottom: 0;
    background: #fff;
    position: absolute;
  }
  li{
    position: relative;
    line-height:0.28rem;
    // height: 0.28rem;
    padding: 0.12rem 0.3rem 0.12rem 0;
    color: #333;
    font-size: 0.15rem;
    border-bottom: 1px solid #eee;
    // margin-bottom: -1px;
    // overflow: hidden;
    .promp{
      color: #999;
      font-size: 0.1rem;
      margin-top: 0.1rem;
      line-height: 0.16rem;
    }
    .btn{
      border: 1px solid #dddddd;
      border-radius: 2px;
      padding: 0.065rem 0.14rem;
      line-height: 100%;
      font-size: 0.16rem;
      width: 100%;
      margin-top: .5rem;
    }
    .del{
      float: right;
      color: #FF2F49;
    }
  }
}
</style>