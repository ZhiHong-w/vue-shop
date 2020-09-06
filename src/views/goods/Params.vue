<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="el-breadcrumb">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="el-card">
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！"
                type="warning" :closable="false"></el-alert>

      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectKeys"
                       :options="cateList"
                       :props="cascaderProps"
                       @change="handleChange" style="width: 40%"></el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="manyTabData" border stripe>
            <!--            展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index"
                        closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>

            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit"
                           size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete"
                           size="mini" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTabData" border stripe>
<!--            展开行-->
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals"
                        :key="index"
                        closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>

            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit"
                           size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete"
                           size="mini" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
<!--添加参数-->
    <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed">
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
<!--修改参数-->
    <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="100px"
               class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Params",
    data(){
      return{
        cateList: [],
        selectKeys: [],
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: false,
        },
        activeName: 'many',
        manyTabData: [],
        onlyTabData: [],

        addDialogVisible: false,
        addForm:{
          attr_name: ''
        },
        addFormRules:{
          attr_name: [
              {required: true, message: '请输入相关名称', trigger: 'blur' }
          ]
        },

        editDialogVisible: false,
        editForm:{},
        editFormRules:{
          attr_name: [
            {required: true, message: '请输入相关名称', trigger: 'blur' }
          ]
        },

        inputVisible: false,
        inputValue: ''
      }
    },
    created() {
      this.getCateList();
    },
    computed:{
      isBtnDisabled(){
        if(this.selectKeys.length !== 3){
          return true;
        }
        return false;
      },
      cateId(){
        if(this.selectKeys.length === 3){
          return this.selectKeys[2];
        }
        return  null;
      },
      titleText(){
        if(this.activeName === 'many'){
          return '动态参数';
        }
        else{
          return  '静态属性';
        }
      }
    },
    methods:{
      getCateList(){
        this.$http.get('categories')
            .then(res=>{
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.cateList = res.data.data;
                //console.log(res);
              }
            })
      },

      getParamsData(){
        if(this.selectKeys.length !== 3){
          this.selectKeys = [];
          this.manyTabData = [];
          this.onlyTabData = [];
          return;
        }
        this.$http.get('categories/' + this.cateId + '/attributes', {params: {sel: this.activeName}})
            .then(res=>{
              console.log(res);
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                res.data.data.forEach(item=>{
                  item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                  item.inputVisible = false;
                  item.inputValue = '';
                });
                if(this.activeName === 'many'){
                  this.manyTabData = res.data.data;
                }else{
                  this.onlyTabData = res.data.data;
                }
              }
            })
      },

      handleChange(){
        this.getParamsData();
      },
      handleTabClick(){
        this.getParamsData();
      },

      addDialogClosed(){
        this.$refs.addFormRef.resetFields();
      },
      addParams(){
        this.$refs.addFormRef.validate(valid=>{
          if(!valid) return;
          this.$http.post('categories/' + this.cateId + '/attributes', {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }).then(res=>{
            if(res.data.meta.status !== 201){
              this.$message.error(res.data.meta.msg);
            }else{
              this.$message.success(res.data.meta.msg);
              this.addDialogVisible = false;
              this.getParamsData();
            }
          })
        })
      },

      showEditDialog(id){
        this.$http.get('categories/' + this.cateId + '/attributes/' + id,{
          params:{attr_sel: this.titleText}
        }).then(res=>{
          //console.log(res);
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }else{
                this.editForm = res.data.data;
                this.editDialogVisible = true;
              }
            })
      },
      editParams(){
        this.$refs.editFormRef.validate(valid=>{
          if(!valid) return;
          this.$http.put('categories/' + this.cateId + '/attributes/' + this.editForm.attr_id,{
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }).then(res=>{
            if(res.data.meta.status !== 200){
              this.$message.error(res.data.meta.msg);
            }else{
              this.$message.success(res.data.meta.msg);
              this.editDialogVisible = false;
              this.getParamsData();
            }
          })
        })
      },
      editDialogClosed(){
        this.editForm = {};
        this.$refs.editFormRef.resetFields();
      },

      //删除参数
      removeParamsById(id){
        // $confirm返回值是Promise如果不写then就要用async + await;捕获错误的catch不能省略
        this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res=>{
          this.$http.delete('categories/' + this.cateId + '/attributes/' + id)
              .then(res=>{
             console.log(res);
            if(res.data.meta.status !== 200){
              this.$message.error(res.data.meta.msg);
            }
            else{
              this.$message.success(res.data.meta.msg);
              this.getParamsData();
            }
          })
        }).catch(err =>{
          this.$message('已经取消删除！');
        });
      },

      saveAttrVals(row){
        this.$http.put('categories/' + this.cateId + '/attributes/' + row.attr_id,{
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }).then(res=>{
          if(res.data.meta.status !== 200){
            this.$message.error(res.data.meta.msg);
          }else{
            this.$message.success(res.data.meta.msg);
          }
        })
      },

      //+New Tag
      handleInputConfirm(row){
        if(row.inputValue.trim().length === 0){
          row.inputValue = '';
          row.inputVisible = false;
          return ;
        }
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = '';
        row.inputVisible = false;
        this.saveAttrVals(row);
      },
      showInput(row){
        row.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },

      //delete Tag
      handleClose(index,row){
        row.attr_vals.splice(index,1);
        this.saveAttrVals(row);
      }
    },
  }
</script>

<style scoped>
  .cat_opt{
    margin: 15px 0px;
  }
  .el-tag{
    margin: 10px;
  }
  .input-new-tag{
    width: 120px;
  }
</style>