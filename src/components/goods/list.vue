<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table表格区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="80px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="200px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeByID(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //请求参数
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      //总数
      total: 0,
      //商品列表
      goodsList: []
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //进入页面，获取数据
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据");
      }
      this.$message.success("获取商品列表成功");
      this.total = res.data.total;
      this.goodsList = res.data.goods;
    },
    // 页码每页显示个数发生改变时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //当前页发生变化时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    //点击删除，通过iD删除对应数据
   async removeByID(id){
     const resultConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error=>error)
      if(resultConfirm !== "confirm"){
       return  this.$message.info("已取消删除数据")
      }
      const {data: res} = await this.$http.delete(`goods/${id}`)

      if(res.meta.status !== 200) {
        this.$message.error("删除商品数据失败")
      }
      this.$message.success("删除成功")
      this.getGoodsList()
    },
    //点击按钮，跳转到添加商品页面
    goAddPage() {
      this.$router.push("/goods/add")
    }
  }
};
</script>
<style lang="scss" scoped>
.el-col {
  margin: 0 10px;
}
</style>