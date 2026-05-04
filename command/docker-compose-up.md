docker-compose-up
===

创建并启动 Compose 服务

## 补充说明

**docker compose up** 命令用于根据 docker-compose.yml 文件创建并启动所有服务容器。这是 Compose 最核心的命令。

### 语法

```shell
docker compose up [OPTIONS] [SERVICE...]
```

### 选项

```shell
-d, --detach                  # 后台运行
--build                       # 启动前构建镜像
--no-build                    # 不构建镜像，即使缺失
--pull string                 # 启动前拉取镜像策略 (always|missing|never)
--force-recreate              # 强制重建容器
--no-recreate                 # 不重建容器（如容器已存在）
--no-deps                     # 不启动关联服务
--remove-orphans              # 删除 compose 文件中未定义的容器
--scale SERVICE=NUM           # 扩展服务容器数量
-t, --timeout int             # 关闭超时时间（秒）
--exit-code-from SERVICE      # 返回指定服务的退出码
--abort-on-container-exit     # 任意容器退出时停止所有容器
```

### 常用实例

```shell
# 前台启动所有服务
docker compose up

# 后台启动所有服务
docker compose up -d

# 启动指定服务
docker compose up -d web redis

# 启动前构建镜像
docker compose up -d --build

# 强制重建所有容器
docker compose up -d --force-recreate

# 拉取最新镜像后启动
docker compose up -d --pull always

# 扩展服务实例数
docker compose up -d --scale api=3

# 删除孤立容器
docker compose up -d --remove-orphans

# 任意容器退出时停止全部
docker compose up --abort-on-container-exit

# 查看哪个服务退出
docker compose up --abort-on-container-exit --exit-code-from api
```
