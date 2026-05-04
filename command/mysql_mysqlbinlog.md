mysql_mysqlbinlog
===

MySQL二进制日志处理工具

## 补充说明

**mysqlbinlog** 是MySQL提供的二进制日志处理工具，用于查看、解析和恢复二进制日志文件。二进制日志记录了所有修改数据的SQL语句，是数据恢复、主从复制和审计的重要工具。

### 语法

```shell
mysqlbinlog [OPTIONS] log_file ...
```

### 选项

```shell
# 基本选项
--base64-output=name      # BASE64输出格式（AUTO/NEVER/DECODE-ROWS）
--binlog-row-event-max-size=# # 行事件最大大小
--character-sets-dir=name # 字符集目录
-d, --database=name       # 只列出指定数据库的语句
--debug-check             # 退出时检查内存使用
--debug-info              # 显示调试信息
-D, --disable-log-bin     # 禁用二进制日志
--force-if-open           # 强制读取正在使用的日志文件
--force-read              # 忽略未识别的事件继续读取
-f, --force               # 强制读取

# 输出选项
--hexdump                 # 以十六进制输出
--no-defaults             # 不读取配置文件
--open-read-limit=#       # 一次读取的最大事件数
--print-table-metadata    # 打印表元数据
-R, --read-from-remote-server  # 从远程服务器读取
--raw                     # 输出原始二进制日志
--result-file=name        # 输出到文件
-s, --short-form          # 简短格式（只显示语句）
--server-id=#             # 只显示指定服务器ID的事件
--set-charset=name        # 设置字符集
--skip-gtids              # 不显示GTID
--start-datetime=datetime # 起始日期时间
--stop-datetime=datetime  # 结束日期时间
-j, --start-position=#    # 起始位置
--stop-position=#         # 结束位置
--start-gtid=gtid         # 起始GTID
--stop-gtid=gtid          # 结束GTID
-T, --table=table         # 只显示指定表的事件
-t, --to-last-log         # 处理到最后一个日志文件
-u, --user=name           # 远程连接用户名
-v, --verbose             # 详细模式（重建SQL语句）
-vv                       # 更详细（显示列类型）
-V, --version             # 显示版本信息
--help                    # 显示帮助信息
```

### 常用实例

```shell
# 查看二进制日志内容
mysqlbinlog mysql-bin.000001

# 查看多个日志文件
mysqlbinlog mysql-bin.000001 mysql-bin.000002

# 查看指定时间范围的日志
mysqlbinlog --start-datetime="2024-01-01 00:00:00" --stop-datetime="2024-01-02 00:00:00" mysql-bin.000001

# 查看指定位置范围的日志
mysqlbinlog --start-position=1000 --stop-position=2000 mysql-bin.000001

# 只查看指定数据库的日志
mysqlbinlog --database=mydb mysql-bin.000001

# 重建SQL语句（显示原始SQL）
mysqlbinlog -v mysql-bin.000001

# 更详细的输出（显示列信息）
mysqlbinlog -vv mysql-bin.000001

# 将日志输出到文件
mysqlbinlog mysql-bin.000001 > output.sql

# 恢复数据
mysqlbinlog mysql-bin.000001 | mysql -u root -p

# 恢复指定时间范围的数据
mysqlbinlog --start-datetime="2024-01-01 10:00:00" --stop-datetime="2024-01-01 12:00:00" mysql-bin.000001 | mysql -u root -p

# 从远程服务器读取日志
mysqlbinlog --read-from-remote-server --host=192.168.1.100 --user=root --password mysql-bin.000001

# 输出原始二进制格式
mysqlbinlog --raw mysql-bin.000001

# 查看正在使用的日志文件
mysqlbinlog --force-if-open mysql-bin.000001

# 以十六进制输出
mysqlbinlog --hexdump mysql-bin.000001

# 简短格式输出
mysqlbinlog --short-form mysql-bin.000001

# 使用GTID定位
mysqlbinlog --start-gtid="3E11FA47-71CA-11E1-9E33-C80AA9429562:1" --stop-gtid="3E11FA47-71CA-11E1-9E33-C80AA9429562:100" mysql-bin.000001

# 处理到最后一个日志
mysqlbinlog --to-last-log mysql-bin.000001

# 禁用日志记录（恢复时避免循环记录）
mysqlbinlog --disable-log-bin mysql-bin.000001 | mysql -u root -p
```

### 数据恢复场景

