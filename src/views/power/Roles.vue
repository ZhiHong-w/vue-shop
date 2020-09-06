<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="el-breadcrumb">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
           <el-row v-for="(item1, index1) in scope.row.children"
                   :key="item1.id" :class="['bdbottom', index1 === 0 ? 'bdtop': '', 'vcenter']">
             <el-col :span="5">
               <el-tag style="margin: 7px" closable
                       @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
               <el-icon class="el-icon-caret-right"></el-icon>
             </el-col>
             <el-col :span="19">
               <el-row v-for="(item2,index2) in item1.children"
                       :key="item2.id" :class="[index2 !== 0 ? 'bdtop' : '', 'vcenter']">
                 <el-col :span="6">
                   <el-tag type="success" style="margin: 7px" closable
                           @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                   <el-icon class="el-icon-caret-right"></el-icon>
                 </el-col>
                 <el-col :span="18">
                   <el-tag type="warning" v-for="(item3, index3) in item2.children"
                           :key="item3.id" style="margin: 7px" closable
                           @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                 </el-col>
               </el-row>
             </el-col>
           </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit"
                       size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete"
                       size="mini" @click="removeRolesById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加角色-->
    <el-dialog
            title="添加角色"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRoles">确 定</el-button>
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
       <el-button @click="editDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配权限-->
    <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="setRightDialogClosed">
      <el-tree :data="rightsList" :props="treeProps" show-checkbox
               node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data(){
      return{
        rolesList: [],
        addDialogVisible: false,
        addForm:{
          roleName: '',
          roleDesc: '',
        },
        addFormRules: {
          roleName:[
            {required: true, message: '请输入角色名', trigger: 'blur' }
          ]
        },
        editDialogVisible: false,
        editForm:{
          roleName: '',
          roleDesc: '',
        },
        editFormRules:{
          roleName:[
            {required: true, message: '请输入角色名', trigger: 'blur' }
          ]
        },
        setRightDialogVisible: false,
        rightsList: [],
        treeProps:{
          label: 'authName',
          children: 'children'
        },
        defKeys: [],
        roleId: 0,
      }
    },
    created() {
      this.getRolesList();
    },
    methods:{
      //获取角色数据
      getRolesList(){
        this.$http.get('roles')
            .then(res=>{
              console.log(res);
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.rolesList = res.data.data;
                console.log(this.rolesList);
              }
            })
      },

      //添加角色
      addRoles(){
        this.$refs.addFormRef.validate(valid=>{
              if(!valid) return;
              else{
                this.$http.post('roles',this.addForm)
                    .then(res=>{
                      // console.log(res);
                      if(res.data.meta.status !== 201){
                        this.$message.error(res.data.meta.msg);
                      }
                      else{
                        this.$message.success(res.data.meta.msg);
                        this.addDialogVisible = false;
                        this.getRolesList();
                      }
                    })
              }
        })
      },
      //关闭添加角色对话框
      addDialogClosed(){
        this.$refs.addFormRef.resetFields();
      },
      //关闭编辑角色对话框
      editDialogClosed(){
        this.$refs.editFormRef.resetFields();
      },
      //展示编辑角色对话框
      showEditDialog(id){
        this.roleId = id;
        this.$http.get('roles/'+ id)
            .then(res=>{
              // console.log(res);
          if(res.data.meta.status !== 200){
            this.$message.error(res.data.meta.msg);
          }
          else{
            this.editForm = res.data.data;
            this.editDialogVisible = true;
          }
        })
      },
      //编辑角色
      editRoles(){
        this.$refs.editFormRef.validate(valid=>{
          if(!valid) return;
          this.$http.put('roles/'+this.roleId, this.editForm)
              .then(res=>{
                console.log(res);
                if(res.data.meta.status !== 200){
                  this.$message.error(res.data.meta.msg);
                }
                else{
                  this.$message.success(res.data.meta.msg);
                  this.getRolesList();
                  this.editDialogVisible = false;
                }
              })
        })
      },
      //删除角色
      removeRolesById(id){
        // $confirm返回值是Promise如果不写then就要用async + await;捕获错误的catch不能省略
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res=>{
          this.$http.delete('roles/' + id).then(res=>{
            // console.log(res);
            if(res.data.meta.status !== 200){
              this.$message.error(res.data.meta.msg);
            }
            else{
              this.$message.success(res.data.meta.msg);
              this.getRolesList();
            }
          })
        }).catch(err =>{
          this.$message('已经取消删除！');
        });
      },
      //移除权限
      removeRightById(role,rightId){
        this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res=>{
          this.$http.delete('roles/' + role.id + '/rights/' + rightId).then(res=>{
            // console.log(res);
            if(res.data.meta.status !== 200){
              this.$message.error(res.data.meta.msg);
            }
            else{
              this.$message.success(res.data.meta.msg);
              role.children = res.data.data;
            }
          })
        }).catch(err =>{
          this.$message('已经取消删除！');
        });
      },
      //展示获取的权限
      showSetRightDialog(role){
        this.$http.get('rights/tree')
            .then(res=>{
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                //角色id
                this.roleId = role.id;

                this.rightsList = res.data.data;
                //调用递归获取三级节点的id
                this.getLeafKeys(role,this.defKeys);

                this.setRightDialogVisible = true;
              }
            })
      },
      //递归获取角色所有的三级权限
      getLeafKeys(node, arr){
        if(!node.children){
          return arr.push(node.id);
        }
        node.children.forEach(item =>{
          return this.getLeafKeys(item,arr);
        })
      },
      //监听分配权限的对话框关闭事件
      setRightDialogClosed(){
        this.defKeys = [];
      },
      //点击为角色分配权限
      allotRights(){
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            this.$refs.treeRef.getHalfCheckedKeys()
        ];
        const idStr = keys.join(',');
        this.$http.post('roles/' + this.roleId + '/rights', {rids: idStr})
            .then(res=>{
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.$message.success(res.data.meta.msg);
                this.setRightDialogVisible = false;
                this.getRolesList();
              }
            })
      }
    }
  }
</script>

<style scoped>
  .bdtop{
    border-top: 1px solid #eeeeee;
  }
  .bdbottom{
    border-bottom: 1px solid #eeeeee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>