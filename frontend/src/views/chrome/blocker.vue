<template>
  <el-row>
    <h2>blocker插件管理</h2>
    <el-row class="tools">
      <el-tag
        :effect="curRule.id === rule.id ? 'dark': 'plain'"
        :key="index"
        v-for="(rule, index) in blockRules"
        closable
        :disable-transitions="false"
        @click="handleClick(rule)"
        @close="handleClose(rule)">
        {{rule.name}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="curRule.name"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm">
      </el-input>
    <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新规则</el-button>
    </el-row>
    <el-row class="tools" :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>白名单</span>
            <el-switch
              style="float: right;"
              v-model="curRule.whiteable">
            </el-switch>
          </div>
          <el-input
            type="textarea"
            :rows="10"
            placeholder="请输入内容"
            v-model="curRule.white_list">
          </el-input>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
           <div slot="header" class="clearfix">
            <span>黑名单</span>
            <el-switch
              style="float: right;"
              v-model="curRule.blackable">
            </el-switch>
          </div>
          <el-input
            type="textarea"
            :rows="10"
            placeholder="请输入内容"
            v-model="curRule.black_list">
          </el-input>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="footer">
      <el-button size="small" @click="onSave" :loading="isSaving" type="primary">保存</el-button>
    </el-row>
  </el-row>
</template>
<script>
export default {
  data() {
    return {
      blockRules:[],
      curRule:{
        id: '',
        name:'',
        white_list:'',
        black_list:'',
        whiteable: false,
        blackable: false
      },
      tmpRule:{},
      isSaving: false,
      inputVisible: false,
    }
  },
  created(){
    this.tmpRule = Object.assign(this.curRule);
    this.bindData();
  },
  mounted() {
    this.bindEvents();
  },
  methods: {
    bindData() {
      let url = '/api/plugin/blockRule';
      this.$http.get(url, {}).then((res)=>{
        if(res.code != 'SUCCESS'){
          this.$message.error(res.msg);
          return;
        }
        this.blockRules = res.data;
        let tmpRule = res.data.find(item => item.status === 1);
        if(!tmpRule){
          return;
        }
        this.curRule = tmpRule 
        this.curRule.white_list = this.curRule.white_list.replace(/,/ig , '\r\n');
        this.curRule.white_list = this.curRule.black_list.replace(/,/ig ,'\r\n');
      }).catch(() => { });
    },
    bindEvents(){
      let $mainContainer = document.getElementsByClassName('main')[0],
          $footer = document.getElementsByClassName('footer')[0];
      $footer.style.width = $mainContainer.clientWidth +'px';
      window.addEventListener('resize', function(){
          $footer.style.width = $mainContainer.clientWidth +'px';
      });
    },
    onSave(){
      // 更新
      if(this.curRule.id !== -1){
        this.onEdit();
        return;
      }
      this.onAdd();
    },
    onEdit(){
      let url = '/api/plugin/blockRule/'+ this.curRule.id;
      let rule = Object.assign({}, this.curRule);
      rule.white_list = rule.white_list.replace(/\n/ig, ',');
      rule.black_list = rule.black_list.replace(/\n/ig, ',');
      this.isSaving = true;
      this.$http.put(url, rule).then(res => {
        this.isSaving = false;
        if(res.code !== 'SUCCESS'){
          this.$message.error(res.msg);
          return;
        }
        this.$message.success('保存成功，10分钟内配置生效');
        this.bindData();
      }).catch(() => {
        this.isSaving = false;
      });
      return;
    },
    onAdd(){
      // 新增
      this.isSaving = true;
      let url = '/api/plugin/blockRule';
      let rule = Object.assign({}, this.curRule);
      rule.id = '';
      rule.white_list = rule.white_list.replace(/\n/ig, ',');
      rule.black_list = rule.black_list.replace(/\n/ig, ',');
      this.$http.post(url, rule).then(res => {
        this.isSaving = false;
        if(res.code !== 'SUCCESS'){
          this.$message.error(res.msg);
          return;
        }
        this.curRule = Object.assign({}, this.tmpRule);
        this.bindData();
      }).catch(() => {
        this.isSaving = false;
      })
    },
    handleClose(rule) {
      if(rule.id === -1){
        this.curRule = Object.assign(this.tmpRule);
        this.blockRules.pop();
        return;
      }
      let url = '/api/plugin/blockRule/'+ rule.id;
      this.$http.delete(url).then((res) => {
        if(res.code !== 'SUCCESS'){
          this.$message.error(res.msg);
          return;
        }
        let index = this.blockRules.findIndex(item => item.id === rule.id);
        this.blockRules.splice(index, 1);
        this.curRule = Object.assign({},this.tmpRule);
      }).catch(() => {});
    },
    showInput() {
      if(this.curRule.id === -1){
        this.$message.error('请先保存当前规则后，再新增规则');
        return;
      }
      this.curRule = Object.assign({}, this.tmpRule);
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {
      let isExist = this.blockRules.findIndex(item => item.id > 0 && item.name === this.curRule.name) > -1;
      if(isExist){
        this.$message.error(`规则名${this.curRule.name}已存在，请更换名称`);
        return;
      }
      if (this.inputVisible && this.curRule.name) {
        this.curRule.id = -1;
        this.blockRules.push(Object.assign({}, this.curRule));
      }
      this.inputVisible = false;
    },
    handleClick(rule){
      if(this.curRule.id === rule.id){
        return;
      }
      if(this.curRule.id === -1){
        this.$confirm("当前规则未保存，你确定放弃保存?", "友情提示", { type: "warning" }).then(() => {
          this.blockRules.pop();
          this.curRule = Object.assign(this.tmpRule);
        }).catch(() => {})
        return;
      }
      this.curRule = Object.assign({}, rule);
      this.curRule.whiteable = !!this.curRule.whiteable;
      this.curRule.blackable = !!this.curRule.blackable;
      this.curRule.white_list = rule.white_list.replace(/,/ig , '\n');
      this.curRule.black_list = rule.black_list.replace(/,/ig ,'\n');
    },
  }
}
</script>
<style scope lang="scss">
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
  .footer{
      position:fixed;
      bottom:15px;
      left:215px;
      background-color:#fff;
      padding:5px;
      border-top: 1px solid #ddd;
      text-align: right;
      z-index:100;
      .el-button+.el-dropdown{
          margin-left: 10px;
      }
  }
</style>