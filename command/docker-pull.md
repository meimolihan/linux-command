docker-pull
===

从镜像仓库拉取镜像

## 补充说明

**docker pull** 命令用于从 Docker Hub 或其他镜像仓库拉取镜像到本地。默认从 Docker Hub 拉取，也可以指定私有仓库地址。

### 语法

```shell
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
```

### 选项

```shell
-a, --all-tags                # 拉取镜像的所有标签
--platform string             # 拉取指定平台的镜像
-q, --quiet                   # 静默输出
--disable-content-trust       # 跳过镜像验证（默认true）
```

### 常用实例

```shell
# 拉取最新版镜像
docker pull nginx

# 拉取指定标签的镜像
docker pull nginx:1.25-alpine
docker pull python:3.12-slim

# 拉取指定平台镜像
docker pull --platform linux/arm64 nginx:latest

# 从私有仓库拉取
docker pull registry.example.com/myapp:v1.0

# 拉取镜像的所有标签
docker pull -a alpine

# 使用镜像摘要拉取（确保获取特定版本）
docker pull nginx@sha256:abc123...
```
