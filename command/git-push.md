git-push
===

将本地提交推送到远程仓库

## 补充说明

**git push** 命令用于将本地分支的提交推送到远程仓库。推送前需要确保本地分支与远程分支同步，避免冲突。

### 语法

```shell
git push [OPTIONS] [<repository> [<refspec>...]]
```

### 选项

```shell
-u, --set-upstream           # 设置上游分支并推送
--all                        # 推送所有分支
--tags                       # 推送所有标签
--force                      # 强制推送（覆盖远程历史）
--force-with-lease           # 安全强制推送（如果远程有更新则拒绝）
--delete                     # 删除远程分支
--dry-run                    # 模拟推送，不实际执行
--prune                      # 删除远程已不存在的分支的本地追踪引用
-f, --force                  # 强制推送
-d, --delete                 # 删除远程引用
```

### 常用实例

```shell
# 推送当前分支到远程
git push

# 首次推送并设置上游分支
git push -u origin main

# 推送指定分支
git push origin feature/login

# 推送所有分支
git push --all

# 推送标签
git push --tags
git push origin v1.0.0

# 强制推送（慎用！会覆盖远程提交）
git push --force

# 安全强制推送（推荐）
git push --force-with-lease

# 删除远程分支
git push origin --delete feature/login

# 删除远程标签
git push origin --delete v1.0.0

# 模拟推送
git push --dry-run

# 推送所有内容（分支+标签）
git push && git push --tags
```

### force 与 force-with-lease 区别

| 选项 | 说明 |
|------|------|
| `--force` | 无条件覆盖远程分支，可能丢失他人的提交 |
| `--force-with-lease` | 只有远程分支还是你预期的状态时才覆盖，更安全 |
