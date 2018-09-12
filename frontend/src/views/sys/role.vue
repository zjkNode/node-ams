<template>
    <el-row>
        <h2>角色管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入角色名称/描述" @input="searchName"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button type="primary" size="small" @click="bindRoles" icon="el-icon-search"> 查询</el-button>
                <el-button type="primary" size="small" @click="addFormVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="roles" highlight-current-row v-loading="loading">
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
                    <el-button type="text" size="small" @click="showEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="handleJobs(scope.$index, scope.row)">权限</el-button>
                    <el-button type="text" size="small" @click="handleDel(scope.$index, scope.row)" style="color: #ff4949;">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
                @size-change="onSizeChange"
                @current-change="handleCurrentChange"
                :current-page="page"
                :page-sizes="[15, 30, 50, 100]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
        </el-pagination>
        
        <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="80px">
                <el-form-item label="部门选择" prop="depid">
                    <el-cascader change-on-select :options="depOptions"  :props="propss" v-model="addForm.depid">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="addForm.name"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="desc">
                    <el-input type="textarea" v-model="addForm.desc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="addFormVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
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
                <el-button size="small" @click.native="editFormVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

    </el-row>
</template>
<script>
    export default {
        data() {
            return {
                keys:'',
                roles:[],
                loading: false,
                editLoading: false,
                addFormVisible: false,//新增界面是否显示
                editFormVisible: false,//编辑界面是否显示
                editJobsVisible:false,//编辑分配权限
                //新增界面数据
                addForm: {
                    name: '',
                    desc: '',
                    depid:[]
                },
                //编辑界面数据
                editForm: {
                    name: '',
                    desc:'',
                },
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
        mounted() {
            this.bindRoles();
            this.bindDevTree();
        },
        methods: {
            bindRoles(){
                let url = '/api/role';
                let data = {
                    keys: this.keys,
                    pageIndex: this.page,
                    pageSize: this.pageSize
                };
                this.loading = true;
                this.$http.get(url, { params:data }).then((res)=> {
                    this.loading = false;
                    if (res.code !=='SUCCESS') {
                        this.$message(res.msg);
                        return;
                    } 

                    var data = res.data;
                    this.roles = data.lists;
                    this.total = data.total;
                }).catch(() => {
                    this.loading = false;
                });
            },
            //获取部门列表
            bindDevTree(){
                let url = '/api/dep/tree';
                this.$http.get(url,null).then((res)=>{
                    if(res.code !== 'SUCCESS'){
                        this.$message(res.msg);
                        return;
                    }

                    let depTree = res.data || [];
                    if(depTree[0].id == -1){
                        depTree.splice(0, 1); // 删除第一个 顶级 元素
                    }
                    this.depOptions = depTree;
                });
            },
            //新增
            addSubmit(){
                this.$refs.addForm.validate((valid)=> {
                    if(!valid){
                        return;
                    }
                    var data = Object.assign({},this.addForm);
                    data.depid = data.depid.pop();
                    var url = '/api/role';
                    this.addLoading = true;
                    this.$http.post(url, data).then((res)=> {
                        this.addLoading = false;
                        if (res.code !== 'SUCCESS') {
                            this.$message(res.msg);
                            return;
                        } 

                        this.$refs.addForm.resetFields();
                        this.addFormVisible = false;
                        this.bindRoles();
                    }).catch(() => {
                        this.addLoading = false;
                    });
                });
            },
            //编辑
            editSubmit(){
                this.$refs.editForm.validate((valid)=> {
                    if(!valid){
                        return;
                    }
                    var data = Object.assign({},this.editForm);
                    data.depid = data.depid.pop();
                    var url = '/api/role/'+data.id;
                    this.editLoading = true;
                    this.$http.put(url, data).then((res)=> {
                        this.editLoading = false;
                        if (res.code !=='SUCCESS') {
                            this.$message(res.msg);
                            return;
                        }

                        this.$refs.editForm.resetFields();
                        this.editFormVisible = false;
                        this.bindRoles();
                    }).catch(() => {
                        this.editLoading = false;
                    });
                });
            },
            //删除
            handleDel(index,row){
                let id = row.id;
                this.$confirm('确认删除该记录吗?', '提示', { type: 'warning' }).then(() => {
                    let url = '/api/role/' + id;
                    let data ='';
                    this.$http.delete(url, data).then((res)=> {
                        if (res.code !=='SUCCESS') {
                            this.$message(res.msg);
                            return;
                        } 
                        this.roles.splice(index,1);
                    });
                }).catch(() => {});
            },
            //显示编辑页面
            showEdit(index,row){
                this.editForm = Object.assign({}, row);
                this.editForm.depid = row.dep.pids != 0 ? 
                                    row.dep.pids.split(',').map((item)=> parseInt(item)) : 
                                    [row.dep.id];

                this.editFormVisible = true;
            },
            //显示分配权限页面
            handleJobs(index,row){
                this.$router.push({
                    path:'/sys/org/role/authority',
                    query:{ id:row.id }
                });
            },
            //跳转分页
            handleCurrentChange(val) {
                this.page = val;
                this.bindRoles();
            },
            onSizeChange(val){
                this.pageSize = val;
                this.bindRoles();
            },
            searchName(){
                !this.keys && this.bindRoles();
            }
        }
    }
</script>
