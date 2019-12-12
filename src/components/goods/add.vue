<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 竖向tab栏 -->
      <el-form
        :model="addForm"
        :rules="Addrules"
        ref="AddruleForm"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyCate" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyCate" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addCate">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash";
export default {
  data() {
    return {
      activeIndex: "0", //竖向tab栏点击会修改这里的值，不过都是字符串，而步骤条需要拿到数字，所以在步骤条那边减0 完成字符串转数字的操纵
      //form的数据绑定对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: []
      },
      //添加商品的表单验证规则
      Addrules: {
        goods_name: [
          { required: true, message: "商品名称不能为空", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "商品价格不能为空", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "商品重量不能为空", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "商品数量不能为空", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      //商品列表数据的存放数组
      cateList: [],
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      //商品动态参数列表
      manyCate: [],
      //静态参数列表
      onlyCate: [],
      //上传图片的地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      //上传图片请求头,每次请求都要带一个token 因为上传组件默认没有用axios请求，所以没有被拦截，自己加一个请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      //图片预览的地址
      previewPath: "",
      previewVisible: false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据失败");
      }
      this.cateList = res.data;
    },
    handleChange() {
      //判断是否是选择的三级分类，如果不是则清空
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave() {
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // tab栏的点击事件
    async tabClicked() {
      console.log("ok");
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败");
        }
        //现将attr_vals 这个属性从字符串改成字符串数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyCate = res.data;
        console.log(this.manyCate);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态参数列表失败");
        }
        this.onlyCate = res.data;
      }
    },
    //处理图片预览效果
    handlePreview(file) {
      (this.previewPath = file.response.data.url), (this.previewVisible = true);
    },
    //处理移除拖得操作
    handleRemove(file) {
      //第一步拿到被删除的图片地址，第二步在数组中找到对应地址的索引，第三部删除
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex(x => {
        x.pic == filePath;
      });
      this.addForm.pics.splice(i, 1);
    },
    //图片上传成功时触发
    handleSuccess(response) {
      //拼接处一个地址对象
      const picInfo = {
        pic: response.data.tmp_path
      };
      //push到数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    //点击按钮添加商品
    addCate() {
      this.$refs.AddruleForm.validate(async valid => {
        if (!valid) {
          return this.$message.error("请输入合法必要的表单项");
        }
        //因为发送请求时，需要提供的goods_cat是字符串，而级联选择框的model双向绑定也是绑定到了add-form中的goods_cat中，并且级联选择框必须要是数组，这里使用深拷贝解决这个问题 loadsh插件
        const form = _.cloneDeep(this.addForm)
        console.log(form)
        form.goods_cat = form.goods_cat.join(',')
        
        //处理动态参数
        this.manyCate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        //处理静态属性
        this.onlyCate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log(form)
        
        //可以添加商品
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201) {
         return  this.$message.error("添加商品失败");
        }
        this.$message.success("添加商品成功");
        this.$router.push("/goods");
      });
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>
<style lang="scss" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
</style>