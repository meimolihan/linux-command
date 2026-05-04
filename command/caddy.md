caddy
===

现代化 Web 服务器

## 补充说明

**caddy** 是一个现代化、自动化的 Web 服务器，以简洁的配置和自动 HTTPS 著称。支持 HTTP/2、自动 TLS/SSL、Markdown 渲染等功能。

### 语法

```shell
caddy [command] [flags]
caddy run [config_file]
caddy start
caddy stop
caddy reload [--config config_file]
```

### 基本配置

```caddy
# Caddyfile 基础语法

# 简单配置
localhost:8080 {
    respond "Hello, World!"
}

# 静态网站
www.example.com {
    root * /var/www/html
    file_server
}

# 反向代理
example.com {
    reverse_proxy localhost:9000
}
```

### Caddyfile 配置

```caddy
# 全局配置块
{
    admin off
    http_port 80
    https_port 443
    email admin@example.com
    on_demand_tls {
        issuer acme
    }
}

# 基础配置
example.com {
    # 静态文件服务
    root * /var/www/html
    file_server

    # 日志
    log {
        output file /var/log/caddy/access.log
    }

    # 压缩
    encode gzip

    # PHP 支持
    php_fastcgi localhost:9000
}

# 多个站点
www.example.com, example.com {
    root * /var/www/html
    file_server
}
```

### 自动 HTTPS

```caddy
# 自动 HTTPS（默认）
example.com {
    respond "Hello"
}
# 自动申请 TLS 证书，自动重定向 HTTP 到 HTTPS

# 跳过证书申请
localhost:8080 {
    respond "No HTTPS"
}

# 手动指定证书
example.com {
    tls /path/to/cert.pem /path/to/key.pem
}

# Let's Encrypt 证书
example.com {
    tls admin@example.com
}

# 自签名证书
example.com {
    tls self_signed
}

# Let's Encrypt staging
example.com {
    tls {
        ca https://acme-staging-v02.api.letsencrypt.org/directory
    }
}
```

### 反向代理

```caddy
# 基础代理
example.com {
    reverse_proxy localhost:9000
}

# 多后端负载均衡
example.com {
    reverse_proxy localhost:9000 localhost:9001 localhost:9002
}

# 指定后端
example.com {
    reverse_proxy localhost:9000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
}

# 路径路由
example.com {
    handle /api/* {
        reverse_proxy localhost:8080
    }

    handle /* {
        reverse_proxy localhost:3000
    }
}

# WebSocket 支持
example.com {
    reverse_proxy /ws/* localhost:8080
}

# 负载均衡策略
example.com {
    reverse_proxy localhost:9000 localhost:9001 {
       lb_try_duration 3s
        lb_try_interval 200ms
    }
}

# 健康检查
example.com {
    reverse_proxy localhost:9000 localhost:9001 {
        health_uri /health
        health_interval 30s
        health_timeout 5s
    }
}
```

### 重写规则

```caddy
# 基础重写
example.com {
    rewrite /old /new
}

# 条件重写
example.com {
    @old {
        path /old-page /old-post
    }
    rewrite @old /new-page
}

# 正则重写
example.com {
    rewrite /blog/(\d+)/(\d+) /blog?year=$1&month=$2
}

# 路径重写
example.com {
    handle /admin/* {
        rewrite /admin{path} /admin.php{path}
    }
}
```

### 路由规则

```caddy
# handle 块
example.com {
    handle /api/* {
        reverse_proxy localhost:8080
    }

    handle /static/* {
        root * /var/www/static
        file_server
    }

    handle /* {
        reverse_proxy localhost:3000
    }
}

# match 块
example.com {
    @api {
        path /api/v1/*
    }

    @static {
        path /css/* /js/* /images/*
    }

    reverse_proxy @api localhost:8080
    file_server @static
}

# try_files
example.com {
    try_files {path} /index.html
    root * /var/www/html
    file_server
}
```

### PHP FastCGI

