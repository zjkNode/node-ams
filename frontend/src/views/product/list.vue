<template>
    <div>
        <h2>产品列表</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input v-model="keys" size="small" placeholder="请输入产品名称"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button type="primary" size="small" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" size="small" @click="onAdd" icon="el-icon-plus"> 新增</el-button>
            </el-col>  
        </el-row>
        <el-table :data="dataList" stripe v-loading="isLoading">
            <el-table-column type="index" label="" width="60"></el-table-column>
            <el-table-column prop="confid" label="业务类型" width="100" align="center">
                <template slot-scope="scope" >
                    <el-tag :type="scope.row.buConfig.status === 2 ? 'info' : ''" size="small">
                        {{ scope.row.buConfig.name }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="typeName" label="产品类别" align="center" show-overflow-tooltip width="160"></el-table-column>
            <el-table-column prop="title" label="产品标题" align="center" width="200"></el-table-column>
            <!-- <el-table-column prop="url" label="访问地址" align="center" width="300"></el-table-column> -->
            <el-table-column prop="content" label="产品介绍" align="center" min-width="260" class-name='overflow-ellipsis' :formatter="contentFormat"></el-table-column>
            <el-table-column prop="status" label="状态" width="90" align="center">
                <template slot-scope="scope" >
                    <el-tag :type="status[scope.row.status].type" close-transition>
                        {{ status[scope.row.status].label}}
                    </el-tag>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="publish_time" label="发布时间" width="160" align="center" :formatter="dateFormat" sortable></el-table-column> -->
            <el-table-column fixed="right" label="操作" width="100" align="center">
                <template slot-scope="scope">
                    <!-- <el-button type="text" size="small" @click="onPreview(scope.row)">预览</el-button> -->
                    <el-button type="text" size="small" @click="onEdit(scope.row)" >编辑</el-button>
                    <el-button type="text" size="small" @click="onDelete(scope.row)" :disabled="[2,4].includes(scope.row.status)" style="color: #F56C6C;">删除</el-button>
                    <!-- <el-button type="text" size="small" @click="onOnline(scope.row)" :disabled="[2].includes(scope.row.status)">上架</el-button>
                    <el-button type="text" size="small" @click="onOffline(scope.row)" :disabled="[1,3].includes(scope.row.status)">下架</el-button>
                    <el-dropdown size="small" trigger="click" @command="handleDownLoad">
                        <span class="el-dropdown-link">
                            下载<i class="el-icon-caret-bottom el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item :command="{name:'vm',row:scope.row}">vm格式</el-dropdown-item>
                            <el-dropdown-item :command="{name:'html',row:scope.row}">html格式</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown> -->
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            @size-change="onSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pageIndex"
            :page-sizes="[15, 30, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                isLoading: false,
                dataList:null,
                keys:"",
                total:0,
                pageSize:15,
                pageIndex: 1,
                status:{
                    1: { label:'测试', type:'' },
                    2: { label:'已上架', type:'success' },
                    3: { label:'已下架', type:'info' },
                    4: { label:'已更新', type:'warning' }
                }
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init(){
                let params = {
                    keys: this.keys,
                    pageIndex:this.pageIndex,
                    pageSize:this.pageSize
                }
                let url = '/api/pro';
                this.isLoading = true;
                this.$http.get(url,{ params: params }).then((res)=>{
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.dataList = res.data.list;
                    this.total = res.data.total;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            //发布产品
            onOnline(row){
                this.$confirm('合同上架，将发布到线上环境，确认上架吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/contract/online';
                    this.$http.post(url, { id: row.id }).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.$message.success(res.msg);
                        this.init();
                    }).catch(() => {});
                }).catch(() => {});
            },
            onOffline(row){
                this.$confirm('合同下架，线上合同将不能再访问，确认下架吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/contract/offline';
                    this.$http.post(url, { id: row.id }).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.$message.success(res.msg);
                        this.init();
                    }).catch(() => {});
                }).catch(() => {});
            },
            //预览
            onPreview(row){
                window.open(row.url);
            },
            handleDownLoad(command){
                let row = command.row;
                let url = row.url.substring(row.url.indexOf('/contract/'));
                url = '/preview'+ url;
                if(command.name == "vm"){
                    this.download(url, `${row.title}.vm`);
                    return;
                }
                
                if(command.name == "html"){
                    this.download(url, `${row.title}.html`);
                    return;
                }

                // if(command.name === 'pdf'){
                //     url = '/preview/contract/pdf/'+ row.id;
                //     this.download(url, `${row.title}.pdf`);
                //     return;
                // }
            },
            download(url, title){
                let a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', title);
                a.click();
            },
            onAdd(){
                this.$router.push({
                    path:'/pro/add'
                });
            },
            //显示编辑弹框
            onEdit(row){
                this.$router.push({
                    path:'/pro/edit',
                    query:{ id: row.id }
                });
            },
            //删除数据
            onDelete(row) {
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/pro/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        if(res.code != 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.init();
                    });
                }).catch(() => {});
            },
            handleCurrentChange(val) {
                this.pageIndex = val;
                this.init()
            },
            onSizeChange(val){
                this.pageSize = val;
                this.init()
            },
            contentFormat(row){
                return row.content.replace(/<[^>]+>/g,"")
            },
        }
    }
</script>
<style lang='scss' scope>
.el-table {
    .el-dropdown-link {
        cursor: pointer;
        color: #409EFF;
        font-size:12px;
    }
    .el-icon-arrow-down {
        font-size: 12px;
    }
    .el-button + .el-dropdown{
        margin-left:10px;
    }
}

</style>