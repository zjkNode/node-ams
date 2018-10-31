<template>
    <div>
        <h2>组件列表</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入活动组件名称"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-upload
                     v-if="authCheck(sysActions.upload)"
                    style="display:inline-block; margin-left:10px;"
                    ref="upload"
                    action="/api/act/component"
                    accept="application/x-zip-compressed"
                    :data="uploadData"
                    :show-file-list="false"
                    :before-upload = "onBeforeUpload"
                    :on-success="onUploadSuccess"
                    :on-error="onUploadError">
                    <el-button slot="trigger" size="small" icon="el-icon-plus" type="primary">上传</el-button>
                </el-upload>
            </el-col>
        </el-row>
        <el-table stripe v-loading="isLoading" :data="componentsLists">
            <el-table-column type="index" label="" width="60"></el-table-column>
            <el-table-column prop="name" label="组件名称" align="center"  min-width="200"></el-table-column>
            <el-table-column prop="time" label="更新时间" width="160" align="center" :formatter="formatDate" sortable show-overflow-tooltip></el-table-column>
            <el-table-column fixed="right" label="操作" width="100" align="center">
                <template slot-scope="scope">
                    <el-button v-if="authCheck(sysActions.update)" type="text" size="small" @click="onEdit(scope.row)">更新</el-button>
                    <el-button v-if="authCheck(sysActions.delete)" type="text" size="small" @click="onDel(scope.$index, scope.row)" style="color: #F56C6C;">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>

    export default {
        data(){
            return {
                isLoading: false,
                keys:'',
                uploadData:{ 
                    type: 'add',
                    fileName:''
                },
                componentsLists:[],
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init(){
                let url = '/api/act/component';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.componentsLists = res.data;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            formatDate(row, column, value){
                return this.$options.filters.formatDate(value);
            },
            onEdit(row){
                this.uploadData.type = 'update';
                this.uploadData.fileName = row.name;
                this.$refs.upload.$el.children[0].click();
            },
            onDel(index, row){
                this.$confirm('确认删除该组件吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/act/component/'+ row.name;
                    this.$http.delete(url).then((res)=>{
                        if( res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.componentsLists.splice(index,1);
                    });
                }).catch(()=>{});
            },
            onBeforeUpload(file){
                if(this.uploadData.type === 'update' && file.name !== this.uploadData.fileName +'.zip'){
                    this.$message.warning('抱歉，请保持组件名称一致');
                    return false;
                }
            },
            onUploadSuccess(res){
                if(res.code != 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                }
                let msg = this.uploadData.type === 'add' ? '组件上传成功' : '组件更新成功';
                this.$message.success(msg);
                this.uploadData.type = 'add';
                this.$refs.upload.clearFiles();
                this.init();
            },
            onUploadError(err){
                let res = JSON.parse(err.message);
                this.$message.error(res.msg);
            }
        }
    }
</script>