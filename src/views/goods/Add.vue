<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="el-breadcrumb">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="el-card">
      <el-alert title="警告提示的文案" type="warning" show-icon center :closable="false"></el-alert>

      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图品"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px" label-position="top">
        <el-tabs tab-position="left" v-model="activeIndex"
                 :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat"
                           :options="cateList"
                           :props="cateProps"
                           @change="handleChange" style="width: 40%"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTabData"
            :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item2" v-for="(item2,index) in item.attr_vals"
                             :key="index" border :checked="false"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
                    :action="uploadURL"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    list-type="picture"
                    :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
<!--            富文本编辑器-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

<!--    预览图片-->
    <el-dialog
            title="预览图片"
            :visible.sync="previewDialogVisible"
            width="50%" @close="previewClosed">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  //深拷贝
  import _ from 'lodash';

  export default {
    name: "Add",
    data(){
      return{
        cateList: [],
        activeIndex: '0',
        addForm:{
          goods_name: '',
          goods_cat: [],
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_introduce: '',
          pics:[],
          attrs: [],
        },
        addFormRules:{
          goods_name:[
            {required: true, message: '请输入商品名称', trigger: 'blur'}
          ],
          goods_price:[
            {required: true, message: '请输入商品价格', trigger: 'blur'}
          ],
          goods_number:[
            {required: true, message: '请输入商品数量', trigger: 'blur'}
          ],
          goods_weight:[
            {required: true, message: '请输入商品重量', trigger: 'blur'}
          ],
          goods_cat:[
            {required: true, message: '请选着分类', trigger: 'blur'}
          ],
        },
        cateProps:{
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: false,
        },
        manyTabData: [],
        onlyTabData: [],
        uploadURL: 'http://timemeetyou.com:8889/api/private/v1/upload',
        headerObj:{
          Authorization : window.sessionStorage.getItem('token'),
        },
        previewPath: '',
        previewDialogVisible : false,
      }
    },
    created() {
      this.getCateList();
    },
    computed:{
      isFullAddForm(){
        let afm = this.addForm;
        if(afm.goods_cat.length === 3 && afm.goods_name !== '' && afm.goods_number !== 0
        && afm.goods_price !== 0 && afm.goods_weight !== 0){
          return true;
        }
        return false;
      },
      cateId(){
        if(this.addForm.goods_cat.length == 3){
          return this.addForm.goods_cat[2];
        }
        return null;
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
              }
              // console.log(this.cateList);
            })
      },

      handleChange(){
        if(this.addForm.goods_cat.length !== 3){
          this.addForm.goods_cat = [];
        }
      },

      beforeTabLeave(activeName,oldActiveName){
        if(oldActiveName === '0' && !this.isFullAddForm){
          this.$message.error('基本信息请填写完整');
          return false;
        }
        return true;
      },

      tabClicked(){
        if(this.activeIndex === '1'){
          this.$http.get('categories/'+this.cateId + '/attributes',
              {params: {sel: 'many'}}).then(res=>{
                console.log(res);
                if(res.data.meta.status !== 200){
                  this.$message.error('获取数据失败');
                }
                else{
                  res.data.data.forEach(item=>{
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                  });
                  this.manyTabData = res.data.data;
                  console.log(this.manyTabData);
                }
          })
        }
        else if(this.activeIndex === '2'){
          this.$http.get('categories/'+this.cateId + '/attributes',
              {params: {sel: 'only'}}).then(res=>{
            console.log(res);
            if(res.data.meta.status !== 200){
              this.$message.error('获取数据失败');
            }
            else{
              this.onlyTabData = res.data.data;
            }
          })
        }
      },

      //预览图片
      handlePreview(file){
        //console.log(file);
        this.previewPath = file.response.data.url;
        this.previewDialogVisible = true;
      },
      //图片删除
      handleRemove(file){
        //console.log(file);
        const filePath = file.response.data.tem_path;
        const value = this.addForm.pics.findIndex(x => x.pic === filePath);
        this.addForm.pics.splice(value,1);
      },
      //接收图片上传成功后的返回值
      handleSuccess(response){
        // console.log(response);
        const picInfo = {pic: response.data.tmp_path};
        this.addForm.pics.push(picInfo);
        // console.log(this.addForm.pics);
      },
      //预览图片关闭
      previewClosed(){
        this.previewDialogVisible = false;
      },
      //添加商品
      add(){
        this.$refs.addFormRef.validate(valid =>{
          if(!valid){
            return this.$message.error('填写必要的商品内容');
          }
          //const a = this.addForm;
         // a.goods_cat = a.goods_cat.join(','); 不行，对象类型会同时变化
          // lodash
          const form =  _.cloneDeep(this.addForm);
          form.goods_cat = form.goods_cat.join(',');
          this.manyTabData.forEach(item=>{
            const newInfo = { attr_id: item.attr_id , attr_vals: item.attr_vals.join(' ') };
            this.addForm.attrs.push(newInfo);
          });
          this.onlyTabData.forEach(item=>{
            const newInfo = { attr_id: item.attr_id , attr_vals: item.attr_vals };
            this.addForm.attrs.push(newInfo);
          });
          form.attrs = this.addForm.attrs;
          //console.log(form);
          this.$http.post('goods', form)
              .then(res=>{
            console.log(res);
            if(res.data.meta.status !== 201){
              this.$message.error(res.data.meta.msg);
            }
            else{
              this.$message.success(res.data.meta.msg);
              this.$router.replace('/goods');
            }
          })
        })
      }
    }
  }
</script>

<style scoped>
  .el-steps{
   margin: 15px 0;
    font-size: 12px;
  }
  .el-checkbox{
    margin: 0 5px 0 0 !important;
  }
  .previewImg{
    width: 100%;
  }
  .btnAdd{
    margin-top: 20px;
    float: right;
  }
</style>