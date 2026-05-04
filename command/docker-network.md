docker-network
===

管理 Docker 网络

## 补充说明

**docker network** 命令用于管理 Docker 的网络。Docker 网络允许容器之间以及容器与外部之间的通信。Docker 默认提供 bridge、host、none 三种网络驱动。

### 语法

```shell
docker network COMMAND
# 子命令: connect | create | disconnect | inspect | ls | prune | rm
```

### 常用实例

```shell
# ===== 列出网络 =====
docker network ls

# ===== 创建网络 =====
# 创建 bridge 网络
docker network create my-net

# 创建时指定子网和网关
docker network create --subnet=172.20.0.0/16 --gateway=172.20.0.1 my-net

# 创建自定义驱动的网络
docker network create -d bridge my-net

# 指定IP范围
docker network create --subnet=172.20.0.0/16 --ip-range=172.20.10.0/24 my-net

# ===== 连接容器到网络 =====
docker network connect my-net my-container

# 连接时指定IP地址
docker network connect --ip 172.20.0.10 my-net my-container

# ===== 断开容器与网络的连接 =====
docker network disconnect my-net my-container

# ===== 查看网络详情 =====
docker network inspect my-net

# ===== 删除网络 =====
docker network rm my-net

# ===== 清理未使用的网络 =====
docker network prune

# ===== 运行容器时指定网络 =====
docker run -d --network my-net --name my-app nginx:latest
```

### Docker 网络模式

| 模式 | 说明 |
|------|------|
| `bridge` | 默认模式，容器通过虚拟网桥通信 |
| `host` | 容器与宿主机共享网络命名空间 |
| `none` | 容器没有网络功能 |
| `overlay` | 用于 Swarm 集群跨主机通信 |
| `macvlan` | 为容器分配物理网络MAC地址 |
