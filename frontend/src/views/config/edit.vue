<template>
    <el-dialog title="修改用户" size="tiny" :visible.sync="bEditVisible">
      <el-form :model="formData" :rules="rules" ref="userEditForm" label-width="90px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="formData.name" auto-complete="off" name="name" placeholder="请输入配置名称"></el-input>
        </el-form-item>
        <el-form-item label="描述内容" prop="desc">
          <el-input v-model="formData.desc"  auto-complete="off" name="desc" placeholder="请输入描述内容"></el-input>
        </el-form-item>
        <el-form-item label="关键字" prop="key">
          <el-input v-model="formData.key" auto-complete="off" name="key" placeholder="请输入关键字"></el-input>
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input v-model="formData.value" auto-complete="off" name="value" placeholder="请输入配置值"></el-input>
        </el-form-item>
        <el-form-item label="是否有效" >
          <el-radio-group v-model="formData.status">
            <el-radio class="radio" :label="1">有效</el-radio>
            <el-radio class="radio" :label="2">无效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('userEditForm')" :loading="isLoading">确 定</el-button>
      </div>
    </el-dialog>
</template>
<script>
  export default {
    props:{
      isEditVisible:{ type:Boolean, default:false },
      rowData:null
    },
    data() {
      return {
        bEditVisible: this.isEditVisible,
        isLoading: false,
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
      isEditVisible(val){
        this.bEditVisible = val;
      },
      bEditVisible(val){
        this.$emit('onEditVisibleChange',val);
      },
      rowData(row){
        row.status=row.status-0;
        this.formData = row;
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
          this.isLoading = true;
          var apiUrl = "/api/config/"+ this.formData.id;
          this.$http.put(apiUrl,this.formData).then((res)=>{
            this.isLoading = false;
            this.bEditVisible = false;
            this.$emit('afterSubmit');
          },(error)=>{
            this.isLoading = false;
            console.log(error);
          });
        });
      }
    }
  };
</script>
