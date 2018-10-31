<template>
	<div v-popover:button-pop class="rmableBtnWrapper" ref="curPop">
        <el-popover ref="button-pop" placement="right" width="350" trigger="click">
            <zbutton ref='zbutton' :originData="originData"></zbutton>
        </el-popover>
        <el-button size="small">按钮{{index}}</el-button>
        <i v-if='showClose' class="el-icon-circle-close" @click="handleRemove($event)"></i>
    </div>
</template>
<script>
    import zbutton from "./_button.vue"

    export default {
        name:'buttons',
        desc:'按钮组件',
        props: ['originData','onRemove', 'index'],
        components:{ zbutton },
        data(){
            return {
                uuid:'',
                button:{},
                showClose:false
            }
        },
        mounted(){
            this.uuid = this.$refs.zbutton.uuid;
            this.showClose = !!this.$listeners.onRemove;
        },
        methods:{
            getData(){
                this.button = this.$refs.zbutton.getData();
                return this.button;
            },
            handleRemove(event){
                event.stopPropagation();
                this.$refs.curPop.parentNode.removeChild(this.$refs.curPop);
                this.$emit('onRemove',this.index);
            }
        }
    }

</script>
<style lang="scss" scope>
    .rmableBtnWrapper{
        float:left;
        margin-right: 5px;
        position:relative;

        .el-icon-circle-close{
            position:absolute;
            top:-3px; right:-5px;
            z-index:1;
        }
    }
</style>
