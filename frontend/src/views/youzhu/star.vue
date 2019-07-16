<template>
    <el-row>
        <h2>收藏管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入产品内容/用户标识"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindDepList" icon="el-icon-search"> 查询</el-button>
            </el-col>
        </el-row>
        <el-table :data="depList" stripe v-loading="isLoading" >
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="title" label="产品标题" show-overflow-tooltip></el-table-column>
            <el-table-column prop="uid" label="用户标识" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态" width="90">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>{{scope.row.status | statusFilter}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="ctime" label="收藏时间" :formatter="dateFormat" width="160"></el-table-column>
      </el-table>
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
      title: "",
      formData: {
        pid: "",
        pids: [],
        name: "",
        status: 1
      },
      rules: {
        pids: [
          {
            type: "array",
            required: true,
            message: "父级部门不能为空",
            trigger: "blur"
          }
        ],
        name: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
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