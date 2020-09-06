<template>
  <div class="login_container">
    <div class="login_box">
      <!--  头像区域    -->
      <div class="img_box">
        <img src="../../assets/logo.png" alt="">
      </div>
      <!--  登陆区域  -->
      <el-form ref="loginFormRef"
               :model="loginForm"
               :rules="loginFormRules"
               label-width="0px"
               class="login_form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password"  prefix-icon="iconfont icon-password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data(){
      return{
        loginForm:{
          username: '',
          password: '',
        },
        loginFormRules:{
          username: [
            { required: true, message: '请输入登录名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
          ],
        }
      }
    },
    methods:{
      resetLoginForm(){
        this.$refs.loginFormRef.resetFields();
      },
      login(){
        this.$refs.loginFormRef.validate(valid=>{
          if(!valid) return;
          this.$http.post('login',this.loginForm)
              .then(res=>{
                // console.log(res);
            if(res.data.meta.status !==200){
              this.resetLoginForm();
              this.$message.error("登录失败！");
            }
            else{
              this.$message.success("登录成功！");
              window.sessionStorage.setItem('token',res.data.data.token);
              this.$router.replace('/home');
            }
          })
        })
      }
    }
  }
</script>

<style scoped>
  .login_container{
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #ffffff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
    -webkit-transform: translate(-50%,-50%);
    -moz-transform: translate(-50%,-50%);
    -o-transform: translate(-50%,-50%);
  }
  .img_box{
    width: 130px;
    height: 130px;
    border: 1px solid #eeeeee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #dddddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    -ms-transform: translate(-50%,-50%);
    -webkit-transform: translate(-50%,-50%);
    -moz-transform: translate(-50%,-50%);
    -o-transform: translate(-50%,-50%);
    background-color: #ffffff;
  }
  .img_box img{
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eeeeee;
  }

  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns{
    display: flex;
    justify-content: flex-end;
  }
</style>