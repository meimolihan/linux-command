kubectl
===

Kubernetes 命令行管理工具

## 补充说明

**kubectl** 是 Kubernetes 集群的命令行管理工具，用于部署应用、管理集群资源、查看日志、执行命令等。是 K8s 运维的核心工具。

### 语法

```shell
kubectl [command] [TYPE] [NAME] [flags]
```

### 常用命令

```shell
# ========== 资源查看 ==========

# 查看集群信息
kubectl cluster-info

# 查看节点
kubectl get nodes
kubectl get nodes -o wide

# 查看所有 Pod
kubectl get pods
kubectl get pods -A              # 所有命名空间
kubectl get pods -o wide          # 显示更多信息

# 查看服务
kubectl get services
kubectl get svc

# 查看部署
kubectl get deployments
kubectl get deploy

# 查看所有资源
kubectl get all
kubectl get all -A

# 查看命名空间
kubectl get namespaces
kubectl get ns

# 查看配置
kubectl get configmaps
kubectl get secrets

# ========== 部署应用 ==========

# 创建部署
kubectl create deployment nginx --image=nginx:latest

# 扩缩容
kubectl scale deployment nginx --replicas=3

# 自动扩缩容
kubectl autoscale deployment nginx --min=2 --max=10 --cpu-percent=80

# 暴露端口
kubectl expose deployment nginx --port=80 --target-port=80 --type=NodePort

# 创建资源
kubectl apply -f deployment.yaml
kubectl create -f deployment.yaml

# 删除资源
kubectl delete -f deployment.yaml
kubectl delete deployment nginx

# ========== Pod 管理 ==========

# 查看 Pod 详情
kubectl describe pod nginx-xxx

# 查看 Pod 日志
kubectl logs nginx-xxx
kubectl logs -f nginx-xxx              # 实时跟踪
kubectl logs --tail=100 nginx-xxx       # 最近100行

# 进入 Pod 执行命令
kubectl exec -it nginx-xxx -- /bin/bash
kubectl exec nginx-xxx -- ls /app

# 进入容器终端
kubectl exec -it nginx-xxx -c container-name -- /bin/sh

# 复制文件
kubectl cp file.txt nginx-xxx:/tmp/
kubectl cp nginx-xxx:/tmp/file.txt ./file.txt

# 删除 Pod
kubectl delete pod nginx-xxx
kubectl delete pod nginx-xxx --force --grace-period=0  # 强制删除

# ========== 服务管理 ==========

# 创建服务
kubectl expose pod nginx --port=80 --target-port=80

# 端口转发（本地调试）
kubectl port-forward pod/nginx-xxx 8080:80
kubectl port-forward svc/nginx 8080:80

# 查看 Service 详情
kubectl describe svc nginx

# 查看 Endpoints
kubectl get endpoints

# ========== 配置管理 ==========

# 创建 ConfigMap
kubectl create configmap my-config --from-literal=key1=value1
kubectl create configmap my-config --from-file=config.txt

# 创建 Secret
kubectl create secret generic my-secret --from-literal=password=123456
kubectl create secret tls my-tls --cert=tls.crt --key=tls.key

# 编辑 ConfigMap
kubectl edit configmap my-config

# ========== 命名空间管理 ==========

# 创建命名空间
kubectl create namespace my-namespace

# 切换默认命名空间
kubectl config set-context --current --namespace=my-namespace

# 删除命名空间
kubectl delete namespace my-namespace

# ========== 节点管理 ==========

# 查看节点详情
kubectl describe node node-name

# 标记节点不可调度
kubectl cordon node-name

# 标记节点可调度
kubectl uncordon node-name

# 驱逐节点上的 Pod
kubectl drain node-name --ignore-daemonsets

# ========== 调试排错 ==========

# 查看事件
kubectl get events
kubectl get events --sort-by='.lastTimestamp'

# 查看资源使用
kubectl top nodes
kubectl top pods

# 查看资源配额
kubectl describe resourcequota

# 测试 DNS
kubectl run -it --rm debug --image=busybox -- nslookup kubernetes

# ========== 集群管理 ==========

# 查看 API 资源
kubectl api-resources

# 查看 API 版本
kubectl api-versions

# 查看集群配置
kubectl config view

# 切换集群
kubectl config use-context context-name

# ========== 输出格式 ==========

# JSON 格式
kubectl get pods -o json

# YAML 格式
kubectl get pods -o yaml

# 自定义列
kubectl get pods -o custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[0].image

# 仅输出名称
kubectl get pods -o name

# 标签选择器
kubectl get pods -l app=nginx
kubectl get pods -l 'app in (nginx,apache)'

# 强制删除资源
kubectl patch pod nginx-xxx -p '{"metadata":{"finalizers":null}}'
```

### deployment.yaml 示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
```

### 常用命令速查

```shell
# 快速查看所有资源状态
kubectl get pods,svc,deploy -A

# 查看资源定义
kubectl explain pod
kubectl explain pod.spec.containers

# 快速创建测试 Pod
kubectl run test --image=nginx --rm -it -- sh

# 查看最近事件
kubectl get events --sort-by=.metadata.creationTimestamp

# 导出资源定义
kubectl get pod nginx-xxx -o yaml > pod.yaml

# 滚动更新
kubectl set image deployment/nginx nginx=nginx:1.22
kubectl rollout status deployment/nginx
kubectl rollout history deployment/nginx
kubectl rollout undo deployment/nginx
```
