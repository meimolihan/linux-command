git-rebase
===

变基：将提交重新应用到另一个基准之上

## 补充说明

**git rebase** 命令用于将当前分支的提交重新应用到另一个基准提交之上，使提交历史保持线性。与 merge 不同，rebase 不会产生合并提交，但会改写提交历史。

### 语法

```shell
git rebase [OPTIONS] <upstream>
```

### 选项

```shell
-i, --interactive             # 交互式变基
--continue                    # 冲突解决后继续变基
--abort                       # 中止变基
--skip                        # 跳过当前提交
--onto <newbase>              # 变基到指定基准
--root                        # 变基到根提交
--autosquash                   # 自动合并 fixup/squash 提交
```

### 常用实例

```shell
# 将当前分支变基到 main
git rebase main

# 交互式变基（修改最近3次提交）
git rebase -i HEAD~3

# 变基到指定基准
git rebase --onto main feature/base feature/new

# 解决冲突后继续
git add .
git rebase --continue

# 跳过当前提交
git rebase --skip

# 中止变基
git rebase --abort

# 变基远程分支
git rebase origin/main

# 自动压缩提交
git rebase -i --autosquash HEAD~5
```

### 交互式变基操作

```shell
git rebase -i HEAD~3
# 编辑器打开后，可对每个提交选择操作：
# pick   = 使用提交
# reword = 使用提交，但修改提交信息
# edit   = 使用提交，但暂停以修改提交内容
# squash = 使用提交，合并到前一个提交
# fixup  = 类似 squash，但丢弃提交信息
# drop   = 丢弃提交
```

### ⚠️ 黄金法则

> **永远不要对已经推送到远程仓库的提交执行 rebase！**

```shell
# ❌ 危险操作：对公共分支 rebase
git checkout main
git rebase feature    # 这会改写 main 的历史

# ✅ 安全操作：对私有分支 rebase
git checkout feature
git rebase main       # 只改写 feature 的历史
```
