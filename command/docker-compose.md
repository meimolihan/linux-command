docker-compose
===

定义和运行多容器 Docker 应用的工具

## 补充说明

**docker-compose** 是 Docker 官方的容器编排工具，使用 YAML 文件来定义多容器应用的服务、网络和卷。通过一条命令即可创建并启动所有服务。Docker Compose V2 已集成为 `docker compose`（无横线）。

### 语法

```shell
# Compose V1（独立命令）
docker-compose [OPTIONS] COMMAND

# Compose V2（Docker 插件，推荐）
docker compose [OPTIONS] COMMAND
```

### 常用命令

```shell
docker compose up          # 创建并启动所有服务
docker compose down        # 停止并删除容器、网络、镜像和卷
docker compose start       # 启动已存在的服务容器
docker compose stop        # 停止服务容器（不删除）
docker compose restart     # 重启服务容器
docker compose ps          # 列出服务容器
docker compose logs        # 查看服务日志
docker compose build       # 构建或重建服务镜像
docker compose pull        # 拉取服务镜像
docker compose exec        # 在容器中执行命令
docker compose run         # 运行一次性命令
docker compose config      # 验证并查看 compose 文件
docker compose top         # 显示容器内进程
```

### 常用选项

```shell
-f, --file FILE        # 指定 compose 文件（默认 docker-compose.yml）
-p, --project NAME     # 指定项目名称
--profile PROFILE      # 指定启动的 profile
--env-file FILE        # 指定环境变量文件
```

### docker-compose.yml 示例

```yaml
version: "3.8"
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:
      - api
    restart: unless-stopped

  api:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./api:/app
    command: npm start
    environment:
      - DB_HOST=db
      - REDIS_HOST=redis
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: myapp
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  db_data:
```

### 常用实例

```shell
# 启动所有服务（后台运行）
docker compose up -d

# 启动指定服务
docker compose up -d web db

# 重建并启动
docker compose up -d --build

# 停止并删除所有容器
docker compose down

# 停止并删除容器及数据卷
docker compose down -v

# 查看日志
docker compose logs -f
docker compose logs -f web

# 进入容器
docker compose exec web /bin/sh

# 运行一次性命令
docker compose run --rm api npm install

# 指定配置文件
docker compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker compose ps

# 拉取最新镜像并重启
docker compose pull && docker compose up -d
```
