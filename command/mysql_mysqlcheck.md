mysql_mysqlcheck
===

MySQL表维护和修复工具

## 补充说明

**mysqlcheck** 是MySQL提供的表维护客户端，用于检查、修复、分析和优化数据库表。它支持MyISAM、InnoDB等多种存储引擎，可以同时处理多个数据库或表。

### 语法

```shell
mysqlcheck [OPTIONS] database [tables]
mysqlcheck [OPTIONS] --databases [OPTIONS] DB1 [DB2 DB3...]
mysqlcheck [OPTIONS] --all-databases [OPTIONS]
```

### 选项

```shell
# 连接选项
-h, --host=name          # 连接的主机地址
-P, --port=#             # 连接的端口号
-u, --user=name          # 连接的用户名
-p, --password[=name]    # 连接的密码
-S, --socket=name        # Unix套接字文件

# 操作选项
-a, --analyze            # 分析表
-A, --all-databases      # 检查所有数据库
--auto-repair            # 发现损坏时自动修复
-B, --databases          # 处理多个数据库
--check                  # 检查表（默认操作）
--check-only-changed     # 只检查自上次检查后有变化的表
-C, --check-upgrade      # 检查表是否与当前版本兼容
--compress               # 使用压缩协议
-d, --databases          # 指定数据库列表
-e, --extended           # 扩展检查（更详细但更慢）
-F, --fast               # 只检查未正确关闭的表
--fix-db-names           # 修复数据库名中的特殊字符
--fix-table-names        # 修复表名中的特殊字符
-f, --force              # 即使出现SQL错误也继续
-g, --ggb                # 保留向后兼容
-m, --medium-check       # 中等速度检查
--optimize               # 优化表
--quick                  # 快速检查
-r, --repair             # 修复表
-s, --silent             # 静默模式，只输出错误
--skip-database=name     # 跳过指定数据库
--tables                 # 覆盖--databases选项
-u, --user=name          # 连接用户名
--use-frm                # 使用.frm文件修复（危险）
-v, --verbose            # 详细输出
-w, --write-binlog       # 记录命令到二进制日志
-V, --version            # 显示版本信息
--help                   # 显示帮助信息
```

### 常用实例

```shell
# 检查单个数据库的所有表
mysqlcheck -u root -p mydb

# 检查单个数据库的指定表
mysqlcheck -u root -p mydb users orders

# 检查多个数据库
mysqlcheck -u root -p --databases db1 db2 db3

# 检查所有数据库
mysqlcheck -u root -p --all-databases

# 分析表（更新索引统计信息）
mysqlcheck -u root -p --analyze mydb

# 优化表（重建表，整理碎片）
mysqlcheck -u root -p --optimize mydb

# 修复表
mysqlcheck -u root -p --repair mydb

# 检查并自动修复
mysqlcheck -u root -p --auto-repair --all-databases

# 快速检查（只检查未正确关闭的表）
mysqlcheck -u root -p --fast --all-databases

# 扩展检查（更详细）
mysqlcheck -u root -p --extended mydb users

# 中等速度检查
mysqlcheck -u root -p --medium-check mydb

# 检查时只显示错误
mysqlcheck -u root -p --silent --all-databases

# 详细输出
mysqlcheck -u root -p --verbose --all-databases

# 优化所有数据库的所有表
mysqlcheck -u root -p --optimize --all-databases

# 分析所有表
mysqlcheck -u root -p --analyze --all-databases

# 修复损坏的表
mysqlcheck -u root -p --repair mydb corrupted_table

# 检查并修复（推荐维护流程）
mysqlcheck -u root -p --check --auto-repair --all-databases

# 检查远程数据库
mysqlcheck -h 192.168.1.100 -u root -p mydb

# 跳过某些数据库
mysqlcheck -u root -p --all-databases --skip-database=information_schema --skip-database=performance_schema

# 强制继续（忽略错误）
mysqlcheck -u root -p --force --repair mydb
```

### 操作说明

```shell
# CHECK TABLE - 检查表错误
# 适用于: MyISAM, InnoDB, ARCHIVE
mysqlcheck --check mydb

# ANALYZE TABLE - 分析表，更新索引统计信息
# 用于优化查询计划
mysqlcheck --analyze mydb

# REPAIR TABLE - 修复损坏的表
# 主要用于MyISAM表，InnoDB通常能自动恢复
mysqlcheck --repair mydb

# OPTIMIZE TABLE - 优化表，整理碎片
# 适用于: MyISAM, InnoDB, ARCHIVE
mysqlcheck --optimize mydb
```

### 定期维护脚本

```shell
#!/bin/bash
# MySQL表维护脚本
# 用法: ./mysql_maintenance.sh [database]

DB=${1:-"--all-databases"}
LOG_FILE="/var/log/mysql_maintenance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "=== $DATE ===" >> $LOG_FILE

# 检查所有表
echo "Checking tables..." >> $LOG_FILE
mysqlcheck -u root -p'password' --check --silent $DB >> $LOG_FILE 2>&1

# 分析所有表
echo "Analyzing tables..." >> $LOG_FILE
mysqlcheck -u root -p'password' --analyze --silent $DB >> $LOG_FILE 2>&1

# 优化所有表
echo "Optimizing tables..." >> $LOG_FILE
mysqlcheck -u root -p'password' --optimize --silent $DB >> $LOG_FILE 2>&1

echo "Done." >> $LOG_FILE

# 每周日凌晨3点执行维护
# crontab -e
# 0 3 * * 0 /path/to/mysql_maintenance.sh >> /var/log/mysql_maintenance.log 2>&1
```

### 输出状态说明

```shell
# 正常状态
mydb.users    OK

# 表损坏
mydb.users    Table is marked as crashed

# 修复成功
mydb.users    repair : OK

# 需要优化
mydb.users    note   : Table does not support optimize, doing recreate + analyze instead
```

### 存储引擎支持

| 操作 | MyISAM | InnoDB | ARCHIVE |
|------|--------|--------|---------|
| CHECK | ✓ | ✓ | ✓ |
| ANALYZE | ✓ | ✓ | - |
| REPAIR | ✓ | 不支持* | - |
| OPTIMIZE | ✓ | ✓ | ✓ |

> *注：InnoDB表损坏通常需要通过恢复备份或使用innodb_force_recovery参数处理

### 注意事项

1. **锁表**：CHECK和ANALYZE只读锁，OPTIMIZE和REPAIR会写锁
2. **InnoDB**：InnoDB的OPTIMIZE会重建表，大表可能耗时较长
3. **备份**：修复前建议先备份数据
4. **生产环境**：大表维护应在低峰期执行
5. **监控**：维护期间监控服务器负载和磁盘空间
