<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="userInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户信息表格部分 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- 通过双向数据绑定，作用域插槽，直接拿到值，然后当前的prop可以省略 -->
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的Dialog -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户的Dialog -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    //验证邮箱跟手机号的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      userInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      //接受存放用户列表的数据
      userList: [],
      total: 0,
      addDialogVisible: false,
      //添加用户的数据
      addForm: {
        username: "",
        paseword: "",
        email: "",
        mobile: ""
      },
      //控制编辑用户信息对话框的
      editDialogVisible: false,
      // 添加用户的规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "用户名长度在3~10之间", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请您输入密码", trigger: "blur" },
          { min: 6, max: 12, message: "密码长度在6~12位之间", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请您输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请您输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.userInfo
      });
      if (res.meta.status !== 200) return this.$message.error("获取信息失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      (this.userInfo.pagesize = newSize), //这里拿到当前的页码，然后修改data中的数据，在重新渲染
        this.getUserList();
    },
    handleCurrentChange(newPage) {
      (this.userInfo.pagenum = newPage), this.getUserList();
    },
    async changeState(userInfoState) {
      //记得在change事件中把 插槽数据传进去
      const { data: res } = await this.$http.put(
        `users/${userInfoState.id}/state/${userInfoState.mg_state}`
      );
      if (res.meta.status !== 200) {
        userInfoState.mg_state !== userInfoState.mg_state; //如果失败，此时虽然数据没有改变，但是页面改变了，所以这边手动修改状态，不能改变
        this.$message.error("修改状态失败");
      }
      this.$message.success("修改状态成功");
      console.log(userInfoState);
    },
    //监听对话框关闭，重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //添加用户(首先对整个表单校验，失败就不发请求)
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return; //不合法则valid=false，这里需要取反
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        } else {
          //添加用户成功
          this.$message.success("添加用户成功");
          //隐藏对话框
          this.addDialogVisible = false;
          //重新刷新页面
          this.getUserList();
        }
      });
    },
    //显示编辑用户的对话框
    editDialog() {
      this.editDialogVisible = true;
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
