<template>
    <el-row class="menus">
        <h2>菜单管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入菜单名称/链接地址"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="loadMenus" icon="el-icon-search">查询</el-button>
                <el-button size="small" type="primary" @click="isFormVisible = true" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-table :data="menuList" stripe v-loading="isLoading" style="width: 100%;" @cell-click="onCellClick">
            <el-table-column fixed type="index" label="" width="60"></el-table-column>
            <el-table-column fixed prop="name" label="菜单名称" show-overflow-tooltip width="220" :formatter="formatTree" class-name='flat-tree'></el-table-column>
            <el-table-column prop="alink" label="链接地址" show-overflow-tooltip width="200"></el-table-column>
            <el-table-column prop="sort" label="排序" width="70" align="center"></el-table-column> 
            <el-table-column prop="actions" label="页面功能" min-width="200" show-overflow-tooltip>
                <template v-if="scope.row.isLeaf" scope="scope">
                    <template v-if="scope.row.actions">
                        <el-tag
                          v-if="scope.row.actions && actions"
                          :key="action.id"
                          :offset="1"
                          size="small"
                          v-for="action in scope.row.actions.split(',')">
                          {{actions[action].name}}
                        </el-tag>
                    </template>
                    <template v-else>
                        <el-tag size='small' type="info">暂无</el-tag>
                    </template>
                </template>
            </el-table-column> 
            <el-table-column prop="status" label="状态" width="80"  filter-placement="bottom-end" align="center">
                <template scope="scope" >
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
                        {{scope.row.status | statusFilter}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="添加时间" align="center" width="200" :formatter="dateFormat" show-overflow-tooltip></el-table-column>
            <el-table-column fixed="right" label="操作" width="100" >
                <template scope="scope">
                    <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="onRemoveClick(scope.$index,scope.row)" style="color: #ff4949;">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <el-dialog
          :title="rowData.name +' -- 功能配置'"
          :visible.sync="actionVisible">
            <template v-if="rowData.actions && actions">
                <el-tag
                  :key="action"
                  :offset="1"
                  v-for="action in rowData.actions"
                  closable
                  @close="onUpdateAction(action, 'delete')">
                  {{ actions[action].name }}
                </el-tag>
            </template>
            <el-dropdown split-button type="primary" size="small" @command="onUpdateAction">
              添加功能
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item 
                    v-for="(item, index) in actions" 
                    :key="index" 
                    :disabled="item.disabled"
                    :command='item.key'>{{ item.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
        </el-dialog>
        
        <el-dialog :title="'菜单 -- '+(title || '新增')" :visible.sync="isFormVisible" @close="onFormClose">
            <el-form label-width="90px" ref="dgForm" :model="formData" :rules="rules" :show-message="true">
                <el-form-item label="菜单级别" prop="pids" >
                    <el-cascader 
                        change-on-select 
                        :options="menuTree" 
                        :props="props" 
                        v-model="formData.pids" 
                        @change="pidsChange">
                    </el-cascader> 
                </el-form-item> 
                <el-form-item label="菜单名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入菜单名称"></el-input>
                </el-form-item>
                <el-form-item label="菜单地址" prop="alink">
                    <el-input v-model="formData.alink" placeholder="请输入菜单访问地址（如 /menus ）"></el-input>
                </el-form-item>
                <el-form-item label="菜单排序" prop="sort">
                    <el-input-number v-model="formData.sort" :min="1"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="isFormVisible = false">取 消</el-button>
                <el-button size="small" type="primary" @click="onSubmit">确 定</el-button>
            </div> 
        </el-dialog>
    </el-row>
</template>
<script>
    import { mapGetters } from 'vuex';

    export default {
        data(){
            return {
                isLoading: false,
                isDoing: false,
                isFormVisible: false,
                menuList: null,
                menuTree: [],
                actionVisible: false,
                actions:null,
                rowData: {},
                keys:"",
                title: '',
                props:{ value:'id', label:'name' },
                formData: {
                    id:'',
                    name: '',
                    pid: null,
                    pids: null,
                    alink:'',
                    sort: 1
                },
                rules: {
                    name: [
                        { required: true, message: '请输入菜单名称', trigger: 'blur' }
                    ],
                    alink: [
                        { required: true, message: '请输入菜单访问地址', trigger: 'blur' }
                    ],
                    pids: [
                        { required: true, min: 1, type:'array', trigger: 'blur'}
                    ],
                    sort: [
                        { required: false, min:1, message:'请输入菜单排序编号', type:'number', trigger: 'blur' }
                    ]
                }
            }
        },
        computed: mapGetters({
            menuData:'getMenuTree',
        }),
        watch: {
            menuData: 'bindMenuTree',
        },
        mounted(){
            this.bindMenuTree(this.menuData)
            this.loadMenus();
            this.loadActions();
        },
        methods: {
            bindMenuTree(val){
                if(!val){
                    return;
                }
                let tmp = [{ name:'顶级菜单', id: 0, pid: 0 }];
                tmp = tmp.concat(val);
                this.menuTree = tmp;
            },
            loadMenus(){
                let url = '/api/menu';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url,{ params: params}).then((res)=>{
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.menuList = res.data;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            loadActions(){
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
            pidsChange(val){
                if(val[0] === 0){ // 顶级
                    this.formData.sort = this.menuTree.length;
                    return;
                }
                let tmpMenu = { children: this.menuTree};
                val.forEach(id => {
                    tmpMenu = tmpMenu.children.find(menu => menu.id === id);
                });
                let sort = tmpMenu.children && tmpMenu.children.slice(-1)[0].sort;
                this.formData.sort = sort + 1;
            },
            onCellClick(row, column){
                if(column.property == "actions" && row.isLeaf){
                    this.rowData = Object.assign({}, row);
                    this.rowData.actions = row.actions ? row.actions.split(',') : [];
                    for(let key in this.actions){
                        this.actions[key].disabled = this.rowData.actions.includes(key);
                    }
                    this.actionVisible = true;
                }
            },
            onRemoveClick(index,row){
                this.$confirm('级联子菜单将被同步删除，确认删除吗?', '友情提示', { type: 'warning'}) .then(() => {
                    let url = '/api/menu/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.$store.dispatch('refreshMenuTree');
                        this.loadMenus();
                    });
                }).catch(() => {});
            },
            onUpdateAction(command, type){
                let params = Object.assign({}, this.rowData);
                if(type && type === 'delete'){
                    params.actions.splice(params.actions.indexOf(command), 1);
                } else {
                    params.actions.push(command);
                }
                // 按系统配置，排序显示
                let tmpActions = [];
                for(let key in this.actions){
                    if(params.actions.includes(key)){
                        tmpActions.push(key);
                    }
                }
                params.actions = tmpActions.join(',');
                var url = "/api/menu/"+ this.rowData.id;
                this.$http.put(url,  params).then(res => {
                    if(res.code !== "SUCCESS"){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.$message.success(res.msg);
                    for(let key in this.actions){
                        this.actions[key].disabled = tmpActions.includes(key);
                    }
                    this.menuList.find(item => item.id === this.rowData.id).actions = params.actions;
                });
            },
            onEditClick(row){
                this.formData = Object.assign({}, row);
                this.formData.pids = this.formData.pids.split(',').map(id => parseInt(id));
                this.isFormVisible = true;
            },
            onFormClose(){
                this.formData = {
                    id:'',
                    name: '',
                    pid: null,
                    pids: [],
                    alink:'',
                    sort: 1
                };
                this.title = "";
                this.$refs.dgForm.resetFields();
            },
            onSubmit(){
                if(this.formData.id){
                    this.onEditSubmit();
                    return;
                }
                this.onAddSubmit();
            },
            onAddSubmit(){
                this.$refs.dgForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }
                    this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
                    this.isDoing = true;
                    this.$http.post('/api/menu', this.formData).then(res => {
                        this.isDoing = false;
                        if(res.code != 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.isFormVisible = false;
                        this.$store.dispatch('refreshMenuTree');
                        this.loadMenus();
                    });
                });
            },
            onEditSubmit(){
                this.$refs.dgForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }

                    this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
                    var apiUrl = "/api/menu/"+ this.formData.id;
                    this.isDoing = true;
                    this.$http.put(apiUrl, this.formData).then(() => {
                        this.isDoing = false;
                        this.isFormVisible = false;
                        this.$store.dispatch('refreshMenuTree');
                        this.loadMenus();
                    }).catch(() => {
                        this.isDoing = false;
                    });
                });
            }
        }
    }
</script>