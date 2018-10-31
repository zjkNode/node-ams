<template>
    <el-row>
        <h2>配置管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input v-model="keys" size="small" placeholder="请输入配置名称/关键字/值"  @input="searchName"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button type="primary" size="small" @click="bindConfigs" icon="el-icon-search">查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" type="primary" size="small" @click="isAddVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="dataList" stripe v-loading="isLoading">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="type" label="配置类型" min-width="100">
                <template slot-scope="scope" >
                        {{ configType[scope.row.type]}}
                </template>
            </el-table-column>
            <el-table-column prop="name" label="配置名称" min-width="100"></el-table-column>
            <el-table-column prop="key" label="关键字" min-width="100"></el-table-column>
            <el-table-column prop="value" label="配置值" min-width="230" show-overflow-tooltip></el-table-column>
            <el-table-column prop="desc" label="配置描述" min-width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="extend" label="扩展属性" width="100" show-overflow-tooltip>
                <template v-if="scope.row.type === 'authData'" slot-scope="scope">
                    <el-button type="text" size="small" @click="onExtendDetailClick(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90"  filter-placement="bottom-end" align="center">
                <template slot-scope="scope" >
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                        {{scope.row.status | statusFilter}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="160" align="center" :formatter="dateFormat" sortable></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
                <template slot-scope="scope">
                    <el-button v-if="authCheck(sysActions.edit)" @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                    <el-button v-if="authCheck(sysActions.delete)" @click="onRemoveClick(scope.row)" type="text" size="small" style="color: #F56C6C;">删除</el-button>
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
        
        <el-dialog :title='`配置 -- ${title || "新增"}`' :visible.sync="isAddVisible" @close="onDialogClose">
          <el-form :model="formData" :rules="rules" ref="dialogForm" @keyup.enter.native="onSubmit" label-width="80px">
            <el-form-item label="配置类型" prop="type">
                <el-radio-group v-model="formData.type" size="small">
                    <el-radio-button v-for="(value, key) in configType" :key="key" :label="key">{{ value }}</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="配置名称" prop="name">
              <el-input v-model="formData.name" name="name" placeholder="请输入配置名称"></el-input>
            </el-form-item>
            <el-form-item label="配置描述" prop="desc">
              <el-input v-model="formData.desc" name="desc" placeholder="请输入配置描述"></el-input>
            </el-form-item>
            <el-form-item label="关键字" prop="key">
              <el-input v-model="formData.key" name="key" placeholder="请输入关键字"></el-input>
            </el-form-item>
            <el-form-item label="配置值" prop="value">
              <el-input v-model="formData.value" name="value" placeholder="请输入配置值"></el-input>
            </el-form-item>
            <el-form-item v-if="formData.id" label="是否有效" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio class="radio" :label="1">有效</el-radio>
                <el-radio class="radio" :label="2">无效</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="small" @click="isAddVisible = false">取 消</el-button>
            <el-button type="primary" size="small" @click="onSubmit" :loading='isAddLoading'>确 定</el-button>
          </div>
        </el-dialog>

        <el-dialog :title="`扩展属性 -- ${rowData.name}`" custom-class="dg-extend" :visible.sync="isExtendVisible" @close="onExtendClose">
            <el-alert
                title="扩展属性根据实现情况，对系统配置进行扩展"
                type="warning" :closable='false' style="margin-top:-30px">
            </el-alert>
            <el-tabs v-model="curExtendTab">
                <el-tab-pane label="数据统计" name="thirdCode">
                    <el-alert
                        title="对页面埋点，统计页面的PV、UV及按钮的点击。应用在活动、合同管理"
                        type="info" :closable='false'>
                    </el-alert>
                    <el-input size="small" v-model='extend.thirdCode.baidu' placeholder="请输入统计代码code">
                        <template slot="prepend">百度</template>
                    </el-input>
                    <el-input size="small" v-model='extend.thirdCode.gio' placeholder="请输入统计代码code">
                        <template slot="prepend">GIO</template>
                    </el-input>
                </el-tab-pane>
                <el-tab-pane label="下载地址" name="download">
                    <el-alert
                        title="提供app安装包下载地址配置。应用在活动管理"
                        type="info" :closable='false'>
                    </el-alert>
                    <el-input size="small" v-model='extend.download.android' placeholder="请输入内容">
                        <template slot="prepend">安卓官网</template>
                    </el-input>
                    <el-input size="small" v-model='extend.download.ios' placeholder="请输入内容">
                        <template slot="prepend">iOS 地址</template>
                    </el-input>
                    <el-input size="small" v-model='extend.download.ymb' placeholder="请输入内容">
                        <template slot="prepend">&nbsp;&nbsp;&nbsp;应用宝</template>
                    </el-input>
                    <el-input size="small" v-model='extend.download.openIos' placeholder="请输入内容">
                        <template slot="prepend">iOS 唤醒</template>
                    </el-input>
                    <el-input size="small" v-model='extend.download.openAndroid' placeholder="请输入内容">
                        <template slot="prepend">安卓唤醒</template>
                    </el-input>
                </el-tab-pane>
                <el-tab-pane label="OSS配置" name="oss">
                    <el-alert
                        title="提供系统生成静态文件保存地址。应用在活动、合同管理"
                        type="info" :closable='false'>
                    </el-alert>
                    <el-card shadow="hover">
                        <el-dropdown @command="onOSSChanged">
                          <span class="el-dropdown-link">
                            {{ curOSS.name }}<i class="el-icon-caret-bottom el-icon--right"></i>
                          </span>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item :command="item" v-for="item in ossList" >{{ item.name }}</el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                        <el-input size="small" v-model="extend.oss[curOSS.key].accessKeyId" placeholder="请输入accessKeyId">
                            <template slot="prepend">Key Id</template>
                        </el-input>
                        <el-input size="small" v-model="extend.oss[curOSS.key].accessKeySecret" placeholder="请输入accessKeySecret">
                            <template slot="prepend">Secret</template>
                        </el-input>
                        <el-input size="small" v-model="extend.oss[curOSS.key].bucket" placeholder="请输入OSS Bucket 名称">
                            <template slot="prepend">bucket</template>
                        </el-input>
                    </el-card>
                </el-tab-pane>
            </el-tabs>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="isExtendVisible = false">取 消</el-button>
                <el-button type="primary" size="small" @click="onExtendSubmit" :loading='isExtendLoading'>确 定</el-button>
            </div>
        </el-dialog>
    </el-row>
</template>
<script>
    export default {
        data() {
            return {
                title: '',
                isAddVisible: false,
                isExtendVisible: false,
                isLoading: false,
                isAddLoading: false,
                isExtendLoading: false,
                keys:"",
                rowData:{},
                dataList: null,
                pageSize:15,
                pageIndex:1,
                total:0,
                formData: {
                    type:'normal',
                    name:'',
                    desc:'',
                    key:'',
                    status: 1,
                    value:''
                },
                rules: {
                    name:[
                        { required:true, message:'请输入配置名称',trigger:'blur'}
                    ],
                    key: [
                        { required:true, message:'请输入关键字',trigger:'blur' }
                    ],
                    value: [
                      { required:true, message:'请输入配置值',trigger:'blur' }
                    ]
                },
                configType:{
                    normal: '普通',
                    authData: '数据权限',
                    authAction: '功能权限'
                },
                ossList:[
                    { key: 'dev', name: '开发环境' },
                    { key: 'test', name: '测试环境' },
                    { key: 'pre', name: '预发环境' },
                    { key: 'pro', name: '生产环境' },
                ],
                curOSS:{ key: 'dev', name: '开发环境'},
                curExtendTab:'thirdCode',
                extend:{
                    thirdCode:{ baidu:'', gio:''},
                    download:{ android:'',ios:'',ymb:'',openIos:'',openAndroid:'' },
                    oss:{
                        dev:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                        test:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                        pre:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                        pro:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                    }
                }
            }
        },
        mounted(){
            this.bindConfigs();
        },
        methods:{
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
                        this.$message.error(res.msg);
                        return;
                    }

                    this.dataList = res.data.list;
                    this.total = res.data.total;
                }).catch(() => {
                    this.isLoading = false;
                });
            },
            onExtendDetailClick(row){
                this.rowData = row;
                this.extend = Object.assign({}, this.extend, row.extend);
                this.isExtendVisible = true;
            },
            onEditClick(row){
                this.title = '编辑',
                this.formData = Object.assign({}, row);
                this.formData.status = parseInt(row.status);
                this.isAddVisible = true;
            },
            onRemoveClick(row){
                this.$confirm('确认删除该配置吗?', '友情提示', { type: 'warning'}).then(() => {
                    let url = '/api/config/'+ row.id;
                    this.$http.delete(url).then((res)=>{
                        if(res.code !== 'SUCCESS'){
                            this.$message.error(res.msg);
                            return;
                        }
                        this.bindConfigs();
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
                !this.keys && this.bindConfigs();
            },
            onOSSChanged(command){
                this.curOSS = command;
            },
            onExtendClose(){
                this.curExtendTab = 'thirdCode';
                this.curOSS = this.ossList[0];
                this.extend = {
                    thirdCode:{ baidu:'', gio:''},
                    download:{ android:'',ios:'',ymb:'',openIos:'',openAndroid:'' },
                    oss:{
                        dev:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                        test:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                        pre:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                        pro:{ accessKeyId: '', accessKeySecret: '', bucket: '' },
                    }
                };
            },
            onExtendSubmit(){
                let params = Object.assign({}, this.rowData);
                params.extend = this.extend;
                let apiUrl = '/api/config/'+ this.rowData.id;
                this.isExtendLoading = true;
                this.$http.put(apiUrl, params).then(res => {
                    this.isExtendLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.rowData.extend = this.extend;
                    this.isExtendVisible = false;
                }).catch(() => {
                    this.isExtendLoading = false;
                });
            },
            onDialogClose(){
                this.title = '',
                this.formData = {
                    type:'normal',
                    name:'',
                    desc:'',
                    key:'',
                    status: 1,
                    value:''
                };
                this.$refs.dialogForm.resetFields();
            },
            onSubmit(){
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
                  var apiUrl = "/api/config";
                  this.isAddLoading = true;
                  this.$http.post(apiUrl,this.formData).then((res) => {
                    this.isAddLoading = false;
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }

                    this.isAddVisible = false;
                    this.bindConfigs();
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
                  var apiUrl = "/api/config/"+ this.formData.id;
                  this.isEditLoading = true;
                  this.$http.put(apiUrl,this.formData).then((res)=>{
                    if(res.code !== 'SUCCESS'){
                        this.$message.error(res.msg);
                        return;
                    }
                    this.isEditLoading = false;
                    this.isAddVisible = false;
                    this.bindConfigs()
                  }).catch(() => {
                    this.isEditLoading = false;
                  });
                });
            }
        }
    };
</script>
<style lang='scss' scope>
.dg-extend{
    .el-card{
        overflow:inherit;
        margin-top:20px;
        position:relative;

        .el-dropdown{
            position:absolute;
            top:-15px;
            left:10px;
            padding:5px 10px;
            color:#409EFF;
            background-color:#fff;
        }
    }
    .el-alert + .el-input, .el-input + .el-input{
        margin-top:10px;
    }
}
</style>