podman-compose
===

Podman 多容器编排工具

## 补充说明

**podman-compose** 是 Docker Compose 的 Podman 替代品，用于定义和运行多容器应用。通过 YAML 文件配置服务、网络和卷，然后一键启动所有容器。

### 语法

```shell
podman-compose [OPTIONS] [COMMAND]
```

### 安装

```shell
# pip 安装
pip install podman-compose

# 从源码安装
git clone https://github.com/containers/podman-compose.git
cd podman-compose
pip install -e .

# 使用 pipx
pipx install podman-compose
```

### 基本用法

```shell
# 启动服务
podman-compose up

# 后台运行
podman-compose up -d

# 指定文件
podman-compose -f docker-compose.yml up

# 指定项目名称
podman-compose -p myproject up
```

### docker-compose.yml 示例

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - frontend

  api:
    image: node:18
    working_dir: /app
    volumes:
      - ./api:/app
    command: npm start
    networks:
      - frontend
      - backend
    environment:
      - DB_HOST=db
      - DB_PORT=5432

  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - backend

  redis:
    image: redis:7-alpine
    networks:
      - backend

networks:
  frontend:
  backend:

volumes:
  db_data:
```

### 服务管理

```shell
# 启动所有服务
podman-compose up -d

# 带构建启动
podman-compose up --build

# 只启动特定服务
podman-compose up -d web

# 停止服务
podman-compose down

# 停止并删除卷
podman-compose down -v

# 停止并删除镜像
podman-compose down --rmi local

# 重启服务
podman-compose restart
podman-compose restart web

# 查看状态
podman-compose ps
```

### 构建选项

```shell
# 构建镜像
podman-compose build

# 构建特定服务
podman-compose build web

# 不使用缓存构建
podman-compose build --no-cache

# 构建并启动
podman-compose up --build
```

### 日志和调试

```shell
# 查看日志
podman-compose logs

# 实时日志
podman-compose logs -f

# 特定服务日志
podman-compose logs -f web

# 最近日志
podman-compose logs --tail=100

# 后台运行
podman-compose up -d
```

### 执行命令

```shell
# 在服务中执行命令
podman-compose exec web ls -la

# 交互式执行
podman-compose exec -it web /bin/bash

# 指定用户
podman-compose exec --user 1000 web whoami

# 运行一次性命令
podman-compose run web npm test
```

### 卷管理

```shell
# 查看卷
podman-compose volume ls

# 检查卷
podman-compose volume inspect myapp_db_data

# 清理未使用的卷
podman-compose down -v

# 创建卷
podman-compose volume create myvolume
```

### 网络管理

```shell
# 查看网络
podman-compose network ls

# 检查网络
podman-compose network inspect myapp_frontend
```

### 环境变量

```shell
# .env 文件
# POSTGRES_PASSWORD=secret
# REDIS_HOST=redis

# docker-compose.yml 引用
environment:
  - DB_HOST=${REDIS_HOST}
  - DB_PASSWORD=${POSTGRES_PASSWORD}
```

### 扩展配置

```shell
# 使用扩展字段
x-common: &common
  restart: unless-stopped
  logging:
    driver: "json-file"
    options:
      max-size: "10m"

services:
  web:
    <<: *common
    image: nginx

  api:
    <<: *common
    image: node:18
```

### 健康检查

```shell
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 资源限制

```shell
services:
  web:
    image: nginx
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 常用示例

```shell
# LNMP 环境
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./www:/usr/share/nginx/html
    depends_on:
      - php
    networks:
      - app

  php:
    image: php:8-fpm
    volumes:
      - ./www:/var/www/html
    networks:
      - app

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: myapp
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app

volumes:
  mysql_data:

networks:
  app:
```

```shell
# Node.js + MongoDB
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
    depends_on:
      mongo:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongo:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongo_data:
```
