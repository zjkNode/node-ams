<template>
    <el-row>
        <h2>配置管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="10">
                <el-input v-model="keys" placeholder="请输入配置内容/描述/关键字/值"  @input="searchName"></el-input>
            </el-col>
            <el-col :span="10">
                <el-button type="primary" @click="bindConfigs" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="isAddVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>


        </el-row>
        <el-row>
            <el-table :data="userList" stripe v-loading="isLoading" style="width: 100%">
                <el-table-column type="index" width="60"></el-table-column>
                <el-table-column prop="name" label="配置名称" min-width="160"></el-table-column>
                <el-table-column prop="key" label="关键字" min-width="160"></el-table-column>
                <el-table-column prop="value" label="配置值" min-width="200"></el-table-column>
                <el-table-column prop="desc" label="配置描述" min-width="160" show-overflow-tooltip></el-table-column>
                <el-table-column prop="status" label="状态" width="80"  filter-placement="bottom-end" align="center">
                    <template scope="scope" >
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="100">
                    <template scope="scope">
                        <el-button @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                        <el-button @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #ff4949;">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <el-pagination
            @size-change="onSizeChange"
            @current-change="onCurrentChange"
            :current-page="pageIndex"
            :page-sizes="[15, 30, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
        
        <el-dialog title="新增配置" size="tiny" :visible.sync="isAddVisible">
          <el-form :model="formData" :rules="rules" ref="addForm" label-width="80px">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="formData.name" auto-complete="off" name="name" placeholder="请输入配置名称"></el-input>
            </el-form-item>
            <el-form-item label="配置描述" prop="desc">
              <el-input v-model="formData.desc" auto-complete="off" name="desc" placeholder="请输入描述内容"></el-input>
            </el-form-item>
            <el-form-item label="关键字" prop="key">
              <el-input v-model="formData.key" auto-complete="off" name="key" placeholder="请输入关键字"></el-input>
            </el-form-item>
            <el-form-item label="配置值" prop="value">
              <el-input v-model="formData.value" auto-complete="off" name="value" placeholder="请输入配置值"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('addForm')">取 消</el-button>
            <el-button type="primary" @click="addSubmit" :loading='isAddLoading'>确 定</el-button>
          </div>
        </el-dialog>

        <el-dialog title="修改配置" size="tiny" :visible.sync="isEditVisible">
          <el-form :model="formData" :rules="rules" ref="editForm" label-width="90px">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="formData.name" auto-complete="off" name="name" placeholder="请输入配置名称"></el-input>
            </el-form-item>
            <el-form-item label="描述内容" prop="desc">
              <el-input v-model="formData.desc"  auto-complete="off" name="desc" placeholder="请输入描述内容"></el-input>
            </el-form-item>
            <el-form-item label="关键字" prop="key">
              <el-input v-model="formData.key" auto-complete="off" name="key" placeholder="请输入关键字"></el-input>
            </el-form-item>
            <el-form-item label="配置值" prop="value">
              <el-input v-model="formData.value" auto-complete="off" name="value" placeholder="请输入配置值"></el-input>
            </el-form-item>
            <el-form-item label="是否有效" >
              <el-radio-group v-model="formData.status">
                <el-radio class="radio" :label="1">有效</el-radio>
                <el-radio class="radio" :label="2">无效</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('editForm')">取 消</el-button>
            <el-button type="primary" @click="editSubmit" :loading="isEditLoading">确 定</el-button>
          </div>
        </el-dialog>
        
    </el-row>
</template>
<script>
    export default {
        data() {
            return {
                isAddVisible: false,
                isEditVisible:false,
                isLoading: false,
                isAddLoading: false,
                isEditLoading: false,
                keys:"",
                rowData:null,
                userList: null,
                pageSize:15,
                pageIndex:1,
                total:0,
                formData: {
                  name:'',
                  desc:'',
                  key:'',
                  value:''
                },
                rules: {
                    name:[
                        { required:true, message:'请输入配置名称',trigger:'blur'}
                    ],
                    desc: [
                        { required:true, message:'请输入描述内容',trigger:'blur' }
                    ],
                    key: [
                        { required:true, message:'请输入关键字',trigger:'blur' }
                    ],
                    value: [
                      { required:true, message:'请输入配置值',trigger:'blur' }
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
            this.bindConfigs();
        },
        methods:{
            dateFormat(row,column,cellvalue){
                return this.$options.filters.formatDate(cellvalue);
            },
            bindConfigs(){
                let url = '/api/config';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex:this.pageIndex
                };
                this.isLoading = true;
                this.$http.get(url,{ params: params }).then((res)=>{
                    this.isLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$toast(res.msg);
                    }

                    let resData = res.data;
                    this.userList = resData.lists;
                    this.total = resData.total;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            onEditClick(row){
                this.formData = Object.assign({}, row);
                this.formData.status = parseInt(row.status);
                this.isEditVisible = true;
            },
            onRemoveClick(index,row){
                this.$confirm('确认删除该用户吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/config/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        if(res.code !== 'SUCCESS'){
                            this.$toast(res.msg);
                            return;
                        }
                        this.userList.splice(index,1);
                    });
                }).catch(()=>{});

            },
            onSizeChange(val) {
                this.pageSize = val;
                this.bindConfigs();
            },
            onCurrentChange(val) {
                this.pageIndex = val;
                this.bindConfigs();
            },
            searchName(){
                !this.keys && this.bindConfigs()
            },
            addSubmit() {
                this.$refs.addForm.validate((valid) => {
                  if (!valid) {
                    return false;
                  }
                  var apiUrl = "/api/config";
                  this.isAddLoading = true;
                  this.$http.post(apiUrl,this.formData).then((res) => {
                    this.isAddLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$toast(res.msg);
                        return;
                    }

                    this.$refs.addForm.resetFields();
                    this.isAddVisible = false;
                    this.bindConfigs();
                  }).catch(() => {
                    this.isAddLoading = false;
                  });
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.isAddVisible = this.isEditVisible = false;
            },
            editSubmit() {
                this.$refs.editForm.validate((valid) => {
                  if (!valid) {
                    return false;
                  }
                  var apiUrl = "/api/config/"+ this.formData.id;
                  this.isEditLoading = true;
                  this.$http.put(apiUrl,this.formData).then((res)=>{
                    this.isEditLoading = false;
                    this.$refs.editForm.resetFields();
                    this.isEditVisible = false;
                    this.bindConfigs()
                  }).catch(() => {
                    this.isEditLoading = false;
                  });
                });
            }
        }
    };
</script>
