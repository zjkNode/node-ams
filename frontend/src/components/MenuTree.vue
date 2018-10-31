<template>
    <div>
    <template v-for="menu in menuData" v-if="curUser.isAdmin || curUser.mids.includes(menu.id)">
        <el-submenu v-if="menu.children" :index="menu.alink" :key="menu.id">
            <template slot="title">
                <i class="el-icon-menu"></i>
                <el-tooltip class="item" effect="light" :open-delay='1000' :content="menu.name" placement="right-start">
                    <el-button type="text">{{menu.name}}</el-button>
                </el-tooltip>
            </template>
            <MenuTree :menuData="menu.children"></MenuTree>
        </el-submenu>
        <el-menu-item v-else :route="menu.alink" :index="menu.alink" :key="menu.id">
            <i class="el-icon-menu"></i>
            <el-tooltip class="item" effect="light" :open-delay='1000' :content="menu.name" placement="right-start">
                <el-button type="text">{{menu.name}}</el-button>
            </el-tooltip>
        </el-menu-item>
    </template>
    </div>
</template>

<script>
  export default {
    props: ['menuData'],
    name: 'MenuTree'
  }
</script>
<style scope>
.el-menu-item, .el-submenu__title{
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.el-menu .el-button{
    color: inherit;
}
</style>