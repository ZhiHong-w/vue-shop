<template>
  <div>

    <el-breadcrumb separator-class="el-icon-arrow-right" class="el-breadcrumb">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="el-card">

      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" border  :stripe="true" class="el-table">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top-end" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
              class="el-pagination"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>

    </el-card>

<!--添加用户-->
    <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
<!--修改用户-->
    <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser">确 定</el-button>
  </span>
    </el-dialog>
<!--分配角色-->
    <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
                    v-for="item in rolesList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Users",
    data(){
      var checkEmail = (rule, value, callback)=> {
        const regEmail  = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if(regEmail.test(value)){
          return callback();
        }
        else{
          return  callback(new Error('请输入合法的邮箱！！！'))
        }
      };

      var checkMobile = (rule, value, callback)=> {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
        if(regMobile.test(value)){
          return callback();
        }
        else{
          return  callback(new Error('请输入合法的手机号码！！！'))
        }
      };

      return{
        queryInfo:{
          query: '',
          pagenum: 1,
          pagesize: 2,
        },
        userList: [],
        total:0,
        addDialogVisible : false,
        addForm:{
          username: '',
          password: '',
          email: '',
          mobile: '',
        },
        addFormRules:{
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur'}
          ]
        },
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur'}
          ]
        },
        setRoleDialogVisible: false,
        userInfo: '',
        rolesList: [],
        selectRoleId: ''
      }
    },
    created() {
      this.getUserList();
    },
    methods:{
      getUserList(){
        this.$http.get('users',{params: this.queryInfo})
            .then(res=>{
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.userList = res.data.data.users;
                this.total = res.data.data.total;
              }
              //console.log(res);
            })
      },

      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize;
        this.getUserList();

      },
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage;
        this.getUserList();
      },

      userStateChange(userInfo){
        //'users/${userinfo.id}/state/${userinfo.mg_state}'
        this.$http.put('users/'+userInfo.id+'/state/'+userInfo.mg_state)
            .then(res=>{
              console.log(res);
              if(res.data.meta.status !== 200){
                userInfo.mg_state = !userInfo.mg_state;
                this.$message.error('更新用户状态失败！');
              }
              else{
                this.$message.success('更新用户状态成功！');
              }
            })
      },

      //对话框关闭事件
      addDialogClosed(){
        this.$refs.addFormRef.resetFields();
      },

      //添加用户
      addUser(){
        this.$refs.addFormRef.validate(valid=>{
          if(!valid) return;
          else{
            this.$http.post('users',this.addForm)
                .then(res=>{
                  // console.log(res);
                  if(res.data.meta.status !==201){
                    this.$refs.addFormRef.resetFields();
                    this.$message.error(res.data.meta.msg);
                  }
                  else{
                    this.$message.success(res.data.meta.msg);
                    this.addDialogVisible = false;
                    this.getUserList();
                  }
                })
          }
        })
      },

      //修改信息
      showEditDialog(id){
        this.$http.get('users/'+id)
            .then(res=>{
              console.log(res);
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.editForm = res.data.data;
                this.editDialogVisible = true;
              }
            });
      },
      editDialogClosed(){
        this.$refs.editFormRef.resetFields();
      },
      editUser(){
        this.$refs.editFormRef.validate(valid=>{
          if(!valid) return;
          this.$http.put('users/'+ this.editForm.id , this.editForm)
              .then(res=>{
                // console.log(res);
                if(res.data.meta.status !== 200){
                  this.$message.error(res.data.meta.msg);
                }
                else{
                  this.$message.success(res.data.meta.msg);
                  this.getUserList();
                  this.editDialogVisible = false;
                }
              });
        })
      },

      //删除用户
      async removeUserById(id){
        // $confirm返回值是Promise如果不写then就要用async + await;捕获错误的catch不能省略
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err =>{
          return err;
        });

        if(confirmResult !== 'confirm'){
          this.$message('已经取消删除！');
        }
        else{
          this.$http.delete('users/' + id).then(res=>{
            // console.log(res);
            if(res.data.meta.status !== 200){
              this.$message.error(res.data.meta.msg);
            }
            else{
              this.$message.success(res.data.meta.msg);
              this.getUserList();
            }
          })
        }
      },

      setRole(userInfo){
        this.userInfo = userInfo;
        this.$http.get('roles')
            .then(res=>{
              console.log(res);
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.rolesList = res.data.data;
                this.setRoleDialogVisible = true;
              }
            })
      },
      saveRoleInfo(){
        if(!this.selectRoleId){
          this.$message.error('请选择角色');
        }
        this.$http.put('users/' + this.userInfo.id + 'role', {rid: this.selectRoleId})
            .then( res=>{
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.$message.success(res.data.meta.msg);
                this.getUserList();
                this.setRoleDialogVisible = false;
              }
            })
      },
      setRoleDialogClosed(){
        this.selectRoleId = '';
        this.userInfo = '';
      }

    }
  }
</script>

<style scoped>

</style>