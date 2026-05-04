git-pull
===

从远程仓库拉取并合并代码

## 补充说明

**git pull** 命令用于从远程仓库获取最新代码并合并到当前分支。它实际上是 `git fetch` + `git merge` 的组合操作。

### 语法

```shell
git pull [OPTIONS] [<repository> [<refspec>...]]
```

### 选项

```shell
--rebase                     # 使用 rebase 代替 merge 合并代码
--no-rebase                  # 使用 merge 合并（默认）
--ff-only                    # 只在快进合并时才合并
--all                        # 拉取所有远程仓库
--prune                      # 删除远程已不存在的分支的本地追踪引用
--depth <depth>              # 限制拉取深度
--dry-run                    # 模拟运行
-q, --quiet                  # 静默模式
-v, --verbose                # 详细输出
```

### 常用实例

```shell
# 拉取当前分支的最新代码并合并
git pull

# 拉取并使用 rebase 方式合并（保持提交历史线性）
git pull --rebase

# 只允许快进合并（避免产生合并提交）
git pull --ff-only

# 拉取指定远程和分支
git pull origin main

# 拉取所有远程的更新
git pull --all

# 拉取并清理已删除的远程分支引用
git pull --prune

# 设置默认使用 rebase 拉取
git config pull.rebase true
```

### pull --rebase vs pull --merge 对比

```shell
# merge 方式（默认）：会产生合并提交
git pull
# 历史记录: A - B - C - M (合并提交)
#                  \   /
#                   D - E

# rebase 方式：保持线性历史
git pull --rebase
# 历史记录: A - B - C - D' - E' (线性)
```

### 推荐做法

```shell
# 拉取远程更新时优先使用 rebase
git pull --rebase origin main

# 如果有冲突，解决后继续
git add .
git rebase --continue

# 如果想放弃 rebase
git rebase --abort
```
