<template>
    <div>
        <h2>合同占位符</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input v-model="keys" placeholder="请输入要查找的占位符名称"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button size="small" type="primary" @click="isVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>  
        </el-row>
        <el-table :data="dataList" stripe v-loading="isLoading">       
            <el-table-column type="index" label="" width="60"></el-table-column>
            <el-table-column prop="type" label="所属合同类型" min-width="200" align="center"  class-name='flat-tree'></el-table-column>
            <el-table-column prop="name" label="占位符名称" min-width="200" align="center"  class-name='flat-tree'></el-table-column>
            <el-table-column prop="placeholder" label="VM占位符"  align="center" min-width="200" ></el-table-column>  
            <el-table-column prop="desc" label="占位符描述"  align="center" min-width="200" ></el-table-column> 
            <el-table-column prop="create_time" label="添加时间" align="center"  min-width="260" :formatter="dateFormat"></el-table-column>
            <el-table-column fixed="right" label="操作" width="200" align="center">
                <template slot-scope="scope">
                    <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="onRemoveClick(scope.$index,scope.row)" style="color: #F56C6C;">删除</el-button>
                </template>
            </el-table-column>
        </el-table>               
        <el-pagination
            @size-change="onSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page"
            :page-sizes="[15, 30, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>

        <el-dialog :title='"合同占位符 --"+ (title || "新增")' :visible.sync="isVisible" @close="onFormClose">
            <el-form label-width="100px" ref="dgForm" :rules="rules" :model="formData" @keyup.enter.native="onSubmit"  :show-message="true">
                <el-form-item label="合同类型" prop="typeIds">
                    <el-cascader 
                        change-on-select 
                        :options="typeTree" 
                        :props="props" 
                        v-model="formData.typeIds"></el-cascader> 
                </el-form-item>
                <el-form-item label="占位符名称" prop="name">
                        <el-input v-model="formData.name" placeholder="请输入占位符名称"></el-input>
                </el-form-item>
                <el-form-item label="VM占位符" prop="placeholder">
                        <el-input v-model="formData.placeholder" placeholder="请输入VM占位符"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="desc">
                        <el-input v-model="formData.desc" placeholder="请输入占位符描述"></el-input>
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
                title:'',
                isVisible:false,
                isLoading: false,
                isDoing: false,
                dataList:null,
                typeTree:null,
                props:{
                    value:'id',
                    label:'name'
                },
                keys:"",
                page: 1,
                pageSize: 15,
                total:0,
                formData:{
                    id:'',
                    typeIds:[],
                    name: '',
                    placeholder:'',
                    typeid:null,
                    desc:''
                },
                rules: {
                    typeIds:[{ required: true, type:'array', message:'请选择合同类型', trigger: 'change' }],
                    name: [
                        {required: true, message: '请输入占位符名称', trigger: 'change'},
                        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
                    ],
                    placeholder: [
                        {required: true, message: '请输入占位符代码', trigger: 'change'},
                        { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        mounted(){
            this.init();
            this.getTreeData();
        },
        methods:{
            init(){
                let url = '/api/contract/vm';
                let params = {
                    keys: this.keys,
                    pageIndex:this.page,
                    pageSize:this.pageSize
                };
                this.isLoading = true;
                this.$http.get(url, { params: params }).then((res)=>{
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    let resData = res.data;
                    this.dataList = resData.list;
                    //处理分页数据：
                    this.total = resData.total; 
                                   
                }).catch(() => {

                });
            },
            getTreeData(){
                let url = '/api/contract/type/tree';
                this.$http.get(url).then((res) => {
                    if(res.code != 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    if(res.data && res.data.length > 0){
                        this.typeTree = res.data;
                        return;
                    }
                    this.typeTree = [{ name:'无数据', id: -1, disabled: true}];
                }).catch(() => { });
            },
            onRemoveClick(index,row){
                this.$confirm('确认删除吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/contract/vm/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }

                        this.init();
                    }).catch(() => {

                    });
                }).catch(() => {});
                
            },
            handleCurrentChange(val) {
                this.page = val;
                this.init()
            },
            onSizeChange(val){
                this.pageSize = val;
                this.init()            
            },
            onEditClick(row){
                this.title = '编辑';
                this.formData = Object.assign({}, row);
                this.isVisible = true;
            },
            onFormClose(){
                this.formData = {
                    id:'',
                    name: '',
                    placeholder:'',
                    typeid:null,
                    desc:''
                };
                this.title = "";
                this.$refs.dgForm.resetFields();
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
                    var apiUrl = "/api/contract/vm/add";
                    this.isDoing = true;
                    this.$http.post(apiUrl, this.formData).then((res) => {
                        this.isDoing = false;
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            this.formData.placeholder = ''
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
                    var apiUrl = "/api/contract/vm/"+ this.formData.id;
                    this.isDoing = true;
                    this.$http.put(apiUrl, this.formData).then((res) => {
                        this.isDoing = false;
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            this.formData.placeholder = '';
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
