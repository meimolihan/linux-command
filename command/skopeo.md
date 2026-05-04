skopeo
===

容器镜像检查和复制工具

## 补充说明

**skopeo** 是 Podman 生态中的镜像检查和复制工具，支持在不同容器registries之间复制镜像，检查镜像元数据，无需下载完整镜像即可查看信息。

### 语法

```shell
skopeo [OPTIONS] COMMAND [ARG...]
```

### 基本功能

```shell
# 复制镜像
skopeo copy docker://nginx:latest docker://myregistry/nginx:latest

# 检查镜像
skopeo inspect docker://nginx:latest

# 同步镜像
skopeo sync docker://nginx:latest dir:///tmp/images

# 登录到仓库
skopeo login docker.io
skopeo login --username user myregistry:5000
```

### 镜像检查

```shell
# 查看镜像信息（无需拉取）
skopeo inspect docker://nginx:latest

# 输出示例：
# {
#     "Name": "docker.io/library/nginx:latest",
#     "Tag": "latest",
#     "Digest": "sha256:...",
#     "Architecture": "amd64",
#     "Os": "linux",
#     "Config": {...},
#     "Created": "2024-..."
# }

# 查看私有镜像
skopeo inspect --creds=user:pass docker://myregistry/private:latest

# 查看签名
skopeo inspect --policy policy.json docker://myregistry/image:latest

# 原始配置
skopeo inspect --raw docker://nginx:latest
```

### 镜像复制

```shell
# 复制镜像
skopeo copy docker://source.com/image:latest docker://dest.com/image:latest

# 复制到本地目录
skopeo copy docker://nginx:latest dir:///tmp/myimages

# 从本地目录复制
skopeo copy dir:///tmp/myimages docker://myregistry/myimage:latest

# OCI 格式
skopeo copy docker://nginx:latest oci:///tmp/nginx:latest

# Docker 镜像归档
skopeo copy docker://nginx:latest docker-archive:/tmp/nginx.tar

# 加载归档
skopeo copy docker-archive:/tmp/nginx.tar containers-storage:localhost/nginx:latest
```

### 多架构镜像

```shell
# 复制所有架构
skopeo copy docker://source/manifest-list:latest docker://dest/manifest-list:latest

# 指定架构
skopeo copy --override-arch amd64 docker://source/image:latest docker://dest/image:amd64

# 指定 OS
skopeo copy --override-os linux docker://source/image:latest docker://dest/image:linux
```

### 认证

```shell
# 交互式登录
skopeo login docker.io

# 命令行登录
skopeo login --username user --password-stdin myregistry.com

# 读取密码文件
cat ~/password.txt | skopeo login --username user myregistry.com

# 登出
skopeo logout docker.io

# 查看已登录仓库
skopeo login --get-login docker.io
```

### TLS 配置

```shell
# 跳过 TLS 验证（不推荐）
skopeo copy --dest-tls-verify=false docker://insecure-registry:5000/image docker://other/insecure:latest

# 指定 CA 证书
skopeo copy --dest-cert-dir=/path/to/certs docker://source/image docker://dest/image

# 使用 skopeo.conf
# /etc/containers/registries.conf
```

### 镜像同步

```shell
# 同步到目录
skopeo sync docker://nginx:latest dir:///tmp/images

# 同步到仓库
skopeo sync docker://nginx:latest docker://myregistry/nginx:latest

# 从目录同步到仓库
skopeo sync dir:///tmp/images docker://myregistry/

# 同步多个标签
skopeo sync docker://nginx:latest dir:///tmp/nginx \
  --all-tags

# 同步多个镜像
skopeo sync \
  docker://nginx:latest \
  docker://redis:alpine \
  docker://postgres:15 \
  dir:///tmp/images
```

### 镜像签名

```shell
# 检查签名策略
skopeo inspect --policy /etc/containers/policy.json docker://signed-image:latest

# 复制并验证签名
skopeo copy --sign-by admin@example.com docker://src/image docker://dest/image

# 复制并添加签名
skopeo copy --sign-by admin@example.com \
  docker://myregistry/unsigned:latest \
  docker://myregistry/signed:latest

# 仅复制签名
skopeo copy --仅-signature-scheme atomic \
  docker://source/signed:latest \
  docker://dest/signed:latest
```

### 清单操作

```shell
# 查看镜像清单
skopeo inspect --raw docker://nginx:latest | jq .manifests

# 创建清单列表
skopeo manifest create myapp:multi \
  myapp:amd64 \
  myapp:arm64

# 添加清单
skopeo manifest add myapp:multi myapp:arm/v7

# 推送清单列表
skopeo manifest push myapp:multi docker://myregistry/myapp:multi

# 删除镜像标签
skopeo remove docker://myregistry/myapp:old-tag
```

### registries 配置

```shell
# /etc/containers/registries.conf 示例
# [registries.search]
# registries = ['docker.io', 'quay.io']
#
# [registries.block]
# registries = ['registry.untrusted.com']
#
# [[registries.insecure]]
# registries = ['myinsecure.local:5000']
```

### 策略文件

```shell
# /etc/containers/policy.json 示例
{
    "default": [{"type": "reject"}],
    "transports": {
        "docker": {
            "myregistry.com": [{
                "type": "insecureAcceptAnything"
            }]
        },
        "docker-daemon": {
            "": [{"type": "insecureAcceptAnything"}]
        }
    }
}
```

### 常用示例

```shell
# 检查镜像层大小
skopeo inspect docker://nginx:latest | jq '.LayersData'

# 导出镜像到文件
skopeo copy docker://nginx:latest docker-archive:/tmp/nginx.tar

# 导入镜像
skopeo copy docker-archive:/tmp/nginx.tar containers-storage:localhost/nginx

# 批量导出
for img in nginx redis postgres; do
  skopeo copy docker://$img:latest dir:///tmp/images/$img
done

# 离线复制
skopeo copy docker://source/image docker-archive:/tmp/image.tar
# (传输到目标机器)
skopeo copy docker-archive:/tmp/image.tar docker://dest/image

# 清理未使用的镜像
podman system prune -a
```

### 镜像清理

```shell
# 检查未引用的层
skopeo cleanup

# 使用 --platform 过滤
skopeo copy --override-arch arm64 \
  docker://source/image:latest \
  docker://dest/image:arm64
```

### 与其他工具对比

| 工具 | 主要用途 |
|------|----------|
| skopeo | 检查和复制镜像 |
| buildah | 构建镜像 |
| podman | 运行和管理容器 |
| podman-compose | 多容器编排 |

### 常用命令速查

```shell
# 检查
skopeo inspect docker://nginx:latest
skopeo inspect --creds=user:pass docker://private/image:latest

# 复制
skopeo copy docker://source docker://dest
skopeo copy docker://source docker-archive:/path.tar
skopeo copy dir:///source docker://dest

# 同步
skopeo sync docker://image dir:///path
skopeo sync dir:///path docker://dest

# 认证
skopeo login registry.com
skopeo logout registry.com

# 清单
skopeo manifest create new:tag old:tag
skopeo manifest push manifest:tag docker://dest
```
