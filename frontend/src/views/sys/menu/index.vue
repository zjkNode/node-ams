<template>
    <el-row class="menus">
        <h2>菜单管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入菜单名称/链接地址"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="loadMenus" icon="el-icon-search">查询</el-button>
                <el-button size="small" type="primary" @click="$refs.addForm.show()" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        
        <el-table :data="menuList" stripe v-loading="isLoading" style="width: 100%;" @cell-click="onCellClick">
            <el-table-column fixed type="index" label="" width="60"></el-table-column>
            <el-table-column fixed prop="name" label="菜单名称" show-overflow-tooltip width="220" :formatter="formatTree" class-name='flat-tree'></el-table-column>
            <el-table-column prop="alink" label="链接地址" show-overflow-tooltip width="200"></el-table-column>
            <el-table-column prop="actions" label="页面功能" min-width="200">
                <template v-if="scope.row.isLeaf" scope="scope">
                    <el-tag>测试</el-tag>
                </template>
            </el-table-column> 
            <el-table-column prop="sort" label="排序" width="70" align="center"></el-table-column> 
            <el-table-column prop="status" label="状态" width="80"  filter-placement="bottom-end" align="center">
                <template scope="scope" >
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
                        {{scope.row.status | statusFilter}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="添加时间" align="center" width="200" :formatter="formatterDate" show-overflow-tooltip></el-table-column>
            <el-table-column fixed="right" label="操作" width="100" >
                <template scope="scope">
                    <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="onRemoveClick(scope.$index,scope.row)" style="color: #ff4949;">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog
          :title="actionTitle+' -- 功能配置'"
          :visible.sync="actionVisible">
          <el-tag
              :key="action.id"
              :offset="1"
              v-for="action in actions"
              closable
              type="info">
              {{action.name}}
            </el-tag>
          <el-dropdown split-button type="primary" size="small">
              更多
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in actions" :key="index">{{ item.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
        </el-dialog>
        <addForm ref='addForm' @afterSubmit="loadMenus" ></addForm>   
        <editForm ref="editForm" @afterSubmit="loadMenus" :rowData="rowData"></editForm>
    </el-row>
</template>
<script>
    import addForm from './add.vue';
    import editForm from './edit.vue';

    export default {
        components:{ addForm, editForm},
        data(){
            return {
                isLoading: true,
                menuList: null,
                // menuTree: null,
                actionTitle:'',
                actionVisible: false,
                actions:null,
                rowData: null,
                keys:"",
                addFormVisible: false,
                editFormVisible:false
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
        mounted(){
            this.loadMenus();
            this.loadActions();
        },
        methods: {
            loadMenus(){
                let url = '/api/menu';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url,{ params: params}).then((res)=>{
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
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
            onCellClick(row, column){
                if(column.property == "actions" && row.isLeaf){
                    this.actionTitle = row.name;
                    this.actionVisible = true;
                }
            },
            onEditClick(row){
                this.rowData = Object.assign({}, row);
                this.rowData.pids = row.pids ? row.pids.split(',').map(id => parseInt(id)) : [row.id];
                this.$refs.editForm.show();
            },
            onRemoveClick(index,row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/menu/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        this.menuList.splice(index,1);
                        this.$store.dispatch('refreshMenuTree');
                    });
                }).catch(() => {});
            },
            formatterDate(row,column,cellValue){
                return this.$options.filters.formatDate(cellValue);
            },
            formatTree(row, column,value){
                return this.$options.filters.flatTree(row, value);
            }
        }
    }
</script>
<style scope>
    .el-tag + .el-tag, .el-tag + .el-dropdown {
        margin-left: 10px;
    }
</style>
