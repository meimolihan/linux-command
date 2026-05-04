mysql_mysqladmin
===

MySQL服务器管理工具

## 补充说明

**mysqladmin** 是MySQL提供的服务器管理客户端，用于执行管理操作，如创建/删除数据库、刷新权限、查看服务器状态、关闭服务器等。它是数据库管理员日常运维的重要工具。

### 语法

```shell
mysqladmin [OPTIONS] command command....
```

### 选项

```shell
# 连接选项
-h, --host=name          # 连接的主机地址
-P, --port=#             # 连接的端口号
-u, --user=name          # 连接的用户名
-p, --password[=name]    # 连接的密码
-S, --socket=name        # Unix套接字文件

# 执行选项
-c, --count=#            # 迭代执行的次数（与--sleep配合）
-s, --sleep=#            # 重复执行的间隔秒数
-r, --relative           # 显示当前值与上一次值的差异
-i, --sleep=#            # 间隔秒数重复执行

# 输出选项
-v, --verbose            # 详细输出
-V, --version            # 显示版本信息
--help                   # 显示帮助信息
--force                  # 不再询问确认（删除数据库时）
--debug-info             # 显示调试信息
--default-auth=name      # 默认认证插件
--no-beep                # 忽略错误蜂鸣
```

### 命令

```shell
create databasename       # 创建数据库
drop databasename         # 删除数据库
extended-status           # 显示服务器扩展状态信息
flush-hosts               # 刷新主机缓存
flush-logs                # 刷新日志
flush-privileges          # 刷新权限（重载权限表）
flush-status              # 清除状态变量
flush-tables              # 刷新表缓存
flush-threads             # 刷新线程缓存
kill id,id,...            # 终止服务器线程
password new-password     # 更改旧密码为new-password
ping                      # 检查服务器是否可用
processlist               # 显示活动线程列表
reload                    # 重载权限表
refresh                   # 刷新所有表并关闭/打开日志
shutdown                  # 关闭服务器
status                    # 显示服务器状态
start-slave               # 启动从服务器复制
stop-slave                # 停止从服务器复制
variables                 # 显示服务器变量
version                   # 显示服务器版本
```

### 常用实例

```shell
# 检查服务器是否运行
mysqladmin -u root -p ping

# 查看服务器状态
mysqladmin -u root -p status

# 查看服务器版本
mysqladmin -u root -p version

# 查看服务器扩展状态
mysqladmin -u root -p extended-status

# 查看服务器变量
mysqladmin -u root -p variables

# 查看所有变量（搜索特定变量）
mysqladmin -u root -p variables | grep max_connections

# 创建数据库
mysqladmin -u root -p create mydb

# 删除数据库（需要确认）
mysqladmin -u root -p drop mydb

# 删除数据库（不确认）
mysqladmin -u root -p -f drop mydb

# 刷新权限
mysqladmin -u root -p flush-privileges

# 刷新日志
mysqladmin -u root -p flush-logs

# 刷新表缓存
mysqladmin -u root -p flush-tables

# 查看当前进程列表
mysqladmin -u root -p processlist

# 显示完整进程列表
mysqladmin -u root -p processlist --verbose

# 终止指定线程
mysqladmin -u root -p kill 12345

# 终止多个线程
mysqladmin -u root -p kill 123,456,789

# 关闭MySQL服务器
mysqladmin -u root -p shutdown

# 修改root密码
mysqladmin -u root -p password "new_password"

# 定时监控服务器状态（每5秒一次）
mysqladmin -u root -p -i 5 status

# 定时监控状态变化（显示差值）
mysqladmin -u root -p -i 5 -r extended-status

# 监控特定状态变量
mysqladmin -u root -p -i 5 -r extended-status | grep -E "Questions|Queries|Connections"

# 查看从服务器复制状态
mysqladmin -u root -p extended-status | grep -E "Slave_.*_Running|Seconds_Behind"

# 启动从服务器复制
mysqladmin -u root -p start-slave

# 停止从服务器复制
mysqladmin -u root -p stop-slave

# 执行多个命令
mysqladmin -u root -p ping status version

# 远程服务器管理
mysqladmin -h 192.168.1.100 -P 3306 -u root -p status
```

### 监控脚本示例

```shell
#!/bin/bash
# MySQL监控脚本
# 用法: ./mysql_monitor.sh [interval]

INTERVAL=${1:-5}

echo "MySQL Server Monitor (interval: ${INTERVAL}s)"
echo "Press Ctrl+C to stop"
echo ""

mysqladmin -u root -p -i $INTERVAL -r extended-status | \
  awk '/Queries|Questions|Connections|Bytes_received|Bytes_sent|Threads_connected|Threads_running/ {
    printf "%-20s %15s\n", $2, $4
  }'
```

### 状态输出说明

```shell
# status 命令输出
Uptime: 123456    # 服务器运行时间（秒）
Threads: 5        # 活动线程数
Questions: 12345  # 服务器收到的查询数
Slow queries: 10  # 慢查询数
Opens: 500        # 打开的表数
Flush tables: 2   # 刷新表次数
Open tables: 50   # 当前打开的表数
Queries per second avg: 0.100  # 平均每秒查询数
```

### 常用运维场景

```shell
# 1. 检查MySQL是否响应
mysqladmin -u root -p ping
# 正常输出: mysqld is alive

# 2. 监控连接数
watch -n 1 'mysqladmin -u root -p processlist | wc -l'

# 3. 找出长时间运行的查询
mysqladmin -u root -p processlist | grep -v "Sleep" | awk '{print $3, $4, $5}'

# 4. 监控QPS
mysqladmin -u root -p -i 1 -r status | awk '{print $NF}'

# 5. 刷新所有缓存
mysqladmin -u root -p flush-hosts flush-logs flush-privileges flush-tables flush-status flush-threads

# 6. 安全关闭MySQL
mysqladmin -u root -p shutdown
# 等待所有连接关闭后再停止服务
```

### 注意事项

1. **权限要求**：执行管理命令需要足够的权限（如SHUTDOWN、PROCESS、RELOAD等）
2. **远程管理**：远程关闭服务器需要确保有网络连接和相应权限
3. **生产环境**：在生产环境执行shutdown前，确保已通知相关人员
4. **密码安全**：避免在命令行直接输入密码，建议使用配置文件
