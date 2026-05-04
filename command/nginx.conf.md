nginx.conf
===

Nginx 配置文件详解

## 补充说明

**nginx.conf** 是 Nginx 服务器的主配置文件。理解其结构对于配置 Nginx 至关重要。Nginx 配置采用层级结构，主要包括：全局块、events 块、http 块、server 块和 location 块。

### 配置文件结构

```nginx
# 全局块
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    # events 块
    worker_connections 1024;
}

http {
    # http 块
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 发送文件
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # gzip 压缩
    gzip on;
    gzip_disable "msie6";

    # include 虚拟主机配置
    include /etc/nginx/conf.d/*.conf;
}
```

### 全局块

全局块是配置文件的开头部分，主要设置影响 Nginx 全局的指令。

```nginx
# 运行用户
user nginx;

# 工作进程数，auto 表示自动检测 CPU 核心数
worker_processes auto;

# 指定错误日志路径和级别
error_log /var/log/nginx/error.log warn;

# 指定 PID 文件路径
pid /var/run/nginx.pid;

# 加载动态模块
load_module /usr/lib/nginx/modules/ngx_http_lua_module.so;
```

### events 块

events 块主要设置影响服务器与客户端的网络连接。

```nginx
events {
    # 每个 worker 进程允许的最大连接数
    worker_connections 1024;

    # 使用 epoll 模型（Linux 推荐）
    use epoll;

    # 启用多连接复用
    multi_accept on;

    # 接受多个客户端连接
    accept_mutex on;
}
```

### http 块

http 块是配置文件中最大的部分，包括日志定义、缓存、代理、FastCGI 等。

```nginx
http {
    # 基础设置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # 访问日志
    access_log /var/log/nginx/access.log main;

    # 文件传输设置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # 连接超时时间
    keepalive_timeout 65;
    keepalive_requests 100;

    # 请求体大小限制
    client_max_body_size 20M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # 上游服务器组（用于反向代理）
    upstream backend {
        least_conn;  # 最少连接数
        server 192.168.1.10:8080 weight=5;
        server 192.168.1.11:8080 weight=3;
        server 192.168.1.12:8080 backup;  # 备用服务器
    }

    # 包含虚拟主机配置
    include /etc/nginx/conf.d/*.conf;
}
```

### server 块

server 块用于配置虚拟主机，可以在 http 块中定义多个 server 块。

```nginx
server {
    # 监听端口
    listen 80;
    listen 443 ssl http2;

    # 服务器名称
    server_name example.com www.example.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;

    # 根目录
    root /var/www/html;

    # 默认索引文件
    index index.html index.htm index.php;

    # 日志
    access_log /var/log/nginx/example.com/access.log main;
    error_log /var/log/nginx/example.com/error.log;

    # 隐藏版本号
    server_tokens off;

    # 禁止访问 .ht 文件
    location ~ /\.ht {
        deny all;
    }
}
```

### location 块

location 块用于匹配 URI 并定义处理规则。

```nginx
# 根路径
location / {
    root /var/www/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
}

# 精确匹配
location = / {
    root /var/www/html;
    index index.html;
}

# 正则匹配（区分大小写）
location ~ \.php$ {
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}

# 正则匹配（不区分大小写）
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# 反向代理
location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# 负载均衡
location / {
    proxy_pass http://backend;
}

# 路径重写
location /old-path {
    rewrite ^/old-path/(.*)$ /new-path/$1 permanent;
}

# 限制 IP 访问
location /admin/ {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
}
```

### 常用配置示例

#### 静态网站

```nginx
server {
    listen 80;
    server_name static.example.com;
    root /var/www/static;

    location / {
        index index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

#### PHP-FPM

```nginx
server {
    listen 80;
    server_name php.example.com;
    root /var/www/php;

    location / {
        index index.php index.html;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 禁止访问上传目录中的脚本
    location /uploads/ {
        location ~* \.php$ {
            deny all;
        }
    }
}
```

#### WordPress

```nginx
server {
    listen 80;
    server_name wordpress.example.com;
    root /var/www/wordpress;
    index index.php index.html;

    client_max_body_size 50M;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

#### SSL/HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name secure.example.com;
    root /var/www/secure;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    # SSL 配置
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # 现代配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        root /var/www/secure;
        index index.html;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name secure.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 性能优化配置

```nginx
# 工作进程优化
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 10240;
    use epoll;
    multi_accept on;
}

http {
    # 文件描述符缓存
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # 零复制传输
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # 连接复用
    keepalive_timeout 65;
    keepalive_requests 1000;

    # 缓冲区优化
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;

    # 代理缓冲区
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
}
```

### 安全配置

```nginx
# 隐藏版本号
server_tokens off;

# 防止点击劫持
add_header X-Frame-Options "SAMEORIGIN" always;

# XSS 防护
add_header X-XSS-Protection "1; mode=block" always;

# 防止 MIME 类型嗅探
add_header X-Content-Type-Options "nosniff" always;

# 引用来源策略
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# 安全策略
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# 禁止访问敏感文件
location ~ /\.(?!well-known).* {
    deny all;
}

location ~ /\.(svn|git|hg|bzr|cvs) {
    deny all;
}
```

### 常用命令

```shell
# 测试配置文件
nginx -t

# 指定配置文件测试
nginx -t -c /etc/nginx/nginx.conf

# 重新加载配置
nginx -s reload

# 优雅停止
nginx -s quit

# 快速停止
nginx -s stop

# 重新打开日志
nginx -s reopen

# 升级 Nginx（不停服务）
nginx -s upgrade
```

### 常见问题

**Q: 如何调试 Nginx 配置？**

A: 使用 `nginx -t` 测试配置，使用 `nginx -T` 查看完整配置。

**Q: 如何查看 Nginx 错误日志？**

A: 默认在 `/var/log/nginx/error.log`，可在 error_log 指令中自定义路径。

**Q: location 匹配优先级？**

A: 优先级：精确匹配(=) > 前缀匹配(^~) > 正则匹配(~/~*) > 普通前缀匹配(/)?