git-fetch
===

从远程仓库获取更新（不合并）

## 补充说明

**git fetch** 命令用于从远程仓库下载最新的提交和引用，但不会修改工作目录。与 `git pull` 不同，fetch 只下载不合并，让你可以在合并前审查变更。

### 语法

```shell
git fetch [OPTIONS] [<repository> [<refspec>...]]
```

### 选项

```shell
--all                        # 获取所有远程仓库的更新
--prune                      # 删除远程已不存在的分支引用
--depth <depth>              # 限制获取深度
--dry-run                    # 模拟获取
-t, --tags                   # 获取所有标签
--force                      # 强制更新本地引用
-j, --jobs <n>               # 并行获取的子模块数量
```

### 常用实例

```shell
# 获取 origin 的所有更新
git fetch

# 获取所有远程仓库的更新
git fetch --all

# 获取指定远程仓库的更新
git fetch origin

# 获取指定分支
git fetch origin main

# 获取并清理无效引用
git fetch --prune

# 获取标签
git fetch --tags

# 查看获取到的更新
git fetch && git log HEAD..origin/main

# 获取后在本地创建追踪分支
git fetch origin feature/login
git checkout -b feature/login origin/feature/login

# 对比本地和远程的差异
git fetch origin
git diff main origin/main
git log main..origin/main
```

### fetch vs pull

| 命令 | 下载 | 合并 | 安全性 |
|------|------|------|--------|
| `git fetch` | ✅ | ❌ | 安全，不会修改工作目录 |
| `git pull` | ✅ | ✅ | 可能产生冲突，需要解决 |
