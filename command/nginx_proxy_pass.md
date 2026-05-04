nginx_proxy_pass
===

nginx 反向代理配置指令

## 补充说明

**proxy_pass** 是 nginx 中最重要的指令之一，用于配置反向代理，将客户端请求转发到后端服务器。支持 HTTP、HTTPS、FastCGI、uwsgi、SCGI、gRPC 等协议。

### 语法

```nginx
proxy_pass URL;
```

### 常用实例

```nginx
# 基本反向代理
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend_server;
    }
}

# 代理到 HTTPS 后端
location / {
    proxy_pass https://backend_server;
}

# 代理到本地端口
location / {
    proxy_pass http://127.0.0.1:8080;
}

# 代理到 Unix Socket
location / {
    proxy_pass http://unix:/var/run/app.sock;
}
```

### 常用 proxy_set_header

```nginx
location / {
    proxy_pass http://backend;
    
    # 设置转发头
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
}
```

### 超时配置

```nginx
location / {
    proxy_pass http://backend;
    
    # 连接超时
    proxy_connect_timeout 60s;
    
    # 发送请求超时
    proxy_send_timeout 60s;
    
    # 读取响应超时
    proxy_read_timeout 60s;
}
```

### 缓冲配置

```nginx
location / {
    proxy_pass http://backend;
    
    # 启用缓冲
    proxy_buffering on;
    
    # 响应缓冲大小
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
    
    # 最大缓冲大小
    proxy_max_temp_file_size 1024m;
}
```

### WebSocket 代理

```nginx
location /ws {
    proxy_pass http://websocket_backend;
    
    # WebSocket 支持
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # 长连接超时
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

### 路径重写代理

```nginx
# 保留 URI 的代理（推荐）
location /api/ {
    proxy_pass http://backend/;
}

# 带 URI 重写的代理
location /api/ {
    proxy_pass http://backend/v1/;
}
```

### 常见问题处理

```shell
# 502 Bad Gateway - 后端服务未启动
# → 检查后端服务是否运行

# 504 Gateway Timeout - 超时
# → 调整 proxy_read_timeout

# 获取真实 IP
# → 确保设置了 proxy_set_header X-Forwarded-For
```
