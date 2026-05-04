git-reset
===

重置当前 HEAD 到指定状态

## 补充说明

**git reset** 命令用于将当前分支的 HEAD 重置到指定状态。根据选项不同，可以控制是否保留工作区和暂存区的更改。

### 语法

```shell
git reset [OPTIONS] [<commit>]
```

### 选项

```shell
--soft                # 只重置 HEAD，保留暂存区和工作区
--mixed               # 重置 HEAD 和暂存区，保留工作区（默认）
--hard                # 重置 HEAD、暂存区和工作区（⚠️ 丢弃所有更改）
--merge               # 重置 HEAD 和暂存区，保留工作区中未合并的更改
--keep                # 重置 HEAD，如果工作区有更改则中止
```

### 常用实例

```shell
# 撤销最近一次提交（保留更改在暂存区）
git reset --soft HEAD~1

# 撤销最近一次提交（保留更改在工作区）
git reset --mixed HEAD~1
git reset HEAD~1    # --mixed 是默认的

# 撤销最近一次提交（丢弃所有更改 ⚠️）
git reset --hard HEAD~1

# 撤销最近两次提交
git reset --soft HEAD~2

# 重置到指定提交
git reset --soft abc123

# 取消暂存（unstage）
git reset HEAD file.txt

# 取消所有暂存
git reset HEAD .

# 撤销 merge
git reset --hard ORIG_HEAD
```

### 三种模式对比

| 模式 | HEAD | 暂存区 | 工作区 | 用途 |
|------|------|--------|--------|------|
| `--soft` | ✅ 重置 | ❌ 保留 | ❌ 保留 | 撤销提交，重新组织提交 |
| `--mixed` | ✅ 重置 | ✅ 重置 | ❌ 保留 | 撤销提交和暂存 |
| `--hard` | ✅ 重置 | ✅ 重置 | ✅ 重置 | 彻底回退（危险！） |

### 恢复误操作

```shell
# 如果误用了 --hard，可以通过 reflog 恢复
git reflog
# 找到误操作前的 HEAD，如 abc123
git reset --hard abc123
```
