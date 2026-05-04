nginx_rewrite
===

nginx URL 重写模块指令

## 补充说明

**rewrite** 指令是 ngx_http_rewrite_module 的核心功能，用于根据正则表达式重写请求的 URL。可以实现 URL 规范化、伪静态、重定向等效果。

### 语法

```nginx
rewrite regex replacement [flag];
```

### flag 标志位

```nginx
last     # 重写后停止处理后续 rewrite 指令，重新匹配 location
break    # 重写后停止处理后续 rewrite 指令，但不重新匹配 location
redirect # 返回 302 临时重定向
permanent # 返回 301 永久重定向
```

### 常用实例

```nginx
# 301 永久重定向
rewrite ^/old-page\.html$ /new-page.html permanent;

# 302 临时重定向
rewrite ^/temporary$ http://example.com permanent redirect;

# 伪静态（隐藏 .html 扩展名）
rewrite ^/article/(\d+)$ /article/$1.html last;

# 强制使用 HTTPS
if ($scheme = http) {
    return 301 https://$host$request_uri;
}

# 去除末尾斜杠
rewrite ^/(.*)/$ /$1 permanent;

# 添加末尾斜杠
if (-d $request_filename) {
    rewrite ^/(.*[^/])$ /$1/ permanent;
}
```

### last vs break

```nginx
# last - 重新匹配 location
server {
    rewrite ^/feed/xml$ /feed/atom.xml last;
    # ↓ 重新从这里开始匹配
    
    location /feed/ {
        proxy_pass http://backend;
    }
}

# break - 停止 rewrite，继续处理
server {
    rewrite ^/static/(.*)$ /files/$1 break;
    # ↓ 直接在当前 server 块继续处理
    root /var/www;
}
```

### 常用场景

```nginx
# 1. 域名重定向
server {
    listen 80;
    server_name old-site.com;
    return 301 $scheme://new-site.com$request_uri;
}

# 2. www 重定向
server {
    listen 80;
    server_name example.com;
    return 301 http://www.example.com$request_uri;
}

# 3. 移动端适配（简单版）
if ($http_user_agent ~* "Mobile|Android|iPhone") {
    rewrite ^(.*)$ /mobile$1 last;
}

# 4. 防盗链
location /images/ {
    valid_referers none blocked example.com;
    if ($invalid_referer) {
        return 403;
    }
}

# 5. 禁止访问隐藏文件
location ~ /\. {
    return 404;
}
```

### 变量参考

```nginx
# 常用变量
$uri          # 当前请求的 URI（不带参数）
$request_uri  # 完整请求 URI（带参数）
$args         # 请求参数
$scheme       # 协议（http/https）
$host         # 主机名
$request_filename  # 当前请求的文件路径
```

### 条件判断

```nginx
# if 指令
if ($condition) { ... }

# 常用条件
if ($request_method = POST) { ... }      # 请求方法
if ($http_cookie ~* "id=([^;]+)(?:;|$)") { ... }  # Cookie
if ($request_uri ~ "pattern") { ... }    # URI 匹配
if ($args ~ "pattern") { ... }           # 参数匹配
```
