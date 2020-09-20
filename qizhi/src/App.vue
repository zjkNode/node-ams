<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import utils from '@/assets/js/utils'
export default {
  computed: mapGetters({
    userInfo:'getUserInfo'
  }),
  data() {
    return {
      wxAuth:{
        // 海客公众号
        jc1:{ appId:'wx3f6f926fe8a0014a'},
        jc2:{ appId:'wx54a451e09224eec3'},
        pro:{ appId:'wx2e5328f2559a6bdd'},
      }
    };
  },
  created() {
   this.wxLogin();
  },
  mounted() {
			document.body.addEventListener("focusout", (e) => {
				//软键盘收起的事件处理
				setTimeout(() => {
					const scrollHeight =
						document.documentElement.scrollTop || document.body.scrollTop || 0;
					(e.target.type != 'radio' && e.target.type != 'checkbox') && window.scrollTo(0, Math.max(scrollHeight - 1, 0));
				}, 100);
				//   setTimeout(() => {
				//   window.scrollTo(0,0)
				//   // 间隔设为10，减少页面失去焦点定时器的突兀感，
				// },10)
			});
			//微信内置浏览器浏览H5页面弹出的键盘遮盖文本框的解决办法
			document.body.addEventListener("resize", function() {
				if(
					document.activeElement.tagName == "INPUT" ||
					document.activeElement.tagName == "TEXTAREA"
				) {
					setTimeout(function() {
						document.activeElement.scrollIntoView();
					}, 100);
				}
			});
  },
  methods: {
    wxLogin(){
      if(!utils.env.isWX()) return; // 非微信环境

      let code = utils.getQueryParam('code');
      if(!code){
        // 首次，请求code
        let matchEnv = location.host.match(/jc\d/i);
        let _wxAuth = this.wxAuth[matchEnv ? matchEnv[0] : 'pro'];
        let wxAuthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${_wxAuth.appId}&redirect_uri=${encodeURIComponent(location.href)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
        let authFlag = sessionStorage.getItem('authFlag');
        if(!authFlag){
          sessionStorage.setItem('authFlag', true)
          window.location.replace(wxAuthUrl);
        }
        return;
      }
      sessionStorage.removeItem('authFlag');
      this.$indicator.open("授权获取中");
      this.$axios({
        method: "post",
        url:"/hk-insurance-shop/weChat/getWeChatUserInfo",
        params: {
          code: code,
        }
      }).then(res => {
          this.$indicator.close();
          this.$store.dispatch("setUserInfo", res.responseBody);
        }).catch(() => {});
    }
  }
}
</script>
<style>
html{
  height: 100%; -webkit-text-size-adjust:none; 
  font-family:"PingFang SC", "Lantinghei SC", "Helvetica Neue", "Helvetica, Arial", "Microsoft YaHei"; 
  font-size: calc(200vw/7.5);
}
body{height: 100%;}
@media only screen and (min-width: 750px) {
	html {font-size:200px;}
	body {width: 750px; margin: 0 auto;}
}

.page {
  position: relative;
  padding: .14rem;
  min-height: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
ul{list-style: none; padding: 0;}
.app_header {
  padding-top: 0.6rem;
}
.v-modal {
  left: auto;
  max-width: 750px;
}
#app {
  max-width: 750px;
  margin: 0 auto;
}

input:focus,
button:focus {
  outline: none;
}
input::-webkit-input-placeholder,
input:-ms-input-placeholder,
input:-moz-placeholder,
input::-moz-placeholder {
  color: #979797;
}
</style>
