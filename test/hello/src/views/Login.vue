<template>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
        <h3 class="title">系统登录</h3>
        <el-form-item prop="email">
            <el-input type="text" v-model="ruleForm.email" auto-complete="off" placeholder="账号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input type="password" v-model="ruleForm.password" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
        <el-checkbox v-model="ckPwd"  class="remember">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
            <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit('ruleForm')" :loading="logining">登录</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    var util = require('@/assets/js/util');
    export default{
        data() {
            return {
                logining: false,
                ruleForm: {
                    email: '',
                    password: ''
                },
                rules: {
                    email: [
                        { required: true, message: '请输入账号', trigger: 'blur' },
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                    ]
                },
                ckPwd: true
            };
        },
        mounted() {
            this.init();
        },
        destroyed() {
            
        },
        methods:{
            init(){
                this.ckPwd = !!this.$cookie.get('password');
                this.ruleForm.email = this.$cookie.get('email') || '';
                this.ruleForm.password = this.$cookie.get('password') || '';
                var me = this;
                // $(document).keydown(function(event){
                //     if (event.keyCode == 13) {
                //         me.handleSubmit('ruleForm');
                //     }
                // });
            },
            handleSubmit(forName){
                this.$refs[forName].validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    this.logining = true;
                    var apiUrl = "/api/signin";
                    var params = {
                        email: this.ruleForm.email,
                        password: util.encrypt(this.ruleForm.password)
                    };
                    console.log(params);
                    this.$http.post(apiUrl,params).then((res)=>{
                        this.logining = false;

                        if(res.body.code != 'SUCCESS'){
                            this.$message.error(res.body.msg);
                            return;
                        }

                        let user = res.body.data;
                        if(!user.rules || user.rules.length == 0){
                            this.$message({
                              message: '您没有权限访问系统，请联系系统管理员',
                              type: 'warning'
                            });
                            return;
                        }

                        localStorage.setItem('user',JSON.stringify(user));
                        if(this.ckPwd){
                            this.$cookie.set('email', params.email);
                            this.$cookie.set('password', params.password);
                        } else {
                            this.$cookie.delete('email');
                            this.$cookie.delete('password');
                        }
                        this.$router.push({ path: '/' });
                    },(error)=>{
                        this.logining = false;
                        console.log(error);
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
