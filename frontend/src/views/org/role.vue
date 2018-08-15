<template>
    <el-row class="category">
        <h2>角色管理</h2>
        <!--工具条-->
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入角色名称/描述" @input="searchName"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="getAllRoles" icon="el-icon-search"> 查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus" pull="6">新增</el-button>
            </el-col>
        </el-row>

        <!--列表-->
        <template>
            <el-table :data="roles" highlight-current-row v-loading="loading" style="width: 100%;">
                <el-table-column type="index" width="60" >
                </el-table-column>
                <el-table-column prop="dep.name" label="所在部门"  >
                </el-table-column>
                <el-table-column prop="name" label="角色名称"  >
                </el-table-column>
                <el-table-column prop="desc" label="角色描述" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="操作" width="140" fixed="right">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="handleJobs(scope.$index, scope.row)">权限</el-button>
                        <el-button type="text" size="small" @click="handleDel(scope.$index, scope.row)" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <!--工具条-->
        <div class="block pagbar">
            <el-pagination
                    @size-change="onSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="page"
                    :page-sizes="[15, 30, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
        <!--新增界面-->
        <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
            <el-form :model="ruleForm" :rules="addFormRules" ref="ruleForm" label-width="80px">
                <el-form-item label="部门选择" prop="depid">
                    <el-cascader change-on-select :options="depOptions"  :props="propss" v-model="ruleForm.depid">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="desc">
                    <el-input type="textarea" v-model="ruleForm.desc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit('ruleForm')" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--编辑界面-->
        <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="部门选择" prop="depid">
                    <el-cascader change-on-select :options="depOptions"  :props="propss" v-model="editForm.depid">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="角色备注">
                    <el-input type="textarea" v-model="editForm.desc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit('editForm')" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

    </el-row>
