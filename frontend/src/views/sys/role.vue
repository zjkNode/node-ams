<template>
    <el-row>
        <h2>角色管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入角色名称/描述" @input="searchName"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button type="primary" size="small" @click="bindRoles" icon="el-icon-search"> 查询</el-button>
                <el-button type="primary" size="small" @click="isVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="roles" highlight-current-row v-loading="loading">
            <el-table-column type="index" width="60" >
            </el-table-column>
            <el-table-column prop="name" label="角色名称"  >
            </el-table-column>
            <el-table-column prop="desc" label="角色描述" show-overflow-tooltip>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
                <template scope="scope">
                    <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="showAuthConf(scope.row)">权限</el-button>
                    <el-button type="text" size="small" @click="handleDel(scope.$index, scope.row)" style="color: #ff4949;">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <el-dialog :title="'角色 -- '+ (title || '新增')" :visible.sync="isVisible" @close="onFormClose">
            <el-form :model="formData" :rules="rules" ref="formData" label-width="80px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="formData.name"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="desc">
                    <el-input type="textarea" v-model="formData.desc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click.native="isVisible = false">取消</el-button>
                <el-button size="small" type="primary" @click.native="onSubmit" :loading="isLoading">提交</el-button>
            </div>
        </el-dialog>

        <el-dialog :title="'角色权限分配 -- '+ authTitle" :visible.sync="isAuthVisible" @close="onAuthClose">
            <el-tabs style="margin: 0 2%;">
                <el-tab-pane label="系统菜单权限">
                    <el-tree
                        ref='menuTree'
                        :props="props"
                        :data="menuData"
                        node-key="id"
                        show-checkbox
                        @node-click="onNodeClick"
                        @check-change="onCheckChanged">
                        <span class='custom-node' slot-scope="{ node, data }">
                            {{ data.name }}
                            <template v-if="data.isLeaf">
                                <el-tag v-if="!data.actions" size="mini" type="info">暂无</el-tag>
                                <template v-else v-for='action in data.actions.split(",")'>
                                    <el-tag 
                                    v-if="roleData.actions[data.id] && roleData.actions[data.id].includes(action)" 
                                    :key='action'
                                    closable
                                    @close="onRemoveAction(data.id, action)"
                                    size="mini">{{ actions[action].name }}</el-tag>
                                    <el-button v-else class="btn-mini" :key='action' @click="onCheckAction(data.id, action)">{{ actions[action].name }}</el-button>
                                </template>
                            </template>
                        </span>
                    </el-tree>
                </el-tab-pane>
                <el-tab-pane label="系统数据权限">配置管理</el-tab-pane>
            </el-tabs>
        </el-dialog>
    </el-row>
