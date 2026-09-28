# 南京航空航天大学空天智能与智造研究所网站

研究所官网，包含研究成果、团队信息、产品介绍与招生合作页面。

## 开发

直接打开 `index.html` 预览，或使用任意静态 HTTP Server。

更新成员、论文或公共头尾模板后运行：

```bash
node scripts/build.mjs
```

生成发布目录：

```bash
node scripts/publish.mjs
```

发布时使用 `dist/` 目录。主要数据位于 `data/`，成员简介位于 `content/members/`，公共模板位于 `partials/`。
