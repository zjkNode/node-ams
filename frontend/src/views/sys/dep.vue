<template>
    <el-row class="dep">
        <h2>部门管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入部门名称"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="bindDepList" icon="el-icon-search"> 查询</el-button>
                <el-button type="primary" @click="isAddVisible = true" icon="el-icon-plus" pull="6">新增</el-button>
            </el-col>
            
            
        </el-row>
        <el-row>
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
        </el-row>

        <el-dialog title="新增部门" size="tiny" :visible.sync="isAddVisible">
          <el-form :model="addFormData" :rules="rules" ref="addDepFrom" label-width="90px">
            <el-form-item label="父级部门" prop="pids">
              <el-cascader change-on-select :options="depOptions"  :props="props"
                v-model="addFormData.pids">
              </el-cascader>
            </el-form-item>
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="addFormData.name" auto-complete="off" name="name" placeholder="部门名称"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('addDepFrom')">取 消</el-button>
            <el-button type="primary" @click="onAddSubmit('addDepFrom')" :loading="isAddLoading">确 定</el-button>
          </div>
        </el-dialog>
        
        <el-dialog title="修改部门" size="tiny" :visible.sync="isEditVisible">
          <el-form :model="editFormData" :rules="rules" ref="editDepFrom" label-width="90px">
            <el-form-item label="父级部门" prop="pids">
              <el-cascader change-on-select :options="depOptions"  :props="props"
                v-model="editFormData.pids">
              </el-cascader>
            </el-form-item>
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="editFormData.name" auto-complete="off" name="name" placeholder="部门名称"></el-input>
            </el-form-item>
            <el-form-item label="是否可用">
              <el-radio-group v-model="editFormData.status">
                <el-radio class="radio" :label="1">正常</el-radio>
                <el-radio class="radio" :label="2">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('editDepFrom')">取 消</el-button>
            <el-button type="primary" @click="onEditSubmit('editDepFrom')" :loading='isEditLoading'>确 定</el-button>
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
            isAddLoading: false,
            isEditLoading: false,
            isAddVisible: false,
            isEditVisible:false,
            keys:"",
            depOptions:[],
            props:{ value:'id', label:'name' },
            addFormData:{
                pids:[],
                name:''
            },
            editFormData:{
                pids:[],
                name:'',
                status:1
            },
            rules: {
                pids: [
                    {type:'array', required: true,message:'父级部门不能为空', trigger: 'change'}
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
                    this.$message(res.msg);
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
                    this.$message(res.msg);
                    return;
                } 
                this.depOptions = res.data || [];
            }).catch(() => {});
        },
        onEditClick(row){
            this.editFormData = Object.assign({}, row);
            this.editFormData.pids = this.editFormData.pids.split(',').map((item) => { return item == '0' ? -1 : parseInt(item); });
            this.$options.filters.disableItem(this.depOptions,row.id)
            this.isEditVisible = true;
        },
        onRemoveClick(index,row){
            this.$confirm('确认删除该部门吗?', '友情提示', { type: 'warning'}).then(() => {
                let url = '/api/dep/'+ row.id;
                this.$http.delete(url).then((res)=>{
                    if(res.code !== 'SUCCESS'){
                        this.$message(res.msg);
                        return;
                    }
                    this.refreshData();
                });
            }).catch(()=>{});
            
        },
        onAddSubmit(formName){
            this.$refs[formName].validate((valid) => {
              if (!valid) {
                return false;
              }
              var apiUrl = "/api/dep";
              this.isAddLoading = true;
              this.$http.post(apiUrl,this.addFormData).then((res)=>{
                this.isAddLoading = false;
                this.$refs[formName].resetFields();
                if(res.code !== 'SUCCESS'){
                    this.$message(res.msg);
                    return;
                } 
                this.isAddVisible = false;
                this.refreshData();
              }).catch(() => {
                this.isAddLoading = false;
              });
            });
        },
        onEditSubmit(formName){
            this.$refs[formName].validate((valid) => {
              if (!valid) {
                return false;
              }
              var apiUrl = "/api/dep/"+ this.editFormData.id;
              this.isEditLoading = true;
              this.$http.put(apiUrl,this.editFormData).then((res)=>{
                this.isEditLoading = false;
                this.$refs[formName].resetFields();
                if(res.code !== 'SUCCESS'){
                    this.$message(res.msg);
                    return;
                } 
                this.isEditVisible = false;
                this.refreshData();
              }).catch(() => {
                this.isEditLoading = false;
              });
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
            this.isAddVisible = this.isEditVisible = false;
        }
    }
}
</script>
