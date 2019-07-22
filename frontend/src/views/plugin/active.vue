<template>
    <el-row>
        <h2>block插件激活码管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入用户手机号"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindDataList" icon="el-icon-search"> 查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" size="small" type="primary" @click="isDialogVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="dataList" stripe v-loading="isLoading" >
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="name" label="激活码"></el-table-column>
            <el-table-column prop="user_phone" label="手机号"></el-table-column>
            <el-table-column prop="payment" label="缴费费金额"></el-table-column>
            <el-table-column prop="pay_num" label="缴费次数"></el-table-column>
            <el-table-column prop="amount" label="总金额"></el-table-column>
            <el-table-column prop="status" label="状态" width="90">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>{{scope.row.status | statusFilter}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="start_time" label="有效时间(起)" :formatter="dateFormat" width="160"></el-table-column>
            <el-table-column prop="end_time" label="有效时间(止)" :formatter="dateFormat" width="160"></el-table-column>
            <el-table-column prop="create_time" label="创建时间" :formatter="dateFormat" width="160"></el-table-column>
            <el-table-column prop="update_time" label="最近更新时间" :formatter="dateFormat" width="160"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template v-if="scope.row.operateAble" slot-scope="scope">
                <el-button v-if="authCheck(sysActions.edit)" @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                <el-button v-if="authCheck(sysActions.delete)" @click="onRemoveClick(scope.row)" type="text" size="small" style="color: #F56C6C;">删除</el-button>
              </template>
            </el-table-column>
      </el-table>

      <el-dialog :title="'激活码 -- '+ (title || '新增')" :visible.sync="isDialogVisible" @close="onFormClose">
        <el-form :model="formData" :rules="rules" ref="dialogForm" label-width="90px" @keyup.enter.native="onSubmit">
          <el-form-item label="激活码" prop="active_code">
            <el-input v-model="formData.active_code" name="active_code" placeholder="激活码"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="user_phone">
            <el-input v-model="formData.user_phone" name="user_phone" placeholder="手机号"></el-input>
          </el-form-item>
          <el-form-item label="缴费金额" prop="payment">
            <el-input v-model="formData.payment" name="payment" placeholder="缴费金额"></el-input>
          </el-form-item>
          <el-form-item label="有效期(起)" prop="start_time">
            <el-input v-model="formData.start_time" name="start_time" placeholder="有效期(起)"></el-input>
          </el-form-item>
          <el-form-item label="有效期(止)" prop="end_time">
            <el-input v-model="formData.end_time" name="end_time" placeholder="有效期(止)"></el-input>
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
      dataList: null,
      isLoading: false,
      isDoing: false,
      isDialogVisible: false,
      keys: "",
      title: "",
      formData: {
        active_code: "",
        user_phone: '',
        payment: "",
        start_time: '',
        end_time:''
      },
      rules: {
        user_phone: [
          { required: true, message: "用户手机号不能为空", trigger: "blur" },
        ]
      }
    };
  },
  created(){

  },
  mounted() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      this.bindDataList();
    },
    bindDataList() {
      let url = "/api/plugin/blockActive";
      let params = {
        keys: this.keys
      };
      this.isLoading = true;
      this.$http.get(url, { params: params }).then(res => {
          this.isLoading = false;
          if(res.code !== "SUCCESS") {
            this.$message.error(res.msg);
            return;
          }
          this.dataList = res.data;
        }).catch(() => {
          this.isLoading = false;
        });
    },
    onFormClose() {
      this.formData = {
        pids: this.curUser.depids,
        name: ""
      };
      this.title = "";
      this.$refs.dialogForm.resetFields();
    },
    onEditClick(row) {
      this.title = "编辑";
      this.formData = Object.assign({}, row);
      this.isDialogVisible = true;
    },
    onRemoveClick(row) {
      this.$confirm("确认删除该激活码吗?", "友情提示", { type: "warning" }).then(() => {
          let url = "/api/plugin/blockActive" + row.id;
          this.$http.delete(url).then(res => {
            if (res.code !== "SUCCESS") {
              this.$message.error(res.msg);
              return;
            }
            this.bindDataList();
          }).catch(() => {});
        }).catch(() => {});
    },
    onSubmit() {
      if (this.formData.id) {
        this.onEditSubmit();
        return;
      }
      this.onAddSubmit();
    },
    onAddSubmit() {
      this.$refs.dialogForm.validate(valid => {
        if (!valid) {
          return false;
        }
        this.isDoing = true;
        this.$http.post("/api/plugin/blockActive", this.formData).then(res => {
            this.isDoing = false;
            if (res.code !== "SUCCESS") {
              this.$message.error(res.msg);
              return;
            }
            this.isDialogVisible = false;
            this.bindDataList();
        }).catch(() => {
            this.isDoing = false;
        });
      });
    },
    onEditSubmit() {
      this.$refs.dialogForm.validate(valid => {
        if (!valid) {
          return false;
        }
        let apiUrl = "/api/plugin/blockActive/" + this.formData.id;
        this.isDoing = true;
        this.$http.put(apiUrl, this.formData).then(res => {
            this.isDoing = false;
            if (res.code !== "SUCCESS") {
              this.$message.error(res.msg);
              return;
            }
            this.isDialogVisible = false;
            this.bindDataList();
          }).catch(() => {
            this.isDoing = false;
          });
      });
    }
  }
}
</script>
