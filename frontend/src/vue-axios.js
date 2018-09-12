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
        config.headers.Authorization = 'testToken'
        return config;
        
    }, error => {
        // 对请求错误做些什么
        return Promise.reject(error);
    });

axios.interceptors.response.use(
  response => {
    var resData = response.data;
    
    return resData
  },
  error => {
    let errRes = error.response;
    if (errRes) {
        switch (errRes.status) {
            case 400:
            case 430:// 数据验证失败
            case 440:// 数据库查询失败
                let message = '';
                if(Object.prototype.toString.call(errRes.data) === '[object Array]'){
                    let tmpMsg = [];
                    for (let i = 0; i < errRes.data.length; i++) {
                       tmpMsg.push(errRes.data[i].msg);
                    }
                    message = tmpMsg.join('<br/>')
                } else {
                    message = errRes.data.msg;
                }
                Vue.prototype.$message({
                    type:'error',
                    dangerouslyUseHTMLString: true,
                    message: message
                });
                break;
            case 401:
                // 401 清除token信息并跳转到登录页面
                localStorage.clear();
                Vue.cookie.delete('amsnodecookie');
                location.href = '/login';
                break;
        }
    }
    // return Promise.reject(error);
  }
)

Vue.prototype.$http = axios

export default axios