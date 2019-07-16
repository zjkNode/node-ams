<template>
    <el-row>
        <h2>消息管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入消息标题"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindDepList" icon="el-icon-search"> 查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" size="small" type="primary" @click="isDialogVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="depList" stripe v-loading="isLoading" >
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="title" label="消息标题" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="消息类型"></el-table-column>
            <el-table-column prop="content" label="消息内容"></el-table-column>
            <el-table-column prop="link" label="跳转地址"></el-table-column>
            <el-table-column prop="status" label="状态" width="90">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>{{scope.row.status | statusFilter}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="ctime" label="创建时间" :formatter="dateFormat" width="160"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template v-if="scope.row.operateAble" slot-scope="scope">
                <el-button v-if="authCheck(sysActions.edit)" @click="onEditClick(scope.row)" type="text" size="small">编辑</el-button>
                <el-button v-if="authCheck(sysActions.delete)" @click="onRemoveClick(scope.row)" type="text" size="small" style="color: #F56C6C;">删除</el-button>
              </template>
            </el-table-column>
      </el-table>

      <el-dialog :title="'系统消息 -- '+ (title || '新增')" :visible.sync="isDialogVisible" @close="onFormClose">
        <el-form :model="formData" :rules="rules" ref="dialogForm" label-width="90px" @keyup.enter.native="onSubmit" size='small'>
          <el-form-item label="消息类型" prop="type">
            <el-select v-model="formData.type" placeholder="消息类型">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="消息标题" prop="title">
            <el-input v-model="formData.title" name="title" placeholder="消息标题"></el-input>
          </el-form-item>
          <el-form-item label="跳转地址" prop="link">
            <el-input v-model="formData.link" name="link" placeholder="跳转地址"></el-input>
          </el-form-item>
          <el-form-item label="消息内容" prop="content">
            <el-input v-model="formData.content" name="content" type='textarea' placeholder="消息内容"></el-input>
          </el-form-item>
          <el-form-item v-if="formData.id" label="是否可用" prop="status">
              <el-radio-group v-model.number="formData.status">
                  <el-radio :label="1">正常</el-radio>
                  <el-radio :label="2">停用</el-radio>
              </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="isDialogVisible = false" size='small'>取 消</el-button>
          <el-button type="primary" @click="onSubmit" :loading="isDoing" size='small'>确 定</el-button>
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
      keys: "",
      depOptions: [],
      props: { value: "id", label: "name" },
      typeOptions:[
        {value:1, label:'类型1'},
        {value:2, label:'类型2'},
        {value:3, label:'类型3'},
      ],
      title: "",
      formData: {
        pid: "",
        pids: [],
        name: "",
        status: 1
      },
      rules: {
        name: [
          { required: true, message: "消息标题不能为空", trigger: "blur" },
          { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      
    },
    bindDepList() {
      let url = "/api/dep";
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
          this.depList = res.data;
        }).catch(() => {
          this.isLoading = false;
        });
    },
    bindDepTree() {
      let url = "/api/dep/tree";
      this.$http.get(url).then(res => {
          if (res.code !== "SUCCESS") {
            this.$message.error(res.msg);
            return;
          }
          let tmpOption = [];
          if(this.curUser.isAdmin){
              tmpOption.push({ name: "顶级", id: 0, pid: 0 });
          }
          if (res.data && res.data.length > 0) {
              tmpOption = [...tmpOption, ...res.data];
          }
          this.formData.pids = this.curUser.depids;
          this.depOptions = tmpOption;
        }).catch(() => {});
    },
    onFormClose() {
      this.formData = {
        pids: this.curUser.depids,
        name: ""
      };
      this.title = "";
      this.$refs.dialogForm.resetFields();
      this.$options.filters.disableItem(this.depOptions, this.curUser.depids);
    },
    onEditClick(row) {
      this.title = "编辑";
      this.formData = Object.assign({}, row);
      this.$options.filters.disableItem(this.depOptions, [row.id, ...this.curUser.depids]);
      this.isDialogVisible = true;
    },
    onRemoveClick(row) {
      this.$confirm("确认删除该部门吗?", "友情提示", { type: "warning" }).then(() => {
          let url = "/api/dep/" + row.id;
          this.$http.delete(url).then(res => {
            if (res.code !== "SUCCESS") {
              this.$message.error(res.msg);
              return;
            }
            this.refreshData();
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
        this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
        this.isDoing = true;
        this.$http
          .post("/api/dep", this.formData)
          .then(res => {
            this.isDoing = false;
            if (res.code !== "SUCCESS") {
              this.$message.error(res.msg);
              return;
            }
            this.isDialogVisible = false;
            this.refreshData();
          })
          .catch(() => {
            this.isDoing = false;
          });
      });
    },
    onEditSubmit() {
      this.$refs.dialogForm.validate(valid => {
        if (!valid) {
          return false;
        }
        this.formData.pid = this.formData.pids.slice(-1)[0] || 0;
        let apiUrl = "/api/dep/" + this.formData.id;
        this.isDoing = true;
        this.$http.put(apiUrl, this.formData).then(res => {
            this.isDoing = false;
            if (res.code !== "SUCCESS") {
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