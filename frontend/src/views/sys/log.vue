<template>
    <el-row>
        <h2>日志管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入用户名/内容/链接地址"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" icon="el-icon-search" @click="loadData">查询</el-button>
            </el-col>
        </el-row>
        <el-table :data="logsList" stripe v-loading="isLoading">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column prop="content" label="内容描述" min-width="180" show-overflow-tooltip></el-table-column>
            <el-table-column prop="url" label="链接地址"  min-width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ip" label="用户 IP" width="150" show-overflow-tooltip></el-table-column>
            <el-table-column prop="create_time" label="添加时间" width="200" :formatter="dateFormat" show-overflow-tooltip></el-table-column>
        </el-table>
        <div class="block pagbar">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="pageIndex"
                    :page-sizes="[15, 30, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
    </el-row>
</template>
<script>
    export default({
        data() {
            return {
                isLoading: false,
                pageSize: 15,
                pageIndex: 1,
                total: 0,
                keys: "",
                logsList: [],
            }
        },
        mounted(){
            this.loadData();
        },
        methods: {
            //获取日志列表;
            loadData(){
                let url = '/api/log';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                };
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if (res.code === 200) {
                        this.$toast(res.msg);
                        return;
                    }
                    let resData = res.data;
                    this.logsList = resData.lists;
                    this.total = resData.total;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.loadData();
            },
            handleCurrentChange(val) {
                this.pageIndex = val;
                this.loadData();
            },
            dateFormat(row, column, cellvalue){
                this.$options.filters.formatDate(cellvalue);
            }
        }
    })
</script>
