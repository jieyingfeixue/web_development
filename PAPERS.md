# 论文库维护

统一论文数据位于 `data/papers.json`。每篇论文只录入一次，在 `authors` 中填写完整作者名单及顺序；页面会自动把论文分配到所有作者名下，并按学术列表格式展示。

```json
{
  "id": "paper-2026-001",
  "title": "论文标题",
  "year": 2026,
  "type": "PAPER",
  "venue": "期刊或会议名称",
  "authors": [
    { "id": "weimingqiang", "name": "魏明强" },
    { "id": "student-001", "name": "学生姓名" }
  ],
  "abstract": "论文摘要（可选）",
  "images": [
    { "src": "imgs/paper-2026-001-01.jpg", "alt": "实验结果图", "caption": "实验结果" },
    { "src": "imgs/paper-2026-001-02.jpg", "alt": "系统示意图", "caption": "系统示意图" }
  ]
}
```

没有配图时省略 `images`；有一张或多张时，页面会自动显示图片区域，多张图片支持横向滚动。

生成静态数据：

```bash
node scripts/generate-papers.mjs
```
