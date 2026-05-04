docker_buildx_local
===

Docker 多架构镜像本地构建与推送教程，支持 amd64/arm64 双架构构建，并推送到 Docker Hub。

## 构建流程

> 1. 克隆项目 
> 2. 开启 Docker 多架构支持（buildx）
> 3. 登录 Docker Hub
> 4. 构建并推送多架构镜像
> 5. 验证运行 

## 第一步：克隆项目

```bash
cd /vol1/1000/compose
rm -rf /vol1/1000/compose/linux-command
git clone https://github.com/meimolihan/linux-command.git
cd linux-command
```

## 第二步：开启 Docker 多架构支持

> 构建支持 amd64 / arm64 双架构的镜像。`docker buildx create` 只需执行一次，之后每次构建直接使用即可。

```bash
# 启用 experimental 模式（Docker 旧版本需要，新版本可省略）
export DOCKER_CLI_EXPERIMENTAL=enabled

# 创建新的 buildx builder
docker buildx create --name mybuilder --use

# 启动并检查 builder
docker buildx inspect mybuilder --bootstrap
```

## 第三步：构建并推送多架构镜像

> 需要先执行 `docker login` 登录 Docker Hub。

### 完整构建命令

```bash
# 首先进入项目源码目录
cd /vol1/1000/compose/linux-command

# 先登录 Docker Hub
docker login -u mobufan

# 构建 amd64 + arm64 双架构镜像,并推送到 Docker Hub
docker buildx build \
 --platform linux/amd64,linux/arm64 \
 -t mobufan/linux-command:latest \
 -t mobufan/linux-command:2026.04.19 \
 --push \
 .
```

### 参数说明

| 参数 | 说明 |
| ------------ | ------------------------------------------------------------ |
| `--platform` | 指定目标架构，支持 `linux/amd64`、`linux/arm64`、`linux/arm/v7` |
| `--push` | 构建完成后自动推送到镜像仓库 |
| `--load` | 将镜像加载到本地 Docker（仅构建不推送时使用） |
| `-t` | 镜像标签，可同时指定多个（:latest + 版本号） |
| `-o type=docker` | 输出为本地 Docker 镜像格式（不推送） |
| `-o type=registry` | 直接推送到 registry |

> 💡 如果只想本地构建不推送，去掉 `--push`，改为加 `-o type=docker`：
> ```bash
> docker buildx build --platform linux/amd64,linux/arm64 -t mobufan/linux-command:latest -o type=docker .
> ```

## 单独构建某一架构

### 构建 amd64 到本地并推送

```bash
# 首先进入项目源码目录
cd /vol1/1000/compose/linux-command

# 先登录 Docker Hub
docker login -u mobufan

# 构建单架构 amd64 到本地
docker buildx build \
 --platform linux/amd64 \
 -t mobufan/linux-command:amd64 \
 -t mobufan/linux-command:2026.04.13-amd64 \
 --load \
 .

# amd64 架构镜像，推送到 Docker Hub
docker push mobufan/linux-command:amd64
docker push mobufan/linux-command:2026.04.13-amd64
```

### 构建 arm64 到本地并推送

```bash
# 首先进入项目源码目录
cd /vol1/1000/compose/linux-command

# 先登录 Docker Hub
docker login -u mobufan

# 构建单架构 arm64 到本地
docker buildx build \
 --platform linux/arm64 \
 -t mobufan/linux-command:arm64 \
 -t mobufan/linux-command:2026.04.13-arm64 \
 --load \
 .

# arm64 架构镜像，推送到 Docker Hub
docker push mobufan/linux-command:arm64
docker push mobufan/linux-command:2026.04.13-arm64
```

## 架构与镜像标签对照

| 架构 | 镜像标签示例 |
|------|------------|
| amd64 | `mobufan/linux-command:amd64` |
| arm64 | `mobufan/linux-command:arm64` |
| 双架构（默认） | `mobufan/linux-command:latest` |

> ⚠️ 单独构建后拉取时必须指定对应标签：
> ```bash
> docker pull mobufan/linux-command:amd64  # 仅 amd64 机器
> docker pull mobufan/linux-command:arm64  # 仅 arm64 机器（如 Mac M系列）
> docker pull mobufan/linux-command:latest # 自动匹配当前架构
> ```

## 第四步：运行容器

```bash
docker run -d \
 --name linux-command \
 --restart always \
 -p 9665:80 \
 -e TZ=Asia/Shanghai \
 mobufan/linux-command:latest
```

### 运行参数说明

| 参数 | 说明 |
|------|------|
| `-d` | 后台运行 |
| `--name` | 容器名称 |
| `--restart always` | 开机自启 |
| `-p 9665:80` | 端口映射（主机端口:容器端口） |
| `-e TZ=Asia/Shanghai` | 设置时区 |

## 常见问题

### Q: 构建失败怎么办？

```bash
# 检查 builder 状态
docker buildx inspect mybuilder

# 重新创建 builder
docker buildx rm mybuilder
docker buildx create --name mybuilder --use
docker buildx inspect mybuilder --bootstrap
```

### Q: 推送失败怎么办？

```bash
# 确认登录状态
docker login -u mobufan

# 检查镜像标签
docker images | grep linux-command
```

### Q: 如何查看构建日志？

```bash
docker buildx build --progress=plain .
```

## 相关命令速查

```bash
# 创建 builder（首次）
docker buildx create --name mybuilder --use

# 构建 amd64 + arm64 并推送
docker buildx build --platform linux/amd64,linux/arm64 -t mobufan/linux-command:latest --push .

# 本地构建测试
docker buildx build --platform linux/amd64 -t mobufan/linux-command:latest -o type=docker .

# 运行
docker run -d --name linux-command -p 9665:80 mobufan/linux-command:latest
```