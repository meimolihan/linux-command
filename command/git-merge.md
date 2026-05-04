git-merge
===

合并分支

## 补充说明

**git merge** 命令用于将两个或多个开发历史合并在一起。是最常用的分支合并方式。

### 语法

```shell
git merge [OPTIONS] <commit>...
```

### 选项

```shell
--ff                         # 快进合并（默认）
--no-ff                      # 禁用快进合并，始终创建合并提交
--ff-only                    # 只允许快进合并
--squash                     # 将合并内容压缩为工作区更改（不自动提交）
--abort                      # 中止合并
--continue                   # 合并冲突解决后继续
-s, --strategy <strategy>    # 使用指定的合并策略
-X, --strategy-option <opt>  # 传递给合并策略的选项
```

### 常用实例

```shell
# 将 feature 分支合并到当前分支
git merge feature/login

# 禁用快进合并（保留分支历史）
git merge --no-ff feature/login

# 只允许快进合并
git merge --ff-only feature/login

# 压缩合并（将所有提交压缩为一个）
git merge --squash feature/login
git commit -m "feat: 合并登录功能"

# 解决冲突后继续合并
git add .
git merge --continue

# 中止合并
git merge --abort

# 指定合并策略
git merge -X theirs feature/login    # 冲突时优先采用对方代码
git merge -X ours feature/login      # 冲突时优先采用己方代码
```

### 合并策略对比

```shell
# fast-forward（快进合并）
# 适用于：目标分支没有新提交
# 结果：线性历史，不产生合并提交
A---B---C feature
         |
A---B---C main (快进后)

# no-fast-forward（非快进合并）
# 适用于：保留分支合并记录
# 结果：产生合并提交
A---B---C---M main
     \     /
      D---E feature

# squash（压缩合并）
# 适用于：功能分支提交混乱，需要整理
# 结果：所有提交压缩为一个
A---B---C---S main (S = 压缩后的单个提交)
```
