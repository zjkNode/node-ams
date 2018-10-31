<template>
    <router-view/>
</template>

<style lang="scss">
$fontLight: #d5d5d5;

html,body{
    height: 100%;
    width: 100%;
    background: #eff0f4;
    margin:0;
    padding:0;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
ul, li{
	padding:0;
	margin:0;
	list-style:none;
}

::placeholder,
::-webkit-input-placeholder,
:-moz-placeholder,
::-moz-placeholder,
:-ms-input-placeholder {color:$fontLight; font-weight: normal; font-size: 14px;}

.flex{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;
-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;}

.flex-center-v {display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;display: flex; flex-direction: column; 
-webkit-box-pack:justify;-ms-flex-pack:justify;-webkit-justify-content:center;justify-content:center;justify-content: center; }

.overflow-ellipsis > div{ white-space: nowrap !important; }
.flat-tree > div{ white-space:pre !important; }
.el-table thead th{ background: #f5f7fa; padding:5px 0;}
.el-table tbody td{ padding:5px 0; }
.el-form-item{ margin-bottom:20px; }
.mask {
    height: 100%;
    width:100%;
    background: rgba(0, 0, 0, 0.6);
    position: absolute;
    top:0;
    left:0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    display: none;
    
    .modify{
        font-size: 16px;
        line-height:20px;
        color:#fff;
        position:absolute;
        background:rgba(0,0,0,0.7);
        padding:3px 10px;
        right:0;
        top:0;
        i+i{
            margin-left:10px;
        }
    }
}

::-webkit-scrollbar{  
    position: absolute;
    width:4px;  
    right: -1px;
    height:4px;
}  
::-webkit-scrollbar-track{  
    background: #f6f6f6;  
    border-radius:2px;  
}  
::-webkit-scrollbar-thumb{  
    background: #aaa;  
    border-radius:2px; 
}  
::-webkit-scrollbar-thumb:hover{  
    background: #747474;  
}  
::-webkit-scrollbar-corner{  
    background: #f6f6f6;  
}
</style>