</template>
<script>
    // import Tree from './tree.vue';
    //import NProgress from 'nprogress'
    export default {
        data() {
            return {
                keys:'',
                roles:[],
                loading: false,
                editLoading: false,
                listLoading:false,
                addFormVisible: false,//新增界面是否显示
                editFormVisible: false,//编辑界面是否显示
                editJobsVisible:false,//编辑分配权限
                //新增界面数据
                ruleForm: {
                    name: '',
                    desc: '',
                    depid:[]
                },
                //编辑界面数据
                editForm: {
                    name: '',
                    desc:'',
                },
                tree:'',
                addFormRules: {
                    depid:[{type: "array",required: true, message: '请选择部门', trigger: 'change'}],
                    name: [
                        {required: true,message:'名称不能为空',trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    desc:[
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },
                editJobsForm:{
                    authorties:[]
                },
                editFormRules:{
                    name: [
                        {required: true, message:'名称不能为空',trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    desc:[
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },
                addLoading: false,
                total: 0,
                page: 1,
                pageSize:15,
                pageIndex:1,
                props: {
                    label: 'name',
                    children: 'children'
                },
                depOptions:[],
                propss:{ value:'id', label:'name' },
            }
        },
        // components:{Tree},
        mounted() {
            this.init()
        },
        methods: {
           init(){
            this.getAllRoles();
            this.getDepids();
           },
            //获取全部角色数据
            getAllRoles(){
                let me = this;
                let url = '/api/roles/lists';
                let data = {keys:this.keys,pageIndex:this.page,pageSize:this.pageSize};
                me.loading=true;
                me.$http.get(url, {params:data}, {credentials: true})
                        .then((res)=> {
                            me.loading = false;
                            if (res.body.code =='SUCCESS') {
                                var data = res.body.data;
                                me.roles = data.lists;
                                me.total = data.total;
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.loading = false;
                        });
                // me.getJobsData();
                // me.getDepids()
            },
            //获取部门列表
            getDepids(){
                let url = '/api/dep/treeList';
                this.$http.get(url,null).then((res)=>{
                    if(res.body.code === 'SUCCESS'){
                        let depTree = res.body.data || [];
                        if(depTree[0].id == -1){
                            depTree.splice(0, 1); // 删除第一个 顶级 元素
                        }
                        this.depOptions = depTree;
                        return;
                    }
                    this.$message(res.body.msg);

                },(err) => {
                    console.log(err);
                });
            },
            //新增
            addSubmit(formName){
                var me = this;
                me.$refs[formName].validate((valid)=> {
                    if (valid) {
                        var data = Object.assign({},me.ruleForm);
                        data.depid=data.depid.pop();
                        var url = '/api/roles/add';
                        me.addLoading = true;
                        me.$http.post(url, data, {credentials: true})
                                .then((res)=> {
                                    me.addLoading = false;
                                    if (res.body.code === 'SUCCESS') {
                                        me.$message({
                                            message: '提交成功',
                                            type: 'success'
                                        });
                                        me.$refs['ruleForm'].resetFields();
                                        me.addFormVisible = false;
                                        me.getAllRoles()
                                    } else {
                                        me.$alert(res.body.msg,'友情提示', {
                                            confirmButtonText: '确定'
                                        });
                                    }
                                },(err) => {
                                    me.addLoading = false;
                                });

                    }
                })
            },
            //编辑
            editSubmit(formName){
                var me = this;
                this.$refs[formName].validate((valid)=> {
                    if (valid) {
                        var data = Object.assign({},me.editForm);
                        data.depid=data.depid.pop();
                        var url = '/api/roles/'+data.id;
                        me.editLoading = true;
                        me.$http.put(url, data, {credentials: true})
                                .then((res)=> {
                                    me.editLoading = false;
                                    if (res.body.code =='SUCCESS') {
                                        me.$message({
                                            message: '提交成功',
                                            type: 'success'
                                        });
                                        me.$refs['editForm'].resetFields();
                                        me.editFormVisible = false;
                                        me.getAllRoles()
                                    } else {
                                        me.$alert(res.body.msg,'友情提示', {
                                            confirmButtonText: '确定'
                                        });
                                    }
                                },(err) => {
                                    me.editLoading = false;
                                });
                    }
                })
            },
            //删除
            handleDel(index,row){
                let me = this;
                let id = row.id;
                me.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    let url = '/api/roles/' + id;
                    let data ='';
                    me.listLoading = true;
                    me.$http.delete(url, data, {credentials: true})
                            .then((res)=> {
                                me.listLoading = false;
                                if (res.body.code =='SUCCESS') {
                                    me.$message({
                                        message: '删除成功',
                                        type: 'success'
                                    });
                                    me.getAllRoles()
                                } else {
                                    me.$alert(res.body.msg,'友情提示', {
                                        confirmButtonText: '确定'
                                    });
                                }
                            },(err) => {
                                me.editLoading = false;
                            });
                }).catch(_ => {
                    this.$message('已取消删除');
                });
            },
            //显示编辑页面
            handleEdit(index,row){
                this.editForm=Object.assign({}, row);
                this.editForm.depid=row.dep.pids != 0 ? row.dep.pids.split(',').map((item)=>{return parseInt(item)}) : [row.dep.id]
                this.editFormVisible = true;
            },
            //显示分配权限页面
            handleJobs(index,row){
                this.$router.push({
                    path:'/sys/org/role/authority',
                    query:{id:parseInt(row.id)}
                })
            },
            //跳转分页
            handleCurrentChange(val) {
                this.page = val;
                this.getAllRoles()
            },
            onSizeChange(val){
                this.pageSize = val;
                this.getAllRoles()
            },
            searchName(){
                if(!this.keys){
                    this.getAllRoles()
                }
            }

        }
    }

</script>
<style lang="scss">
    .ul1{
        position: relative;
    }
    .ul2{
        margin-left:70px;
    }
    .li2 ul{
        margin-left:70px;
    }
    .li5,.t2{
        margin-top:-36px!important;
    }
    .t1 input{
        -webkit-appearance: checkbox;
    }
    .transfer-footer {
        margin-left: 20px;
        padding: 6px 5px;
    }
</style>
