import Vue from 'vue'
import Axios from 'axios'

let axios = Axios.create({
    timeout: 1000 * 5,
    // baseURL: '',

    withCredentials: true, // 跨域请求时，允许其他域设置自身站点下的cookie
});

axios.interceptors.request.use( 
    config => {
        // 添加headers
        // console.log(window.vm.$store.getters.getCurMenu)
        // config.headers.Authorization = 'testToken'
        if(!Vue.cookie.get('nodesyscookie') && config.url !== "/api/user/signin"){
            throw new Error('USER_EXPIRES');
        }
        return config;
        
    }, error => {
        // 对请求错误做些什么
        return Promise.reject(error);
    });

axios.interceptors.response.use(response => {
    let resData = response.data;
    
    return resData
  }, error => {
    let vm = window.vm;
    if(error.message === 'USER_EXPIRES'){
        vm.$message({
            type:'error',
            message:'用户已退出登录, 请重新登录',
            duration: 1000,
            onClose(){
                // 强制刷新页面，清除vuex 对变量的缓存，否则重新登录后，系统菜单加载不出来
                window.location.replace('/login'); 
            }
        });
        // vm.$router.push({ path: '/login' });
        return;
    }
    if(!error.response){
        return;
    }
    let errRes = error.response;
    let message = '';
    switch (errRes.status){
        case 400:
        case 430:// 数据验证失败
        case 440:// 数据库查询失败
            if(Object.prototype.toString.call(errRes.data) === '[object Array]'){
                let tmpMsg = [];
                for (let i = 0; i < errRes.data.length; i++) {
                   tmpMsg.push(errRes.data[i].msg);
                }
                message = tmpMsg.join('<br/>')
            } else {
                message = errRes.data.msg;
            }
            vm.$message({
                type:'error',
                dangerouslyUseHTMLString: true,
                message: message
            });
            break;
        case 401:
            // 401 清除token信息并跳转到登录页面
            vm.$cookie.delete('nodesyscookie');
            // 强制刷新页面，清除vuex 对变量的缓存，否则重新登录后，系统菜单加载不出来
            window.location.replace('/login');
            // vm.$router.push({ path: '/login' });
            break;
    }
    return Promise.reject(errRes)
  }
)

Vue.prototype.$http = axios

export default axios