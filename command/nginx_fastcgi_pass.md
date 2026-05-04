nginx_fastcgi_pass
===

nginx FastCGI 代理配置指令

## 补充说明

**fastcgi_pass** 指令用于将请求转发给 FastCGI 服务器（如 PHP-FPM、Python uwsgi 等）。配置时需要配合 `fastcgi_param`、`fastcgi_index` 等指令一起使用。

### 语法

```nginx
fastcgi_pass host:port;           # TCP 连接
fastcgi_pass unix:path;           # Unix Socket 连接
fastcgi_pass $variable;           # 动态地址（需使用 map）
```

### PHP-FPM 配置示例

```nginx
# TCP 连接
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.php index.html;
    
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        
        # 传递 SCRIPT_FILENAME
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        
        # 常用 FastCGI 参数
        fastcgi_param QUERY_STRING $query_string;
        fastcgi_param REQUEST_METHOD $request_method;
        fastcgi_param CONTENT_TYPE $content_type;
        fastcgi_param CONTENT_LENGTH $content_length;
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;
        fastcgi_param REQUEST_URI $request_uri;
        fastcgi_param DOCUMENT_URI $document_uri;
        fastcgi_param DOCUMENT_ROOT $document_root;
        fastcgi_param SERVER_PROTOCOL $server_protocol;
        fastcgi_param REQUEST_SCHEME $scheme;
        fastcgi_param HTTPS $https if_not_empty;
        
        # 包含默认参数
        include fastcgi_params;
        
        # 超时设置
        fastcgi_connect_timeout 60;
        fastcgi_send_timeout 60;
        fastcgi_read_timeout 60;
    }
}

# Unix Socket 连接
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### FastCGI 参数详解

```nginx
# 常用 fastcgi_param
fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;  # 必需！
fastcgi_param  QUERY_STRING      $query_string;
fastcgi_param  REQUEST_METHOD    $request_method;
fastcgi_param  CONTENT_TYPE      $content_type;
fastcgi_param  CONTENT_LENGTH    $content_length;
fastcgi_param  SCRIPT_NAME       $fastcgi_script_name;
fastcgi_param  REQUEST_URI       $request_uri;
fastcgi_param  DOCUMENT_URI      $document_uri;
fastcgi_param  DOCUMENT_ROOT     $document_root;
fastcgi_param  SERVER_PROTOCOL   $server_protocol;
fastcgi_param  REQUEST_SCHEME   $scheme;
fastcgi_param  HTTPS             $https if_not_empty;
fastcgi_param  GATEWAY_INTERFACE CGI/1.1;
fastcgi_param  SERVER_SOFTWARE   nginx/$nginx_version;
fastcgi_param  REMOTE_ADDR       $remote_addr;
fastcgi_param  REMOTE_PORT       $remote_port;
fastcgi_param  SERVER_ADDR       $server_addr;
fastcgi_param  SERVER_PORT       $server_port;
fastcgi_param  SERVER_NAME       $server_name;
fastcgi_param  REDIRECT_STATUS   200;
```

### fastcgi_split_path_info

```nginx
# 路径拆分（用于 Laravel、ThinkPHP 等框架）
location ~ ^/api/(.+)$ {
    fastcgi_split_path_info ^/api/(.+)$;
    fastcgi_param PATH_INFO $fastcgi_path_info;
    fastcgi_pass unix:/var/run/php/php-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root/api.php;
    include fastcgi_params;
}

# ThinkPHP 5+ 路由
location / {
    if (!-e $request_filename) {
        rewrite ^/(.*)$ /index.php/$1 last;
    }
}

location ~ \.php {
    fastcgi_split_path_info ^/index.php/(.+)$;
    fastcgi_param SCRIPT_FILENAME $document_root/index.php;
    fastcgi_param PATH_INFO $fastcgi_path_info;
    fastcgi_pass unix:/var/run/php/php-fpm.sock;
    include fastcgi_params;
}
```

### 超时和缓冲配置

```nginx
location ~ \.php$ {
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
    
    # 连接超时
    fastcgi_connect_timeout 60s;
    
    # 发送超时
    fastcgi_send_timeout 60s;
    
    # 读取超时
    fastcgi_read_timeout 60s;
    
    # 缓冲
    fastcgi_buffering on;
    fastcgi_buffer_size 4k;
    fastcgi_buffers 8 4k;
    fastcgi_busy_buffers_size 8k;
    
    # 请求缓冲区
    fastcgi_request_buffering on;
}
```

### 安全配置

```nginx
# 禁止访问敏感文件
location ~ \.php$ {
    # 只允许访问特定文件
    location ~ ^/index\.php {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # 其他 PHP 文件拒绝访问
    location ~ ^/.*\.php$ {
        return 404;
    }
}

# 隐藏 PHP 版本
fastcgi_hide_header X-Powered-By;
fastcgi_pass_header X-Generator;
```

### 常用路径

```shell
# Debian/Ubuntu
/etc/php/8.1/fpm/pool.d/www.conf
unix:/run/php/php-fpm.sock

# CentOS/RHEL
/etc/php-fpm.d/www.conf
unix:/var/run/php-fpm/www.sock

# macOS (Homebrew)
/usr/local/opt/php@8.1/var/run/php-fpm.pid
unix:/usr/local/var/run/php-fpm.sock
```
