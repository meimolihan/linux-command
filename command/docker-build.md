docker-build
===

使用 Dockerfile 构建镜像

## 补充说明

**docker build** 命令用于根据 Dockerfile 和上下文（构建上下文目录）来构建 Docker 镜像。构建过程由 Docker 守护进程执行，构建上下文会在构建开始时发送给守护进程。

### 语法

```shell
docker build [OPTIONS] PATH | URL | -
```

### 选项

```shell
-t, --tag list                # 镜像名称和标签，格式: name:tag
-f, --file string             # 指定 Dockerfile 路径（默认为 PATH/Dockerfile）
--build-arg list              # 设置构建时的变量
--no-cache                    # 构建时不使用缓存
--platform string             # 设置目标平台 (如 linux/amd64, linux/arm64)
--target string               # 构建指定的构建阶段
--progress string             # 设置进度输出类型 (auto|plain|tty)
--network string              # 构建过程中使用的网络模式
--rm                          # 构建成功后删除中间容器（默认true）
--force-rm                    # 始终删除中间容器
-q, --quiet                   # 静默模式，构建成功后只输出镜像ID
--label list                  # 设置镜像元数据
--push                        # 构建并推送到仓库（BuildKit）
--secret stringArray          # 传递密钥给构建（BuildKit）
--ssh stringArray             # 传递 SSH agent 套接字给构建（BuildKit）
```

### 常用实例

```shell
# 在当前目录构建镜像
docker build -t myapp:latest .

# 指定 Dockerfile 路径
docker build -f /path/to/Dockerfile -t myapp:latest .

# 不使用缓存构建
docker build --no-cache -t myapp:latest .

# 传递构建参数
docker build --build-arg VERSION=1.0 -t myapp:latest .

# 多平台构建
docker build --platform linux/amd64,linux/arm64 -t myapp:latest .

# 构建指定阶段（多阶段构建）
docker build --target builder -t myapp:builder .

# 从 Git 仓库构建
docker build -t myapp:latest https://github.com/user/repo.git

# 从标准输入读取 Dockerfile
echo -e "FROM alpine\nRUN echo hello" | docker build -t myapp:latest -

# 静默构建
docker build -q -t myapp:latest .
```

### Dockerfile 多阶段构建示例

```dockerfile
# 构建阶段
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
