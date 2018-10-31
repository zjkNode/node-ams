<template>
    <el-form :model="loginForm" :rules="rules" ref="loginForm" @keyup.enter.native="handleSubmit" label-width="0" class="login-container">
        <h3 class="title">系统登录</h3>
        <el-form-item prop="email">
            <el-input type="text" v-model="loginForm.email" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-checkbox v-model="isRemember"  class="remember">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
            <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit" :loading="isLoading">登录</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    import util from '@/assets/js/util'
    export default {
        data() {
            return {
                isLoading: false,
                loginForm: {
                    email: '',
                    password: ''
                },
                isRemember: true,
                rules: {
                    email: [
                        { required: true, message: '请输入账号', trigger: 'blur' },
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                        { min:6, message:'密码不能小于6位', trigger: 'blur' }
                    ]
                },
            };
        },
        mounted() {
            let loginData = localStorage.getItem('loginData');
            if(loginData) {
                this.loginForm = JSON.parse(loginData);
            }
        },
        methods:{
            handleSubmit(){
                this.$refs.loginForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    let url = "/api/user/signin";
                    let params = {
                        email: this.loginForm.email,
                        password: util.encrypt(this.loginForm.password)
                    };
                    this.isLoading = true;
                    this.$http.post(url, params).then((res)=>{
                        this.isLoading = false;
                        if(res.code != 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }

                        this.$store.dispatch('setCurUser', res.data);
                        if(this.isRemember){
                            localStorage.setItem('loginData', JSON.stringify(this.loginForm))
                        } else {
                            localStorage.removeItem('loginData')
                        }
                        this.$router.push({ path: '/' });
                    }).catch(() => {
                        this.isLoading = false;
                    });
                });
            }
        }
    }
</script>
<style lang="scss" scoped>
    .login-container {
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin: 180px auto;
        width: 350px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        .title {
            margin: 0px auto 40px auto;
            text-align: center;
            color: #505458;
        }
        .remember {
            margin: 0px 0px 35px 0px;
        }
    }
</style>
