<template>
    <el-row>
        <h2>Banner 管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入banner名称"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindList" icon="el-icon-search"> 查询</el-button>
                <el-button v-if="authCheck(sysActions.add)" size="small" type="primary" @click="isDialogVisible = true" icon="el-icon-plus">新增</el-button>
            </el-col>
        </el-row>
        <el-table :data="bannerList" stripe v-loading="isLoading" >
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="image_url" label="图片" width="160">
              <template slot-scope="scope">
                <img :src="scope.row.image_url"/>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="图片名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="link" label="跳转地址" show-overflow-tooltip width="160"></el-table-column>
            <el-table-column prop="status" label="状态" width="90">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" close-transition>{{bannerStatus[scope.row.status]}}</el-tag>
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

      <el-dialog :title="'Banner -- '+ (title || '新增')" :visible.sync="isDialogVisible" @close="onFormClose">
        <el-form :model="formData" :rules="rules" ref="dialogForm" label-width="90px" @keyup.enter.native="onSubmit" size='small'>
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" name="name" placeholder="Banner名称"></el-input>
          </el-form-item>
          <el-form-item label="跳转地址" prop="link">
            <el-input v-model="formData.link" name="link" placeholder="跳转地址"></el-input>
          </el-form-item>
          <el-form-item label="图片" prop='image_url'>
            <el-upload
              class="banner-uploader"
              action="/api/yz/banner/upload"
              :data="uploadData"
              :show-file-list="false"
              :on-success="onBannerSuccess"
              :before-upload="beforeBannerUpload">
              <img v-if="formData.image_url" :src="formData.image_url" class="banner" />
              <i v-else class="el-icon-plus banner-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item v-if="formData.id" label="是否可用" prop="status">
              <el-radio-group v-model.number="formData.status">
                  <el-radio :label="1">上架</el-radio>
                  <el-radio :label="2">下架</el-radio>
              </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="isDialogVisible = false" size='small'>取 消</el-button>
          <el-button type="primary" @click="onSubmit" :loading="isDoing" size="small">确 定</el-button>
        </div>
      </el-dialog>
    </el-row>
</template>
<script>
import util from '@/assets/js/util';
export default {
  data() {
    return {
      bannerList: null,
      isLoading: false,
      isDoing: false,
      isDialogVisible: false,
      keys: "",
      title: "",
      uploadData:{
        uuid: util.uuid()
      },
      formData: {
        id: "",
        name: '',
        image_url: "",
        link: '',
        status:1
      },
      bannerStatus:{
        1:'上架', 2: '下架'
      },
      rules: {
        image_url: [
          { required: true, message: "图片不能为空", trigger: "blur" },
        ]
      }
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      
    },
    bindList() {
      let url = "/api/yz/banner";
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
          this.bannerList = res.data;
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
      this.$confirm("确认删除该Banner吗?", "友情提示", { type: "warning" }).then(() => {
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
        this.$http.post("/api/dep", this.formData).then(res => {
            this.isDoing = false;
            if (res.code !== "SUCCESS") {
              this.$message.error(res.msg);
              return;
            }
            this.isDialogVisible = false;
            this.loadData();
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
            this.loadData();
          }).catch(() => {
            this.isDoing = false;
          });
      });
    },
    beforeBannerUpload(file){
      util.getImageWH(file.path).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })
      console.log(file)
    },
    onBannerSuccess(res, file){
      console.log(res, file);
    }
  }
}
</script>
<style scope>
.banner-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .banner-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .banner-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 400px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
  .banner {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>