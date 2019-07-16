<template>
    <el-row>
        <h2>分享记录</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入用户名/分享内容"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" icon="el-icon-search" @click="loadData">查询</el-button>
            </el-col>
        </el-row>
        <el-table :data="logsList" stripe v-loading="isLoading">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="phone" label="手机号" width="100"></el-table-column>
            <el-table-column prop="content" label="分享文案" min-width="260" show-overflow-tooltip></el-table-column>
            <el-table-column prop="image" label="分享图片" min-width="300" show-overflow-tooltip></el-table-column>
            <el-table-column prop="share" label="分享类型"  min-width="300" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ptype" label="产品类型" width="140"></el-table-column>
            <el-table-column prop="ctime" label="操作时间" width="160" :formatter="dateFormat" sortable></el-table-column>
        </el-table>
        <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pageIndex"
                :page-sizes="[15, 30, 50, 100]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
        </el-pagination>
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
            // this.loadData();
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
                    if (res.code !== 'SUCCESS') {
                        this.$message.error(res.msg);
                        return;
                    }
                    let resData = res.data;
                    this.logsList = resData.list;
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
            }
        }
    })
</script>
