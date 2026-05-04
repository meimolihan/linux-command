apache
===

Apache HTTP 服务器

## 补充说明

**apache** 或 **httpd** 是 Apache 软件基金会的开源 Web 服务器，是世界上最流行的 Web 服务器之一，支持模块化配置和多种操作系统。

### 语法

```shell
apachectl [OPTIONS]
httpd [OPTIONS]
apachectl -t              # 测试配置
httpd -v                  # 显示版本
```

### 基本配置

```shell
# 主配置文件
/etc/httpd/conf/httpd.conf      # RHEL/CentOS
/etc/apache2/apache2.conf       # Debian/Ubuntu

# 包含目录
/etc/httpd/conf.d/              # RHEL/CentOS
/etc/apache2/sites-available/   # Debian/Ubuntu

# 启动服务
systemctl start httpd
systemctl start apache2

# 停止服务
systemctl stop httpd

# 重启服务
systemctl restart httpd

# 重载配置
systemctl reload httpd

# 查看状态
systemctl status httpd
```

### 核心配置指令

```apache
# 服务器标识
ServerRoot "/etc/httpd"
ServerName www.example.com:80

# 监听端口
Listen 80
Listen 443

# 用户/组（以谁运行）
User apache
Group apache

# 文档根目录
DocumentRoot "/var/www/html"

# 目录权限
<Directory "/var/www/html">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# 默认字符集
AddDefaultCharset UTF-8

# 错误日志
ErrorLog "logs/error_log"
LogLevel warn

# 访问日志格式
LogFormat "%h %l %u %t \"%r\" %>s %b" combined
CustomLog "logs/access_log" combined
```

### 虚拟主机

```apache
# 基于域名的虚拟主机
<VirtualHost *:80>
    ServerName www.example.com
    DocumentRoot /var/www/example.com
    ErrorLog /var/log/httpd/example.com_error
    CustomLog /var/log/httpd/example.com_access combined
</VirtualHost>

# 多个虚拟主机
<VirtualHost *:80>
    ServerName www.example.com
    ServerAlias example.com *.example.com
    DocumentRoot /var/www/example.com
</VirtualHost>

# 基于端口的虚拟主机
<VirtualHost *:8080>
    ServerName www.example.com
    DocumentRoot /var/www/html8080
</VirtualHost>

# 基于 IP 的虚拟主机
<VirtualHost 192.168.1.10:80>
    ServerName www.example.com
    DocumentRoot /var/www/example.com
</VirtualHost>
```

### 目录权限

```apache
# 基本权限
<Directory "/var/www/html">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# 禁用目录列表
<Directory "/var/www/html">
    Options -Indexes +FollowSymLinks
</Directory>

# 启用 .htaccess
<Directory "/var/www/html">
    AllowOverride All
</Directory>

# IP 限制
<Directory "/var/www/html/admin">
    Require ip 192.168.1.0/24
    Require valid-user
</Directory>

# 密码保护
<Directory "/var/www/html/private">
    AuthType Basic
    AuthName "Restricted"
    AuthUserFile /etc/httpd/.htpasswd
    Require valid-user
</Directory>
```

### SSL/TLS 配置

```apache
# 加载 SSL 模块
LoadModule ssl_module modules/mod_ssl.so

# SSL 虚拟主机
<VirtualHost *:443>
    ServerName www.example.com
    DocumentRoot /var/www/html
    SSLEngine on
    SSLCertificateFile /etc/httpd/ssl/server.crt
    SSLCertificateKeyFile /etc/httpd/ssl/server.key
    SSLCertificateChainFile /etc/httpd/ssl/ca-bundle.crt
</VirtualHost>

# 强制 HTTPS
<VirtualHost *:80>
    ServerName www.example.com
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

# SSL 协议和加密套件
SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
SSLHonorCipherOrder on
```

### 模块配置

```apache
# 启用模块（Debian/Ubuntu）
a2enmod ssl
a2enmod rewrite
a2enmod headers
a2enmod proxy
a2enmod proxy_http

# 禁用模块
a2dismod module_name

# 常用模块配置
# mod_rewrite
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php/$1 [L]
</IfModule>

# mod_proxy
<IfModule mod_proxy.c>
    ProxyRequests Off
    ProxyPass /api http://backend:8080/
    ProxyPassReverse /api http://backend:8080/
</IfModule>

# mod_headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

### URL 重写

```apache
# 启用重写
RewriteEngine On
RewriteBase /

# 重定向
RewriteRule ^oldpage\.html$ newpage.html [R=301,L]
RewriteRule ^old/(.*)$ new/$1 [R=302,L]

# 强制 HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 强制 www
RewriteCond %{HTTP_HOST} !^www\. [NC]
RewriteRule ^(.*)$ http://www.%{HTTP_HOST}/$1 [R=301,L]

# 移除 www
RewriteCond %{HTTP_HOST} ^www\.(.+)$ [NC]
RewriteRule ^(.*)$ http://%1/$1 [R=301,L]

# 美化 URL
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^blog/([0-9]+)/?$ blog.php?id=$1 [L,QSA]
```

### 性能优化

```apache
# MPM 配置（Prefork）
<IfModule mpm_prefork_module>
    StartServers             5
    MinSpareServers          5
    MaxSpareServers         10
    MaxRequestWorkers       150
    MaxConnectionsPerChild 3000
</IfModule>

# MPM 配置（Worker）
<IfModule mpm_worker_module>
    StartServers             3
    MinSpareThreads         25
    MaxSpareThreads         75
    ThreadLimit              64
    ThreadsPerChild          25
    MaxRequestWorkers       150
    MaxConnectionsPerChild   0
</IfModule>

# 启用压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript
    AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>

# 浏览器缓存
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# 连接超时
Timeout 60
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5
```

### 日志配置

```apache
# 错误日志级别
LogLevel warn
LogLevel info
LogLevel debug

# 自定义日志格式
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
LogFormat "%h %l %u %t \"%r\" %>s %b" common

# 条件日志
SetEnvIf Remote_Addr "192\.168\.1\.100" local_request
CustomLog logs/access_log combined env=!local_request

# 日志轮转（使用 rotatelogs）
CustomLog "|/usr/sbin/rotatelogs -l /var/log/httpd/access_%Y%m%d.log 86400" combined
ErrorLog  "|/usr/sbin/rotatelogs -l /var/log/httpd/error_%Y%m%d.log 86400"
```

### 安全配置

```apache
# 隐藏版本信息
ServerTokens Prod
ServerSignature Off

# 禁用目录遍历
<Directory />
    Options -Indexes
    AllowOverride None
</Directory>

# 文件访问限制
<Files ".ht*">
    Require all denied
</Files>

<FilesMatch "\.(?:lock|put|log)$">
    Require all denied
</FilesMatch>

# 防止点击劫持
Header always set X-Frame-Options "SAMEORIGIN"

# XSS 保护
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"

# CSP
Header always set Content-Security-Policy "default-src 'self'"
```

### 常用命令

```shell
# 测试配置语法
apachectl configtest
httpd -t
apachectl -t

# 语法检查（详细）
apachectl -t -D DUMP_VHOSTS

# 查看已编译的模块
httpd -M
apachectl -M

# 查看编译参数
httpd -V

# 重载配置
systemctl reload httpd

# 查看运行状态
systemctl status httpd
ps aux | grep httpd

# 日志查看
tail -f /var/log/httpd/access_log
tail -f /var/log/httpd/error_log
```
