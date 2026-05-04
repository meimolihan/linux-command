podman-generate
===

Podman Kubernetes YAML 生成工具

## 补充说明

**podman generate** 是 Podman 内置的 Kubernetes YAML 生成工具，可以将运行中的容器或 Pod 转换为 Kubernetes YAML 配置文件，便于迁移到 K8s 集群。

### 语法

```shell
podman generate <subcommand> [OPTIONS]
```

### kube 子命令

```shell
# 生成 Kubernetes YAML
podman generate kube mypod > pod.yaml

# 生成服务（暴露端口）
podman generate kube --service mypod > deployment.yaml

# 从正在运行的容器生成
podman generate kube mycontainer > container.yaml

# 指定 Pod 名称
podman generate kube --pod-name my-app mypod > pod.yaml
```

### 生成选项

```shell
# 生成 Service
podman generate kube --service mypod

# 不生成卷
podman generate kube --without-volumes mypod

# 指定命名空间
podman generate kube --namespace production mypod

# 使用 init 容器
podman generate kube --init-container mypod

# 添加注释
podman generate kube --annotation "description=My app" mypod

# 生成 JSON 格式
podman generate kube --format json mypod
```

### systemd 子命令

```shell
# 生成 systemd 服务文件
podman generate systemd mycontainer

# 生成服务文件到目录
podman generate systemd --files --name mycontainer

# 生成带依赖的服务
podman generate systemd --dependencies mypod

# 重新启动策略
podman generate systemd --restart-policy always mycontainer

# 不包含容器
podman generate systemd --no-header mycontainer

# 指定超时
podman generate systemd --start-timeout 60 mycontainer

# 停止超时
podman generate systemd --stop-timeout 30 mycontainer
```

### 完整示例

```shell
# 创建测试容器
podman run -d --name web \
  -p 8080:80 \
  -v web_data:/data \
  -e APP_ENV=production \
  nginx:latest

# 生成 Kubernetes YAML
podman generate kube web > web.yaml

# 查看生成的 YAML
cat web.yaml
```

### 生成的 YAML 结构

```yaml
# Pod 模式
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: "2024-01-01T00:00:00Z"
  annotations:
    podman.compose.version: "2.0"
  labels:
    app: web
  name: web
spec:
  containers:
  - name: web
    image: nginx:latest
    ports:
    - containerPort: 80
      hostPort: 8080
      protocol: TCP
    env:
    - name: APP_ENV
      value: production
    resources: {}
    volumeMounts:
    - mountPath: /data
      name: web-data
  restartPolicy: Always
  volumes:
  - name: web-data
    persistentVolumeClaim:
      claimName: web-data
```

```yaml
# Service 模式
apiVersion: v1
kind: Pod
metadata:
  name: web
spec:
  containers:
  - name: web
    image: nginx:latest
    ports:
    - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 从 Pod 生成

```shell
# 创建 Pod
podman pod create --name myapp

# 在 Pod 中运行容器
podman run -d --pod myapp --name web nginx
podman run -d --pod myapp --name api myapi:v1

# 生成 Pod YAML
podman generate kube myapp > myapp.yaml

# 生成带服务的 Pod YAML
podman generate kube --service myapp > myapp-all.yaml
```

### systemd 集成

```shell
# 创建服务容器
podman create --name myapp \
  -p 8080:80 \
  --restart=never \
  nginx:latest

# 生成 systemd 服务
podman generate systemd myapp

# 输出：
# # container-myapp.service
# [Unit]
# Description=Podman container-myapp.service
# ...

# 生成并保存
mkdir -p ~/.config/systemd/user
podman generate systemd --files --name myapp
ls ~/.config/systemd/user/container-myapp.service

# 启用服务
systemctl --user enable container-myapp.service

# 启动服务
systemctl --user start container-myapp.service

# 查看状态
systemctl --user status container-myapp.service
```

### 完整工作流

```shell
# 1. 在本地开发并测试
podman run -d --name myapp -p 8080:8080 myapp:latest

# 2. 生成 Kubernetes YAML
podman generate kube --service myapp > myapp.yaml

# 3. 手动调整 YAML（如添加资源限制）
vim myapp.yaml

# 4. 部署到 Kubernetes
kubectl apply -f myapp.yaml

# 5. 或者使用 podman play
podman play kube myapp.yaml
```

### 多容器生成

```shell
# docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx
    ports:
      - "80:80"
  api:
    image: myapi
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

```shell
# 使用 podman-compose 生成
podman-compose up -d

# 为每个服务生成 YAML
for service in web api db; do
  podman generate kube --service $service > ${service}.yaml
done

# 或者使用 podman kube play
podman-compose down
podman-compose bundle -o bundle.tar

# 生成 KubeCtl
podman-compose generate kube > app.yaml
```

### 常用命令

```shell
# 查看帮助
podman generate --help
podman generate kube --help
podman generate systemd --help

# 列出所有子命令
podman generate --list
```

### 生成的资源类型

```shell
# Pod (默认)
podman generate kube mypod

# Deployment (需要 --service)
podman generate kube --service mypod

# Kubernetes Deployment + Service
podman generate kube --service mypod > deployment.yaml

# Init Container
podman generate kube --init-container mypod

# ConfigMap (如果有环境变量文件)
podman generate kube --configmap mypod
```

### 注意事项

```shell
# Rootless 容器生成的 YAML
# 需要确保 K8s 节点支持 rootless

# 卷处理
# 本地卷会转换为 PersistentVolumeClaim
# 需要手动创建对应的 PVC

# 网络
# 默认使用 bridge 网络
# 在 K8s 中需要配置相应的网络策略
```
