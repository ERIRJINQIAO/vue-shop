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
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-check" v-if="scope.row.cat_deleted==false" style="color: lightgreen"></i>
          <i class="el-icon-close" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 页码区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的dialog -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form
        :model="addCateRuleForm"
        :rules="addCateRules"
        ref="addCateRuleRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateRuleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称：">
          <!-- options用来指定数据源 -->
          <!-- model双向绑定存放级联选择的id -->
          <!-- props用来配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //商品分类的数据列表，，默认为空
      cateList: [],
      //查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //总数据条数，默认为0
      total: 0,
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          //表示定义当前的模板列
          type: "template",
          //表示当前这一列所使用的模板名称
          template: "isok"
        },
        {
          label: "排序",
          //表示定义当前的模板列
          type: "template",
          //表示当前这一列所使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          //表示定义当前的模板列
          type: "template",
          //表示当前这一列所使用的模板名称
          template: "opt"
        }
      ],
      // 控制添加分类dialog的显示与隐藏
      addCateDialogVisible: false,
      //渲染添加分类对话框表单的数据
      addCateRuleForm: {
        //分类名称
        cat_name: "",
        //父级分类的ID,不能为空，默认为0
        cat_pid: 0,
        //分类层级,不能为空，默认是1级分类
        cat_level: 1
      },
      //添加分类对话框表单的验证规则
      addCateRules: {
        cat_name: [
          {
            required: true,
            message: "请您输入需要添加的分类名称",
            trigger: "blur"
          }
        ]
      },
      //存放父级分类的数据列表
      parentCateList: [],
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: "true"
      },
      // 选中的父级分类的ID数组
      selectedKeys: []
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类列表失败");
      }
      console.log(res);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newNumber) {
      this.querInfo.pagenum = newNumber;
      this.getCateList();
    },
    //点击添加分类，先获取数据，在显示对话框
    showAddCate() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //发送请求，获取父级分类的列表数据
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      this.parentCateList = res.data;
    },
    //选择项发生变化时触发这个函数
    parentCateChanged() {
      //判断如果selectedKeys的长度大于0，说明选中了父级分类，则重新赋值分类对话框表单的数据，如果等于0，则说明没有选中父级分类
      console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        //父级分类的ID
        this.addCateRuleForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        //为当前分类的等级赋值
        this.addCateRuleForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        //父级分类的ID
        this.addCateRuleForm.cat_pid = 0;
        //为当前分类的等级赋值
        this.addCateRuleForm.cat_level = 0;
      }
    },
    //点击确定，添加分类信息。
    async addCate() {
      this.$refs.addCateRuleRef.validate( valid => {
        if(!valid) return this.$message.error("请输入合法的分类名称")
      })
      const {data: res} = await this.$http.post("categories",this.addCateRuleForm)
      if(res.meta.status!==201){
        return this.$message.error("添加分类失败")
      }
      this.$message.success("添加分类成功")
      this.addCateDialogVisible = false
      this.getCateList()
    },
    //监听对话框的关闭事件，重置表单
    addCateDialogClosed() {
      this.$refs.addCateRuleRef.resetFields()
      this.selectedKeys = []
      this.addCateRuleForm.cat_level = 0
      this.addCateRuleForm.cat_pid = 0
    }
  }
};
</script>
<style lang="scss" scoped>
.treeTable {
  margin-top: 15px;
}
</style>