nginx_nginx
===

高性能的 HTTP 和反向代理 web 服务器

## 补充说明

**nginx**（发音为 "engine-x"）是一款轻量级、高性能的 HTTP Web 服务器，以其高并发、低内存消耗而闻名。它既可以作为 HTTP 服务器，也可以作为反向代理服务器、负载均衡器和 HTTP 缓存。

### 语法

```shell
nginx [-?hqvV] [-c filename] [-g directives] [-p prefix] [-t] [-s signal]
```

### 常用选项

```shell
-?,-h           # 显示帮助信息
-v              # 显示 nginx 版本
-V              # 显示 nginx 版本、编译参数和配置参数
-c filename     # 指定配置文件路径（默认 /etc/nginx/nginx.conf）
-g directives   # 设置全局指令，如 nginx -g "worker_processes 4;"
-p prefix       # 设置前缀路径（默认 /usr/local/nginx）
-t              # 测试配置文件语法是否正确
-s signal       # 发送信号给 nginx 主进程
```

### 信号控制

```shell
nginx -s stop       # 强制关闭（快速终止）
nginx -s quit       # 优雅停止（等待请求处理完毕）
nginx -s reload     # 重新加载配置
nginx -s reopen     # 重新打开日志文件
```

### 常用实例

```shell
# 启动 nginx
nginx

# 指定配置文件启动
nginx -c /etc/nginx/nginx.conf

# 测试配置文件
nginx -t

# 测试并显示配置
nginx -t -c /etc/nginx/nginx.conf

# 优雅重启（配合 reload 信号）
nginx -s reload

# 快速停止
nginx -s stop

# 优雅关闭
nginx -s quit

# 发送信号
kill -QUIT $(cat /var/run/nginx.pid)
```

### 配置文件结构

```nginx
# 全局块
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    # http 全局块
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # server 块（每个网站一个）
    server {
        listen 80;
        server_name example.com;
        root /var/www/html;
        
        location / {
            index index.html;
        }
    }
}
```

### systemctl 管理

```shell
# 启动
systemctl start nginx

# 停止
systemctl stop nginx

# 重载配置
systemctl reload nginx

# 重启
systemctl restart nginx

# 查看状态
systemctl status nginx

# 设置开机启动
systemctl enable nginx
```
