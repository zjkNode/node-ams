<template>
    <el-row>
        <h2>用户管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入用户email/姓名/电话"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindUsers" icon="el-icon-search">查询</el-button>
                <el-button size="small" type="primary" @click="isVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="userList" stripe v-loading="isLoading" style="width: 100%">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="email" label="登录名" width="180"></el-table-column>
            <el-table-column prop="nickname" label="真实姓名" min-width="180"></el-table-column>
            <el-table-column prop="depName" label="所在部门" min-width="180"></el-table-column>
            <el-table-column prop="roleids" label="角色" min-width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="80">
                <template scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{scope.row.status | statusFilter}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="添加时间" :formatter="dateFormat" width="200"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template scope="scope">
                <el-button @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                <el-button @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #ff4949;">删除</el-button>
              </template>
            </el-table-column>
        </el-table>
        <el-pagination 
              @size-change="onSizeChange"
              @current-change="onCurrentChange"
              :current-page="pageIndex"
              :page-sizes="[15, 30, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
        </el-pagination>

        <el-dialog :title="'用户 -- '+ (title || '新增')" :visible.sync="isVisible" @close="onDialogClose">
          <el-form :model="formData" :rules="rules" ref="dialogForm" label-width="80px">
            <el-form-item label="所在部门" prop="depids">
              <el-cascader 
                change-on-select 
                expand-trigger="hover" 
                :options="depTree"  
                :props="props"
                v-model="formData.depids" >
              </el-cascader>
            </el-form-item>
            <el-form-item label="角色" prop="roleids" >
              <el-select 
                v-model="formData.roleids" 
                multiple
                collapse-tags 
                placeholder="请选择角色" 
                @change="onRoleChanged">
                    <el-option
                      v-for="item in roles"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="用户名" prop="email">
              <el-input v-model="formData.email" auto-complete="off" name="email" placeholder="登录用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="formData.password" type="password" auto-complete="off" name="password" placeholder="登录密码"></el-input>
            </el-form-item>
            <el-form-item label="真实姓名" prop="nickname">
              <el-input v-model="formData.nickname" auto-complete="off" name="nickname" placeholder="真实姓名"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" auto-complete="off" name="phone" placeholder="联系电话"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="small" @click="isVisible = false">取 消</el-button>
            <el-button size="small" type="primary" @click="onSubmit" :loading="isDoing">确 定</el-button>
          </div>
        </el-dialog>
    </el-row>
</template>
<script>
import util from '@/assets/js/util';

export default {
    data() {
      return {
            isVisible:false,
            isLoading: false,
            isDoing: false,
            keys:"",
            rowData:null,
            depTree: null,
            userList: null,
            pageSize:15,
            pageIndex:1,
            total:0,
            title:'',
            roles:[],
            props:{ value:'id', label:'name' },
            formData: {
              id:'',
              email: '',
              password: '',
              nickname: '',
              depids: [],
              roleids: [],
              phone: ''
            },
            rules: {
                email:[
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                ],
                password:[
                    { required: true, message: '请输入登录密码', trigger: 'blur' }
                ],
                nickname:[
                    { required:true, message:'请输入用户别名',trigger:'blur'}
                ],
                depids: [
                    { type: "array", required:true, message:'请选择部门',trigger:'blur' }
                ],
                roleids: [
                    { type:"array", required:true, message:'请选择角色',trigger:'blur' }
                ]
            }
        }
    },
    mounted(){
        this.bindDepTree();
        this.bindRoles();
        this.bindUsers();
    },
    methods:{
        bindUsers(){
            let url = '/api/user';
            let params = {
                keys: this.keys,
                pageSize: this.pageSize,
                pageIndex:this.pageIndex
            };
            this.isLoading = true;
            this.$http.get(url,{ params: params}).then((res)=>{
                this.isLoading = false;
                if(res.code !== 'SUCCESS'){
                    return;
                }
                let resData = res.data;
                this.userList = resData.list;
                this.total = resData.total;
            }).catch(()=> {
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
            this.depTree = res.data || [];
          }).catch((err) => {
            console.log(err)
          });
        },
        bindRoles(){
            this.$http.get('/api/role', { params: {}}).then(res => {
                if(res.code !== 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                }
                this.roles = res.data;
            }).catch(() => {});
        },
        onRoleChanged(val){
            console.log(val)
        },
        onDialogClose(){
            this.formData = {
                id:'',
                email: '',
                password: '',
                nickname: '',
                depids: [],
                roleids: [],
                phone: ''
            };
            this.title = '';
            this.$refs.dialogForm.resetFields();
        },
        onSubmit(){
            if(this.formData.id){
                this.onEditSubmit();
                return;
            }
            this.onAddSubmit();
        },
        onEditClick(row){
            this.title = "编辑";
            this.formData = Object.assign({}, row);
            this.isVisible = true;
        },
        onRemoveClick(index,row){
            this.$confirm('确认删除该用户吗?', '友情提示', { type: 'warning'}).then(() => {
                let url = '/api/user/'+ row.id;
                this.$http.delete(url).then(res => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.userList.splice(index,1);
                });
            }).catch(() => {});
        },
        onAddSubmit(){
            this.$refs.dialogForm.validate((valid) => {
              if (!valid) {
                return false;
              }
              let apiUrl = "/api/user";
              let params = Object.assign({}, this.formData);
              params.password = util.encrypt(params.password);
              this.isDoing = true;
              this.$http.post(apiUrl, params).then((res)=>{
                this.isDoing = false;
                if(res.code !== 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                }
                this.isVisible = false;
                this.bindUsers();
              }).catch((err) => {
                this.isDoing = false;
              });
            });
        },
        onEditSubmit(){
            this.$refs.dialogForm.validate((valid) => {
              if (!valid) {
                return false;
              }
              this.isDoing = true;
              var apiUrl = "/api/user/"+ this.formData.id;
              var params = Object.assign({}, this.formData);
              params.password = util.encrypt(params.password)
              this.$http.put(apiUrl, params).then((res)=>{
                this.isDoing = false;
                if(res.code !== 'SUCCESS'){
                    this.$message.error(res.msg);
                    return;
                }
                this.isVisible = false;
                this.bindUsers();
              }).catch(() => {
                this.isDoing = false;
              });
            });
        },
        onSizeChange(val) {
            this.pageSize = val;
            this.bindUsers();
        },
        onCurrentChange(val) {
            this.pageIndex = val;
            this.bindUsers();
        }
    }
  };
</script>
