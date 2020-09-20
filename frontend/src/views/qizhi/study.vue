<template>
    <el-row>
        <h2>学习记录管理</h2>
        <el-row class="tools">
            <el-col :span="10">
                <el-input size="small" v-model="keys" placeholder="请输入学员姓名"></el-input>
            </el-col>
            <el-col :span="13" :offset="1">
                <el-button size="small" type="primary" @click="bindStudyList" icon="el-icon-search">查询</el-button>
            </el-col>
        </el-row>
        <el-table :data="studyList" stripe v-loading="isLoading">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="student_name" label="学生姓名" min-width="120"></el-table-column>
            <el-table-column prop="teacher_name" label="打卡老师" min-width="120"></el-table-column>
            <el-table-column prop="create_time" label="打卡时间" :formatter="dateFormat" min-width="160" sortable></el-table-column>
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
    </el-row>
</template>
<script>
export default {
    data() {
      return {
            isVisible:false,
            isLoading: false,
            isDoing: false,
            keys:"",
            studyList: null,
            pageSize:15,
            pageIndex:1,
            total:0,
        }
    },
    mounted(){
        this.bindStudyList();
    },
    methods:{
        bindStudyList(){
            let url = '/api/qizhi/study';
            let params = {
                keys: this.keys,
                pageSize: this.pageSize,
                pageIndex:this.pageIndex
            };
            this.isLoading = true;
            this.$http.get(url,{ params: params}).then((res)=>{
                this.isLoading = false;
                if(res.code !== 'SUCCESS'){
                    return;
                }
                this.studyList = res.data.list;
                this.total = res.data.total;
            }).catch(()=> {
                this.isLoading = false;
            });
        },
        onSizeChange(val) {
            this.pageSize = val;
            this.bindStudyList();
        },
        onCurrentChange(val) {
            this.pageIndex = val;
            this.bindStudyList();
        }
    }
  }
</script>