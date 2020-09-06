<template>
  <el-container class="home_container">

    <el-header class="home_header">
      <div class="header_title">
        <img src="../../assets/timg.jpg" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <el-container>

      <el-aside :width="isCollapse ? '64px' : '200px'" class="home_aside">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu class="aside_menu"
                 background-color="#333744"
                 text-color="#fff"
                 active-text-color="#409Bff"
                 unique-opened
                 :collapse="isCollapse"
                 :collapse-transition="false"
                 :router="true" :default-active="activePath">
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="'/' + subItem.path"
                          v-for="subItem in item.children"
                          :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>

      </el-aside>

      <el-main class="home_main">
        <router-view></router-view>
      </el-main>

    </el-container>

  </el-container>
</template>

<script>
  export default {
    name: "Home",
    data(){
      return{
        menuList: [],
        iconsObj:{
          125: 'el-icon-s-custom',
          103: 'el-icon-lock',
          101: 'el-icon-s-goods',
          102: 'el-icon-shopping-bag-1',
          145: 'el-icon-data-analysis'
        },
        isCollapse : false,
        activePath: '',
      }
    },
    methods:{
      logout(){
        window.sessionStorage.clear();
        this.$router.replace('/login');
      },

      getMenuList(){
        this.$http.get('menus')
            .then(res=>{
              // console.log(res);
              if(res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg);
              this.menuList = res.data.data;
        })
      },

      toggleCollapse(){
        this.isCollapse = !this.isCollapse;
      },

      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath);
        this.activePath = activePath;
      }
    },
    created() {
      this.getMenuList();
      this.activePath = window.sessionStorage.getItem('activePath');
    }
  }
</script>

<style scoped>
  .home_container{
    height: 100%;
  }

  .home_header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0px;
    align-items: center;
    color: #ffffff;
    font-size: 20px;
  }
  .header_title{
    display: flex;
    align-items: center;
  }
  .header_title img{
    width: 70px;
    height: 50px;
  }
  .header_title span{
    margin-left: 15px;
  }

  .home_aside{
    background-color: #333744;
  }
  .toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #ffffff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .aside_menu{
    border-right: none;
  }

  .home_main{
    background-color: #EAEDF1;
  }
</style>