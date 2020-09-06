<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right" class="el-breadcrumb">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="el-card">

      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table class="el-table" :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" ></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="80px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="创建时间" width="180px">
          <template v-slot="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"></el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
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
              :total="total" background>
      </el-pagination>

    </el-card>
  </div>
</template>

<script>
  export default {
    name: "List",
    data(){
      return{
        queryInfo:{
          query: '',
          pagenum: 1,
          pagesize: 10,
        },
        goodsList: [],
        total: 0,
      }
    },
    created() {
      this.getGoodsList();
    },
    methods:{
      getGoodsList(){
        this.$http.get('goods',{params:this.queryInfo})
            .then(res=>{
              // console.log(res);
              if(res.data.meta.status !== 200){
                this.$message.error(res.data.meta.msg);
              }
              else{
                this.goodsList = res.data.data.goods;
                this.total = res.data.data.total;
              }
            })
      },

      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize;
        this.getGoodsList();
      },
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage;
        this.getGoodsList();
      },

      async removeGoodsById(id){
        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
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
          this.$http.delete('goods/' + id).then(res=>{
            // console.log(res);
            if(res.data.meta.status !== 200){
              this.$message.error(res.data.meta.msg);
            }
            else{
              this.$message.success(res.data.meta.msg);
              this.getGoodsList();
            }
          })
        }
      },

      goAddpage(){
        this.$router.push('goods/add');
      }
    }
  }
</script>

<style scoped>

</style>