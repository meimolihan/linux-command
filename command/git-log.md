git-log
===

查看提交历史

## 补充说明

**git log** 命令用于查看 Git 仓库的提交历史。支持多种格式化输出和过滤选项，是回溯代码变更最重要的工具。

### 语法

```shell
git log [OPTIONS] [<revision-range>]
```

### 选项

```shell
--oneline                    # 每次提交显示一行
--graph                      # 显示分支合并图
--all                        # 显示所有分支
-n, --max-count <n>          # 限制显示的提交数
--author <pattern>           # 按作者过滤
--since, --after <date>      # 显示指定日期之后的提交
--until, --before <date>     # 显示指定日期之前的提交
--grep <pattern>             # 按提交信息过滤
-S <string>                  # 搜索添加/删除了指定字符串的提交
-p, --patch                  # 显示每次提交的 diff
--stat                       # 显示每次提交的文件变更统计
--name-only                  # 只显示变更的文件名
--pretty <format>            # 自定义输出格式
--abbrev-commit              # 显示简短的提交哈希
--no-merges                  # 不显示合并提交
```

### 常用实例

```shell
# 查看完整提交历史
git log

# 单行显示
git log --oneline

# 图形化显示所有分支
git log --oneline --graph --all

# 查看最近5次提交
git log -5
git log -5 --oneline

# 按作者过滤
git log --author="John"

# 按日期范围过滤
git log --since="2024-01-01" --until="2024-12-31"
git log --since="2 weeks ago"

# 按提交信息搜索
git log --grep="fix:"

# 搜索代码变更（谁添加/删除了某段代码）
git log -S "function login"

# 查看某个文件的提交历史
git log -- file.txt
git log -p -- file.txt         # 显示文件每次变更的 diff

# 显示文件变更统计
git log --stat

# 自定义格式
git log --pretty=format:"%h - %an, %ar : %s"

# 只显示非合并提交
git log --no-merges

# 查看某次提交的详情
git show abc123
```

### 格式化占位符

| 占位符 | 说明 |
|--------|------|
| `%H` | 完整哈希 |
| `%h` | 简短哈希 |
| `%an` | 作者名 |
| `%ae` | 作者邮箱 |
| `%ar` | 相对日期 |
| `%ad` | 作者日期 |
| `%s` | 提交信息 |
| `%d` | 引用名称 |

### 推荐别名

```shell
git config --global alias.lg "log --oneline --graph --all"
# 使用: git lg

git config --global alias.ll "log --pretty=format:'%h - %an, %ar : %s'"
# 使用: git ll
```
