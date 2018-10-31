<template>
	<div v-popover:turn-pop  class="turnWrapper">
		<el-popover ref="turn-pop" placement="right" width="400" trigger="click">
			<el-form label-width="90px" :model="comData" class="turnForm">
            	<el-form-item label="组件定位" >
                    <el-col :span="7">
                        <el-input v-model="comData.wrap.style.height" placeholder="高px"></el-input>
                    </el-col>
                    <el-col :span="7" :offset='1'>
                        <el-input v-model="comData.wrap.style['padding-top']" placeholder="顶距px"></el-input>
                    </el-col>
                </el-form-item>
               	<el-form-item label="组件背景">
                   	<el-col :span="7">
                       <el-input  placeholder="#000000" v-model="comData.wrap.style['background-color']"></el-input>
                   	</el-col>
                    <el-col :span="7" :offset="1" v-show="comData.wrap.style['background-image']">
                        <el-select v-model="comData.wrap.style['background-repeat']" placeholder="请选择">
                            <el-option v-for="item in bgImgOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                   	<el-col :span="7" :offset="1">
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :limit="1"
                            :file-list="bgWrap"
                            accept="image/gif,image/jpeg,image/png"
                            :on-exceed= "handleExceed"
                            :on-remove="onWrapRemove"
                            :on-success="onWrapSuccess"
                            :multiple="false"
                            :auto-upload="true"
                            list-type="text">
                        	<el-button size="small" type="primary">上传</el-button>
                        </el-upload>
                   </el-col>
               	</el-form-item>
               	<el-form-item label="转盘">
                    <el-col :span="7">
                        <el-input v-model="comData.wheel.style.width" placeholder="宽度(px)"></el-input>
                    </el-col>
                    <el-col :span='10' :offset='1'>
                        <el-upload action="/api/act/upload"
                            :data="uploadData"
                            :limit="1"
                            :file-list="bgWheel"
                            accept="image/gif,image/jpeg,image/png"
                            :on-exceed= "handleExceed"
                            :on-remove="onWheelRemove"
                            :on-success = "onWheelSuccess"
                            :multiple = "false"
                            :auto-upload="true"
                            list-type="text">
                        	<el-button size="small" type="primary">上传</el-button>
                        </el-upload>
                    </el-col>
               	</el-form-item>
               	<el-form-item label="奖品颜色">
                    <el-col :span="7">
                        <el-input v-model="oddColor" placeholder="背景1"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="evenColor" placeholder="背景2"></el-input>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-input v-model="comData.wheel.style.color" placeholder="名称"></el-input>
                    </el-col>
               	</el-form-item>
                <el-form-item label="抽奖按钮">
                    <template v-for="(item, index) in tempBtns">
                        <rmable_button :key="index" :ref="'rmableBtn_'+ index" :originData="comData.buttons.items[index]" ></rmable_button>
                    </template>
                </el-form-item>
               	<el-form-item label="奖品列表">
               		<el-radio-group v-model="prizeCount" size="small" @change="onPrizeChange">
				      <el-radio-button label="6"></el-radio-button>
				      <el-radio-button label="8"></el-radio-button>
				    </el-radio-group>
               	</el-form-item>
               	<el-row>
	       			<el-col class='pcard' :span="7" :offset="1" v-for="(item, index) in comData.prizes" :key="index">
					    <el-card :body-style="{ 'padding': '0px' }" @click="onPrizeClick(item)">
				    		<el-row>
				    			<el-col :span="10">
							      	<el-upload
									  action="/api/act/upload"
		                              :data="uploadData"
									  :show-file-list="false"
									  :on-success="handlePrizeSuccess">
									  <div class='img' v-if="item.img" :style="'background-image:url('+item.img+')'"></div>
									  <i v-else class="el-icon-plus pcard-icon"></i>
								  	</el-upload>
							  	</el-col>
							  	<el-col :span="10" :offset="2">
							  		<el-button type="text" size="mini" disabled>奖品Id</el-button>
							  		<el-input size="mini" placeholder="id" v-model="item.id"></el-input> 
						      	</el-col>
					      	</el-row>
					      	<el-select size="mini" placeholder="选择弹框" v-model="item.alert" :ref="'pAlters_'+index">
		                       <el-option v-for="opt in alertsOptions"
		                                  :data-key="opt.name"
		                                  :key="opt.value + index"
		                                  :label="opt.label"
		                                  :value="opt.name">
		                       </el-option>
		                   </el-select>
					      	<el-input size="mini" type="textarea" resize="none" placeholder="奖品名称" v-model="item.name"></el-input>
					    </el-card>
					</el-col>
				</el-row>
            </el-form>
		</el-popover>

		<div class="mask">
            <el-button icon="el-icon-edit-outline">编辑</el-button>
        </div>

		<div class="turnContainer" ref="turnContainer" :style="comData.wrap.style | formatStyle">
			<div class="wheel" :style="comData.wheel.style | formatStyle">
				<div class="turnplate">
					<div class="turborder" :style="comData.wheelBorder.style | formatStyle(defaultWheel)"></div>
					<div class="core">
						<div class="core-box">
							<div class="prize" :style="prize.style | formatStyle" :key="index" :class="'p_'+prizeCount" v-for="(prize, index) in comData.prizes">
								<div class="prize-con">
                                    <pre>{{ prize.name | nl2br }}</pre>
									<div class="img" :style="'background-image:url('+ (prize.img || require('../img/prize.png')) +')'"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
                <div class="start">
                    <template v-for="(item, index) in comData.buttons.items">
                        <img :src="item.imageUrl || require('../img/start.png')" :data-uuid="item.uuid" alt="" :key="index" :style="item.style | formatStyle"/>
                    </template>
                </div>
			</div>
		</div>
	</div>
