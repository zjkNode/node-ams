<template>
    <el-row>
        <h2>部门管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入部门名称"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindDepList" icon="el-icon-search"> 查询</el-button>
                <el-button size="small" type="primary" @click="isDialogVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="depList" stripe v-loading="isLoading" >
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="部门名称" show-overflow-tooltip :formatter="formatTree" class-name='flat-tree'></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>{{scope.row.status | statusFilter}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="添加时间" :formatter="dateFormat" show-overflow-tooltip width="180"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template scope="scope">
                <el-button @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                <el-button @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #ff4949;">删除</el-button>
              </template>
            </el-table-column>
      </el-table>

        <el-dialog :title="'部门 -- '+ (title || '新增')" :visible.sync="isDialogVisible" @close="onFormClose">
          <el-form :model="formData" :rules="rules" ref="dialogForm" label-width="90px">
            <el-form-item label="父级部门" prop="pids">
              <el-cascader 
                change-on-select 
                :options="depOptions"  
                :props="props"
                v-model="formData.pids">
              </el-cascader>
            </el-form-item>
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="formData.name" auto-complete="off" name="name" placeholder="部门名称"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="isDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="onSubmit" :loading="isDoing">确 定</el-button>
          </div>
        </el-dialog>
    </el-row>
</template>
<script>
export default {
    data() {
      return {
            depList: null,
            isLoading: false,
            isDoing: false,
            isDialogVisible: false,
            keys:"",
            depOptions:[],
            props:{ value:'id', label:'name' },
            title: '',
            formData:{
                pid:'',
                pids:[],
                name:'',
                status:1
            },
            rules: {
                pids: [
                    { type:'array', required: true, message:'父级部门不能为空', trigger: 'blur'}
                ],
                name: [
                    {required: true, message:'部门名称不能为空',trigger: 'blur'},
                    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
                ]
            }
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
        this.refreshData();
    },
    methods:{
        dateFormat(row,column,cellvalue){
            return this.$options.filters.formatDate(cellvalue);
        },
        formatTree(row, column,value){
            return this.$options.filters.flatTree(row, value);
        },
        refreshData(){
            this.bindDepList();
            this.bindDepTree();
        },
        bindDepList(){
            let url = '/api/dep';
            let params = {
                keys: this.keys
            };
            this.isLoading = true;
            this.$http.get(url,{ params: params}).then((res)=>{
                this.isLoading = false;
                if(res.code !== 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                } 

                this.depList = res.data;
            }).catch(() => {
                this.isLoading = false;
            });
        },
        bindDepTree(){
            let url = '/api/dep/tree';
            this.$http.get(url,null).then((res)=>{
                if(res.code !== 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                } 
                let tmpOption = [{ name:'顶级', id:0, pid: 0}];
                if(res.data && res.data.length > 0){
                    tmpOption = [...tmpOption, ...res.data];
                }
                this.depOptions = tmpOption;
            }).catch(() => {});
        },
        onFormClose(){
            this.formData = {
                pids:[],
                name:''
            };
            this.title = '';
            this.$refs.dialogForm.resetFields();
            this.$options.filters.disableItem(this.depOptions, -1);
        },
        onEditClick(row){
            this.title = "编辑";
            this.formData = Object.assign({}, row);
            this.formData.pids = this.formData.pids.split(',').map((item) => parseInt(item));
            this.$options.filters.disableItem(this.depOptions,row.id);
            this.isDialogVisible = true;
        },
        onRemoveClick(index,row){
            this.$confirm('确认删除该部门吗?', '友情提示', { type: 'warning'}).then(() => {
                let url = '/api/dep/'+ row.id;
                this.$http.delete(url).then((res)=>{
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.refreshData();
                });
            }).catch(()=>{});
        },
        onSubmit(){
            if(this.formData.id){
                this.onEditSubmit();
                return;
            }
            this.onAddSubmit();
        },
        onAddSubmit(){
            this.$refs.dialogForm.validate((valid) => {
              if (!valid) {
                return false;
              }
              this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
              this.isDoing = true;
              this.$http.post("/api/dep", this.formData).then((res)=>{
                this.isDoing = false;
                if(res.code !== 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                } 
                this.isDialogVisible = false;
                this.refreshData();
              }).catch(() => {
                this.isDoing = false;
              });
            });
        },
        onEditSubmit(){
            this.$refs.dialogForm.validate((valid) => {
              if (!valid) {
                return false;
              }
              this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
              let apiUrl = "/api/dep/"+ this.formData.id;
              this.isDoing = true;
              this.$http.put(apiUrl,this.formData).then((res)=>{
                this.isDoing = false;
                if(res.code !== 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                } 
                this.isDialogVisible = false;
                this.refreshData();
              }).catch(() => {
                this.isDoing = false;
              });
            });
        }
    }
}
</script>
