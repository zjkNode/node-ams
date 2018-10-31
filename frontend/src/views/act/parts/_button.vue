<template>
	<div>
		<el-form-item label="按钮图片" style="margin-bottom:0;">
            <el-upload
                class="btn-uploader"
                action="/api/act/upload"
                accept="image/gif,image/jpeg,image/png"
                :data="uploadData"
                :show-file-list="false"
                :on-success="handleSuccess">
                <img v-if="button.imageUrl" :src="button.imageUrl" class="btn_img" />
                <i v-else class="el-icon-plus btn-uploader-icon"></i>
            </el-upload>
        </el-form-item>
        <el-form-item label="按钮功能" >
            <el-row>
                <el-cascader 
                :options="btnUsages" 
                v-model="button.usages" 
                placeholder="请选择按钮功能" 
                @active-item-change="onItemChange"
                @change="changeSelectFn"></el-cascader>
                <el-button type="text" size="small" plain icon="el-icon-circle-plus" style="margin-left: 10px;" v-if="button.usages == 'goResponse'" @click="addResStatus">状态</el-button>
            </el-row>
            <el-row style="margin-top:10px;" v-if="button.usages == 'goOthers'">
                <el-input v-model="button.href" placeholder="请输入按钮要跳转H5链接地址"></el-input>
            </el-row>
            <el-row style="margin-top:10px;" v-if="button.usages == 'goResponse'">
                <template v-for="(item,index) in tempResStatus">
                    <response :originData="button.responses[index]" :index="index" :key="index" @delBackEndFn="delBackEndFn" :ref="'response_'+ index"></response>
                </template>
            </el-row>
        </el-form-item>
	</div>
</template>
<script>
    import response from "./_response.vue"
    import { mapGetters } from 'vuex';
    import util from '@/assets/js/util';
	
	export default  {
        props: ['originData'],
        components:{ response },
        computed: mapGetters({
            cacheActParts: 'getActParts',
            uploadData: 'getUploadData'
        }),
		data(){
			return {
                uuid: util.uuid(), // 子组件，可能被多次引用，uuid 用于区分不同的实例,
				button:{
					imageUrl:'',
					usages:[],
	                href:'',
                     style:{
	                    width:'',
                        margin:'0 0'
	                },
	                responses:[]
				},
				btnUsages:[
                    { value: 'download', label: '去下载' }, 
                    { value: 'goApp', label: '去app', children:[
                            { value: 'goAppIndex', label: '首页' },
                            { value: 'goAppAccount', label: '帐户页' },
                            { value: 'goAppCoupons', label: '优惠券页' },
                            { value: 'goAppCredit', label: '认证中心页' },
                            { value: 'goAppCard', label: '会员卡页' },
                            { value: 'goAppMarket', label: '贷款超市' }
                    ]},
                    { value: 'goAlerts', label: '去弹框'},
                    { value: 'goAlertClose', label: '去关闭弹框' },
                    { value: 'goResponse', label: '去响应' },
                    { value: 'goOthers', label: '去其他H5链接' }
                ],
                tempResStatus:[''],
                btnImgList:[]
			}
		},
		mounted(){
            this.button.uuid = this.uuid;
            this.bindAlters();
            if(!this.originData){
                return;
            }
            this.tempResStatus = [];
            this.button = this.originData;
            this.uuid = this.originData.uuid;
            this.button.responses = this.originData.responses || [];
            let imgUrl = this.button.imageUrl;
            if(imgUrl){
                this.btnImgList.push({ name:imgUrl.split('/').pop(), url: imgUrl});
            }
            for (var i = 0; i < this.button.responses.length; i++) {
                this.tempResStatus.push('');
            }
		},
        watch:{
            cacheActParts:'bindAlters'
        },
		methods:{
			getData(){
				this.button.responses = [];
                for(let key in this.$refs){
                    if(key.indexOf('response_') > -1){
                        this.button.responses.push(this.$refs[key][0].getData());
                    }
                }
				return this.button;
			},
			delBackEndFn(index){
                delete this.$refs['response_'+ index];
            },
            bindAlters(){
                if(!this.cacheActParts){
                    return;
                }
                let alters = this.cacheActParts.filter(item => item.type === 'hidden');
                this.btnUsages[2].children = alters;
            },
            changeSelectFn(value){
                this.button.usages = value;
                let selectedStr = value[value.length-1];
                if(selectedStr !== 'goOthers'){
                    this.button.href = '' ;
                }
            },
            onItemChange(value){
                let _this = this;
                this.$nextTick(() => {
                    let $casMenus = document.getElementsByClassName("el-cascader-menu");
                    let $alertContainer = $casMenus[$casMenus.length - 1];
                    let $alerts = $alertContainer.getElementsByTagName('li');

                    if(value[0] !== 'goAlerts'){
                        for (let i = 0; i < $alerts.length; i++) {
                            $alerts[i].removeEventListener('mouseenter', _this.onItemEnter);
                            $alerts[i].removeEventListener('mouseleave', _this.onItemLeave);
                        }
                        return;
                    }
                    for (let i = 0; i < $alerts.length; i++) {
                        $alerts[i].addEventListener('mouseenter', _this.onItemEnter);
                        $alerts[i].addEventListener('mouseleave', _this.onItemLeave);
                    }
                });
            },
            onItemEnter(e){
                let index = [].indexOf.call(e.target.parentNode.children, e.target);
                let curAlert = this.btnUsages[2].children[index];
                this.$store.dispatch("setCurActBtnRes",curAlert.value);
            },
            onItemLeave(){
                this.$store.dispatch("setCurActBtnRes",null);
            },
            handleSuccess(response){
                this.button.imageUrl = response.file.path;
                util.getImageWH(response.file.path).then(res => {
                    this.button.style.width = res.width;
                    this.$store.dispatch("setButtonConfig",this.button);
                });
            },
            addResStatus(){
                this.tempResStatus.push('');
                this.$nextTick(()=>{
                    let resItem = this.$refs['response_'+ (this.tempResStatus.length-1)][0];
                    this.button.responses.push(resItem.getData());
                });
            }
		}
	}

</script>
<style scope>
.btn-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    line-height:28px;
}
.btn-uploader .el-upload:hover {
    border-color: #409EFF;
}
.btn-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    line-height: 40px;
    text-align: center;
}
.btn_img {
    width: 100px;
}

</style>