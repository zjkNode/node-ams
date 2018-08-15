<template>
    <el-row>
        <h2>配置管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="10">
                <el-input v-model="keys" placeholder="请输入配置内容/描述/关键字/值"  @input="searchName"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="bindUsers" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>


        </el-row>
        <el-row>
            <el-table :data="userList" stripe v-loading="isLoading" style="width: 100%">
                <el-table-column type="index" width="60"></el-table-column>
                <el-table-column prop="name" label="配置名称" min-width="160"></el-table-column>
                <el-table-column prop="key" label="关键字" min-width="160"></el-table-column>
                <el-table-column prop="value" label="配置值" min-width="200"></el-table-column>
                <el-table-column prop="desc" label="配置描述" min-width="160" show-overflow-tooltip></el-table-column>
                <el-table-column prop="status" label="状态" width="80"  filter-placement="bottom-end" align="center">
                    <template scope="scope" >
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                    <template scope="scope">
                        <el-button @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                        <el-button @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <div class="block pagbar">
            <el-pagination
                    @size-change="onSizeChange"
                    @current-change="onCurrentChange"
                    :current-page="pageIndex"
                    :page-sizes="[15, 30, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="bindUsers"></addForm>
        <editForm :isEditVisible="editFormVisible" :rowData="rowData" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="bindUsers"></editForm>
    </el-row>
</template>
<script type="text/ecmascript-6">
    import addForm from './add.vue';
    import editForm from './edit.vue';
    var moment = require('moment');

    export default {
        components:{ addForm, editForm },
        data() {
            return {
                addFormVisible: false,
                editFormVisible:false,
                isLoading: false,
                keys:"",
                rowData:null,
                userList: null,
                pageSize:15,
                pageIndex:1,
                total:0
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
            this.bindUsers();
        },
        methods:{
            onAddVisibleChange(val){
                this.addFormVisible = val;
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            },
            dateFormat(row,column,cellvalue){
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            filterTag(value,row){
                return row.status == value;
            },
            bindUsers(){
                let url = '/api/config/lists';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex:this.pageIndex
                };
                this.isLoading = true;
                this.$http.get(url,{ params: params }).then((res)=>{
                    this.isLoading = false;
                    if(res.body.code === 200){
                        let resData = res.body.data;
                        this.userList = resData.lists;
                        this.total = resData.total;
                    }
                },(err) => {
                    this.isLoading = false;
                });
            },
            onAddClick(){
                this.addFormVisible = true;
            },
            onEditClick(row){
                this.rowData = Object.assign({}, row);
                this.editFormVisible = true;
            },
            onRemoveClick(index,row){
                this.$confirm('确认删除该用户吗?', '友情提示', { type: 'warning'})
                        .then(() => {
                            let url = '/api/config/'+ row.id;
                            this.$http.delete(url).then((res)=>{
                                this.userList.splice(index,1);
                            },(err)=>{
                                console.log(err);
                            });
                        }).catch(()=>{
                    this.$message({
                        message:'已取消删除'
                    });
                });

            },
            onSizeChange(val) {
                this.pageSize = val;
                this.bindUsers();
            },
            onCurrentChange(val) {
                this.pageIndex = val;
                this.bindUsers();
            },
            searchName(){
                if(!this.keys){
                    this.bindUsers()
                }
            }
        }
    };
</script>
