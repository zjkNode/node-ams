<template>
    <el-row>
        <h2>学员管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input v-model="keys" size="small" placeholder="请输入学员姓名/联系电话" @input="searchName"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button type="primary" size="small" @click="initData" icon="el-icon-search">查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" type="primary" size="small" @click="isPopVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="dataList" stripe v-loading="isLoading">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="姓名" min-width="100"></el-table-column>
            <el-table-column prop="phone" label="联系电话" min-width="120"></el-table-column>
            <el-table-column prop="subject" label="学科" width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="start_time" label="开始时间" width="160" align="center">
              <template slot-scope="scope" >
                {{scope.row.start_time | dateFormat('YYYY-MM-DD')}}
              </template>
            </el-table-column>
            <el-table-column prop="end_time" label="结束时间" width="160" align="center">
              <template slot-scope="scope" >
                {{scope.row.end_time | dateFormat('YYYY-MM-DD')}}
              </template>
            </el-table-column>
            <el-table-column prop="period" label="总课时数" min-width="100"></el-table-column>
            <el-table-column prop="fee" label="学费" width="100"></el-table-column>
            <el-table-column prop="status" label="状态" width="90"  filter-placement="bottom-end" align="center">
                <template slot-scope="scope" >
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                        {{scope.row.status | statusFilter}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="100"></el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="160" align="center" :formatter="dateFormat" sortable></el-table-column>
            <el-table-column fixed="right" label="操作" width="150">
                <template slot-scope="scope">
                    <el-button v-if="authCheck(sysActions.edit)" @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                    <el-button v-if="authCheck(sysActions.delete)" @click="onRemoveClick(scope.row)" type="text" size="small" style="color: #F56C6C;">删除</el-button>
                    <el-button @click="onQRClick(scope.row)" type="text" size="small" style="color: #67C23A;">二维码</el-button>
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
        
        <el-dialog :title='`学员 -- ${title || "新增"}`' :visible.sync="isPopVisible"  @close="onDialogClose">
          <el-form ref="dialogForm" label-width="80px" size="small" 
            :model="formData" 
            :rules="rules" 
            @keyup.enter.native="onSubmit">
            <el-form-item label="学员姓名" prop="name">
              <el-input v-model="formData.name" name="name" placeholder="请输入学员姓名"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" name="phone" maxlength='11' placeholder="请输入联系电话"></el-input>
            </el-form-item>
            <el-form-item label="年级" prop="class">
              <el-select v-model="formData.class" placeholder="请选择年级">
                <el-option
                  v-for="item in classes"
                  :key="item"
                  :label="item+'年级'"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学科" prop="subject">
              <el-select v-model="formData.subject" multiple placeholder="请选择学科">
                <el-option
                  v-for="(value, key) in subjects"
                  :key="key"
                  :label="value"
                  :value="value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学费" prop="fee">
              <el-input v-model="formData.fee" name="fee" placeholder="请输入学费"></el-input>
            </el-form-item>
            <el-form-item label="学时" prop="period">
              <el-input placeholder="请输入学时" v-model="formData.period">
                <template slot="append">课时</template>
              </el-input>
            </el-form-item>
            <el-form-item label="上课时间" prop="studyTime">
              <el-date-picker
                style="width:100%;"
                v-model="formData.studyTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="formData.remark" name="remark" type="textarea" placeholder="请输入备注"></el-input>
            </el-form-item>
            <el-form-item v-if="formData.id" label="是否有效" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio class="radio" :label="1">有效</el-radio>
                <el-radio class="radio" :label="2">无效</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="small" @click="isPopVisible = false">取 消</el-button>
            <el-button type="primary" size="small" @click="onSubmit" :loading='isAddLoading'>确 定</el-button>
          </div>
        </el-dialog>
        
        <el-dialog :title="qrDialog.title" :visible.sync="qrDialog.isVisible" width="306px" :show-close="false" center>
          <img :src="qrDialog.qrImage" />
        </el-dialog>
    </el-row>
</template>
<script>
import util from '@/assets/js/util'
import {qrBuilder} from '@/assets/js/qrBuilder'
    export default {
        data() {
            return {
                title: '',
                isQRVisible: false,
                isPopVisible: false,
                isLoading: false,
                isAddLoading: false,
                keys:"",
                dataList: null,
                pageSize:15,
                pageIndex:1,
                total:0,
                qrDialog:{
                  isVisible: false,
                  title:'',
                  qrImage:''
                },
                classes:[9,8,7,6,5,4,3,2,1],
                subjects:{
                  english:'英语',
                  math:'数学',
                  physics:'物理',
                  chemistry:'化学',
                  homework:'作业辅导',
                  weekend:'周未班',
                  tuoguan:'托管班',
                },
                formData: {
                  id:'',
                  name:'',
                  phone:'',
                  class:'',
                  subject:[],
                  fee:'',
                  remark:'',
                  period:'',
                  studyTime:'',
                  status: 1,
                },
                rules: {
                    name:[{ required:true, message:'请输入学员姓名',trigger:'blur'}],
                    phone: [
                      { required:true, message:'请输入联系电话',trigger:'blur' }
                    ],
                    class:[
                      {required:true, message:'请选择学科',trigger:'change' }
                    ],
                    subject:[
                      {type: 'array', required:true, message:'请选择学科',trigger:'change' }
                    ],
                    fee:[
                      { required:true, message:'请输入学费',trigger:'blur' }
                    ]
                },
            }
        },
        created(){
          this.tmpFormData = Object.assign({}, this.formData);
          this.initData();
        },
        methods:{
            initData(){
                let url = '/api/qizhi/student';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex:this.pageIndex
                };
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
            onEditClick(row){
                this.title = '编辑',
                this.formData = Object.assign({}, row);
                this.formData.status = parseInt(row.status);
                this.formData.subject = this.formData.subject.split(',');
                this.formData.studyTime = [this.formData.start_time, this.formData.end_time];
                this.isPopVisible = true;
            },
            onRemoveClick(row){
                this.$confirm('确认删除该学员吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/qizhi/student/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.initData();
                    });
                }).catch(()=>{});

            },
            onQRClick(row){
              let qrCodeUrl = 'http://qizhi.dmzttz.com/checkIn?name='+ encodeURI(row.name) +'&st='+ util.encrypt(`${row.id}_${row.name}`, false);
              // let qrCodeUrl = 'http://120.27.21.93:8050/checkIn?name='+ encodeURI(row.name) +'&st='+ util.encrypt(`${row.id}_${row.name}`, false);
              let opt = { //二维码配置
                margin: 0,
                width: 256,
                logo:require('@/assets/img/admin.png')
              };
              qrBuilder(qrCodeUrl, opt, qrcodeImg => {
                this.qrDialog.title = row.name;
                this.qrDialog.qrImage = qrcodeImg;
                this.qrDialog.isVisible = true;
              });
            },
            onSizeChange(val) {
                this.pageSize = val;
                this.initData();
            },
            onCurrentChange(val) {
                this.pageIndex = val;
                this.initData();
            },
            searchName(){
                !this.keys && this.initData();
            },
            onDialogClose(){
                this.title = '',
                this.formData = Object.assign({}, this.tmpFormData);
                this.$refs.dialogForm.resetFields();
            },
            onSubmit(){
              this.formData.start_time = util.dateFormat(this.formData.studyTime[0], 'YYYY-MM-DD');
              this.formData.end_time = util.dateFormat(this.formData.studyTime[1], 'YYYY-MM-DD');
                if(this.formData.id){
                    this.editSubmit();
                    return;
                }
                this.addSubmit();
            },
            addSubmit() {
                this.$refs.dialogForm.validate((valid) => {
                  if (!valid) {
                    return false;
                  }
                  var apiUrl = "/api/qizhi/student";
                  this.isAddLoading = true;
                  this.$http.post(apiUrl,this.formData).then((res) => {
                    this.isAddLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }

                    this.isPopVisible = false;
                    this.initData();
                  }).catch(() => {
                    this.isAddLoading = false;
                  });
                });
            },
            editSubmit() {
                this.$refs.dialogForm.validate((valid) => {
                  if (!valid) {
                    return false;
                  }
                  var apiUrl = "/api/qizhi/student/"+ this.formData.id;
                  this.isEditLoading = true;
                  this.$http.put(apiUrl,this.formData).then((res)=>{
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.isEditLoading = false;
                    this.isPopVisible = false;
                    this.initData()
                  }).catch(() => {
                    this.isEditLoading = false;
                  });
                });
            }
        }
    };
</script>