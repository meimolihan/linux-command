docker-push
===

推送镜像到镜像仓库

## 补充说明

**docker push** 命令用于将本地镜像推送到 Docker Hub 或其他镜像仓库。推送前需要先登录仓库，且镜像必须带有正确的仓库标签。

### 语法

```shell
docker push [OPTIONS] NAME[:TAG]
```

### 选项

```shell
-a, --all-tags                # 推送镜像的所有标签
--disable-content-trust       # 跳过镜像签名（默认true）
--platform string             # 推送指定平台的镜像
-q, --quiet                   # 静默输出
```

### 常用实例

```shell
# 登录 Docker Hub
docker login

# 推送镜像到 Docker Hub
docker push myusername/myapp:latest

# 推送所有标签
docker push --all-tags myusername/myapp

# 推送到私有仓库
docker push registry.example.com/myapp:v1.0

# 先打标签再推送
docker tag myapp:latest registry.example.com/myapp:v1.0
docker push registry.example.com/myapp:v1.0

# 登录私有仓库
docker login registry.example.com -u username -p password
```
