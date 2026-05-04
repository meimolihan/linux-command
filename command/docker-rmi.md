docker-rmi
===

删除一个或多个镜像

## 补充说明

**docker rmi** 命令用于删除本地不再需要的 Docker 镜像。如果镜像被容器引用，需要先删除相关容器或使用 `-f` 强制删除。

### 语法

```shell
docker rmi [OPTIONS] IMAGE [IMAGE...]
```

### 选项

```shell
-f, --force       # 强制删除镜像
--no-prune        # 不删除未标记的父镜像
```

### 常用实例

```shell
# 删除指定镜像
docker rmi nginx:latest

# 通过镜像ID删除
docker rmi abc123def456

# 强制删除镜像
docker rmi -f nginx:latest

# 删除多个镜像
docker rmi nginx:latest redis:7 alpine:3.18

# 删除所有悬空镜像（无标签）
docker rmi $(docker images -q -f "dangling=true")

# 删除所有镜像
docker rmi $(docker images -q)

# 删除指定仓库名的所有镜像
docker rmi $(docker images -q nginx)

# 配合 docker image prune 清理
docker image prune -a   # 删除所有未使用的镜像
docker image prune       # 只删除悬空镜像
```