</template>
<script>
    import util from '@/assets/js/util';
    import rmable_button from './_rmable_button.vue';
	import { mapGetters } from 'vuex';

	export default {
        name:'turnplate',
        desc:'大转盘',
        props: ['originData'],
        components:{ rmable_button },
        computed: mapGetters({
        	cacheActParts: 'getActParts',
        	btnConfig: 'getActBtnConfig',
            uploadData: 'getUploadData'
        }),
        filters:{
            nl2br:function(value){
                if(!value) return '';
                return value.replace(',','\n');
            }
        },
        watch: {
            btnConfig(val){
                if(!val) return;
                this.comData.buttons.items.forEach(item => {
                    if(item.uuid === val.uuid){
                        item = val;
                        return;
                    }
                });
            },
            evenColor(val){
                this.comData.prizes.forEach((prize, index) => {
                    if(index % 2 === 0){
                        prize.style['background-color'] = val;
                    }
                });
            },
            oddColor(val){
                this.comData.prizes.forEach((prize, index) => {
                    if(index % 2 !== 0){
                        prize.style['background-color'] = val;
                    }
                });
            },
            cacheActParts:'bindAlertOptions'
        },
        data(){
        	return {
        		comData:{
                    name:"turnplate",
        			prizes:[],
                    wrap:{

                        style:{
                            height:'',
                            'padding-top':'',
                            'background-image':''
                        }
                    },
        			wheel:{
        				style:{
        					"background-image":''
        				},
        			},
                    wheelBorder:{
                        style:{
                            'background-image':''
                        }
                    },
        			buttons:{
        				items:[]
        			}
        		},
                defaultWheel:{
                    'background-image': `url(${require('../img/turntable_bg.png')})`
                },
                defaultPrize:{
                    'background-image': `url(${require('../img/prize.png')})`
                },
        		prizeCount:6,
        		oddColor:"#fefefe",
        		evenColor:"#f3f3f3",
        		curPrize:null,
        		tempBtns:[],
        		bgWrap:[],
        		bgWheel:[],
                bgImgOptions:[
                    { label: '适配全屏', value:'no-repeat' },
                    { label: '横向重复', value:'repeat-x' },
                    { label: '纵向重复', value:'repeat-y' },
                ],
                alertsOptions:[]
        	}
        },
        mounted(){
            this.bindAlertOptions();
        	this.initPrize();
        	if(!this.originData){
                this.addButton();
                return;
            }
            this.comData = this.originData;
            this.comData.prizes.forEach((prize, index) => {
                prize.name = prize.name.replace(/,/g,'\n');
                if(prize.color){
                    index % 2 == 0 ? this.evenColor = prize.color : this.oddColor = prize.color;
                }
            });
            let bgWrapImg = this.comData.wrap.style['background-image'];
            if(bgWrapImg){
                this.bgWrap.push({ name: bgWrapImg.split('/').pop(), url: bgWrapImg });
            }

            let bgWheelImg = this.comData.wheel.style['background-image'];
            if(bgWheelImg){
                this.bgWheel.push({ name: bgWheelImg.split('/').pop(), url: bgWheelImg });
            }
            this.tempBtns = [];
            for (var i = 0; i < this.comData.buttons.items.length; i++) {
                this.tempBtns.push('');
            }
        },
        methods:{
        	getData(){
                this.comData.buttons.items = [];
                for(let key in this.$refs){
                    if(key.indexOf('rmableBtn_') > -1){
                        let itemData = this.$refs[key][0].getData();
                        this.comData.buttons.items.push(itemData);
                    }
                }
                this.comData.prizes.forEach((prize) => {
                    prize.name = prize.name.replace(/\n/g,',');
                });
                return this.comData;
            },
        	initPrize(){
                let tmpPrizes = [];
                let step = 360 / this.prizeCount;
                let skewY = 90 - step;
                for(let i = 0; i < this.prizeCount; i++){
                    let rotate = step/2 + i*step; // 旋转角度
                    let prize = this.comData.prizes[i] || { id:'', name:'', img: ''};
                    prize.style = {
                        'background-color': (i % 2 == 0 ? this.evenColor : this.oddColor),
                        transform: `rotate(${rotate}deg) skewY(${skewY}deg)`,
                        '-webkit-transform':`rotate(${rotate}deg) skewY(${skewY}deg)`,
                        '-moz-transform':`rotate(${rotate}deg) skewY(${skewY}deg)`
                    };
                    tmpPrizes.push(prize);
                }
                this.comData.prizes = tmpPrizes;
        	},
        	bindAlertOptions(){
                this.alertsOptions = this.cacheActParts.filter(part => part.type === 'hidden');
                if(this.alertsOptions.length === 0){
                    return;
                }
                let _this = this;
                this.$nextTick(() => {
                    for(let j = 0; j < this.prizeCount; j++){
                        let $dlContainer = _this.$refs['pAlters_'+ j][0].popperElm;
                        let $dlItems = $dlContainer.getElementsByTagName('li');
                        for (let i = 0; i < $dlItems.length; i++) {
                            // 当这个方法多次调用时，会绑定多个事件
                            $dlItems[i].addEventListener('mouseenter',function(){
                                let alertKey = _this.alertsOptions[i].value;
                                _this.$store.dispatch("setCurActBtnRes",alertKey);
                            });
                            $dlItems[i].addEventListener('mouseleave',function(){
                                _this.$store.dispatch("setCurActBtnRes",null);
                            });
                        }
                   }
                });
            },
        	addButton(){
                this.tempBtns.push('');
                this.$nextTick(()=>{
                    let btnItem = this.$refs['rmableBtn_'+ (this.tempBtns.length-1)][0];
                    this.comData.buttons.items.push(btnItem.getData());
                });
            },
        	onPrizeClick(prize){
        		this.curPrize = prize;
        	},
        	onPrizeChange(value){
        		this.prizeCount = parseInt(value);
        		this.initPrize();
        	},
        	handlePrizeSuccess(response){
        		this.curPrize.img = response.file.path;
        	},
        	handleExceed(){
                this.$message.warning(`抱歉，只能上传一张图片，如需修改，请删除后再操作`);
            },
            onWrapSuccess(response){
                this.comData.wrap.style['background-image'] = `url(${response.file.path})`;
                util.getImageWH(response.file.path).then(res => {
                    this.comData.wrap.style.height = this.comData.wrap.style.height || res.height;
                });
            },
            onWrapRemove(){
                this.comData.wrap.style['background-image'] = '';
                this.comData.wrap.style['background-repeat'] = '';
            },
            onWheelSuccess(response){
                this.comData.wheelBorder.style['background-image'] = `url(${response.file.path})`;
            },
            onWheelRemove(){
                this.comData.wheelBorder.style['background-image'] = '';
            }
        }
    }
