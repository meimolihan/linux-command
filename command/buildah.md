buildah
===

无守护进程镜像构建工具

## 补充说明

**buildah** 是 Podman 生态中的无守护进程镜像构建工具，可以单独使用或与 Podman 配合使用。支持 Dockerfile 和无 Dockerfile 方式构建镜像。

### 语法

```shell
buildah [OPTIONS] COMMAND [ARG...]
```

### 与 Podman 的关系

```shell
# buildah 构建镜像
buildah bud -t myimage:latest .

# podman 运行
podman images
podman run myimage:latest

# 可以互相替代
# buildah 是底层工具，功能更底层
# podman 是上层工具，API 更友好
```

### 无 Dockerfile 构建

```shell
# 从基础镜像创建容器
buildah from nginx:latest

# 查看正在使用的容器
buildah containers

# 挂载容器文件系统
buildah mount web

# 在容器中执行命令
buildah run web -- sh -c "echo 'hello' > /usr/share/nginx/html/index.html"

# 复制文件
buildah copy web ./src/index.html /usr/share/nginx/html/

# 设置工作目录
buildah config --workingdir /app web

# 设置环境变量
buildah config --env APP_ENV=production web

# 设置端口
buildah config --port 80 --port 443 web

# 设置入口点
buildah config --entrypoint '["/usr/sbin/nginx", "-g", "daemon off;"]' web

# 提交镜像
buildah commit web myimage:latest

# 删除正在使用的容器
buildah rm web
```

### 使用 Containerfiles

```shell
# 构建镜像（bud = build using dockerfile）
buildah bud -t myapp:latest .

# 指定 Dockerfile
buildah bud -f Dockerfile.dev -t myapp:dev .

# 指定构建上下文
buildah bud -t myapp:latest ./context

# .dockerignore 支持
buildah bud -t myapp:latest .

# 多阶段构建
buildah bud -t myapp:latest -f Dockerfile.multi .
```

### 构建选项

```shell
# 标签
buildah bud -t myapp:latest -t myapp:v1.0.0 .

# 添加注解
buildah bud --annotation "version=1.0" -t myapp .

# 标签
buildah bud --label "maintainer=admin@example.com" -t myapp .

# 移除构建过程中的中间容器
buildah bud --rm .

# 不使用缓存
buildah bud --no-cache -t myapp .

# 使用特定缓存镜像
buildah bud --cache-from mybase:latest -t myapp .

# 构建参数
buildah bud --build-arg HTTP_PROXY=http://proxy:8080 -t myapp .

# 指定平台
buildah bud --platform linux/amd64 -t myapp .

# 指定架构
buildah bud --arch arm64 -t myapp:arm64 .

# 用户命名空间
buildah bud --userns=keep-id -t myapp .
```

### 镜像层管理

```shell
# 查看镜像层
buildah images --format json

# 历史记录
buildah history myimage:latest

# 添加说明
buildah config --label "description=My application" container

# 设置启动命令
buildah config --cmd '["/start.sh"]' container

# 设置用户
buildah config --user 1000:1000 container
```

### 高级配置

```shell
# 设置工作目录
buildah config --workingdir /app container

# 设置 shell
buildah config --shell '["/bin/bash", "-c"]' container

# 复制多个文件
buildah copy container file1.txt file2.txt /app/

# 添加本地文件
buildah add container /local/path /container/path

# 设置环境变量
buildah config --env APP_ENV=production container
buildah config --env 'PATH=/usr/local/bin:$PATH' container

# 取消设置
buildah config --env APP_DEBUG= container
```

### 多架构构建

```shell
# 构建多平台镜像
buildah bud --platform linux/amd64,linux/arm64 -t myapp:latest .

# 使用 QEMU
buildah bud --platform linux/arm64 -t myapp:arm64 .

# 清单列表
buildah images
buildah manifest inspect myapp:latest
```

### 与 Podman 集成

```shell
# buildah 构建镜像到 Podman
buildah bud -t myapp:latest .

# Podman 验证
podman images | grep myapp

# 从 Podman 拉取镜像到 buildah
buildah from docker://nginx:latest

# 在 Podman 中运行
podman run -d myapp:latest
```

### 无 Dockerfile 示例

```shell
# 创建工作容器
ctr=$(buildah from fedora:latest)

# 挂载文件系统
mnt=$(buildah mount $ctr)

# 安装软件
dnf install -y --installroot=$mnt nginx

# 配置
echo "server { listen 80; location / { root /usr/share/nginx/html; } }" > $mnt/etc/nginx/conf.d/default.conf

# 设置启动
buildah config --cmd '["/usr/sbin/nginx", "-g", "daemon off;"]' $ctr

# 提交镜像
buildah commit $ctr my-nginx:latest

# 清理
buildah rm $ctr
```

### Dockerfile 构建示例

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```shell
# 构建
buildah bud -t myapp:latest .

# 查看
buildah images myapp
```

### 清理

```shell
# 删除未使用的构建容器
buildah rm --all

# 删除本地缓存
buildah image prune

# 删除所有未使用的镜像
buildah image prune -a

# 强制清理
buildah prune -f
```

### 签名和安全

```shell
# 信任镜像
buildah trust set --type reject localhost/myapp

# 签名镜像
buildah push --sign-by admin@example.com myapp:latest

# TLS 验证
buildah push --tls-verify=false myregistry/myapp:latest
```

### 常用示例

```shell
# 简单构建
buildah bud -t myapp:latest .

# 带缓存构建
buildah bud -t myapp:latest --layers .

# 详细输出
buildah bud -t myapp:latest --layers --progress=plain .

# 无缓存重新构建
buildah bud -t myapp:latest --no-cache .

# 指定构建参数
buildah bud \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t myapp:latest .

# 构建并直接运行
buildah bud -t myapp:latest .
podman run -d --name myapp myapp:latest
```

### 与 CI/CD 集成

```shell
#!/bin/bash
# 构建脚本
set -e

REGISTRY="docker.io"
IMAGE="username/myapp"
TAG=$(git rev-parse --short HEAD)

# 构建
buildah bud --layers \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t ${IMAGE}:${TAG} \
  -t ${IMAGE}:latest \
  .

# 推送
buildah push ${IMAGE}:${TAG}
buildah push ${IMAGE}:latest

# 清理
buildah image prune -f
```
