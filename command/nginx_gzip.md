nginx_gzip
===

nginx gzip 压缩配置指令

## 补充说明

**gzip** 指令用于启用 gzip 压缩，可以显著减少传输数据量，加快页面加载速度，同时节省带宽。压缩比建议设置在 4-6 之间，压缩级别越高 CPU 消耗越大。

### 语法

```nginx
gzip on | off;
gzip_vary on | off;
gzip_proxied any;
gzip_comp_level level;     # 压缩级别 1-9，默认 1
gzip_buffers number size;  # 缓冲区设置
gzip_min_length length;    # 最小压缩长度
gzip_http_version version; # 最低 HTTP 版本
gzip_types mime-type ...;  # 要压缩的 MIME 类型
gzip_disable regex;        # 禁用特定 User-Agent
```

### 常用配置

```nginx
http {
    # 启用 gzip
    gzip on;
    
    # 兼容旧代理
    gzip_vary on;
    
    # 代理请求也压缩
    gzip_proxied any;
    
    # 压缩级别（1-9，4-6 推荐）
    gzip_comp_level 6;
    
    # 缓冲区
    gzip_buffers 16 8k;
    
    # 最小压缩长度（字节）
    gzip_min_length 1024;
    
    # HTTP 版本
    gzip_http_version 1.1;
    
    # 压缩的 MIME 类型
    gzip_types 
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/x-javascript
        application/xml
        application/xhtml+xml
        application/atom+xml
        application/rss+xml
        application/ld+json
        application/manifest+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        font/opentype
        font/ttf
        font/eot
        font/otf
        image/svg+xml
        image/x-icon;
    
    # 禁用 MSIE 6 的 gzip（兼容旧浏览器）
    gzip_disable "MSIE [1-6]\.";
}

server {
    location / {
        root /var/www/html;
        
        # 对特定文件启用 gzip
        gzip on;
        gzip_types text/css application/javascript;
    }
}
```

### 常用实例

```nginx
# 静态资源压缩配置
server {
    listen 80;
    root /var/www/static;
    
    # 启用 gzip
    gzip on;
    gzip_min_length 1000;
    gzip_comp_level 5;
    gzip_vary on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 预压缩文件（使用 nginx 的 gzip_static 模块）
    gzip_static on;
}

# 动态内容压缩
server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend;
        
        gzip on;
        gzip_min_length 100;
        gzip_comp_level 4;
        gzip_types application/json application/xml;
    }
}
```

### 压缩效果参考

| 文件类型 | 原始大小 | gzip 后 | 压缩率 |
|---------|---------|---------|--------|
| HTML    | 50KB    | 10KB    | 80%    |
| CSS     | 30KB    | 6KB     | 80%    |
| JS      | 100KB   | 35KB    | 65%    |
| JSON    | 20KB    | 5KB     | 75%    |

### 相关模块

```nginx
# gzip_static - 预压缩文件
# 需要编译时添加 --with-http_gzip_static_module
gzip_static on;

# gunzip - 解压 gzip 文件
# 适用于后端返回压缩内容但客户端不支持的情况
gunzip on;
```

### 测试压缩效果

```shell
# 使用 curl 测试
curl -I -H "Accept-Encoding: gzip" http://example.com/style.css

# 查看响应头
# Content-Encoding: gzip
# Content-Length: 1234
```
