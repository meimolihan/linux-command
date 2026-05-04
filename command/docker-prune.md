docker-prune
===

清理Docker未使用的资源

## 补充说明

**docker prune** 命令用于清理Docker系统中不再使用的资源，包括容器、镜像、网络和构建缓存等。这是清理磁盘空间和维护Docker环境的常用操作。

### 语法

```shell
docker prune [OPTIONS]
```

### 选项

```bash
-a, --all     # 删除所有未使用的镜像（不只是 dangling 镜像）
--filter      # 提供过滤条件（如 until=24h）
-f, --force   # 不显示确认提示
```

### 常用实例

#### 清理所有未使用的资源

```shell
# 清理所有未使用的容器、网络、镜像和构建缓存
docker system prune

# 清理所有未使用的资源（包括 volumes）
docker system prune -a

# 清理24小时前创建的所有资源
docker system prune --filter "until=24h"
```

#### 清理未使用的容器

```shell
# 删除已停止的容器
docker container prune

# 删除所有未使用的容器（不仅仅是停止的）
docker container prune -a

# 删除超过24小时的已停止容器
docker container prune --filter "until=24h"
```

#### 清理未使用的镜像

```shell
# 删除 dangling 镜像（未标签且不被任何容器使用）
docker image prune

# 删除所有未使用的镜像
docker image prune -a

# 删除超过7天的未使用镜像
docker image prune -a --filter "until=168h"
```

#### 清理未使用的网络

```shell
# 删除未被任何容器使用的网络
docker network prune
```

#### 清理未使用的卷

```shell
# 删除未被任何容器使用的卷
docker volume prune

# 删除所有未使用的卷（包括命名卷）
docker volume prune -a

# 注意：-a 参数在 volume prune 中会删除所有未使用的卷
```

#### 清理构建缓存

```shell
# 删除构建缓存
docker builder prune

# 删除所有构建缓存
docker builder prune -a
```

#### 清理特定资源组合

```shell
# 只清理容器和镜像
docker container prune -a && docker image prune -a

# 清理网络和卷（小心使用）
docker network prune -a && docker volume prune -a

# 完整清理（包含 volumes）
docker system prune -a --volumes
```

#### 查看清理前的空间使用

```shell
# 查看磁盘使用情况
docker system df

# 详细查看各类资源
docker system df -v
```

### 输出示例

```shell
$ docker system prune

WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all build caches

Are you sure you want to continue? [y/N] y
Deleted Containers:
deleted1234567890abc
Total reclaimed space: 123.4MB
```

### 常见问题

**Q: 清理后空间没有释放？**

A: 检查是否有运行中的容器正在使用这些资源，或检查Docker根目录的挂载点。

**Q: 如何自动定期清理？**

A: 可以使用cron定时任务或systemd timer：
```shell
# /etc/cron.d/docker-prune
0 0 * * * root docker system prune -f
```

**Q: 误删了重要数据？**

A: docker volume prune 会删除未使用的卷，谨慎使用。重要数据应使用命名卷并定期备份。