```shell
# 场景：误删数据后恢复

# 1. 查看当前二进制日志
mysql -u root -p -e "SHOW MASTER LOGS;"

# 2. 找到误删操作的日志
mysqlbinlog -v --base64-output=DECODE-ROWS mysql-bin.000001 | grep -A 10 "DELETE"

# 3. 恢复到删除操作之前
mysqlbinlog --stop-datetime="2024-01-15 14:30:00" mysql-bin.000001 | mysql -u root -p

# 4. 恢复指定数据库
mysqlbinlog --database=mydb --stop-position=12345 mysql-bin.000001 | mysql -u root -p mydb

# 完整恢复流程
# 假设在2024-01-15 15:00:00误删了数据

# 1. 恢复备份
mysql -u root -p mydb < backup_2024_01_15.sql

# 2. 应用备份后的二进制日志（到误删前）
mysqlbinlog --start-datetime="2024-01-15 03:00:00" --stop-datetime="2024-01-15 15:00:00" mysql-bin.00000* | mysql -u root -p

# 3. 跳过误删操作，继续应用后续日志
mysqlbinlog --start-datetime="2024-01-15 15:01:00" mysql-bin.00000* | mysql -u root -p
```

### 主从复制相关

```shell
# 查看从服务器的relay log
mysqlbinlog -v relay-bin.000001

# 检查主从数据一致性
# 在主服务器上
mysqlbinlog --base64-output=DECODE-ROWS -v mysql-bin.000001 > master_binlog.sql

# 在从服务器上
mysqlbinlog --base64-output=DECODE-ROWS -v relay-bin.000001 > slave_relay.sql

# 对比
diff master_binlog.sql slave_relay.sql

# 找出复制错误
mysqlbinlog --base64-output=DECODE-ROWS -v mysql-bin.000001 | grep -i error

# 跳过错误的复制事件
# 1. 查看错误位置
mysqlbinlog -v mysql-bin.000001 | grep -A 5 "Error"

# 2. 跳过错误位置
mysqlbinlog --start-position=123456 mysql-bin.000001 | mysql -u root -p
```

### 输出格式说明

```shell
# 标准格式
# at 123
#240115 10:30:45 server id 1  end_log_pos 256 CRC32 0x12345678  Query   thread_id=10    exec_time=0     error_code=0
SET TIMESTAMP=1705284645/*!*/;
INSERT INTO users (name) VALUES ('test')
/*!*/;

# 详细格式(-v)
# at 123
#240115 10:30:45 server id 1  end_log_pos 256 CRC32 0x12345678  Query   thread_id=10    exec_time=0     error_code=0
SET TIMESTAMP=1705284645/*!*/;
### INSERT INTO `mydb`.`users`
### SET
###   @1=1
###   @2='test'
###   @3='2024-01-15 10:30:45'
/*!*/;
```

### 实用脚本

```shell
#!/bin/bash
# 二进制日志分析脚本

LOG_DIR=/var/lib/mysql
LOG_FILE=$1

if [ -z "$LOG_FILE" ]; then
  echo "Usage: $0 <binlog_file>"
  exit 1
fi

echo "=== Binary Log Analysis: $LOG_FILE ==="
echo ""

echo "Time range:"
mysqlbinlog $LOG_DIR/$LOG_FILE | grep "^#" | head -1
mysqlbinlog $LOG_DIR/$LOG_FILE | grep "^#" | tail -1
echo ""

echo "Databases in log:"
mysqlbinlog --base64-output=DECODE-ROWS -v $LOG_DIR/$LOG_FILE | grep "USE \`" | sort | uniq
echo ""

echo "Operations count:"
mysqlbinlog --base64-output=DECODE-ROWS -v $LOG_DIR/$LOG_FILE | grep -E "^### (INSERT|UPDATE|DELETE)" | cut -d' ' -f3 | sort | uniq -c
echo ""

echo "Tables affected:"
mysqlbinlog --base64-output=DECODE-ROWS -v $LOG_DIR/$LOG_FILE | grep -oP '`[^`]+`\.`[^`]+`' | sort | uniq -c | sort -rn
```

### 注意事项

1. **权限**：需要具有访问二进制日志的权限
2. **磁盘空间**：解析大型日志文件可能需要大量临时空间
3. **恢复测试**：生产恢复前在测试环境验证
4. **GTID**：使用GTID时注意GTID集合的连续性
5. **字符集**：确保客户端字符集与日志字符集一致
