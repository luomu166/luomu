# 廖昌林 · 个人作品集

一个从零搭建、无框架依赖的暗色系个人作品集静态网站。视觉上强调高级、克制与科技感，内容全部来自简历：视觉设计师 / AI 设计师 / 品牌设计师 / 汽车渲染师 / 建模师。

## 快速开始

直接用浏览器打开 `index.html` 即可预览，无需安装任何依赖。

也可以本地起一个静态服务：

```bash
# Python
python -m http.server 8080

# 或 Node
npx serve .
```

然后访问 `http://localhost:8080`。

## 目录结构

```text
portfolio-site/
├─ index.html            # 页面结构（所有文案都在这里）
├─ assets/
│  ├─ css/style.css      # 全部样式（设计变量集中在 :root）
│  ├─ js/main.js         # 交互脚本（Hero 粒子 / 滚动显现 / 计数 / 菜单）
│  ├─ img/               # 头像、favicon、项目作品图（work-01 ~ work-11）
│  └─ media/             # Hero 视频与海报（放入 hero.mp4 即自动启用）
└─ README.md
```

## 替换内容与资产

1. 所有文字（标题、介绍、联系方式、项目、优势）都在 `index.html` 中，直接搜索对应中文即可修改。
2. 头像：已替换为你的肖像照片（`assets/img/portrait.jpg`，800×1000）；想换照片，用同名文件覆盖即可。
3. 项目作品图：11 张作品已放在 `assets/img/projects/`（`work-01.jpg` ~ `work-11.jpg`），想换图直接覆盖同名文件即可，无需改代码。
4. Hero 背景视频：已放入 `assets/media/hero.mp4`（来自你的 11月1日.mp4，压缩至约 17MB，满足 Cloudflare Workers 25MiB 单文件上限）；想换视频，直接用同名文件覆盖即可，注意保持小于 25MiB。

详细说明见同级的《使用文档》。如需生成替换用图，见《AI 提示词》。
