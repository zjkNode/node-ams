<template>
    <el-row>
        <h2>角色管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入角色名称/描述" @input="searchName"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button type="primary" size="small" @click="bindRoles" icon="el-icon-search"> 查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" type="primary" size="small" @click="isVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="roles" highlight-current-row v-loading="loading">
            <el-table-column type="index" width="60" ></el-table-column>
            <el-table-column prop="name" label="角色名称"></el-table-column>
            <el-table-column prop="desc" label="角色描述" show-overflow-tooltip></el-table-column>
            <el-table-column prop="create_time" label="添加时间" align="center" width="160" sortable :formatter="dateFormat"></el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
                <template slot-scope="scope">
                    <el-button v-if="authCheck(sysActions.edit)" type="text" size="small" @click="onEdit(scope.row)">编辑</el-button>
                    <el-button v-if="authCheck(sysActions.auth)" type="text" size="small" @click="onAuthConf(scope.row)">权限</el-button>
                    <el-button v-if="authCheck(sysActions.delete)" type="text" size="small" @click="onDelete(scope.$index, scope.row)" style="color: #F56C6C;">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <el-dialog :title="'角色 -- '+ (title || '新增')" :visible.sync="isVisible" @close="onFormClose">
            <el-form :model="formData" :rules="rules" ref="formData" label-width="80px" @keyup.enter.native="onSubmit">
                <el-form-item label="角色名称" prop="name" >
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

        <el-dialog :title="'角色权限分配 -- '+ roleData.name" :visible.sync="isAuthVisible" @close="onAuthClose">
            <el-tabs @tab-click='loadAuthConf' v-model='curAuthTab'>
                <el-tab-pane label="系统菜单权限" name="authAction">
                    <el-tree
                        ref='menuTree'
                        :props="props"
                        :data="menuData"
                        node-key="id"
                        show-checkbox
                        @check="onMenuChecked">
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
                                    size="mini">{{ authConf[curAuthTab][action].name }}</el-tag>
                                    <el-button v-else class="btn-mini" :key='action' @click="onCheckAction(data.id, action)">{{ authConf[curAuthTab][action].name }}</el-button>
                                </template>
                            </template>
                        </span>
                    </el-tree>
                </el-tab-pane>
                <el-tab-pane label="系统数据权限" name='authData' style="margin:15px 0;">
                    <el-checkbox-group v-model="roleData.datas">
                        <el-checkbox
                            v-for="(item, key) in authConf[curAuthTab]" 
                            :label="item.id" 
                            :key="item.id">{{ item.name }}</el-checkbox>
                    </el-checkbox-group>  
                </el-tab-pane>
            </el-tabs>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="isAuthVisible = false">取 消</el-button>
                <el-button size="small" type="primary" @click="onAuthUpdate" :loading="isDoing">确 定</el-button>
            </div>
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
                        {required: true,message:'名称不能为空',trigger: 'blur',},
                        {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
                    ],
                    desc:[
                        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
                    ]
                },
                props: {
                    label: 'name',
                },
                isAuthVisible: false,
                isDoing: false,
                curAuthTab:'authAction',
                authConf:{
                    authAction:null,
                    authData: null
                },
                cacheRole:null,
                roleData:{
                    id:'',
                    mids:[],
                    actions:{}, //{ menuid: ['add', 'edit', ...]}
                    datas:[]
                }
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
                    this.roles = res.data;
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
            onDelete(index,row){
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
            onEdit(row){
                this.formData = Object.assign({}, row);
                this.title = '编辑';
                this.isVisible = true;
            },
            onAuthClose(){
                this.curAuthTab = 'authAction';
            },
            //显示分配权限页面
            onAuthConf(row){
                this.cacheRole = row;
                this.roleData = Object.assign({}, row);
                this.isAuthVisible = true;
                this.loadAuthConf();
                this.$nextTick(() => {
                    this.$refs.menuTree.setCheckedKeys(row.mids);
                });
                if(!this.curUser.roleids.includes(row.id)){
                    return;
                }
                setTimeout(() => {
                    this.$notify({
                        title: '警告',
                        message: '检测到当前用户权限将被修改，修改成功后请重新登录系统，',
                        type: 'warning'
                    });
                }, 500);
            },
            loadAuthConf(){
                if(this.authConf[this.curAuthTab]){
                    return;
                }
                let query = { type: this.curAuthTab };
                this.$http.get('/api/config/listByType', { params: query }).then(res => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.authConf[this.curAuthTab] = res.data;
                });
            },
            onMenuChecked(data, tree){
                this.roleData.mids = tree.checkedKeys;
                let tmpActions = Object.assign({}, this.roleData.actions);
                for(let key in tmpActions){
                    if(!tree.checkedKeys.includes(parseInt(key))){
                        delete tmpActions[key];
                    }
                }
                this.roleData.actions = tmpActions;
            },
            onCheckAction(menuId, action){
                let roleActions = Object.assign({}, this.roleData.actions);
                roleActions[menuId] = roleActions[menuId] || [];
                roleActions[menuId].push(action);
                this.roleData.actions = roleActions;
                if(!this.roleData.mids.includes(menuId)){
                    this.roleData.mids.push(menuId);
                }
                this.$refs.menuTree.setCheckedKeys(this.roleData.mids);
            },
            onRemoveAction(menuId, action){
                let roleActions = Object.assign({}, this.roleData.actions);
                roleActions[menuId].splice(roleActions[menuId].indexOf(action),1);
                if(roleActions[menuId].length === 0){
                    delete roleActions[menuId];
                    this.roleData.mids.splice(this.roleData.mids.indexOf(menuId), 1);
                }
                this.roleData.actions = roleActions;
                this.$refs.menuTree.setCheckedKeys(this.roleData.mids);
            },
            onAuthUpdate(){
                let url = '/api/role/'+ this.roleData.id;
                
                // let checkedNodes = this.$refs.menuTree.getCheckedNodes(false, true);
                // this.roleData.mids = checkedNodes.map(node => node.id);
                let checkedKeys = this.$refs.menuTree.getCheckedKeys();
                let halfCheckedKeys = this.$refs.menuTree.getHalfCheckedKeys();
                halfCheckedKeys = halfCheckedKeys.map(id => -id); // 负值代表半选状态，页面绑定时生效
                this.roleData.mids = [...checkedKeys, ...halfCheckedKeys];
                this.isDoing = true;
                this.$http.put(url, this.roleData).then((res)=> {
                    this.isDoing = false;
                    if (res.code !=='SUCCESS') {
                        this.$message.error(res.msg);
                        return;
                    }
                    this.isAuthVisible = false;
                    this.cacheRole.mids = this.roleData.mids;
                    this.cacheRole.actions = this.roleData.actions;
                    this.cacheRole.datas = this.roleData.datas;
                    // 更新当前登录用户的权限及菜单
                    if(this.curUser.roleids.includes(this.roleData.id)){
                        this.$message.warning('当前用户权限已被修改，请退出系统重新登录');
                        this.signout();
                    }
                }).catch(() => { 
                    this.isDoing = false;
                });
            }
        }
    }
</script>
<style scope>
    .custom-node{
        font-size: 12px;
    }
    .btn-mini{
        font-size: 12px;
        padding: 0 5px;
        line-height: 18px;
        height:20px;
    }
</style>