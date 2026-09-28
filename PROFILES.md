# 成员资料维护

成员基础信息维护在 `data/members.json`，每位成员的简介正文维护在 `content/members/<id>.md`。不要直接编辑生成后的 `<id>.html`。

生成全部成员详情页：

```bash
node scripts/generate-profiles.mjs
```

发布前也可以一次生成论文数据和全部成员页：

```bash
node scripts/build.mjs
```

新增成员时，在 `members.json` 增加一条记录，并创建对应的 Markdown 文件。JSON 中的 `id` 必须与 Markdown 文件名一致；`photo` 和 `email` 用于详情页侧栏，论文会根据 `data/papers.json` 中的作者 `id` 自动关联。