</template>
<script>
    import { mapGetters } from 'vuex';
    export default {
        computed: mapGetters({
            menuData:'getMenuTree',
        }),
        data() {
            return {
                keys:'',
                roles:[],
                loading: false,
                isLoading: false,
                isVisible: false,//新增界面是否显示
                title: '',
                formData: {
                    name: '',
                    desc: '',
                },
                rules: {
                    name: [
                        {required: true,message:'名称不能为空',trigger: 'blur'},
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ],
                    desc:[
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },

                authTitle:'',
                isAuthVisible: false,
                roleData:'',
                props: {
                    label: 'name',
                },
                tmpActions:[],
                actions:[],
            }
        },
        mounted() {
            this.bindRoles();
        },
        methods: {
            searchName(){
                !this.keys && this.bindRoles();
            },
            bindRoles(){
                let url = '/api/role';
                let data = {
                    keys: this.keys
                };
                this.loading = true;
                this.$http.get(url, { params:data }).then((res)=> {
                    this.loading = false;
                    if (res.code !=='SUCCESS') {
                        this.$message.error(res.msg);
                        return;
                    } 
                    this.roles = res.data;;
                }).catch(() => {
                    this.loading = false;
                });
            },
            onFormClose(){
                this.formData = {
                    name: '',
                    desc: '',
                };
                this.title = "";
                this.$refs.formData.resetFields();
            },
            onSubmit(){
                if(this.formData.id){
                    this.editSubmit();
                    return;
                }
                this.addSubmit();
            },
            //新增
            addSubmit(){
                this.$refs.formData.validate((valid)=> {
                    if(!valid){
                        return;
                    }
                    var url = '/api/role';
                    this.isLoading = true;
                    this.$http.post(url,  this.formData).then((res)=> {
                        this.isLoading = false;
                        if (res.code !== 'SUCCESS') {
                            this.$message.error(res.msg);
                            return;
                        } 
                        this.isVisible = false;
                        this.bindRoles();
                    }).catch(() => {
                        this.isLoading = false;
                    });
                });
            },
            //编辑
            editSubmit(){
                this.$refs.formData.validate((valid)=> {
                    if(!valid){
                        return;
                    }
                    var url = '/api/role/'+ this.formData.id;
                    this.isLoading = true;
                    this.$http.put(url, this.formData).then((res)=> {
                        this.isLoading = false;
                        if (res.code !=='SUCCESS') {
                            this.$message.error(res.msg);
                            return;
                        }

                        this.isVisible = false;
                        this.bindRoles();
                    }).catch(() => {
                        this.isLoading = false;
                    });
                });
            },
            //删除
            handleDel(index,row){
                let id = row.id;
                this.$confirm('确认删除该记录吗?', '提示', { type: 'warning' }).then(() => {
                    let url = '/api/role/' + id;
                    this.$http.delete(url).then((res)=> {
                        if (res.code !== 'SUCCESS') {
                            this.$message.error(res.msg);
                            return;
                        } 
                        this.roles.splice(index,1);
                    });
                }).catch(() => {});
            },
            //显示编辑页面
            showEdit(row){
                this.formData = Object.assign({}, row);
                this.title = '编辑';
                this.isVisible = true;
            },
            //显示分配权限页面
            showAuthConf(row){
                this.authTitle = row.name;
                this.roleData = row;
                this.roleData.actions = row.actions ? JSON.parse(row.actions) : {};
                this.loadActions();
                this.isAuthVisible = true;
            },
            onAuthClose(){
                console.log('onAuthClose');
            },
            loadActions(){
                if(this.actions.length > 0){
                    return;
                }
                let query = {
                    type: 'authAction'
                };
                this.$http.get('/api/config/listByType', { params: query }).then(res => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.actions = res.data;
                });
            },
            onNodeClick(data, node){
                // console.log(data, node)
                // if(data.isLeaf){
                //  this.nodeData = data;
                //  this.nodeData.actions = data.actions ? data.actions.split(',') : [];
                // }
            },
            onCheckChanged(data, checked, indeterminate){
                console.log(data, checked, indeterminate);
            },
            onActionChecked(value){
                console.log(value)
            },
            onCheckAction(menuId, action){
                let roleActions = Object.assign({}, this.roleData.actions);
                roleActions[menuId] = roleActions[menuId] || [];
                roleActions[menuId].push(action);
                // actions = { menuid: ['add', 'edit', ...]}
                let params = {
                    roleid: this.roleData.id,
                    actions: roleActions
                };
                // 更新成功后同步本地状态
                // this.tmpActions = roleActions[menuId];
                this.roleData.actions = roleActions;
                console.log(this.tmpActions)
                console.log(params);
            },
            onRemoveAction(menuId, action){
                let roleActions = Object.assign({}, this.roleData.actions);
                roleActions[menuId].splice(roleActions[menuId].indexOf(action),1);
                let params = {
                    roleid: this.roleData.id,
                    actions: roleActions
                }

                // 更新成功后 同步本地状态
                this.roleData.actions = roleActions;
            }
        }
    }
</script>
<style scope>
   
    .btn-mini{
        font-size: 12px;
        padding: 0 5px;
        line-height: 18px;
        height:20px;
    }
    .el-tag + .el-button, 
    .el-button + .el-button,
    .el-button + .el-tag{
        margin-left:10px;
    }
</style>