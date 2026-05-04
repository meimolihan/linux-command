nginx_try_files
===

nginx 尝试访问多个文件路径指令

## 补充说明

**try_files** 指令按顺序检查文件是否存在，返回第一个找到的文件。如果都不存在，则执行最后一个 URI 或命名 location。配合 SPA（单页应用）框架非常有用。

### 语法

```nginx
try_files file1 file2 ... uri;
try_files file1 file2 ... =code;
try_files file1 file2 ... @named;
```

### 常用实例

```nginx
# 基本用法：尝试文件，不存在则重写
server {
    root /var/www/html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# WordPress 伪静态
location / {
    try_files $uri $uri/ /index.php?$args;
}

# Laravel 路由
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

# React/Vue SPA（单页应用）
location / {
    try_files $uri $uri/ /index.html;
}
```

### 配合命名 location

```nginx
server {
    root /var/www/html;
    
    location / {
        try_files $uri @backend;
    }
    
    # 后端代理
    location @backend {
        proxy_pass http://127.0.0.1:3000;
    }
    
    # PHP 处理
    location ~ \.php$ {
        try_files $uri @php;
    }
    
    location @php {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 静态资源 + 后端回退

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    
    # 静态文件
    location / {
        try_files $uri @app;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://backend;
    }
    
    # 应用回退
    location @app {
        proxy_pass http://app_server;
        proxy_set_header Host $host;
    }
}
```

### 错误码处理

```nginx
server {
    root /var/www/html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 50x 错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/errors;
        internal;
    }
}
```

### 常见模式

```nginx
# 1. 带查询参数的回退
location / {
    try_files $uri $uri/ /index.html?q=$uri&$args;
}

# 2. 仅回退到 index
location / {
    try_files $uri /index.html;
}

# 3. 多文件尝试
location / {
    try_files 
        $uri
        $uri.html
        $uri.php
        /fallback.html
        =404;
}

# 4. 带内部重定向
location / {
    try_files $uri @proxy;
}

location @proxy {
    internal;
    proxy_pass http://backend;
}
```

### 注意事项

- `$uri` 是解析后的 URI（不包含参数）
- `$request_uri` 是原始 URI（包含参数）
- 最后一个参数必须是存在的文件、URI 或命名 location
- `=404` 表示返回 404 状态码
- `internal` 标记的 location 只能内部访问
