docker-run
===

创建并启动一个新的容器

## 补充说明

**docker run** 命令是 Docker 中最常用的命令之一，它会基于指定的镜像创建一个新的容器并启动运行。该命令实际上是 `docker create` 和 `docker start` 的组合。

### 语法

```shell
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

### 选项

```shell
-d, --detach                    # 后台运行容器并返回容器ID
-i, --interactive               # 保持标准输入打开
-t, --tty                       # 分配一个伪终端
-p, --publish list              # 发布容器端口到主机  -p 宿主机端口:容器端口
-P, --publish-all               # 发布所有暴露的端口到随机端口
-v, --volume list               # 挂载卷  -v 宿主机路径:容器路径
--name string                   # 为容器指定名称
--network network               # 将容器连接到网络
--restart policy                # 容器退出时的重启策略 (no|on-failure|always|unless-stopped)
-e, --env list                  # 设置环境变量
-w, --workdir string            # 指定容器内的工作目录
-u, --user string               # 指定用户 (格式: <name|uid>[:<group|gid>])
--rm                            # 容器退出时自动删除
--hostname string               # 设置容器主机名
--add-host list                 # 添加自定义主机到IP映射 (host:ip)
--cpus decimal                  # CPU数量限制
-m, --memory bytes              # 内存限制
--gpus device-request           # GPU设备分配
--privileged                    # 赋予容器扩展权限
--entrypoint string             # 覆盖镜像的默认ENTRYPOINT
--init                          # 在容器内启动一个init进程
--log-driver string             # 日志驱动
--ip string                     # 指定容器IPv4地址
-h, --help                      # 显示帮助信息
```

### 常用实例

```shell
# 启动一个 nginx 容器，映射 80 端口
docker run -d --name my-nginx -p 80:80 nginx:latest

# 交互式启动 Ubuntu 容器
docker run -it ubuntu:22.04 /bin/bash

# 挂载宿主机目录
docker run -d -v /host/data:/container/data nginx:latest

# 设置环境变量和重启策略
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 --restart=always -p 3306:3306 mysql:8.0

# 限制资源使用
docker run -d --cpus=2 -m 1g nginx:latest

# 容器退出后自动删除
docker run --rm alpine:latest echo "hello world"

# 使用自定义网络
docker run -d --network my-net --name my-app my-image

# 指定容器内用户
docker run -u 1000:1000 ubuntu:22.04 whoami

# 分配 GPU
docker run --gpus all nvidia/cuda:11.8-base nvidia-smi
```

### 重启策略说明

| 策略 | 说明 |
|------|------|
| `no` | 默认值，容器退出不重启 |
| `on-failure[:max-retries]` | 容器非正常退出时重启，可设置最大重试次数 |
| `always` | 容器退出时总是重启 |
| `unless-stopped` | 类似 always，但在 Docker 守护进程启动时，不会启动已手动停止的容器 |
