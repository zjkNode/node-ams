<template>
    <div>
        <h2>活动列表</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入活动名称/代码/路径"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" size="small" type="primary" icon="el-icon-plus" @click="$router.push('/act/add')">新增</el-button>
            </el-col>  
        </el-row>
        <el-table stripe v-loading="isLoading" :data="actList">
            <el-table-column type="index" label="" width="60"></el-table-column>
            <el-table-column prop="name" label="活动名称" show-overflow-tooltip align="center" width="200"></el-table-column>
            <el-table-column prop="code" label="活动代码" align="center"  width="100"></el-table-column>
            <el-table-column prop="url" label="活动访问Url" align="center" min-width="300"></el-table-column>
            <el-table-column prop="extends" label="扩展属性" align="center" min-width="260">
                <template slot-scope="scope">
                    <el-tooltip v-if="value" v-for="(value, key) in scope.row.extends" class="item" effect="dark" :content="value" :key="key">
                        <el-tag size="small" style="margin:0 3px;">{{ extendConfig[key] || key }}</el-tag>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90" align="center">
                <template slot-scope="scope" >
                    <el-tag :type="actStauts[scope.row.status].type" close-transition>
                        {{ actStauts[scope.row.status].label }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="publish_time" label="发布时间" width="160" align="center" :formatter="dateFormat" sortable show-overflow-tooltip></el-table-column>
            <el-table-column fixed="right" label="操作" width="250" align="center">
                <template slot-scope="scope">
                    <el-button v-if="authCheck(sysActions.preview)" type="text" size="small" :disabled="[1,6].includes(scope.row.status)" @click="onView(scope.row)">预览</el-button>
                    <el-button v-if="authCheck(sysActions.edit)" type="text" size="small" :disabled="[6].includes(scope.row.status)" @click="onEdit(scope.row)">编辑</el-button>
                    <el-button v-if="authCheck(sysActions.delete)" type="text" size="small" :disabled="[2,3].includes(scope.row.status)" @click="onDel(scope.row)" style="color: #F56C6C;">{{scope.row.status === 6 ? '彻底':''}}删除</el-button>
                    <el-button v-if="authCheck(sysActions.online)" type="text" size="small" :disabled="[1,2,6].includes( scope.row.status)" @click="onOnline(scope.row)">上架</el-button>
                    <el-button v-if="authCheck(sysActions.offline)" type="text" size="small" :disabled="[1,4,5,6].includes(scope.row.status)" @click="onOffline(scope.row)">下架</el-button>
                    <el-button v-if="scope.row.status === 6" type="text" size="small" @click="onRecover(scope.row)" style="color: #E6A23C;">恢复</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            @size-change="onSizeChange"
            @current-change="onCurChange"
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
                keys:'',
                total: 0,
                pageSize:15,
                pageIndex:1,
                actList:[],
                actStauts:{
                    1: { label:'草稿', type:'' },
                    2: { label:'已上架', type:'success' },
                    3: { label:'已更新', type:'warning' },
                    4: { label:'已下架', type:'info' },
                    5: { label:'测试', type:'' },
                    6: { label:'已删除', type:'danger'}
                },
                extendConfig:{
                    abTest: 'abTest'
                }
            }
        },
        mounted(){
            this.init();
        },
        methods: {
            init(){
                let url = '/api/act';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                };
                this.isLoading = true;
                this.$http.get(url, { params: params }).then((res) => {
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }

                    this.total = res.data.total;
                    this.actList = res.data.list;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            onView(row){
                window.open(row.url);
            },
            onEdit(row){
                this.$router.push('/act/edit?id='+ row.id);
            },
            onOnline(row){
                this.$confirm('活动上架，将发布到线上环境，确认上架吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/act/online';
                    this.$http.post(url, { id: row.id }).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.$message.success('活动上架成功');
                        this.init();
                    }).catch(() => {});
                }).catch(() => {});
            },
            onOffline(row){
                this.$confirm('确认下架吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/act/offline';
                    this.$http.post(url,{ id: row.id }).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.$message.success('活动下架成功');
                        this.init();
                    }).catch(() => {});
                }).catch(() => {});
            },
            onDel(row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/act/'+ row.id;
                    this.$http.delete(url).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.$message.success('活动删除成功');
                        this.init();
                    }).catch(() => {});
                }).catch(() => {});
            },
            onRecover(row){
                let url = '/api/act/'+ row.id;
                this.$http.patch(url).then(res => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.$message.success('活动恢复成功');
                    this.init();
                }).catch(() => {});
            },
            onSizeChange(value){
                this.pageSize = value;
                this.init();
            },
            onCurChange(value){
                this.pageIndex = value;
                this.init();
            }
        }
    }
</script>