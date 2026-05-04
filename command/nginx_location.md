nginx_location
===

nginx location 匹配配置块

## 补充说明

**location** 指令用于匹配客户端请求的 URI，根据匹配结果决定如何处理请求。每个 location 块可以定义不同的处理规则，如静态文件服务、反向代理、重定向等。

### 语法

```nginx
location [ = | ~ | ~* | ^~ ] uri { ... }
location @name { ... }
```

### 匹配修饰符

```nginx
=        # 精确匹配（优先级最高）
^~       # 前缀匹配，匹配后停止搜索正则
~        # 正则匹配（区分大小写）
~*       # 正则匹配（不区分大小写）
无修饰符  # 普通前缀匹配
```

### 匹配优先级

```nginx
# 1. 精确匹配（=）优先级最高
location = / {
    # 只匹配 /
}

# 2. 前缀匹配（^~），不检查正则
location ^~ /static/ {
    # 匹配 /static 开头的请求，不检查正则
}

# 3. 正则匹配（~ / ~*），按配置顺序匹配，第一个匹配生效
location ~ \.php$ {
    # 匹配 .php 结尾
}
location ~* \.(jpg|png|gif)$ {
    # 匹配图片
}

# 4. 普通前缀匹配，最长的匹配优先
location / {
    # 默认匹配
}
location /documents/ {
    # 匹配 /documents/ 开头的请求
}
```

### 常用实例

```nginx
# 精确匹配首页
location = / {
    root /var/www/html;
    index index.html;
}

# 静态文件服务
location /static/ {
    alias /var/www/static/;
    expires 30d;
    add_header Cache-Control "public";
}

# PHP 代理
location ~ \.php$ {
    proxy_pass http://php_fpm;
    proxy_set_header Host $host;
}

# 不区分大小写的正则
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    root /var/www/static;
    expires 7d;
    add_header Cache-Control "public";
}

# 图片防盗链
location ~* \.(jpg|png|gif)$ {
    valid_referers none blocked example.com *.example.com;
    if ($invalid_referer) {
        return 403;
    }
}

# 禁止访问隐藏文件
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

# 路径重写
location /old-path {
    return 301 /new-path;
}
```

### alias vs root

```nginx
# root - 请求 URI 会追加到 root 路径后
server {
    root /var/www/html;
    
    location /images/ {
        # 请求 /images/logo.png
        # → /var/www/html/images/logo.png
    }
}

# alias - alias 路径完全替换匹配部分
server {
    location /images/ {
        alias /var/www/static/img/;
        
        # 请求 /images/logo.png
        # → /var/www/static/img/logo.png
    }
}
```

### 命名 location（内部重定向）

```nginx
location / {
    try_files $uri @backend;
}

location @backend {
    proxy_pass http://app_servers;
}

# 更多用法
location / {
    try_files $uri $uri/ /index.html @notfound;
}
```

### 变量

```nginx
# 常用 location 变量
$uri          # 当前请求的 URI（解析后）
$request_uri  # 原始请求 URI
$document_uri  # 同 $uri
$args          # 查询参数
$is_args       # 是否有参数（?则为空）
$query_string  # 同 $args
```

### 嵌套 location

```nginx
location /api/ {
    # API 相关配置
    
    location ~ \.php$ {
        # 只处理 /api/ 下的 PHP 请求
        proxy_pass http://php_fpm;
    }
}
```

### 常见配置示例

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html index.htm;

    # 精确匹配
    location = /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # 静态资源
    location ^~ /assets/ {
        alias /var/www/static/;
        expires 7d;
        gzip_static on;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # PHP
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 默认
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 匹配测试

```shell
# 请求 / → 匹配 location = /
# 请求 /static/css/main.css → 匹配 location ^~ /static/
# 请求 /api/user → 匹配 location ~ /api$
# 请求 /documents/file.txt → 匹配 location /documents/
```