```caddy
# PHP-FPM 配置
example.com {
    root * /var/www/html
    php_fastcgi localhost:9000
    file_server
}

# 多 PHP 版本
example.com {
    route {
        match *.php {
            php_fastcgi localhost:9000
        }
        file_server
    }
    root * /var/www/html
}

# Unix Socket PHP-FPM
example.com {
    php_fastcgi unix//run/php/php-fpm.sock
}
```

### 访问控制

```caddy
# IP 白名单
example.com {
    @blocked {
        remote_ip 192.168.1.100
    }
    respond @blocked 403

    handle / {
        reverse_proxy localhost:9000
    }
}

# IP 黑名单
example.com {
    @blocked {
        remote_ip 10.0.0.0/8
    }
    respond @blocked "Access denied" 403

    reverse_proxy localhost:9000
}

# HTTP Basic Auth
example.com {
    basicauth /* {
        admin JDJhJDEwJEVCSm9VUXVIT0JLaXhOLnVuLkVkR0dNZXc=
    }
}
```

### 日志配置

```caddy
# 访问日志
example.com {
    log {
        output file /var/log/caddy/access.log
        format single_field common_log
    }
    respond "Hello"
}

# 差异化日志
example.com {
    log {
        output file /var/log/caddy/access.log
    }
}

# 全局日志
{
    log {
        output file /var/log/caddy/caddy.log
        level DEBUG
    }
}
```

### 压缩

```caddy
# 自动压缩
example.com {
    encode gzip
}

# 指定压缩类型
example.com {
    encode gzip zstd
}

# Brotli 支持（需要编译）
example.com {
    encode br gzip
}
```

### WebSocket

```caddy
# WebSocket 代理
example.com {
    reverse_proxy /ws localhost:8080 {
        header_up -Origin
    }
}
```

### 运行命令

```shell
# 启动 Caddy
caddy run
caddy start

# 使用配置文件
caddy run --config Caddyfile
caddy start --config Caddyfile

# 停止 Caddy
caddy stop

# 重载配置
caddy reload
caddy reload --config Caddyfile

# 验证配置
caddy validate --config Caddyfile

# 适配配置（转换为 JSON）
caddy adapt --config Caddyfile

# 后台运行
caddy run --config Caddyfile &
```

### 适配器

```shell
# 使用 Caddyfile
caddy run

# 使用 JSON 配置
caddy run --config config.json

# 从 stdin 读取
cat Caddyfile | caddy adapt --adapter caddyfile | caddy run

# 导出 JSON
caddy adapt --config Caddyfile --pretty
```

### 环境变量

```shell
# 设置配置目录
export CADDY_CONFIG_DIR=/etc/caddy

# 设置数据目录
export CADDY_DATA_DIR=/var/lib/caddy

# 设置日志目录
export CADDY_LOG_DIR=/var/log/caddy

# TLS 配置
export CADDY_TLS_EMAIL=admin@example.com
```

### Docker 部署

```shell
# 运行 Caddy
docker run -d \
    --name caddy \
    -p 80:80 \
    -p 443:443 \
    -v /path/Caddyfile:/etc/caddy/Caddyfile \
    -v caddy_data:/data \
    -v caddy_config:/config \
    caddy:2

# Docker Compose
version: "3.7"
services:
  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./site:/srv
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

### 模块

```caddy
# 使用插件
example.com {
    # OpenTelemetry 追踪
    opentelemetry {
        endpoint localhost:4318
    }

    # Redis 缓存
    redis {
        url redis://localhost:6379
    }
}
```

### 常用配置示例

```caddy
# WordPress
example.com {
    root * /var/www/wordpress
    php_fastcgi unix//run/php/php-fpm.sock
    file_server
    handle_errors {
        rewrite /{err.status_code}.html
        file_server
    }
}

# Node.js 应用
example.com {
    reverse_proxy localhost:3000 {
        header_up Host {host}
    }
}

# 静态博客
example.com {
    root * /var/www/hugo/public
    encode gzip
    file_server

    handle /.well-known/acme-challenge/* {
        respond "{path}"
    }
}

# 静态 + API
example.com {
    root * /var/www/html
    file_server

    handle /api/* {
        reverse_proxy localhost:8080
    }

    handle /auth/* {
        reverse_proxy localhost:9000
    }
}
```
