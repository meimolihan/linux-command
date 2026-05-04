podman-play
===

Podman Kubernetes YAML 运行工具

## 补充说明

**podman play kube** 是 Podman 内置的命令，用于从 Kubernetes YAML 文件创建和运行 Pod、Deployment、Service 等资源。与 podman generate kube 配合使用。

### 语法

```shell
podman play kube [OPTIONS] KUBEFILE
podman kube play [OPTIONS] KUBEFILE
```

### 基本用法

```shell
# 从 YAML 运行
podman play kube pod.yaml

# 使用标准输入
cat pod.yaml | podman play kube -

# 后台运行
podman play kube --down pod.yaml
podman play kube pod.yaml

# 停止并删除
podman play kube --down pod.yaml
```

### 资源管理

```shell
# 查看运行中的 Pod
podman pod ls

# 查看所有容器
podman ps -a --pod

# 查看日志
podman pod logs mypod

# 停止
podman pod stop mypod

# 启动
podman pod start mypod

# 删除
podman pod rm -f mypod
```

### 网络配置

```shell
# 创建自定义网络
podman network create mynet

# 使用自定义网络
podman play kube --network mynet pod.yaml

# 多个网络
podman play kube --network frontend,backend pod.yaml

# 无网络
podman play kube --network none pod.yaml
```

### 签名和认证

```shell
# 使用认证拉取镜像
podman login myregistry.com

# 指定签名策略
podman play kube --policy /etc/containers/policy.json pod.yaml

# TLS 验证
podman play kube --tls-verify=false insecure.yaml
```

### 卷配置

```shell
# 使用命名卷
podman play kube --volumes myvolume.yaml pod.yaml

# 指定卷源
podman play kube pod-with-volumes.yaml

# 卷会从 YAML 自动创建
```

### 完整示例

```yaml
# web-app.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
  - name: web
    image: nginx:alpine
    ports:
    - containerPort: 80
      hostPort: 8080
    env:
    - name: APP_ENV
      value: production
    resources:
      limits:
        memory: "128Mi"
        cpu: "500m"
      requests:
        memory: "64Mi"
        cpu: "250m"
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 3
      periodSeconds: 5
```

```shell
# 运行
podman play kube web-app.yaml

# 验证
podman pod ls
podman ps
curl localhost:8080
```

### Deployment 模式

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
```

```shell
# Podman 会自动创建 Pod
podman play kube deployment.yaml

# 查看
podman pod ls
```

### 多容器 Pod

```yaml
# multi-container.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-db
spec:
  containers:
  - name: app
    image: myapp:latest
    ports:
    - containerPort: 3000
    env:
    - name: DB_HOST
      value: localhost
    depends_on:
      - database
    resources:
      limits:
        memory: "256Mi"

  - name: database
    image: postgres:14
    ports:
    - containerPort: 5432
    env:
    - name: POSTGRES_PASSWORD
      value: secret
    - name: POSTGRES_DB
      value: myapp
    resources:
      limits:
        memory: "512Mi"
    volumeMounts:
    - name: db-data
      mountPath: /var/lib/postgresql/data

  volumes:
  - name: db-data
    emptyDir: {}
```

```shell
podman play kube multi-container.yaml
podman pod logs app-with-db
```

### Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

```shell
# Service 需要与 Pod 一起使用
# 通常在同一个文件中定义
```

### ConfigMap 和 Secret

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "localhost"
  CACHE_ENABLED: "true"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # echo -n "secretpass" | base64
  DB_PASSWORD: c2VjcmV0cGFzcw==
---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:latest
    envFrom:
    - configMapRef:
        name: app-config
    - secretRef:
        name: app-secrets
```

```shell
podman play kube configmap.yaml
```

### 完整微服务示例

```yaml
# microservices.yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: frontend
  labels:
    tier: frontend
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
    resources:
      limits:
        memory: "128Mi"
---
apiVersion: v1
kind: Pod
metadata:
  name: api
  labels:
    tier: backend
spec:
  containers:
  - name: api
    image: node:18
    workingDir: /app
    command: ["npm", "start"]
    ports:
    - containerPort: 3000
    resources:
      limits:
        memory: "512Mi"
---
apiVersion: v1
kind: Pod
metadata:
  name: db
  labels:
    tier: database
spec:
  containers:
  - name: postgres
    image: postgres:14
    ports:
    - containerPort: 5432
    env:
    - name: POSTGRES_PASSWORD
      value: devpassword
    - name: POSTGRES_DB
      value: myapp
    resources:
      limits:
        memory: "1Gi"
---
apiVersion: v1
kind: Pod
metadata:
  name: redis
  labels:
    tier: cache
spec:
  containers:
  - name: redis
    image: redis:alpine
    ports:
    - containerPort: 6379
    resources:
      limits:
        memory: "256Mi"
```

```shell
# 运行所有服务
podman play kube microservices.yaml

# 查看
podman pod ls

# 查看日志
podman logs frontend
podman logs api
```

### 选项详解

```shell
# --network: 指定网络
podman play kube --network host pod.yaml

# --no-hostname: 不使用 Pod 名称作为主机名
podman play kube --no-hostname pod.yaml

# --seccomp-profile-root: 指定 Seccomp 配置目录
podman play kube --seccomp-profile-root /etc/seccomp pod.yaml

# --userns: 用户命名空间模式
podman play kube --userns=keep-id pod.yaml

# --label: 添加标签
podman play kube --label "env=dev" pod.yaml

# --tls-verify: TLS 验证
podman play kube --tls-verify=false pod.yaml
```

### 从 Docker Compose 迁移

```yaml
# docker-compose.yml 转换为 Kubernetes YAML
version: '3.8'
services:
  web:
    image: nginx
    ports:
      - "80:80"
    depends_on:
      - api
  api:
    image: myapi
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: secret
```

```shell
# 使用工具转换
# docker-compose to kubernetes
# podman-compose generate kube > app.yaml

# 然后用 podman play 运行
podman play kube app.yaml
```

### 工作流

```shell
# 1. 在本地开发
podman run -d --name web -p 8080:80 nginx

# 2. 生成 Kubernetes YAML
podman generate kube --service web > web.yaml

# 3. 在本地用 Podman 测试
podman play kube --down web.yaml
podman play kube web.yaml

# 4. 如果测试通过，可以部署到 K8s
kubectl apply -f web.yaml

# 5. 或者保存 YAML 用于其他环境
scp web.yaml user@server:
```
