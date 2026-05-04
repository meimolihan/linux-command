git-tag
===

创建、列出或删除标签

## 补充说明

**git tag** 命令用于给仓库中的特定提交打标签，通常用于标记版本发布。标签分为轻量标签（lightweight）和附注标签（annotated）两种。

### 语法

```shell
git tag [OPTIONS]
git tag <tagname>
git tag -a <tagname> -m <msg>
```

### 选项

```shell
-a, --annotate               # 创建附注标签
-m, --message <msg>          # 标签信息
-d, --delete                 # 删除标签
-l, --list                   # 列出标签
-n, --lines <n>              # 每个标签显示 n 行信息
--contains <commit>          # 列出包含指定提交的标签
--sort <key>                 # 排序
```

### 常用实例

```shell
# 列出所有标签
git tag

# 列出标签并显示信息
git tag -n1

# 按模式搜索标签
git tag -l "v1.*"

# 创建轻量标签
git tag v1.0.0

# 创建附注标签（推荐）
git tag -a v1.0.0 -m "发布版本 1.0.0"

# 给指定提交打标签
git tag -a v0.9.0 abc123 -m "历史版本 0.9.0"

# 查看标签信息
git show v1.0.0

# 删除本地标签
git tag -d v1.0.0

# 推送标签到远程
git push origin v1.0.0
git push origin --tags         # 推送所有标签

# 删除远程标签
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0

# 检出标签
git checkout v1.0.0

# 基于标签创建分支
git checkout -b hotfix/v1.0.1 v1.0.0

# 按日期排序标签
git tag --sort=-creatordate

# 列出包含指定提交的标签
git tag --contains abc123
```

### 语义化版本号规范

```shell
v1.0.0  →  v主版本.次版本.修订号
v1.0.0-beta  → 测试版
v1.0.0-rc.1  → 候选版
v1.0.0-alpha → 内测版
```
