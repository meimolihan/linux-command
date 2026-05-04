git-diff
===

查看文件差异

## 补充说明

**git diff** 命令用于查看工作区、暂存区和提交之间的文件差异，是代码审查和调试的重要工具。

### 语法

```shell
git diff [OPTIONS] [<commit>] [--] [<path>...]
```

### 常用实例

```shell
# 查看工作区和暂存区的差异（未暂存的更改）
git diff

# 查看暂存区和最近提交的差异（已暂存的更改）
git diff --cached
git diff --staged

# 查看工作区和最近提交的所有差异
git diff HEAD

# 查看两个提交之间的差异
git diff abc123 def456

# 查看两个分支之间的差异
git diff main..feature
git diff main...feature    # 只显示分支分叉后的差异

# 查看指定文件的差异
git diff file.txt
git diff --cached file.txt

# 统计差异（只显示文件和行数变化）
git diff --stat
git diff --stat HEAD~3

# 只显示修改的文件名
git diff --name-only
git diff --name-only HEAD~1

# 显示每行修改的上下文行数
git diff -U5    # 显示5行上下文

# 显示单词级别的差异
git diff --word-diff

# 忽略空白差异
git diff -w
git diff --ignore-all-space

# 比较暂存区和指定提交
git diff abc123 --staged
```

### 差异对比范围

```shell
git diff                  # 工作区 vs 暂存区
git diff --cached         # 暂存区 vs HEAD
git diff HEAD             # 工作区 vs HEAD
git diff HEAD~1 HEAD      # 上次提交 vs 最新提交
git diff main feature     # main vs feature
```
