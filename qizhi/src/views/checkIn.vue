<template>
  <div class="page check-in">
    <p class="name">学生姓名：<b>{{name}}</b></p>
    <p class="time">打卡时间：<b>{{studyInfo.create_time || '未打卡'}}</b></p>
    <div class="btn-check" :class="{ok:studyInfo.id}" @click="toCheckIn">{{isDoing ? '打卡中' : (studyInfo.id ? '已打卡' : '打卡')}}</div>
  </div>
</template>
<script>
export default {
  data(){
    return {
      isDoing: false,
      st: '',
      name:'',
      studyInfo:{}
    }
  },
  created(){
    if(this.$route.query){
      this.st = this.$route.query.st;
      this.name = this.$route.query.name;
    }
    // this.toCheckIn();
  },
  methods:{
    toCheckIn(){ // 去签到
      if(this.isDoing || this.studyInfo.id){
        return;
      }
      this.isDoing = true;
      this.$indicator.open();
      this.$axios.post("/qizhi/study/checkIn", {student: this.st}).then(res => {
        this.$indicator.close();
        this.isDoing = false;
        if(res.code != 'SUCCESS'){
          this.$toast(res.msg);
          return;
        }
        this.studyInfo = res.data;
      }).catch( () => {
        this.isDoing = false;
        this.$indicator.close();
      });
    },
  }
}
</script>
<style lang="less" scoped>
.btn-check{
  position: relative;
  height: 2rem;
  width: 2rem;
  margin: 50% auto 1rem;
  padding: .1rem;
  line-height: 1.8rem;
  font-size: .5rem;
  text-align: center;
  background: #67C23A;
  border-radius: 50%;
  color: #fff;
  &:before{
    content:' ';
    position: absolute;
    height: 2.4rem;
    width: 2.4rem;
    // background: red;
    background: rgb(225, 243, 216);
    border-radius: 50%;
    top:-.1rem;
    left: -.1rem;
    z-index: -1;
  }
  &:after{
    content:' ';
    position: absolute;
    height: 2.7rem;
    width: 2.7rem;
    // background: red;
    background: rgb(240, 249, 235);
    border-radius: 50%;
    top:-.24rem;
    left: -.24rem;
    z-index: -2;
  }
  &.ok{
    background: #DCDFE6;
    &:before{background:#EBEEF5;}
    &:after{background:#F2F6FC;}
  }
}
.name, .time{
  line-height: .35rem;
  font-size: .16rem;
  b{font-size: .24rem; color: #E6A23C;}
}
.time{
  b{font-size: .18rem; color: #E6A23C;}
}

</style>