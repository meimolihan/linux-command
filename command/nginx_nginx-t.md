nginx_nginx-t
===

测试 nginx 配置文件语法

## 补充说明

**nginx -t** 命令用于测试 nginx 配置文件的语法和有效性，而不实际启动或重载服务。这是在应用配置之前的重要验证步骤。

### 语法

```shell
nginx -t [-c filename] [-g directives] [-p prefix]
```

### 常用实例

```shell
# 测试默认配置文件
nginx -t

# 测试指定配置文件
nginx -t -c /etc/nginx/nginx.conf

# 测试并显示配置片段
nginx -t 2>&1 | head -20

# 结合重载使用
nginx -t && nginx -s reload
```

### 输出示例

```shell
# 语法正确时
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

# 语法错误时
nginx: [emerg] directive "listen" is unexpected in /etc/nginx/conf.d/example.conf:10
nginx: configuration file /etc/nginx/nginx.conf test failed
```

### 常见配置错误

```shell
# 1. 端口冲突
[emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)

# 2. 配置块嵌套错误
[emerg] unexpected end of file

# 3. 语法错误
[emerg] unknown directive "lstien"
```

### 测试流程建议

```shell
# 1. 编辑配置前备份
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# 2. 修改配置

# 3. 测试配置
nginx -t

# 4. 确认语法正确后重载
nginx -s reload
```

### 使用脚本批量测试

```shell
#!/bin/bash
# 测试所有配置
nginx -t -c /etc/nginx/nginx.conf
if [ $? -eq 0 ]; then
    echo "Configuration OK, reloading..."
    nginx -s reload
else
    echo "Configuration error, please fix"
    exit 1
fi
```
