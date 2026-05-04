# Linux 命令大全 - 静态网站

一个包含 800+ Linux 命令的静态查询网站。

## 项目结构

```
linux-command-deploy/
├── .deploy/           # 网站静态文件
│   ├── index.html    # 首页
│   ├── c/            # 命令详情页 (800+ 个)
│   ├── css/          # 样式文件
│   ├── js/           # JavaScript 文件
│   └── img/          # 图片资源
├── vercel.json       # Vercel 部署配置
└── package-lock.json
```

## 部署到 Vercel

### 方法一：通过 Vercel Dashboard（推荐）

1. 访问 [vercel.com](https://vercel.com/) 并登录
2. 点击 "Add New" → "Project"
3. 导入你的 Git 仓库
4. 在项目配置中：
   - **Framework Preset**: 选择 "Other"
   - **Root Directory**: 保持默认（`.`）
   - **Build Command**: 留空
   - **Output Directory**: 设置为 `.deploy`
5. 点击 "Deploy"

### 方法二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

## 本地预览

```bash
# 使用 Python 启动本地服务器
cd .deploy && python3 -m http.server 8080

# 或使用 Node.js
npx serve .deploy
```

访问 `http://localhost:8080`

## 特性

- 🔍 支持命令搜索
- 🌓 支持深色/浅色主题切换
- 📱 响应式设计，移动端友好
- ⚡ 纯静态部署，加载速度快
- 🎨 现代化的 UI 设计
