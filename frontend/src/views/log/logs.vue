<template>
    <el-row class="logs">
        <h2>日志管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入用户名/内容/链接地址"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" icon="el-icon-search" @click="getLogs">查询</el-button>
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
<script type="text/ecmascript-6">
    var moment = require('moment');

    export default({
        data() {
            return {
                isLoading: false,
                pageSize: 15,
                pageIndex: 1,
                total: 0,
                keys: "",
                logsList: [],
//             新增页面数据;
                addFormShow: false,
            }
        },
        mounted(){
            this.getLogsDate();
        },
        methods: {
            //获取日志列表;
            getLogsDate(){
                let url = '/api/logs/lists';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                };
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if (res.body.code === 200) {
                        let resData = res.body.data;
                        this.logsList = resData.lists;
                        this.total = resData.total;
                    }
                }, (err) => {
                    this.isLoading = false;
                });
            },
            getLogs(){
                this.getLogsDate();
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getLogs();
            },
            handleCurrentChange(val) {
                this.pageIndex = val;
                this.getLogs();
            },
            dateFormat(row, column, cellvalue){
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.addFormShow = false;
            }
        }
    })
</script>
