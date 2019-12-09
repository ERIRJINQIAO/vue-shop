<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closeable="false" show-icon></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>

          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnAbled"
            size="mini"
            @click="addCateDialog = true"
          >添加参数</el-button>
          <!-- 动态属性表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEdit(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeAttById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnAbled"
            size="mini"
            @click="addCateDialog = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEdit(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeAttById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数和属性的dialog -->
    <el-dialog
      :title="'添加' + addDialogName"
      :visible.sync="addCateDialog"
      width="50%"
      @close="addAttClosed"
    >
      <el-form
        :model="addAttRuleForm"
        :rules="addAttRules"
        ref="addAttRuleForm"
        label-width="100px"
      >
        <el-form-item :label="addDialogName" prop="attr_name">
          <el-input v-model="addAttRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数和属性的dialog -->
    <el-dialog
      :title="'修改' + addDialogName"
      :visible.sync="editCateDialog"
      width="50%"
      @close="editAttClosed"
    >
      <el-form
        :model="editAttRuleForm"
        :rules="editAttRules"
        ref="editAttRuleForm"
        label-width="100px"
      >
        <el-form-item :label="addDialogName" prop="attr_name">
          <el-input v-model="editAttRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //存放商品列表的数据
      cateList: [],
      //级联选择框当前选中的id
      selectCateKeys: [],
      cateProps: {
        expandTrigger: "click",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      //tabs页签双向绑定的,默认显示第一条
      activeName: "many",
      //动态参数数据保存
      manyTableData: [],
      //静态
      onlyTableData: [],
      //控制添加属性的对话框显示与隐藏
      addCateDialog: false,
      //存放添加属性对话框中form表单的
      addAttRuleForm: {
        attr_name: ""
      },
      //添加属性对话框中的验证规则
      addAttRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      //控制修改属性对话框的显示与隐藏
      editCateDialog: false,
      //修改属性对话框的数据
      editAttRuleForm: {},
      //修改属性对话框中的表单验证
      editAttRules: {
        attr_name: {
          required: true,
          message: "修改的属性名称不能为空",
          trigger: "blur"
        }
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品列表数据
    async getCateList() {
      //根据所选分类的ID 和当前所处的面板获取对应的参数
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.cateList = res.data;
    },
    // 级联选择框内发生改变时触发
    handleChange() {
      this.getParamsList();
    },
    //页签发生改变时触发
    handleTabsClick() {
      this.getParamsList();
    },
    //获取参数列表的数据
    async getParamsList() {
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateID}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数失败");
      }
      console.log(res.data);
      //通过遍历将数据中的字符转转换为数组,用三元表达先排除自定义添加的时候，空字符串会被改成一个数组，这样会被渲染到页面中的el-tag
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //同时设立一个独自的用来切换input还是tag的属性
        item.inputVisible = false;
        item.inputValue = ""; //存放当前行input中的值
      });
      if (this.activeName == "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    //监听添加属性对话框的关闭事件，重置表单
    addAttClosed() {
      this.$refs.addAttRuleForm.resetFields();
    },
    // 点击确定，添加属性
    addParams() {
      this.$refs.addAttRuleForm.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateID}/attributes`,
          {
            attr_name: this.addAttRuleForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败");
        }
        this.addCateDialog = false;
        this.getParamsList();
      });
    },
    //点击编辑，展示修改属性的对话框
    async showEdit(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateID}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        this.$message.error("获取参数列表失败");
      }
      this.editAttRuleForm = res.data;
      this.editCateDialog = true;
    },
    //监听修改对话框的关闭事件重置表单
    editAttClosed() {
      this.$refs.editAttRuleForm.resetFields();
    },
    //点击确定，修改属性
    editParams() {
      this.$refs.editAttRuleForm.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateID}/attributes/${this.editAttRuleForm.attr_id}`,
          {
            attr_name: this.editAttRuleForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败");
        }
        this.getParamsList();
        this.editCateDialog = false;
        this.$message.success("修改参数成功");
      });
    },
    //根据ID删除参数
    async removeAttById(attr_id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除参数操作");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateID}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败");
      }
      this.$message.success("删除参数成功");
      this.getParamsList();
    },
    //键盘回车键和鼠标失去焦点的触发事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length == 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttr(row);
    },
    //编辑提交修改参数选项的封装函数
    async saveAttr(row) {
      //发送请求保存到数据库
      const { data: res } = await this.$http.put(
        `categories/${this.cateID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) {
        this.$message.error("修改参数选项失败");
      }
      this.$message.success("修改参数选项成功");
    },
    //监听el-tag的关闭事件
    handleClosed(i, row) {
      row.attr_vals.splice(i);
      this.saveAttr(row);
    },
    //切换input和el-tag
    showInput(row) {
      row.inputVisible = true;
      //$nextTick 方法的作用，就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    }
  },
  computed: {
    //通过计算属性，如果级联选择的不是第三个则禁用，返回true，否则返回false
    isBtnAbled() {
      if (this.selectCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    //获取当前选择的三级分类iD
    cateID() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2];
      } else {
        return null;
      }
    },
    //动态改变对话框里面的名字
    addDialogName() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>
<style lang="scss" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 0 15px;
}
.input-new-tag {
  width: 100px;
}
</style>