<template>
    <div>
        <h2>产品类型</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input v-model="keys" size="small" placeholder="请输入类型名称"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button type="primary" size="small" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" size="small" @click="isVisible = true" icon="el-icon-plus"> 新增</el-button>
            </el-col> 
        </el-row>
        <el-row>
            <el-table :data="dataList" stripe v-loading="isLoading">
                <el-table-column type="index" label="" width="60"></el-table-column>
                <el-table-column prop="status" label="业务类型" width="100" align="center">
                    <template slot-scope="scope" >
                        <el-tag :type="scope.row.buConfig.status === 2 ? 'info' : ''" size="small">
                            {{ scope.row.buConfig.name }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="类型名称" :formatter="treeFormat" class-name='flat-tree'></el-table-column>
                <el-table-column prop="status" label="状态" width="90" align="center">
                    <template slot-scope="scope" >
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="添加时间" align="center" width="160" :formatter="dateFormat"></el-table-column>
                <el-table-column fixed="right" label="操作" width="100" >
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="onRemoveClick(scope.$index,scope.row)" style="color: #F56C6C;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
       
       <el-dialog :title='"产品类型 --"+ (title || "新增")' :visible.sync="isVisible" @close="onFormClose">
        <el-form label-width="80px" ref='dgForm' :model="formData" :rules="rules" @keyup.enter.native="onSubmit" :show-message="true">
            <el-form-item label="业务类型" prop="confid">
                <el-select v-model="formData.confid" @change="bindTree" :disabled="!!formData.id" placeholder="请选择">
                <el-option
                  v-for="item in buTypes"
                  :disabled="item.disabled"
                  :key="item.key"
                  :label="item.name"
                  :value="item.id">
                  <span style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="父级类型" prop="pids">
                <el-cascader 
                    change-on-select
                    :options="treeList" 
                    :props="props" 
                    v-model="formData.pids">
                </el-cascader> 
            </el-form-item>
            <el-form-item label="类别名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入合同类别名称"></el-input>
            </el-form-item>
            <el-form-item v-if="formData.id" label="是否可用" prop="status">
                <el-radio-group v-model.number="formData.status">
                    <el-radio v-bind:label="1">正常</el-radio>
                    <el-radio v-bind:label="2">停用</el-radio>
                </el-radio-group>
            </el-form-item> 
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" @click="isVisible = false">取 消</el-button>
            <el-button size="small" type="primary" @click="onSubmit" :loading="isDoing">确 定</el-button>
        </div> 
    </el-dialog>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                isLoading: false,
                isVisible: false,
                isDoing: false,
                keys:"",
                title:'',
                dataList:[],
                treeList:[],
                props:{
                    value:'id',
                    label:'name'
                },
                buTypes:[], // 业务分类
                formData:{
                    confid:'', // 系统配置---业务数据配置id
                    pid:'',
                    pids: [],
                    name:'',
                    status: 1,
                },
                rules: {
                    confid:[{ required: true, message:'请选择业务类型', trigger: 'blur' }],
                    pids:[
                        { required: true, type:'array', message:'请选择父级类型', trigger: 'change' }
                    ],
                    name: [
                        { required: true, message:'请输入类型名称', trigger: 'blur' }
                    ]
                    
                }
            }
        },
        mounted(){
            this.bindBuTypes();
            this.init();
        },
        methods:{
            init(){
                this.bindTable();
                this.bindTree();
            },
            bindBuTypes(){
                let query = {
                    type: 'authData'
                };
                this.$http.get('/api/config/listByType', { params: query }).then(res => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    for(let key in res.data){
                        this.buTypes.push(res.data[key]);
                    }
                });
            },
            bindTable(){
                let url = '/api/pro/type';
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url, { params: params }).then((res) => {
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.dataList = res.data;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            bindTree(){
                let params = {
                    confid: this.formData.confid
                };
                let url = '/api/pro/type/tree';
                this.$http.get(url, { params: params }).then(res => {
                    if(res.code != 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    let tree = res.data || [];
                    tree.unshift({ name:'顶级类型', id:0, pid:0 });
                    this.treeList = tree;
                }).catch(() => { });
            },
            onRemoveClick(index,row){
                this.$confirm('所有子类型将被同步删除，确认删除吗？', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/pro/type/'+ row.id;
                    this.$http.delete(url).then((res) => {
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.init();
                    }).catch(() => { });
                }).catch(() => {});
            },
            onFormClose(){
                this.formData = {
                    pid:'',
                    pids: [],
                    name:'',
                    status: 1,
                };
                this.title = "";
                this.$refs.dgForm.resetFields();
                this.$options.filters.disableItem(this.treeList);
            },
            onEditClick(row){
                this.title = "编辑";
                this.formData = Object.assign({}, row);
                this.formData.pids = this.formData.pids.split(',').map(id => parseInt(id));
                this.$options.filters.disableItem(this.treeList, [row.id]);
                this.bindTree();
                this.isVisible = true;
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
                    var apiUrl = "/api/pro/type";
                    this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
                    this.isDoing = true;
                    this.$http.post(apiUrl, this.formData).then((res) => {
                        this.isDoing = false;
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.isVisible = false;
                        this.init();
                    }).catch(() => {
                        this.isDoing = false;
                    });
                });
            },
            onEditSubmit(){
                this.$refs.dgForm.validate((valid) => {
                    if (!valid) {
                        return false;
                    }

                    this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
                    var apiUrl = "/api/pro/type/"+ this.formData.id;
                    this.isDoing = true;
                    this.$http.put(apiUrl, this.formData).then((res) => {
                        this.isDoing = false;
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.isVisible = false;
                        this.init();
                    }).catch(() => {
                        this.isDoing = false;
                    });
                });
            }
        }
    }
</script>
