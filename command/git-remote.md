git-remote
===

管理远程仓库

## 补充说明

**git remote** 命令用于管理本地仓库与远程仓库的关联关系，包括查看、添加、重命名和删除远程仓库。

### 语法

```shell
git remote [OPTIONS]
git remote add <name> <url>
git remote remove <name>
git remote rename <old> <new>
git remote set-url <name> <newurl>
```

### 常用实例

```shell
# 查看远程仓库
git remote
git remote -v    # 显示URL

# 添加远程仓库
git remote add origin https://github.com/user/repo.git
git remote add upstream https://github.com/original/repo.git

# 删除远程仓库
git remote remove origin

# 重命名远程仓库
git remote rename origin old-origin

# 修改远程仓库URL
git remote set-url origin https://github.com/user/new-repo.git

# 切换 HTTPS 和 SSH
git remote set-url origin git@github.com:user/repo.git          # HTTPS → SSH
git remote set-url origin https://github.com/user/repo.git      # SSH → HTTPS

# 查看远程仓库详情
git remote show origin

# 清理无效的远程引用
git remote prune origin

# 更新远程仓库信息
git remote update
```

### 多远程仓库场景

```shell
# fork 项目的标准配置
git remote add origin https://github.com/myfork/repo.git     # 自己的 fork
git remote add upstream https://github.com/original/repo.git # 上游仓库

# 从上游获取更新
git fetch upstream
git merge upstream/main

# 推送到自己的 fork
git push origin main
```
