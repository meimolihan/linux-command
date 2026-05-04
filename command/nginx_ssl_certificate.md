nginx_ssl_certificate
===

nginx SSL/TLS 证书配置

## 补充说明

**ssl_certificate** 和相关指令用于配置 HTTPS，实现 SSL/TLS 加密传输。正确的证书配置对于网站安全至关重要。

### 语法

```nginx
ssl_certificate file;           # SSL 证书文件（.crt 或 .pem）
ssl_certificate_key file;      # 私钥文件（.key）
ssl_protocols [protocols];    # 允许的协议版本
ssl_ciphers ciphers;          # 允许的加密套件
ssl_prefer_server_ciphers on; # 服务器端加密套件优先
ssl_session_cache shared:SSL:10m;  # 会话缓存
ssl_session_timeout 10m;      # 会话超时时间
ssl_session_tickets on;       # 会话票据
ssl_trusted_certificate file; # 可信 CA 证书
ssl_dhparam file;             # DH 参数文件
```

### 基础 HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # 证书配置
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # 协议版本
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 加密套件
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    root /var/www/html;
    index index.html;
}
```

### 完整安全配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # 证书
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # 安全协议（禁用 TLSv1.1 及以下）
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 推荐加密套件（Mozilla SSL Configuration Generator）
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # DH 参数（生成命令：openssl dhparam -out dhparam.pem 2048）
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;
    
    # 会话
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self';" always;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    root /var/www/html;
}
```

### HTTP 重定向到 HTTPS

```nginx
# 方式一：单独 server 块（推荐）
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    # ... HTTPS 配置
}

# 方式二：在一个 server 块中
server {
    listen 80;
    listen 443 ssl http2;
    server_name example.com;
    
    if ($scheme = http) {
        return 301 https://$host$request_uri;
    }
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### Let's Encrypt 证书配置

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    
    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
}
```

### 生成自签名证书（测试用）

```shell
# 生成私钥
openssl genrsa -out server.key 2048

# 生成证书
openssl req -new -x509 -key server.key -out server.crt -days 365

# 合并证书
cat server.crt server.key > server.pem
```

### SSL 测试

```shell
# 使用 OpenSSL 测试
openssl s_client -connect example.com:443

# 使用 curl 测试
curl -Iv https://example.com

# 在线测试
# https://www.ssllabs.com/ssltest/
```
