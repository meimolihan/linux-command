docker-system
===

管理 Docker 系统资源

## 补充说明

**docker system** 命令用于管理 Docker 的系统级资源，包括磁盘占用查看、清理未使用资源等。

### 语法

```shell
docker system COMMAND
# 子命令: df | events | info | prune
```

### 常用实例

```shell
# ===== 查看 Docker 磁盘占用 =====
docker system df
docker system df -v    # 详细显示

# ===== 查看 Docker 系统信息 =====
docker system info
docker info             # 简写

# ===== 清理未使用资源 =====
# 交互式清理（会确认）
docker system prune

# 清理所有未使用资源（包括未使用的镜像）
docker system prune -a

# 清理时不提示确认
docker system prune -f

# 清理时同时删除数据卷
docker system prune -a --volumes

# 查看实时事件
docker system events
docker system events --since "1h"
docker system events -f "type=container"
```

### 磁盘占用解读

```shell
$ docker system df
TYPE            TOTAL   ACTIVE  SIZE    RECLAIMABLE
Images          15      5       2.5GB   1.8GB (72%)
Containers      8       3       120MB   80MB (66%)
Local Volumes   5       2       500MB   300MB (60%)
Build Cache     20      0       800MB   800MB (100%)
```

### 各类清理命令

```shell
docker image prune     # 清理悬空镜像
docker container prune # 清理已停止的容器
docker volume prune    # 清理未使用的数据卷
docker network prune   # 清理未使用的网络
docker builder prune   # 清理构建缓存
```
