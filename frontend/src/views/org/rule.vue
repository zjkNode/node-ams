<template>
    <el-row class="category">
        <h2>系统功能管理</h2>
        <!--工具条-->
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入系统功能名称/路径" @input="searchName"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="getrules" icon="el-icon-search"> 查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus" pull="6">新增</el-button>
            </el-col>
        </el-row>

        <!--列表-->
        <template>
            <el-table :data="rules" highlight-current-row v-loading="loading" style="width: 100%;">
                <el-table-column type="index" width="60" >
                </el-table-column>
                <el-table-column prop="name" label="功能名称" :formatter="formatTree" show-overflow-tooltip class-name='flat-tree'>
                </el-table-column>
                <el-table-column prop="path" label="功能路径" >
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                    <template scope="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>{{scope.row.status | statusFilter}}</el-tag>
                    </template>
                </el-table-column>
                
                <el-table-column label="操作" width="100" fixed="right">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="handleDel(scope.$index, scope.row)" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <!--新增界面-->
        <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
            <el-form :model="ruleForm" :rules="addFormRules" ref="ruleForm" label-width="80px">
                <el-form-item label="父级功能" prop="pid"  ref="selectform">
                    <el-cascader
                            change-on-select
                            :options="options"
                            :props="props"
                            v-model="ruleForm.pid"
                            @change="handleChange">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="功能名称" prop="name">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
                <el-form-item label="功能路径" prop="path">
                    <el-input v-model="ruleForm.path"></el-input>
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
                <el-form-item label="新闻类别" prop="pid" >
                    <el-cascader
                            change-on-select
                            :options="options"
                            :props="props"
                            v-model="editForm.pid"
                            @change="edithandleChange">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="功能名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="功能路径" prop="name">
                    <el-input v-model="editForm.path" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否可用" prop="status">
                    <el-radio-group v-model="editForm.status">
                        <el-radio class="radio" :label="1">正常</el-radio>
                        <el-radio class="radio" :label="2">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit('editForm')" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </el-row>
</template>
<script type="text/ecmascript-6">
    //import NProgress from 'nprogress'
    export default {
        data() {
            return {
                keys:'',
                rules:[],
                loading: false,
                editLoading: false,
                listLoading:false,
                addFormVisible: false,//新增界面是否显示
                editFormVisible: false,//编辑界面是否显示
                props:{
                    value:'id',
                    label:'name'
                },
                options:[],
                //新增界面数据
                ruleForm: {
                    pid: [],
                    name: '',
                    path:''
                },
                //编辑界面数据
                editForm: {
                    name: '',
                    pid: [],
                    status:'',
                    path:''
                },
                addFormRules: {
                    path: [
                        {required: true,message:'系统功能不能为空',trigger: 'blur'}
                    ],
                    name: [
                        {required: true,message:'系统功能名称不能为空',trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },
                editFormRules:{
                    path: [
                        {required: true,message:'系统功能路径不能为空',trigger: 'blur'}
                    ],
                    name: [
                        {required: true, message:'系统功能名称不能为空',trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },
                addLoading: false,
                editValue:'',
            }
        },
        filters:{
            statusFilter(val){
                if(val === 1)
                    return '正常';
                if(val === 2)
                    return '停用';
                return '未知';
            }
        },
        methods: {
            filterTag(value,row){
                return row.status == value;
            },
            formatTree(row, column,value){
                let flatTree = this.$options.filters.flatTree;
                return flatTree(row, value);
            },
            //查询
            getrules(){
                this.getAllRules()
            },
            getOptions(){
                let me = this;
                let url = '/api/rule/alllists';
                let data = '';
                me.options=[{name:'顶级',id:-1,pid:0}];
                me.$http.get(url, {params:data}, {credentials: true})
                        .then((res)=> {
                            me.loading = false;
                            if (res.body.code =='SUCCESS') {
                                var lists = res.body.data;
                                me.options=!!lists ? [...me.options,...lists] : me.options;
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.loading = false;
                        });
            },
            //获取全部数据
            getAllRules(){
                let me = this;
                let url = '/api/rule/lists';
                let data = {keys:this.keys};
                me.loading=true;
                me.$http.get(url, {params:data}, {credentials: true})
                        .then((res)=> {
                            me.loading = false;
                            if (res.body.code =='SUCCESS') {
                                me.rules = res.body.data;
                            } else {
                                me.$alert(res.body.msg,'友情提示', {
                                    confirmButtonText: '确定',
                                });
                            }
                        },(err) => {
                            me.loading = false;
                        });
            },
            //新增
            addSubmit(formName){
                var me = this;
                me.$refs[formName].validate((valid)=> {
                    if (valid) {
                        var data = Object.assign({},me.ruleForm);
                        var pids = data.pid;
                        data.pids=(pids.length === 1 && pids[0] <0) ? 0 : pids.join(',');
                        var _pid = pids.pop();
                        data.pid = _pid >0 ? _pid : 0;
                        data.status = 1;
                        data.path = data.path.replace(/(^\s*)|(\s*$)/g,"");
                        var url = '/api/rule/add';
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
                                        me.getAllRules();
                                        this.getOptions()
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
                        var data = JSON.parse(JSON.stringify(me[formName]));
                        var pids = data.pid;
                        data.pids=(pids.length === 1 && pids[0] <0) ? 0 : pids.join(',');
                        var _pid = pids.pop();
                        if(_pid == me.editValue){
                            me.$alert('不能选择自己作为父集', '父级功能选择错误', {
                                confirmButtonText: '确定',
                                callback: action => {
                                    this.$message({
                                        type: 'info',
                                        message: '重新选择'
                                    });
                                }
                            });
                            return
                        }
                        data.pid = _pid >0 ? _pid : 0;
                        data.path = data.path.replace(/(^\s*)|(\s*$)/g, "");
                        var url = '/api/rule/'+data.id;
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
                                        me.getAllRules();
                                        this.getOptions()
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
                me.$confirm('确认删除该功能吗?如若有子功能,将一并删除', '提示', {
                    type: 'warning'
                }).then(() => {
                    let url = '/api/rule/' + id;
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
                                    me.getAllRules();
                                    this.getOptions()
                                } else {
                                    me.$alert(res.body.msg,'友情提示', {
                                        confirmButtonText: '确定'
                                    });
                                }
                            },(err) => {
                                me.editLoading = false;
                            });
                }).catch( _ => {
                    this.$message('已取消删除');
                });
            },
            //显示编辑页面
            handleEdit(index,row){
                this.editFormVisible = true;
                var editForm = Object.assign({}, row);
                editForm.pid==0 ? editForm.pid=[-1] : editForm.pid=editForm.pids.split(',');editForm.pid=editForm.pid.map((item)=>{
                    return item-0
                });
                this.editForm = editForm;
                this.editValue = row.id;
            },
            handleChange(value) {
                console.log(value);
            },
            edithandleChange(value) {
                console.log(value);
            },
            searchName(){
                if(!this.keys){
                    this.getAllRules();
                    this.getOptions()
                }
            }

        },
        mounted() {
            this.getAllRules();
            this.getOptions()
        }
    }

</script>
