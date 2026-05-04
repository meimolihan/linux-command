git-branch
===

列出、创建或删除分支

## 补充说明

**git branch** 命令用于管理 Git 分支，包括列出、创建和删除分支。分支是 Git 最强大的特性之一，允许你在不同功能线上并行开发。

### 语法

```shell
git branch [OPTIONS] [<branchname>]
```

### 选项

```shell
-a, --all                    # 列出所有分支（本地+远程）
-r, --remotes                # 只列出远程分支
-v, --verbose                # 显示分支及最后一次提交
-d, --delete                 # 删除已合并的分支
-D                           # 强制删除分支（即使未合并）
-m, --move                   # 重命名分支
-M                           # 强制重命名分支
--merged                     # 列出已合并到 HEAD 的分支
--no-merged                  # 列出未合并到 HEAD 的分支
--contains <commit>          # 列出包含指定提交的分支
--set-upstream-to <upstream> # 设置上游分支
```

### 常用实例

```shell
# 列出本地分支
git branch

# 列出所有分支（含远程）
git branch -a

# 列出远程分支
git branch -r

# 显示分支及最后一次提交
git branch -v

# 创建新分支（不切换）
git branch feature/login

# 基于指定提交创建分支
git branch hotfix abc123def

# 删除已合并的分支
git branch -d feature/login

# 强制删除分支（即使未合并）
git branch -D feature/login

# 重命名当前分支
git branch -m new-name

# 重命名指定分支
git branch -m old-name new-name

# 列出已合并的分支
git branch --merged

# 列出未合并的分支
git branch --no-merged

# 批量删除已合并的本地分支
git branch --merged | grep -v "^\*\|main\|develop" | xargs -n 1 git branch -d

# 删除远程分支的本地追踪引用
git branch -r --merged | grep -v "main\|develop" | sed 's/origin\//:/' | xargs git push

# 设置上游分支
git branch --set-upstream-to=origin/main main
```

### 分支命名规范

```shell
feature/xxx    # 新功能分支
bugfix/xxx     # Bug修复分支
hotfix/xxx     # 紧急修复分支
release/xxx    # 发布分支
test/xxx       # 测试分支
```
