podman
===

无守护进程的容器管理工具

## 补充说明

**Podman** 是一个无守护进程的开源容器引擎，用于在 Linux 上开发、管理和运行容器。与 Docker 兼容，但不需要守护进程，更适合 rootless 运行。

### 语法

```shell
podman [OPTIONS] COMMAND [ARG...]
```

### 命令兼容性

Podman 命令与 Docker 高度兼容，可以直接使用 Docker 的命令参数：

```shell
# Docker 命令
docker run -d nginx

# Podman 直接替换
podman run -d nginx
```

### 镜像管理

```shell
# 查看本地镜像
podman images

# 搜索镜像
podman search nginx

# 拉取镜像
podman pull nginx:latest
podman pull docker.io/library/nginx:latest

# 推送镜像
podman push myimage:tag docker.io/username/myimage:tag

# 删除镜像
podman rmi nginx:latest
podman rmi -f nginx:latest

# 构建镜像
podman build -t myimage:tag .
podman build -f Dockerfile -t myimage:tag .

# 查看镜像历史
podman history nginx:latest

# 导出镜像
podman save -o nginx.tar nginx:latest

# 导入镜像
podman load -i nginx.tar

# 查看镜像详情
podman inspect nginx:latest

# 清理未使用镜像
podman image prune
podman image prune -a
```

### 容器管理

```shell
# 创建容器
podman create --name mynginx nginx:latest

# 运行容器
podman run -d --name mynginx -p 80:80 nginx:latest

# 运行交互式容器
podman run -it --name myalpine alpine:latest /bin/sh

# 启动容器
podman start mynginx

# 停止容器
podman stop mynginx

# 重启容器
podman restart mynginx

# 删除容器
podman rm mynginx
podman rm -f mynginx

# 查看容器列表
podman ps                   # 运行中的容器
podman ps -a               # 所有容器

# 查看容器详情
podman inspect mynginx

# 查看容器资源使用
podman stats
podman stats mynginx

# 查看容器进程
podman top mynginx

# 查看容器日志
podman logs mynginx
podman logs -f mynginx       # 实时跟踪
podman logs --tail 100 mynginx
```

### 容器操作

```shell
# 进入容器终端
podman exec -it mynginx /bin/bash
podman exec -it mynginx /bin/sh

# 在容器中执行命令
podman exec mynginx ls /app

# 复制文件
podman cp file.txt mynginx:/tmp/
podman cp mynginx:/tmp/file.txt ./file.txt

# 查看容器端口映射
podman port mynginx

# 导出容器
podman export mynginx -o container.tar

# 导入容器为镜像
podman import container.tar myimage:latest

# 提交容器为镜像
podman commit mynginx myimage:v1

# 查看容器变更
podman diff mynginx

# 暂停/恢复容器
podman pause mynginx
podman unpause mynginx

# 等待容器退出
podman wait mynginx

# 查看容器事件
podman events
```

### Pod 管理

```shell
# 创建 Pod
podman pod create --name mypod

# 创建带端口的 Pod
podman pod create --name mypod -p 80:80

# 查看所有 Pod
podman pod ps
podman pod list

# 查看 Pod 详情
podman pod inspect mypod

# 在 Pod 中运行容器
podman run -d --pod mypod --name web nginx
podman run -d --pod mypod --name db mysql

# 启动/停止 Pod
podman pod start mypod
podman pod stop mypod

# 删除 Pod
podman pod rm mypod
podman pod rm -f mypod

# 查看 Pod 中的容器
podman pod ps
podman ps --pod
```

### 网络管理

```shell
# 查看网络列表
podman network ls

# 创建网络
podman network create mynet

# 查看/检查网络
podman network inspect mynet

# 连接网络
podman network connect mynet mycontainer

# 断开网络
podman network disconnect mynet mycontainer

# 删除网络
podman network rm mynet

# 运行容器时指定网络
podman run -d --network mynet nginx
```

### 存储管理

```shell
# 查看卷列表
podman volume ls

# 创建卷
podman volume create myvolume

# 查看卷详情
podman volume inspect myvolume

# 删除卷
podman volume rm myvolume

# 挂载卷运行容器
podman run -d -v myvolume:/data nginx
podman run -d -v /host/path:/container/path nginx
```

### Rootless 模式

```shell
# 查看当前用户
whoami

# 没有 root 权限也可以运行容器
podman run -d --name mynginx nginx

# rootless 模式特性
# - 无需守护进程
# - 用户命名空间隔离
# - 无需 root 权限
# - 更高的安全性
```

### Docker 兼容别名

```shell
# 创建 Docker 兼容别名
alias docker=podman
alias docker-compose=podman-compose

# 然后即可使用 docker 命令
docker ps
docker run -d nginx
```

### 清理资源

```shell
# 清理停止的容器
podman container prune

# 清理未使用的镜像
podman image prune

# 清理未使用的卷
podman volume prune

# 清理所有未使用资源
podman system prune
podman system prune -a
```

### Podman vs Docker

| 特性 | Podman | Docker |
|------|--------|--------|
| 守护进程 | 无 | docker daemon |
| Root 权限 | 不需要 | 默认需要 |
| Pod 支持 | 原生支持 | 需要 Kubernetes |
| systemd 集成 | 原生支持 | 需额外配置 |
| 安全性 | 更高 | 一般 |
| 命令兼容 | 100% 兼容 | Docker 原生 |

### 生成 systemd 服务

```shell
# 生成 systemd 服务文件
podman generate systemd --name mynginx --files --new

# 生成的服务文件位置
# /etc/systemd/system/container-mynginx.service

# 启用开机自启
systemctl enable container-mynginx
systemctl start container-mynginx
```
