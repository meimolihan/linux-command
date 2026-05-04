#!/bin/bash
# 部署脚本：将构建产物推送到 GitHub（不暴露源码）
# 使用方法：bash scripts/deploy.sh

set -e

echo "🔨 开始构建..."
npm install
npm run build

echo "📦 准备部署到 GitHub..."

# 保存当前分支
CURRENT_BRANCH=$(git branch --show-current)

# 创建或切换到 deploy 分支（orphan 分支，无历史记录）
git checkout --orphan deploy-temp

# 移除所有文件
git rm -rf . 2>/dev/null || true

# 从 .deploy 复制构建产物到根目录
cp -r .deploy/* .
cp .deploy/.nojekyll . 2>/dev/null || touch .nojekyll

# 添加文件
git add -A

# 提交
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# 重命名分支
git branch -D deploy 2>/dev/null || true
git branch -m deploy-temp deploy

# 强制推送到远程 deploy 分支
git push origin deploy --force

# 切回原分支
git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout -b main

echo "✅ 部署完成！"
echo "📌 请在 Vercel 中关联该仓库的 deploy 分支"
echo "   或者将 deploy 分支设为默认分支"
