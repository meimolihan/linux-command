docker-compose-down
===

停止并删除 Compose 服务容器

## 补充说明

**docker compose down** 命令用于停止并删除由 `docker compose up` 创建的容器、网络、镜像和数据卷。默认只删除容器和网络。

### 语法

```shell
docker compose down [OPTIONS]
```

### 选项

```shell
--rmi string          # 删除镜像 (all|local)
-v, --volumes         # 删除数据卷（包括命名卷）
--remove-orphans      # 删除 compose 文件中未定义的容器
-t, --timeout int     # 关闭超时时间（秒）
```

### 常用实例

```shell
# 停止并删除容器和网络
docker compose down

# 同时删除数据卷
docker compose down -v

# 同时删除所有相关镜像
docker compose down --rmi all

# 只删除本地构建的镜像
docker compose down --rmi local

# 同时删除容器、网络、镜像和数据卷
docker compose down -v --rmi all

# 删除孤立容器
docker compose down --remove-orphans

# 指定超时时间
docker compose down -t 30

# 指定 compose 文件
docker compose -f docker-compose.prod.yml down
```
