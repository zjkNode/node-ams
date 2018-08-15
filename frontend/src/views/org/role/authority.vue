<template>
    <el-row class="news">
        <h2>系统功能--分配</h2>
        <el-form :model="ruleForm" :rules="FormRules" ref="ruleForm" label-width="80px">
            <el-form-item label=系统功能 prop="authorties">
                <tree :lists="list" class="t1"></tree>
            </el-form-item>
            <el-form-item style="text-align: right;">
                <el-button @click="onCancle">取消</el-button>
                <el-button type="primary" @click="editSubmit('ruleForm')" :loading="editLoading">确定</el-button>
            </el-form-item>
        </el-form>
    </el-row>
</template>
<script  type="text/ecmascript-6">
    import util from '@/assets/js/util'
    import Tree from './tree.vue';
    export default {
        name:"leftMenu",
        components:{Tree},
        data(){
            return {
                list:[],
                ruleForm:{
                    checkname:[]
                },
                editLoading:false
            }
        },
        mounted(){
            this.getJobsData();
            this.getJobContent();
            this.$nextTick(()=>{
                this.defaultCheck()
            })
        },
        methods:{
            //获取所有功能
            getJobsData(){
                let me = this;
                let url = '/api/rule/rulelists';
                let data = '';
                me.$http.get(url, {params:data}, {credentials: true})
                        .then((res)=> {
                            if (res.body.code =='SUCCESS') {
                                me.list=res.body.data;
                                me.$nextTick(function(){
                                    me.actionCheckbox()
                                })
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                        });
            },
            //获取1条权限数据
            getJobContent(){
                var me = this;
                var query = util.getQueryParams('id');
                var url='/api/roles/edit/'+query;
                var data={id:query};
                me.$http.get(url, {params:data}, {credentials: true})
                        .then((res)=> {
                            if (res.body.code =='SUCCESS') {
                                me.ruleForm = res.body.data;
                                me.ruleForm.checkname=!!me.ruleForm.authorties ? me.ruleForm.authorties.split(',').map((item)=>{
                                    return item-0
                                }) : [];
                                window.setTimeout(function(){
                                    me.defaultCheck()
                                },10)
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.loading = false;
                        });
            },
            defaultCheck(){
                var me = this;
                var inputs = $('.t1 input');
                for(var i=0;i<inputs.length;i++){
                    if(me.ruleForm.checkname.indexOf(inputs[i].value-0) > -1 ){
                        inputs[i].checked=true;
                    }
                }
            },
            actionCheckbox(){
                var me = this;
//                var input = $('input')
                $('.t1 input').on('click',function(e){
                    let target=e.target;
                    if(target.checked){
                        me.ruleForm.checkname.push(target.value-0);
                    }else{
                        let val=me.ruleForm.checkname.indexOf(target.value-0);
                        me.ruleForm.checkname.splice(val,1);
                    }
                })
            },
            //编辑
            editSubmit(formName){
                var me = this;
                this.$refs[formName].validate((valid)=> {
                    if (valid) {
                        var data = Object.assign({},me.ruleForm);
                        var _auth = data.checkname.join(',');
                        data.authorties = _auth;
                        var url = '/api/roles/auth/'+data.id;
                        me.editLoading = true;
                        me.$http.put(url, data, {credentials: true})
                                .then((res)=> {
                                    me.editLoading = false;
                                    if (res.body.code =='SUCCESS') {
                                        me.$message({
                                            message: '提交成功',
                                            type: 'success'
                                        });
                                        me.$refs['ruleForm'].resetFields();
                                        me.$router.push({
                                            path:'/sys/org/role'
                                        })
                                    } else {
                                        me.$alert(res.body.msg,'友情提示', {
                                            confirmButtonText: '确定',
                                        });
                                    }
                                },(err) => {
                                    me.editLoading = false;
                                });

                    }
                })
            },
            onCancle(){
                this.$router.push({
                    path:'/sys/org/role'
                })
            },
        }
    }
</script>
<style>
    .ul1{
        position: relative;
    }
    .ul2{
        margin-left:80px;
    }
    .li2 ul{
        margin-left:80px;
    }
    .li5,.t2{
        margin-top:-36px!important;
    }
    .t1 input{
        -webkit-appearance: checkbox;
    }
    .left-sider{
        background: #324157;
        width: 230px!important;
        height: 100%;
        color: #bfcbd9;
    }
    .logo{
        height: 30%;
        display:flex;
        align-items: center;
        border-bottom: solid 1px #ccc;
    }
    .logo img{
        height: 50%;
        width: auto;
        margin:0 auto;
    }
    .menulists{
        height: 70%;
        overflow-y: auto;
    }
</style>
