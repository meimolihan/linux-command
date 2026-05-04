git-stash
===

暂存工作区更改

## 补充说明

**git stash** 命令用于临时保存工作区和暂存区的更改，使工作目录回到干净状态。常用于需要临时切换分支但又不想提交未完成工作的情况。

### 语法

```shell
git stash [OPTIONS]
git stash pop  [--index] [<stash>]
git stash apply [--index] [<stash>]
git stash list
git stash drop [<stash>]
git stash clear
git stash branch <branchname> [<stash>]
```

### 常用实例

```shell
# 暂存当前更改
git stash

# 暂存时添加说明
git stash save "WIP: 登录功能"

# 暂存包含未跟踪的文件
git stash -u
git stash --include-untracked

# 暂存所有更改（包括已忽略的文件）
git stash -a

# 查看暂存列表
git stash list

# 恢复最近的暂存并删除
git stash pop

# 恢复最近的暂存但保留
git stash apply

# 恢复指定暂存
git stash apply stash@{2}

# 恢复暂存并恢复暂存区状态
git stash apply --index

# 删除指定暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear

# 查看暂存内容
git stash show
git stash show -p    # 显示完整diff

# 基于暂存创建新分支
git stash branch feature/new stash@{0}

# 部分暂存（交互式选择）
git stash -p
```

### 典型工作流

```shell
# 1. 正在开发功能，需要紧急修复 bug
git stash save "WIP: 用户注册功能"

# 2. 切换到 bugfix 分支
git checkout hotfix/bug-123

# 3. 修复完成后切回
git checkout feature/register

# 4. 恢复之前的工作
git stash pop
```
