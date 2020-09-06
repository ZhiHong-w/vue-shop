<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="el-breadcrumb" >
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="el-card">
      <el-row style="margin-bottom: 15px">
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table :data="cateList" :columns="columns"
                  :selection-type="false" :expand-type="false"
                  :show-index="true" border>
<!--        是否有效-->
        <template slot="isok" scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
<!--        排序-->
        <template slot="order" scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
<!--        操作-->
        <template slot="opt" scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>

<!--    添加分类-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible"
               width="50%" @close="addCateDialogClosed">
      <el-form ref="addCateFormRef" :model="addCateForm" label-width="100px" :rules="addCateFormRules">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
                  v-model="selectKeys"
                  :options="parentCateList"
                  :props="cascaderProps"
                  @change="parentCateChange" style="width: 100%"
                  clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
<!--    编辑分类-->
    <el-dialog
            title="修改分类"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
       <el-button @click="editDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Category",
    data(){
      return{
        cateList: [],
        queryInfo:{
          type: 3,
          pagenum: 1,
          pagesize: 5,
        },
        total: 0,
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            type: 'template',
            template: 'isok',
          },
          {
            label: '排序',
            type: 'template',
            template: 'order',
          },
          {
            label: '操作',
            width: '200px',
            type: 'template',
            template: 'opt',
          }
        ],
        addCateDialogVisible: false,
        addCateForm: {
          cat_name: '',
          cat_pid: 0,
          cat_level: 0,
        },
        addCateFormRules:{
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ],
        },
        parentCateList: [],
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true,
        },
        selectKeys: [],

        editDialogVisible: false,
        editForm:{},
        editFormRules:{
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ],
        }
      }
    },
    created() {
      this.getCateList();
    },
    methods:{
      getCateList(){
        this.$http.get('categories',{ params: this.queryInfo})
            .then(res=>{
              //console.log(res);
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                 this.cateList = res.data.data.result;
                 this.total = res.data.data.total;
              }
            })
      },
      //分页的实现
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize;
        this.getCateList();
      },
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage;
        this.getCateList();
      },

      showAddCateDialog(){
        this.getParentCateList();
        this.addCateDialogVisible = true;
      },
      getParentCateList(){
        this.$http.get('categories',{params:{type: 2}})
            .then(res=>{
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                console.log(res);
                this.parentCateList = res.data.data;
              }
            })
      },
      parentCateChange(){
        if(this.selectKeys.length > 0){
          this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length-1];
          this.addCateForm.cat_level = this.selectKeys.length;
        }
        else{
          this.addCateForm.cat_pid = 0;
          this.addCateForm.cat_level = 0;
        }
      },
      addCate(){
        this.$refs.addCateFormRef.validate(async valid=>{
          if(!valid) return;
          const {data: res} = await this.$http.post('categories',this.addCateForm);
          //console.log(res);
          if(res.meta.status !== 201){
            this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getCateList();
          this.addCateDialogVisible = false;
        })
      },
      addCateDialogClosed(){
        this.addCateForm.cat_level = 0;
        this.addCateForm.cat_pid = 0;
        this.$refs.addCateFormRef.resetFields();
        this.selectKeys = [];
      },

      showEditDialog(id){
        this.$http.get('categories/'+ id)
            .then(res=>{
          //console.log(res);
          if(res.data.meta.status !==200){
            this.$message.error(res.data.meta.msg);
          }
          else{
            this.editForm = res.data.data;
            this.editDialogVisible = true;
          }
        })
      },
      editCate(){
        this.$refs.editFormRef.validate(valid =>{
          if(!valid) return;
          this.$http.put('categories/'+this.editForm.cat_id, {cat_name: this.editForm.cat_name})
              .then(res=>{
                console.log(res);
                if(res.data.meta.status !==200){
                  this.$message.error(res.data.meta.msg);
                }
                else{
                  this.$message.success(res.data.meta.msg);
                  this.editDialogVisible = false;
                  this.getCateList();
                }
              })
        })
      },
      editDialogClosed(){
        this.editForm = {};
        this.$refs.editFormRef.resetFields();
      },

      //删除分类
      removeCateById(id){
        // $confirm返回值是Promise如果不写then就要用async + await;捕获错误的catch不能省略
        this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res=>{
          this.$http.delete('categories/' + id).then(res=>{
             console.log(res);
            if(res.data.meta.status !== 200){
              this.$message.error(res.data.meta.msg);
            }
            else{
              this.$message.success(res.data.meta.msg);
              this.getCateList();
            }
          })
        }).catch(err =>{
          this.$message('已经取消删除！');
        });
      },
    }
  }
</script>

<style scoped>

</style>