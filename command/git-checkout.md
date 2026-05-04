git-checkout
===

切换分支或恢复工作区文件

## 补充说明

**git checkout** 命令用于切换分支或恢复工作区文件。在较新版本的 Git 中，建议使用 `git switch` 切换分支和 `git restore` 恢复文件。

### 语法

```shell
git checkout [OPTIONS] <branch>
git checkout [OPTIONS] -- <file>...
```

### 选项

```shell
-b <new-branch>               # 创建并切换到新分支
-B <new-branch>               # 创建（或重置）并切换到新分支
--track                       # 创建追踪远程分支的本地分支
-t, --track                   # 追踪远程分支
-f, --force                   # 强制切换（丢弃本地更改）
--orphan <new-branch>         # 创建无历史的孤立分支
--detach                      # 切换到分离HEAD状态
```

### 常用实例

```shell
# 切换分支
git checkout main

# 创建并切换到新分支
git checkout -b feature/login

# 创建追踪远程分支的本地分支
git checkout -b feature/login origin/feature/login

# 切换到指定提交
git checkout abc123

# 恢复工作区文件（丢弃修改）
git checkout -- file.txt

# 恢复所有已修改的文件
git checkout -- .

# 切换到上一个分支
git checkout -

# 创建孤立分支（常用于 GitHub Pages）
git checkout --orphan gh-pages

# 强制切换（丢弃所有未提交的更改）
git checkout -f main
```

### 新命令替代（Git 2.23+）

```shell
# 旧命令                          → 新命令
git checkout main               → git switch main
git checkout -b feature/login   → git switch -c feature/login
git checkout -- file.txt        → git restore file.txt
git checkout HEAD -- file.txt   → git restore --staged file.txt
```
