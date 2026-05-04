mysql
===

MySQL客户端命令行工具

## 补充说明

**mysql** 是MySQL数据库的客户端命令行工具，用于连接MySQL服务器并执行SQL语句。它是数据库管理员和开发者最常用的工具之一，支持交互式和批处理两种运行模式。

### 语法

```shell
mysql [OPTIONS] [database]
```

### 选项

```shell
-h, --host=name          # 连接的主机地址（默认localhost）
-P, --port=#             # 连接的端口号（默认3306）
-u, --user=name          # 连接的用户名
-p, --password[=name]    # 连接的密码（不推荐在命令行直接输入）
-D, --database=name      # 指定要使用的数据库
-e, --execute=name       # 执行SQL语句并退出
-B, --batch              # 批处理模式，输出以制表符分隔
-N, --skip-column-names  # 不显示列名
-s, --silent             # 静默模式，减少输出
-r, --raw                # 原始输出，不转义
--vertical               # 垂直显示结果（等同于\G）
--html                   # 以HTML格式输出
--xml                    # 以XML格式输出
--json                   # 以JSON格式输出
-i, --ignore-spaces     # 忽略函数名后的空格
--local-infile          # 启用LOAD DATA LOCAL功能
--max-allowed-packet=#  # 设置最大允许的数据包大小
--net-buffer-length=#   # 设置网络缓冲区大小
--protocol=name         # 使用的连接协议(tcp/socket/pipe/memory)
-S, --socket=name       # Unix套接字文件或Windows命名管道
--ssl-mode=name         # SSL连接模式
--ssl-ca=name           # SSL证书颁发机构文件
--ssl-cert=name         # SSL证书文件
--ssl-key=name          # SSL密钥文件
-v, --verbose           # 详细输出
-V, --version           # 显示版本信息
--help                  # 显示帮助信息
```

### 常用实例

```shell
# 连接本地MySQL服务器
mysql -u root -p

# 连接指定主机和端口
mysql -h 192.168.1.100 -P 3306 -u root -p

# 连接并指定数据库
mysql -u root -p -D mydb

# 直接执行SQL语句
mysql -u root -p -e "SHOW DATABASES;"
mysql -u root -p -e "SELECT * FROM users LIMIT 10;" mydb

# 执行多条SQL语句
mysql -u root -p -e "USE mydb; SELECT COUNT(*) FROM users;"

# 从文件执行SQL脚本
mysql -u root -p mydb < backup.sql

# 批处理模式输出（适合脚本处理）
mysql -u root -p -B -e "SELECT * FROM users" mydb

# 不显示列名
mysql -u root -p -N -e "SELECT name FROM users" mydb

# 垂直显示结果
mysql -u root -p -e "SELECT * FROM users" mydb --vertical

# JSON格式输出（MySQL 5.7+）
mysql -u root -p --json -e "SELECT * FROM users LIMIT 5" mydb

# HTML格式输出
mysql -u root -p --html -e "SELECT * FROM users" mydb > output.html

# 使用SSL连接
mysql -h remote.example.com -u root -p --ssl-mode=REQUIRED

# 导出查询结果到CSV
mysql -u root -p -B -e "SELECT * FROM users" mydb | tr '\t' ',' > users.csv

# 显示版本信息
mysql --version

# 通过Unix套接字连接
mysql -u root -p -S /var/run/mysqld/mysqld.sock
```

### 交互式命令

```shell
# 在mysql>提示符下的常用命令
help (\h)        # 显示帮助
clear (\c)       # 清除当前输入
connect (\r)     # 重新连接到服务器
delimiter (\d)   # 设置语句分隔符
edit (\e)        # 编辑命令（调用编辑器）
ego (\G)         # 发送命令并垂直显示结果
exit (\q)        # 退出mysql
go (\g)          # 发送命令到服务器
nopager (\n)     # 禁用分页器
pager (\P)       # 设置分页器（如less）
print (\p)       # 打印当前命令
prompt (\R)      # 更改提示符
quit (\q)        # 退出mysql
rehash (\#)      # 重建补全哈希
source (\.)      # 执行SQL脚本文件
status (\s)      # 显示服务器状态
system (\!)      # 执行系统命令
tee (\T)         # 设置输出文件（记录所有输出）
use (\u)         # 切换数据库
charset (\C)     # 切换字符集
warnings (\W)    # 显示警告
nowarning (\w)   # 不显示警告
```

### 实用技巧

```shell
# 安全地输入密码（不在命令行暴露）
mysql -u root -p
# 系统会提示输入密码

# 使用配置文件存储连接信息
# 在 ~/.my.cnf 文件中添加：
[client]
user = root
password = your_password
host = localhost

# 然后可以直接运行
mysql

# 显示执行的语句
mysql -u root -p -v -v -v < script.sql

# 将查询结果保存到文件
mysql -u root -p -e "SELECT * FROM users" mydb > output.txt

# 使用管道组合命令
echo "SELECT NOW()" | mysql -u root -p

# 监控MySQL状态
watch -n 1 'mysql -u root -p -e "SHOW PROCESSLIST"'
```

### 环境变量

```shell
MYSQL_UNIX_PORT    # Unix套接字文件路径
MYSQL_TCP_PORT     # TCP端口号
MYSQL_PWD          # 默认密码（不推荐使用）
MYSQL_DEBUG        # 调试选项
TMPDIR             # 临时文件目录
```
