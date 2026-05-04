haproxy
===

高性能负载均衡器

## 补充说明

**haproxy** 是开源的高性能 TCP/HTTP 负载均衡器和代理服务器，支持四层和七层负载均衡，用于构建高可用性和高性能的 Web 应用架构。

### 语法

```shell
haproxy [OPTIONS]
haproxy -f <configfile> [ -pvVd ] [ -L <name> ] [ -n <maxconn> ]
```

### 基础配置结构

```haproxy
# /etc/haproxy/haproxy.cfg

# 全局配置
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon
    maxconn 4096
    pidfile /var/run/haproxy.pid

# 默认配置
defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000
    timeout client  50000
    timeout server  50000
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 500 /etc/haproxy/errors/500.http

# 监听配置
listen http_front
    bind *:80
    mode http
    default_backend web_servers

# 后端配置
backend web_servers
    mode http
    balance roundrobin
    option httpchk
    http-check expect status 200
    server web1 192.168.1.101:80 check inter 2000 rise 2 fall 3
    server web2 192.168.1.102:80 check inter 2000 rise 2 fall 3
```

### 全局配置

```haproxy
global
    # 日志
    log /dev/log local0
    log /dev/log local1
    log stdout format raw local0

    # 运行用户
    user haproxy
    group haproxy

    # chroot 目录
    chroot /var/lib/haproxy

    # 进程管理
    daemon
    master-worker

    # 最大连接数
    maxconn 4096
    maxsessrate 100
    maxconnrate 100

    # PID 文件
    pidfile /var/run/haproxy.pid

    # SSL 密码套件
    ssl-default-bind-ciphers PROFILE=SYSTEM

    # 统计
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 2m

    # 性能
    tune.bufsize 16384
    tune.maxrewrite 1024
```

### 前端配置

```haproxy
# HTTP 前端
frontend http_front
    bind *:80
    mode http

    # 默认后端
    default_backend web_servers

    # ACL 规则
    acl is_api path_beg /api
    acl is_admin path_beg /admin
    acl is_static path_end .jpg .png .css .js

    # 路由
    use_backend api_servers if is_api
    use_backend admin_servers if is_admin
    use_backend static_servers if is_static

# HTTPS 前端
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/example.com.pem
    mode http

    # 强制 HTTPS
    http-request redirect scheme https unless { ssl_fc }

    default_backend web_servers

# TCP 前端（MySQL）
frontend mysql_front
    bind *:3306
    mode tcp
    default_backend mysql_servers

# HAProxy 管理界面
frontend stats_front
    bind *:8404
    mode http
    stats enable
    stats uri /stats
    stats refresh 30s
    stats auth admin:password
```

### 后端配置

```haproxy
# HTTP 后端
backend web_servers
    mode http
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200

    # 服务器
    server web1 192.168.1.101:80 check inter 2000 rise 2 fall 3 weight 100
    server web2 192.168.1.102:80 check inter 2000 rise 2 fall 3 weight 100
    server web3 192.168.1.103:80 check inter 2000 rise 2 fall 3 weight 100

# 备用服务器
backend web_servers_backup
    mode http
    balance roundrobin
    server web_backup 192.168.1.200:80 backup

# TCP 后端（MySQL）
backend mysql_servers
    mode tcp
    balance leastconn
    option tcp-check
    option mysql-check user haproxy_check

    server mysql1 192.168.1.51:3306 check port 3306
    server mysql2 192.168.1.52:3306 check port 3306

# SSL 后端
backend web_servers_https
    mode http
    balance roundrobin
    option ssl-hello-chk

    server web1 192.168.1.101:443 ssl verify none check inter 2000
    server web2 192.168.1.102:443 ssl verify none check inter 2000
```

### 负载均衡算法

```haproxy
# roundrobin - 轮询（默认）
backend web_servers
    balance roundrobin

# static-rr - 静态轮询（基于权重）
backend web_servers
    balance static-rr

# leastconn - 最少连接
backend web_servers
    balance leastconn

# source - 源 IP 哈希
backend web_servers
    balance source

# uri - URI 哈希
backend web_servers
    balance uri

# url_param - URL 参数哈希
backend web_servers
    balance url_param user_id

# hdr - HTTP 头哈希
backend web_servers
    balance hdr(Host)

# rdp-cookie - RDP cookie 哈希
backend rdp_servers
    balance rdp-cookie
```

### ACL 配置

```haproxy
# ACL 定义
frontend http_front
    # 路径前缀
    acl is_api path_beg /api /v1 /v2
    acl is_static path_end .jpg .png .gif .css .js .woff .woff2

    # 路径包含
    acl is_admin path /admin /login /logout

    # 主机头
    acl is_mobile req.hdr(User-Agent) -i -m sub mobile android iphone

    # 来源 IP
    acl is_internal src 192.168.0.0/16 10.0.0.0/8

    # 文件类型
    acl is_dangerous path_reg \.(php|cgi|pl|exe|sh|sql)$

    # 请求方法
    acl is_post method POST PUT DELETE

    # 使用 ACL
    use_backend api_servers if is_api
    use_backend admin_servers if is_admin
    use_backend static_servers if is_static

    # 拒绝访问
    http-request deny if is_dangerous !is_internal

    # 重定向
    http-request redirect location /moved if is_admin
```

### 健康检查

