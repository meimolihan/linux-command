traefik
===

云原生反向代理/负载均衡器

## 补充说明

**traefik** 是为云原生设计的现代反向代理和负载均衡器，支持 Docker、Kubernetes、Consul、Etcd 等多种后端，自动服务发现和动态配置。

### 语法

```shell
traefik [command] [--flag flag_arg]
traefik
traefik --configFile traefik.yml
```

### 配置文件

```yaml
# traefik.yml 基础配置

# 入口点
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

# 静态配置
api:
  dashboard: true
  insecure: true

# 日志
log:
  level: INFO
  filePath: /var/log/traefik/traefik.log

# 访问日志
accessLog:
  filePath: /var/log/traefik/access.log
  format: json

# 证书
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

# 提供商
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
  file:
    directory: /etc/traefik/dynamic
    watch: true
  kubernetescrd:
    enabled: true
```

### 入口点配置

```yaml
entryPoints:
  # HTTP 入口
  web:
    address: ":80"
    
  # HTTPS 入口
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

  # TCP 入口
  mysql:
    address: ":3306"

  # Unix Socket
  unix:
    address: "unix:///var/run/traefik/traefik.sock"
```

### Docker 提供商

```yaml
# docker-compose.yml 标签
version: "3"

services:
  nginx:
    image: nginx
    labels:
      # 启用 traefik
      - "traefik.enable=true"
      
      # 路由规则
      - "traefik.http.routers.nginx.rule=Host(`example.com`)"
      - "traefik.http.routers.nginx.entrypoints=websecure"
      - "traefik.http.routers.nginx.tls.certresolver=letsencrypt"
      
      # 服务配置
      - "traefik.http.services.nginx.loadbalancer.server.port=80"
      
      # 中间件
      - "traefik.http.middlewares.nginx-auth.basicauth.users=admin:$$apr1$$H6uskkkW$$IgXLP6ewTrSuBkTrqE8wj/,test:$$apr1$$PdAgWa7$$EQJ7CG8pBGH1RVmuW0q6D1"
      
      # 重试
      - "traefik.http.middlewares.nginx-retry.retry.attempts=3"
      
      # 速率限制
      - "traefik.http.middlewares.nginx-rate.ratelimit.average=100"
      - "traefik.http.middlewares.nginx-rate.ratelimit.burst=50"

networks:
  default:
    external: true
    name: traefik
```

### 中间件

```yaml
# 中间件配置

http:
  middlewares:
    # 基础认证
    auth:
      basicAuth:
        users:
          - "admin:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/"

    # IP 白名单
    ipwhitelist:
      ipWhiteList:
        sourceRange:
          - "192.168.1.0/24"
          - "10.0.0.0/8"

    # 速率限制
    ratelimit:
      rateLimit:
        average: 100
        burst: 50

    # 重试
    retry:
      retry:
        attempts: 3

    # 压缩
    compress:
      compress: {}

    # 重定向
    redirect:
      redirectRegex:
        regex: "^http://example\\.com/(.*)"
        replacement: "https://www.example.com/$1"
        permanent: true

    # 请求头
    headers:
      headers:
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        sslRedirect: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
```

### 路由配置

```yaml
# 文件提供商的路由
http:
  routers:
    # API 路由
    api:
      rule: "PathPrefix(`/api`)"
      service: api
      entryPoints:
        - websecure
      tls: {}

    # 静态网站
    website:
      rule: "Host(`example.com`)"
      service: website
      entryPoints:
        - web
        - websecure

  services:
    # 负载均衡服务
    api:
      loadBalancer:
        servers:
          - url: "http://backend1:8080"
          - url: "http://backend2:8080"
          - url: "http://backend3:8080"
        healthCheck:
          path: /health
          interval: 10s
          timeout: 3s

    website:
      loadBalancer:
        servers:
          - url: "http://frontend:3000"
```

### TLS 配置

```yaml
# TLS 选项
tls:
  options:
    default:
      minVersion: VersionTLS12
      cipherSuites:
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
      sniStrict: true
```

### 命令行选项

```shell
# 基本启动
traefik

# 指定配置
traefik --configFile traefik.yml

# 静态配置
traefik --api --providers.docker --providers.kubernetescrd

# 入口点
traefik --entryPoints.web.address=:80 --entryPoints.websecure.address=:443

# 日志
traefik --log.level=DEBUG
traefik --accesslog

# TLS
traefik --certificatesresolvers.letsencrypt.acme.email=admin@example.com
traefik --certificatesresolvers.letsencrypt.acme.storage=acme.json
traefik --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web

# Docker 提供商
traefik --providers.docker.endpoint=unix:///var/run/docker.sock
traefik --providers.docker.exposedByDefault=false

# API
traefik --api.insecure=true
traefik --api.dashboard=true

# 端口
traefik --api.port=8080
traefik --ping.port=8082
```

### Docker Compose 部署

```yaml
version: "3.3"

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
      - ./logs:/var/log/traefik
    restart: unless-stopped
    networks:
      - traefik

networks:
  traefik:
    name: traefik
    external: true
```

### Kubernetes Ingress

```yaml
# 安装 CRD
# kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.10/docs/content/reference/dynamic-configuration/kubernetes-crd-definition.yml

# IngressRoute
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: myingressroute
spec:
  entryPoints:
    - web
    - websecure
  routes:
    - match: Host(`example.com`) && PathPrefix(`/api`)
      kind: Rule
      services:
        - name: api-service
          port: 8080
    - match: Host(`example.com`)
      kind: Rule
      services:
        - name: web-service
          port: 80
  tls:
    certResolver: letsencrypt
```

### Middleware CRD

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: auth
spec:
  basicAuth:
    secret: authsecret

---
apiVersion: v1
kind: Secret
metadata:
  name: authsecret
type: kubernetes.io/basic-auth
data:
  # admin:admin 的 base64 编码
  users: |2
    YWRtaW46JGFwcjEkbEd6aDlzVjBkLnVuLkVkR0dNZXc=
```

### 常用配置示例

```yaml
# 完整配置示例

global:
  checkNewVersion: true
  sendAnonymousUsage: false

api:
  dashboard: true
  insecure: true

log:
  level: INFO
  filePath: /var/log/traefik/traefik.log

accessLog:
  filePath: /var/log/traefik/access.log
  format: json

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik
  file:
    directory: /etc/traefik/dynamic
    watch: true
  kubernetescrd:
    enabled: true
```

### 动态配置

```yaml
# /etc/traefik/dynamic/services.yml
http:
  services:
    my-service:
      loadBalancer:
        servers:
          - url: "http://backend:8080"

---
# /etc/traefik/dynamic/middleware.yml
http:
  middlewares:
    secure-headers:
      headers:
        sslRedirect: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
```
