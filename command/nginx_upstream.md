nginx_upstream
===

nginx 负载均衡 upstream 配置块

## 补充说明

**upstream** 指令用于定义一组后端服务器，供 `proxy_pass` 引用。nginx 支持多种负载均衡算法：轮询、加权轮询、IP 哈希、最少连接等。

### 语法

```nginx
upstream name {
    server address [parameters];
    ...
}
```

### 负载均衡算法

```nginx
# 1. 轮询（默认）
upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

# 2. 加权轮询
upstream backend {
    server 192.168.1.10:8080 weight=5;
    server 192.168.1.11:8080 weight=2;
    server 192.168.1.12:8080 weight=1;
}

# 3. IP 哈希（同一 IP 访问同一后端）
upstream backend {
    ip_hash;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

# 4. 最少连接
upstream backend {
    least_conn;
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}
```

### server 参数

```nginx
upstream backend {
    server 192.168.1.10:8080
        weight=5              # 权重
        max_fails=3           # 最大失败次数（默认1）
        fail_timeout=10s     # 失败超时时间（默认10s）
        backup               # 备份服务器
        down                 # 标记为下线
        max_conns=200        # 最大并发连接数
        resolve              # 动态 DNS 解析
        slow_start=30s       # 慢启动时间（商业版）
        route=user            # 路由标记（商业版）
        sbit=0               # 慢连接标记（商业版）
        keepalive=32         # 空闲长连接数
        keepalive_timeout=60s  # 空闲超时
        keepalive_requests=1000;  # 最大请求数
}
```

### 完整示例

```nginx
# 定义上游服务器组
upstream app_servers {
    least_conn;
    
    server 192.168.1.10:8080 weight=5 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 weight=3 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8080 backup;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://app_servers;
        
        # 代理头设置
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # 超时设置
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
}
```

### HTTP/2 跳转服务器

```nginx
upstream backend_http2 {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend_http2;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

### 连接保持（Keep-Alive）

```nginx
upstream backend {
    server 127.0.0.1:8080;
    keepalive 32;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

### 健康检查

```nginx
upstream backend {
    server 192.168.1.10:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:8080 max_fails=3 fail_timeout=30s;
}
```

### zone 共享内存（商业版 / Plus）

```nginx
upstream backend {
    zone backend_pool 64k;
    server 192.168.1.10:8080;
}
```

### 常见问题

```shell
# 1. 所有后端都 down 了会怎样？
# → nginx 会使用最后配置的 server（即使标记了 down）

# 2. backup 服务器什么时候启用？
# → 只有非 backup 服务器全部 down 时才启用

# 3. max_fails 是怎么计算的？
# → 连续失败达到次数后，该 server 被标记为 down
# → fail_timeout 时间后重新尝试

# 4. 如何查看后端状态？
# → nginx_upstream_check_module 模块支持主动健康检查
```