```haproxy
# HTTP 健康检查
backend web_servers
    option httpchk
    http-check expect status 200
    http-check expect string "OK"
    http-check send meth GET uri /health

# TCP 健康检查
backend mysql_servers
    option tcp-check

# SSL 健康检查
backend web_servers_https
    option ssl-hello-chk

# 自定义检查
backend web_servers
    option httpchk
    http-check send meth HEAD uri /health.txt hdr Host www.example.com
    http-check expect string "healthy"

# 检查间隔
backend web_servers
    default-server inter 2000 fall 3 rise 2 slowstart 30s
```

### 会话保持

```haproxy
# 基于 Cookie 的会话保持
backend web_servers
    balance roundrobin
    cookie SERVERID insert indirect nocache

    server web1 192.168.1.101:80 cookie server1 check
    server web2 192.168.1.102:80 cookie server2 check

# 基于源 IP 的会话保持
backend web_servers
    balance source

# 强制连接关闭（禁用会话保持）
backend web_servers
    option httpclose
    option forceclose
```

### SSL/TLS 配置

```haproxy
# HTTPS 监听
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/server.pem
    bind *:443 ssl crt /etc/ssl/certs/mycert.pem ca-file /etc/ssl/certs/ca.pem verify required

    # 默认后端
    default_backend web_servers

# SSL 卸载
frontend http_front
    bind *:80
    mode http

    # 强制 HTTPS
    http-request redirect scheme https if !{ ssl_fc }

# 发送到后端时使用 SSL
backend web_servers_https
    mode http
    balance roundrobin
    server web1 192.168.1.101:443 ssl verify none check
```

### 限流

```haproxy
# 连接限制
frontend http_front
    mode http
    bind *:80
    maxconn 1000

# 速率限制
frontend http_front
    mode http
    stick-table type ip size 100k expire 30s store http_req_rate(10s)

    http-request track-sc0 src table http_front

    acl too_fast src_http_req_rate(http_front) gt 100
    http-request deny if too_fast

# 带宽限制
backend web_servers
    mode http
    fullconn 100

    server web1 192.168.1.101:80 maxconn 50
```

### 日志配置

```haproxy
# rsyslog 配置
# /etc/rsyslog.d/99-haproxy.conf
module(load="imudp")
input(type="imudp" port="514")

local0.* /var/log/haproxy.log
local1.* /var/log/haproxy-admin.log

# HAProxy 日志格式
log /dev/log local0

frontend http_front
    log-format "%ci:%cp [%t] %ft %b/%s %Tw/%Tc/%Tt %B %ts %ac/%fc/%bc/%sc/%rc %sq/%bq %hr %hs %{+Q}r"

# 访问日志
listen stats
    mode http
    log /dev/log local1
    option httplog
```

### 常用命令

```shell
# 测试配置
haproxy -c -f /etc/haproxy/haproxy.cfg

# 显示版本
haproxy -v

# 详细模式
haproxy -vv

# 前端/后端信息
haproxy -f /etc/haproxy/haproxy.cfg -S

# 平滑重载
systemctl reload haproxy

# 重启
systemctl restart haproxy

# 启动
systemctl start haproxy

# 查看状态
systemctl status haproxy

# 查看统计数据
socat /run/haproxy/admin.sock stdio
show stat
show info
```

### 统计页面

```haproxy
# 启用统计页面
listen stats
    bind *:8404
    mode http
    stats enable
    stats uri /stats
    stats refresh 30s
    stats auth admin:password
    stats realm "HAProxy Statistics"
    stats admin if LOCALHOST

# 详细统计
listen stats
    bind *:8404
    mode http
    stats enable
    stats uri /stats
    stats hide-version
    stats show-legends
    stats show-node
```

### 完整示例

```haproxy
# /etc/haproxy/haproxy.cfg

global
    log /dev/log local0
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon
    maxconn 4096
    ssl-default-bind-ciphers PROFILE=SYSTEM

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    option  http-server-close
    option  forwardfor except 127.0.0.0/8
    timeout connect 5000
    timeout client  50000
    timeout server  50000
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 503 /etc/haproxy/errors/503.http

# HTTP to HTTPS 重定向
frontend http_redirect
    bind *:80
    mode http
    default_backend http_redirect_servers

backend http_redirect_servers
    mode http
    http-request redirect scheme https code 301 if !{ ssl_fc }

# HTTPS 前端
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/combined.pem
    mode http

    # X-Forwarded-For
    option forwardfor

    # ACL
    acl is_api path_beg /api
    acl is_static path_end .jpg .png .css .js .woff

    # 路由
    use_backend api_backend if is_api
    use_backend static_backend if is_static
    default_backend web_backend

# Web 后端
backend web_backend
    mode http
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server web1 192.168.1.101:80 check inter 2000 rise 2 fall 3
    server web2 192.168.1.102:80 check inter 2000 rise 2 fall 3

# API 后端
backend api_backend
    mode http
    balance leastconn
    option httpchk GET /api/health
    server api1 192.168.1.201:8080 check inter 2000 rise 2 fall 3
    server api2 192.168.1.202:8080 check inter 2000 rise 2 fall 3

# 静态文件后端
backend static_backend
    mode http
    balance roundrobin
    server static1 192.168.1.301:80 check

# 管理界面
listen admin
    bind *:8404
    mode http
    stats enable
    stats uri /
    stats refresh 30s
    stats auth admin:changeme
```
