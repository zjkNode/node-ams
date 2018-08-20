<template>
    <el-row class="menus">
        <h2>菜单管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入菜单名称/链接地址"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="loadMenus" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="$refs.addForm.show()" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-row>
            <el-table :data="menuList" stripe v-loading="isLoading" style="width: 100%;">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="name" label="菜单名称" show-overflow-tooltip width="300" :formatter="formatTree" class-name='flat-tree'></el-table-column>
                <el-table-column prop="alink" label="链接地址" show-overflow-tooltip min-width="180"></el-table-column>
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
        </el-row>
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
            onEditClick(row){
                this.rowData = Object.assign({}, row);
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
