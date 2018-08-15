<template>
    <el-dialog title="新增配置" size="tiny" :visible.sync="bAddVisible">
      <el-form :model="formData" :rules="rules" ref="userAddForm" label-width="80px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="formData.name" auto-complete="off" name="name" placeholder="请输入配置名称"></el-input>
        </el-form-item>
        <el-form-item label="配置描述" prop="desc">
          <el-input v-model="formData.desc" auto-complete="off" name="desc" placeholder="请输入描述内容"></el-input>
        </el-form-item>
        <el-form-item label="关键字" prop="key">
          <el-input v-model="formData.key" auto-complete="off" name="key" placeholder="请输入关键字"></el-input>
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input v-model="formData.value" auto-complete="off" name="value" placeholder="请输入配置值"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm('userAddForm')">取 消</el-button>
        <el-button type="primary" @click="submitForm('userAddForm')">确 定</el-button>
      </div>
    </el-dialog>
</template>
<script>
  export default {
    props:{
      isAddVisible:{ type:Boolean, default:false }
    },
    data() {
      return {
        bAddVisible: this.isAddVisible,
        formData: {
          name:'',
          desc:'',
          key:'',
          value:''
        },
        rules: {
            name:[
                { required:true, message:'请输入配置名称',trigger:'blur'}
            ],
            desc: [
                { required:true, message:'请输入描述内容',trigger:'blur' }
            ],
            key: [
                { required:true, message:'请输入关键字',trigger:'blur' }
            ],
            value: [
              { required:true, message:'请输入配置值',trigger:'blur' }
            ]
        }
      };
    },
    watch:{
      isAddVisible(val){
        this.bAddVisible = val;
      },
      bAddVisible(val){
        this.$emit('onAddVisibleChange',val);
      }
    },
    mounted(){
    },
    methods:{
      initForm(){
        
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (!valid) {
            return false;
          }
          var apiUrl = "/api/config/add";
          this.$http.post(apiUrl,this.formData).then((res)=>{
            this.$refs[formName].resetFields();
            this.bAddVisible = false;
            this.$emit('afterSubmit');
          },(error)=>{
            console.log(error);
          });

        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.bAddVisible = false;
      }
    }
  };
</script>
