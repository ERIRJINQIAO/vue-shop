<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdBottom',i1===0 ? '' : 'bdTop','vcenter']"
              v-for="( item1, i1 ) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级，三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2==0 ? '' : 'bdTop', 'vcenter']"
                  v-for="( item2, i2 ) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightsById(scope.row,item3.id)"
                    >{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRole(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 展示分配权限的对话框 -->
    <el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%" @close="clearDefKeys">
      <el-tree
        :data="rightsList"
        :props="treeProps"
        node-key="id"
        default-expand-all
        show-checkbox
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%">
      <el-form
        :model="addRoleruleForm"
        :rules="addRolerules"
        ref="addRoleruleRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleruleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleruleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog title="提示" :visible.sync="editRoledialogVisible" width="30%" @close="editRoleClosed">
      <el-form
        :model="editRoleList"
        :rules="addRolerules"
        ref="editRuleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名称" prop="roleName">
          <el-input v-model="editRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="用户描述" prop="roleDesc">
          <el-input v-model="editRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="putRoleList">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //存放权限数据
      rolesList: [],
      //控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      //存放分配权限请求获得的数据
      rightsList: [],
      //树形控件设置
      treeProps: {
        label: "authName",
        children: "children"
      },
      //树形控件默认展开时存放的ID
      defKeys: [],
      //分配权限时保存当时的id
      roleid: "",
      //控制添加用户对话框的显示与隐藏
      addRoleDialogVisible: false,
      //添加用户的数据对象
      addRoleruleForm: {
        roleName: "",
        roleDesc: ""
      },
      //验证添加用户规则
      addRolerules: {
        roleName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 5, message: "用户名长度在3~5之间", trigger: "blur" }
        ]
      },
      //控制编辑用户对话框的显示与隐藏
      editRoledialogVisible: false,
      //保存点击编辑用户信息时传过来的数据
      editRoleList: {}
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //添加角色
    addUsers() {
      //对整个表单进行校验，非法则不发请求
      this.$refs.addRoleruleRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "roles",
          this.addRoleruleForm
        );
        if (res.meta.status !== 201) {
          return this.$message("创建角色失败");
        }
        this.$message.success("添加角色成功");
        this.getRolesList();
        this.addRoleDialogVisible = false;
        this.addRoleruleForm = {};
      });
    },
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败");
      }
      this.rolesList = res.data;
    },
    //根据id删除权限
    async removeRightsById(role, rightId) {
      const result = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      //this.getRolesList();
      // 此处为了防止重新刷新页面带来的不好用户体验，采用将返回的res.data赋值给原来的children
      // console.log(res.data); //当前返回的信息权限数据
      // console.log(role.children);当前角色的children属性
      role.children = res.data;
    },
    //展开分配权限
    async showRightDialog(role) {
      //将ID 保存在data中方便后面使用
      this.roleid = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取分配权限数据失败");
      }
      this.rightsList = res.data;
      console.log(res.data);
      //递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    //利用递归 获取角色下所有三级权限的ID，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      //判断当前是否是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item, arr));
    },
    //监听关闭树形窗口事件，清空defKeys数组中的值
    clearDefKeys() {
      this.defKeys = [];
    },
    //分配权限，点击确定为当前角色添加权限
    async allotRights() {
      //...代表进行计算
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleid}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改用户权限失败！");
      }
      this.$message.success("修改用户权限成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
    //显示编辑用户，拿到数据
    async editRole(id) {
      this.editRoledialogVisible = true;
      const { data: res } = await this.$http.get(`roles/${id}`);
      this.editRoleList = res.data;
    },
    //点击确定，提交编辑用户信息
    async putRoleList() {
      const { data: res } = await this.$http.put(
        `roles/${this.editRoleList.roleId}`,
        this.editRoleList
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改角色信息失败");
      }
      this.$message.success("修改用户信息成功");
      this.getRolesList();
      this.editRoledialogVisible = false;
    },
    //编辑对话框关闭时重置表单
    editRoleClosed() {
      console.log(111);
      this.$refs.editRuleForm.resetFields();
    },
    //删除用户
    async deleteRoles(id) {
      console.log(id);
      const result = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (result !== "confirm") {
        return this.$message.info("已取消删除角色信息！");
      }
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除角色信息失败！");
      }
      this.$message.success("删除角色信息成功!");
      this.getRolesList();
    }
  }
};
</script>
<style lang="scss" scoped>
.el-tag {
  margin: 7px;
}
.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
//纵向上的居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>