</script>

<style lang='scss' scope>
	.turnWrapper{
		position: relative;
		&:hover .mask{
            display: flex;
        }
	}
	.turnForm{
		.el-form-item{
			margin-bottom:10px;
		}
	}
	.pcard{
		margin-top:5px;
		.el-upload {
		    border: 1px dashed #d9d9d9;
		    cursor: pointer;
		    width:100%;
		    position: relative;
		    overflow: hidden;
		    &:hover{
		    	border-color: #409EFF;
		    }
		}
		.pcard-icon {
		    font-size: 28px;
		    color: #8c939d;
		    height: 50px;
		    line-height: 50px;
		    text-align: center;
		}
		.img {
		  	background-repeat:no-repeat;
		  	background-size:contain;
		  	background-position:center;
		  	margin: 0 auto;
		    width: 100%;
		    height: 50px;
		    display: block;
		}
		input,textarea{
			border:1px dashed transparent;
			padding: 0 5px;
			&:hover{
				border-color: #409EFF;
			}
		}
		.el-input-group__prepend{
			border-color:transparent;
			background-color:transparent;
			padding:0 5px;
		}
		.el-input__validateIcon{
			display:none;
		}
	}

	.turnContainer{
	    position: relative;
	    background-size: contain;
	    background-repeat: no-repeat;
        background-position:top;
        min-height:350px;
	    .wheel{
	    	position: relative;
	    	margin: 0 auto;
	    	display: block;
		    width: 350px;
		    height: 350px;
            color: #ff0000;
	    }
	    .turnplate{
	    	display:block;
	    	position:relative;
	    	width:100%;
	    	height:100%;
	    }
	    .turborder{
	    	position:absolute;
	    	margin: auto;
	    	top:0; right:0; left:0; bottom:0;
	    	background-size:contain;
	    	background-position:center;
            background-repeat: no-repeat;
	    }
	    .core{
	    	position:absolute;
	    	width:290px;
	    	height:290px;
	    	border-radius:50%;
	    	background-size:100% 100%;
	    	background-repeat:no-repeat;
	    	top:0; right:0;left:0;bottom:0;
	    	margin:auto;
	    	overflow:hidden;
	    }
	    .core-box{
	    	width:100%;
	    	height:100%;
	    }
	    .prize{
	    	position:absolute;
	    	width:50%;height:50%;
	    	transform-origin:right bottom;
	    	-webkit-transform-origin:right bottom;
	    	-moz-transform-origin:right bottom;
	    	.prize-con{
	    		position:absolute;
	    		text-align:center;
	    		transform:skewY(-30deg) rotate(-30deg);
                -webkit-transform:skewY(-30deg) rotate(-30deg);
                -moz-transform:skewY(-30deg) rotate(-30deg);
	    		top:50px;
	    		left:50px;
	    		width:100px;
	    		height:90px;
            }
	    	pre{
	    		line-height:20px;
	    		height:20px;
	    		font-size:12px;
                font-weight:700;
                margin:10px;
	    	}
	    	.img{
	    		width:50px;
	    		height:50px;
	    		display:inline-block;
	    		background-repeat:no-repeat;
	    		background-position:center;
	    		background-size:contain;
	    	}
	    }
	    .prize.p_8{
	    	.prize-con{
	    		transform:skewY(-45deg) rotate(-22.5deg);
                -webkit-transform:skewY(-45deg) rotate(-22.5deg);
                -moz-transform:skewY(-45deg) rotate(-22.5deg);
	    		left:60px;
	    	}
	    }
	    .start{
	    	background-size:100%;
	    	background-repeat:no-repeat;
	    	position:absolute;
	    	top:50%;left:50%;
	    	transform:translate(-50%, -50%);
	    	-webkit-transform:translate(-50%, -50%);
            -moz-transform:translate(-50%, -50%);
	    	img{
	    		width:50px;
	    	}
	    }
	}
</style>