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

.mainContent .pagbar{ text-align:center; margin:10px 0;}

</style>
