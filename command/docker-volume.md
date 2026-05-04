docker-volume
===

管理 Docker 数据卷

## 补充说明

**docker volume** 命令用于管理 Docker 的数据卷（Volume）。数据卷是 Docker 中持久化数据的首选机制，数据卷的生命周期独立于容器，即使容器被删除，数据卷中的数据仍然保留。

### 语法

```shell
docker volume COMMAND
# 子命令: create | inspect | ls | prune | rm
```

### 常用实例

```shell
# ===== 创建数据卷 =====
docker volume create my-vol

# 创建时指定驱动和选项
docker volume create -d local my-vol

# ===== 列出数据卷 =====
docker volume ls

# 过滤显示
docker volume ls -f "dangling=true"

# ===== 查看数据卷详情 =====
docker volume inspect my-vol

# ===== 删除数据卷 =====
docker volume rm my-vol

# ===== 清理未使用的数据卷 =====
docker volume prune

# 清理所有未使用的数据卷（不提示确认）
docker volume prune -f

# ===== 在容器中使用数据卷 =====
# 使用命名卷
docker run -d -v my-vol:/data nginx:latest

# 使用绑定挂载（bind mount）
docker run -d -v /host/path:/container/path nginx:latest

# 使用只读卷
docker run -d -v my-vol:/data:ro nginx:latest

# 使用多个卷
docker run -d -v vol1:/data1 -v vol2:/data2 nginx:latest
```

### Volume 与 Bind Mount 对比

| 特性 | Volume | Bind Mount |
|------|--------|------------|
| 存储位置 | Docker 管理目录 | 宿主机任意位置 |
| 命名方式 | 有名称 | 路径即名称 |
| 可移植性 | 高 | 低 |
| 性能 | 略低 | 原生性能 |
| 备份 | 需特殊处理 | 直接复制 |
