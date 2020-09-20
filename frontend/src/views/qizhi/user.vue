<template>
    <el-row>
        <h2>用户管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入用户姓名/电话"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindUsers" icon="el-icon-search">查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" size="small" type="primary" @click="isVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="userList" stripe v-loading="isLoading">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="姓名" width="120"></el-table-column>
            <el-table-column prop="phone" label="联系方式" width="120"></el-table-column>
            <el-table-column prop="openid" label="微信授权信息" min-width="120"></el-table-column>
            <el-table-column prop="type" label="用户类型" width="90" align='center'>
                <template slot-scope="scope">
                  <el-tag :type="scope.row.type === 1 ? 'success' : 'danger'">{{scope.row.type === 1 ? '教师' : '家长'}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="添加时间" :formatter="dateFormat" width="160" sortable></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button v-if="authCheck(sysActions.edit)" @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                <el-button v-if="authCheck(sysActions.delete)" @click="onRemoveClick(scope.$index,scope.row)" type="text" size="small" style="color: #F56C6C;">删除</el-button>
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
          <el-form :model="formData" :rules="rules" ref="dialogForm" label-width="80px" @keyup.enter.native="onSubmit">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" name="name" placeholder="用户姓名"></el-input>
            </el-form-item>
            <el-form-item v-if="!formData.id" label="密码" prop="pwd">
              <el-input v-model="formData.pwd" type="password" name="pwd" placeholder="登录密码"></el-input>
            </el-form-item>
            <el-form-item v-else label="密码" prop="newPwd">
              <el-input v-model="formData.newPwd" type="password" name="newPwd" placeholder="登录密码"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" name="phone" maxlength="11" placeholder="联系电话"></el-input>
            </el-form-item>
            <el-form-item label="openid" prop="openid">
              <el-input v-model="formData.openid" name="openid" placeholder="微信授权Id"></el-input>
            </el-form-item>
            <el-form-item label="是否可用" prop="type">
                <el-radio-group v-model.number="formData.type">
                    <el-radio v-bind:label="1">教师</el-radio>
                    <el-radio v-bind:label="2">家长</el-radio>
                </el-radio-group>
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
            userList: null,
            pageSize:15,
            pageIndex:1,
            total:0,
            title:'',
            roles:[],
            props:{ value:'id', label:'name' },
            formData: {
              id:'',
              name: '',
              pwd: '',
              newPwd:'',
              type: 1, // 1教师 2家长
              phone: '',
              openid: ''
            },
            rules: {
                name:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                ],
                pwd:[
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6,  message: '密码不能小于 6 位', trigger: 'blur' }
                ],
                newPwd:[
                    { min: 6,  message: '密码不能小于 6 位', trigger: 'blur' }
                ],
                phone:[
                    { required:true, message:'请输入联系方式',trigger:'blur'}
                ],
            }
        }
    },
    mounted(){
      this.tmpFormData = Object.assign({},this.formData);
      this.bindUsers();
    },
    methods:{
        bindUsers(){
            let url = '/api/qizhi/user';
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
        onRemoveClick(index,row){
            this.$confirm('确认删除该用户吗?', '友情提示', { type: 'warning'}).then(() => {
                let url = '/api/qizhi/user/'+ row.id;
                this.$http.delete(url).then(res => {
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.bindUsers();
                });
            }).catch(() => {});
        },
        onDialogClose(){
            this.formData = Object.assign({}, this.tmpFormData);
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
            this.formData.newPwd = '';
            this.isVisible = true;
        },
        onAddSubmit(){
            this.$refs.dialogForm.validate((valid) => {
              if (!valid) {
                return false;
              }
              let apiUrl = "/api/qizhi/user";
              let params = Object.assign({}, this.formData);
              params.pwd = util.encrypt(params.pwd);
              this.isDoing = true;
              this.$http.post(apiUrl, params).then((res)=>{
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
        onEditSubmit(){
            this.$refs.dialogForm.validate((valid) => {
              if (!valid) {
                return false;
              }
              this.isDoing = true;
              let apiUrl = "/api/qizhi/user/"+ this.formData.id;
              let params = Object.assign({}, this.formData);
              if(params.newPwd.trim()){
                params.newPwd = util.encrypt(params.newPwd.trim());
              }
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
  }
</script>