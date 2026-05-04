git-commit
===

将暂存区的更改提交到本地仓库

## 补充说明

**git commit** 命令用于将暂存区（staged）的更改提交到本地仓库，每次提交都会生成一个唯一的哈希值。提交是 Git 工作流中最核心的操作。

### 语法

```shell
git commit [OPTIONS]
```

### 选项

```shell
-m, --message <msg>          # 提交信息
-a, --all                    # 自动暂存所有已修改和删除的跟踪文件
--amend                      # 修改最近一次提交
--allow-empty                # 允许创建空提交
--no-verify                  # 跳过 pre-commit 和 commit-msg 钩子
-s, --signoff                # 在提交信息末尾添加 Signed-off-by 行
--author <author>            # 覆盖提交作者 (格式: A U Thor <author@example.com>)
--date <date>                # 覆盖提交日期
--squash <commit>            # 合并提交
-C, --reuse-message <commit> # 复用指定提交的信息
-F, --file <file>            # 从文件读取提交信息
-e, --edit                   # 进一步编辑提交信息
--amend                      # 修改上一次提交（用于追加更改或修改信息）
```

### 常用实例

```shell
# 提交暂存区的更改
git commit -m "feat: 添加用户登录功能"

# 提交所有已跟踪文件的修改（跳过 git add）
git commit -am "fix: 修复首页显示问题"

# 修改上一次提交
git commit --amend -m "feat: 添加用户登录和注册功能"

# 追加更改到上一次提交（不修改提交信息）
git add forgotten-file.js
git commit --amend --no-edit

# 跳过钩子提交
git commit --no-verify -m "wip: 临时保存"

# 签核提交
git commit -s -m "feat: 添加用户登录功能"

# 指定作者和日期
git commit --author="John <john@example.com>" -m "update docs"

# 从文件读取提交信息
git commit -F commit-msg.txt

# 允许空提交（常用于触发 CI）
git commit --allow-empty -m "chore: trigger CI"
```

### Conventional Commits 规范

```shell
# 格式: <type>(<scope>): <subject>
feat: 新功能
fix: 修复bug
docs: 文档变更
style: 代码格式（不影响代码运行）
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建过程或辅助工具
ci: CI配置
build: 构建系统
revert: 回滚

# 示例
git commit -m "feat(auth): 添加JWT令牌刷新机制"
git commit -m "fix(api): 修复分页参数校验问题"
git commit -m "docs: 更新API文档"
```
