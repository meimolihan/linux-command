helm
===

Kubernetes 包管理器

## 补充说明

**Helm** 是 Kubernetes 的包管理器，用于管理 Kubernetes 应用的安装、升级、回滚和删除。Helm 使用 Chart 来定义、安装和管理应用。

### 语法

```shell
helm [command] [options]
```

### 仓库管理

```shell
# 添加 Helm 仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://charts.helm.sh/stable
helm repo add aliyan https://kubernetes.oss-cn-hangzhou.aliyuncs.com/charts

# 查看仓库列表
helm repo list
helm repo ls

# 更新仓库索引
helm repo update

# 删除仓库
helm repo remove repo-name
```

### 搜索 Chart

```shell
# 搜索仓库中的 Chart
helm search repo nginx
helm search repo nginx --versions

# 从 Artifact Hub 搜索
helm search hub nginx

# 查看 Chart 详情
helm show chart bitnami/nginx
helm show readme bitnami/nginx
helm show values bitnami/nginx
helm show all bitnami/nginx
```

### 安装管理

```shell
# 安装 Chart
helm install my-nginx bitnami/nginx

# 安装时指定命名空间
helm install my-nginx bitnami/nginx -n my-namespace --create-namespace

# 安装时配置参数
helm install my-nginx bitnami/nginx --set service.type=NodePort

# 使用 values 文件安装
helm install my-nginx bitnami/nginx -f values.yaml

# 安装时设置多种参数
helm install my-nginx bitnami/nginx \
  --set replicaCount=3 \
  --set service.type=NodePort \
  --set persistence.enabled=true
```

### 升级回滚

```shell
# 升级应用
helm upgrade my-nginx bitnami/nginx

# 升级并添加新参数
helm upgrade my-nginx bitnami/nginx --set replicaCount=5

# 升级并安装（推荐）
helm upgrade --install my-nginx bitnami/nginx

# 查看历史版本
helm history my-nginx

# 回滚到上一版本
helm rollback my-nginx

# 回滚到指定版本
helm rollback my-nginx 2

# 更新 values 文件
helm upgrade my-nginx bitnami/nginx -f new-values.yaml
```

### 查看状态

```shell
# 查看已安装的 Release
helm list
helm ls
helm list -A                    # 所有命名空间
helm list --all-namespaces

# 查看 Release 状态
helm status my-nginx

# 查看 Release 历史
helm history my-nginx

# 查看 Release 的 values
helm get values my-nginx
helm get values my-nginx --all

# 查看 Release 的 manifest
helm get manifest my-nginx

# 查看 Release 的 notes
helm get notes my-nginx
```

### 删除应用

```shell
# 删除 Release
helm uninstall my-nginx

# 删除时保留历史记录
helm uninstall my-nginx --keep-history

# 强制删除卡住的 Release
kubectl delete secret -l owner=helm,name=my-nginx
```

### 创建 Chart

```shell
# 创建新 Chart
helm create mychart

# Chart 结构
mychart/
├── Chart.yaml          # Chart 元数据
├── values.yaml         # 默认配置值
├── charts/             # 依赖 Chart
├── templates/          # 模板文件
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── NOTES.txt
└── templates/tests/    # 测试文件

# 验证 Chart
helm lint mychart

# 打包 Chart
helm package mychart

# 从本地安装
helm install my-nginx ./mychart-0.1.0.tgz
```

### Chart 开发

```shell
# Chart.yaml 示例
apiVersion: v2
name: mychart
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.0.0"

# 调试模板渲染
helm template my-nginx mychart
helm template my-nginx mychart --debug

# 验证模板语法
helm lint mychart --strict

# 更新依赖
helm dependency update mychart
helm dependency build mychart
```

### 常用配置

```yaml
# values.yaml 常用配置示例
replicaCount: 3

image:
  repository: nginx
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

nodeSelector: {}
tolerations: []
affinity: {}
```

### 插件管理

```shell
# 安装插件
helm plugin install https://github.com/example/helm-plugin

# 查看已安装插件
helm plugin list

# 更新插件
helm plugin update plugin-name

# 卸载插件
helm plugin uninstall plugin-name
```

### 常用命令速查

```shell
# 一键安装常用应用
helm install nginx bitnami/nginx --set service.type=NodePort
helm install redis bitnami/redis
helm install mysql bitnami/mysql

# 批量查看状态
helm list -A | grep -E "NAME|nginx"

# 导出 values 文件
helm get values my-nginx -o yaml > my-values.yaml

# 强制重新部署
helm upgrade my-nginx bitnami/nginx --force
```
