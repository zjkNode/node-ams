<template>
  <el-row>
    <h2>blocker插件管理</h2>
    <el-row class="tools">
      <el-tag
      :effect="rule.status === 1 ? 'dark': 'plain'"
      :key="rule.id"
      v-for="rule in blockRules"
      closable
      :disable-transitions="false"
      @click="handleClick(rule)"
      @close="handleClose(rule)">
      {{rule.name}}
    </el-tag>
    <el-input
      class="input-new-tag"
      v-if="inputVisible"
      v-model="inputValue"
      ref="saveTagInput"
      size="small"
      @keyup.enter.native="handleInputConfirm"
      @blur="handleInputConfirm">
    </el-input>
    <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
    </el-row>
    <el-row class="tools" :gutter="12">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>白名单</span>
            <el-switch
              style="float: right;"
              @change="handleWhiteChange"
              :value="curRule.type === 1">
            </el-switch>
          </div>
          <el-input
            type="textarea"
            :rows="10"
            placeholder="请输入内容"
            v-model="curRule.whiteList">
          </el-input>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
           <div slot="header" class="clearfix">
            <span>黑名单</span>
            <el-switch
              style="float: right;"
              @change="curRule.type = value ? 2 : 1"
              :value="curRule.type === 2">
            </el-switch>
          </div>
          <el-input
            type="textarea"
            :rows="10"
            placeholder="请输入内容"
            v-model="curRule.blackList">
          </el-input>
        </el-card>
      </el-col>
    </el-row>
  </el-row>
</template>
<script>
export default {
  data() {
    return {
      blockRules:[
        {id:1, name:'规则一', white_list:['baidu','google'], black_list:[], status:1, type: 1},
        {id:2, name:'规则二', white_list:[], black_list:['baidu','google'], status:2, type: 2}
      ],
      curRule:{},
      whiteValue:'',
      blackValue:'',
      value: true,
      textarea:'',
      dynamicTags: ['标签一', '标签二', '标签三'],
      inputVisible: false,
      inputValue: ''
    }
  },
  created(){
    // this.bindData();
  },
  mounted() {
  },
  methods: {
    bindData() {
      let url = '/api/plugin';
      this.$http.get(url, {}).then((res)=>{
        if(res.code != 'SUCCESS'){
          this.$message.error(res.msg);
          return;
        }
      
      }).catch(() => { });
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick( () => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    handleClick(rule){
      this.blockRules.forEach(item => item.status = (rule.id === item.id ? 1 : 2));
      this.curRule.id = rule.id;
      this.curRule.type = rule.type;
      this.curRule.whiteList = rule.white_list.join('\r\n');
      this.curRule.blackList = rule.black_list.join('\r\n');
    },
    handleWhiteChange(value){
      console.log(value)
      this.curRule.type = value ? 1 :  3;
    }
  }
}
</script>
<style scope>
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
</style>