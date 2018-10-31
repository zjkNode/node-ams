#此文件是关于活动组件编写要求：
更新时间： 2017-11-08 19:34

    1. 创建新组件都需要在 本文件夹内 的index.js中做引用，命名规则最好是：元素名称+s， 如alerts，forms；
    2. 每个组件都需要声明 name,desc属性，来命名组件名称；若此组件为隐藏组件，类似于弹框组件和分享组件，需要新增一个type:'hidden'的属性，另外隐藏与非隐藏组件的排版样式稍微有点不同，可拿alerts组件与buttons组件做对比；
    3. 每个带有图片上传的组件都需要声明 props: ['uploadData'] 的属性，因为这里从父组件create.vue中传入一个公共数据的对象（图片上传时需传给后台的数据 timeId）；
    4. 组件数据交互
        4.1 每个组件都需要return comData 对象里的数据，数据格式：

            comData:{
                image_path:[],//用于存取图片路径，非必须，但需注意与activity_tpl工程中各组件数据渲染取值保持一致
                button:{ // 写法作为参照，可选
                    usages:'download',
                    style:{
                        width:'auto'
                    }
                }
            }
        4.2 在methods方法中需要做如下声明：

            getData(){//create.vue会以此方法来调取组件的数据, 必须！
                return this.comData;
            }
        4.3 在活动编辑时，需要从父级组件向每个parts组件传入image_path等数据，因此，每个parts 需要引入props: ['originData'] （结合第3条，props: ['uploadData','originData'] ）；同时在mounted时，做出如下判断：

            if(this.originData){
                this.comData=this.originData;
            };
            
            如此，数据将会传入。
        4.4 活动编辑页面中，有时候父组件会通过 4.3 的方式传入已经上传的数据，如果包括已经上传的图片数据，而且我们想将他展示出来，就需要作出如下操作：
            4.4.1  在elementUi 调用的 <el-upload></el-upload>组件中，写 :file-list="originFileList"
            4.4.2  在vue mounted时，写：
                    $.each(this.comData.image_path,function(i,v){//已上传文件展示
                        let fileName = v.split('/').pop();
                        let fileList = { name:fileName, url: v};
                        _this.originFileList.push(fileList);
                    });
                    此操作是为了将数据改写成如下的写法：
                        originFileList: [{name: '', url: ''}]
            4.4.3  最后我们还需要实时操作数据，这个时候需要在文件remove时做判断，当前文件是否是从父级页面带过来的，即是否有response数据
                   （若父级带过来，没有response，只需要拿文件的url； 重新上传文件的有reponse，那就需要从file.response中拿数据）。例如：
                    this.comData.image_path = this.comData.image_path.filter(function(item){
                        if(file.response){
                            return item != file.response.file.path;
                        }else{
                            return item != file.url;
                        }
                    });
            4.4.4  具体写法可参照image组件。
        5. 重复引用组件
        若出现重复引用两个相同的组件，同时需要对两个组件分别修改css，那么就需要给对应的组件中加入ref属性，然后通过这个ref取元素设置样式，详见buttons组件。（若无css的修改，忽略本条）

