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
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showRolesDialog(scope.row)"
              ></el-button>
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
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%" @closed="editDialogClosed">
      <el-form :model="editDialogIInfo" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editDialogIInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editDialogIInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editDialogIInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的Dialog -->
    <el-dialog title="提示" :visible.sync="setRolesDialogVisible" width="30%" @close="setRoleDialogClosed">
      <p>当前用户:{{ userMessage.username }}</p>
      <p>当前角色:{{ userMessage.role_name }}</p>
      <p>
        分配新角色：
        <el-select v-model="seletedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
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
      //保存编辑用户时，请求拿到的数据
      editDialogIInfo: [],

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
      },
      //编辑用户的验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      //控制分配角色Dialog的显示与隐藏
      setRolesDialogVisible: false,
      //当前的用户信息
      userMessage: {},
      //获取到的角色列表
      rolesList: [],
      //已选中的角色ID 值
      seletedRoleId: ""
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
    async editDialog(id) {
      console.log(id);
      const { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户信息失败");
      }
      this.editDialogIInfo = res.data;
      this.editDialogVisible = true;
    },
    //关闭编辑对话框，重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //编辑用户信息的验证跟请求
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editDialogIInfo.id,
          {
            email: this.editDialogIInfo.email,
            mobile: this.editDialogIInfo.mobile
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("编辑用户信息失败");
        } else {
          //关闭对话框
          this.editDialogVisible = false;
          //刷新页面
          this.getUserList();
          //提示用户
          this.$message.success("修改用户信息成功");
        }
      });
    },
    //删除用户操作
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      console.log(confirmResult);
      //如果确定删除，会显示字符串confirm
      //如果取消删除，则会显示字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      } else {
        //这里说明确认删除，开始发送请求删除数据
        const { data: res } = await this.$http.delete("users/" + id);
        if (res.meta.status !== 200) {
          return this.$message.error("删除信息失败");
        }
        this.$message.success("删除信息成功");
        this.getUserList();
      }
    },
    //分配角色对话框显示
    async showRolesDialog(userMessage) {
      this.userMessage = userMessage;
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        this.$message.error("获取角色列表失败");
      }
      this.rolesList = res.data;
      console.log(res.data);
      this.setRolesDialogVisible = true;
    },
    //点击按钮分配角色
    async saveRoleInfo() {
      if (!this.seletedRoleId) {
        return this.$message.error("请选择要分配的角色");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userMessage.id}/role`,
        {
          rid: this.seletedRoleId
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("保存角色失败！");
      }
      this.$message.success("保存角色成功");
      this.getUserList()
      this.setRolesDialogVisible = false;
    },
    //监听分配角色对话框关闭
    setRoleDialogClosed() {
      this.seletedRoleId = "",
      this.userMessage = []
    }
  }
};
</script>
<style lang="scss" scoped>
</style>