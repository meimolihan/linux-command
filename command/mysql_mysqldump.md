mysql_mysqldump
===

MySQL数据库逻辑备份工具

## 补充说明

**mysqldump** 是MySQL官方提供的逻辑备份工具，用于将数据库或表导出为SQL脚本文件。它支持备份单个数据库、多个数据库或所有数据库，备份内容包括表结构（CREATE TABLE）和数据（INSERT语句）。

### 语法

```shell
mysqldump [OPTIONS] database [tables]
mysqldump [OPTIONS] --databases [OPTIONS] DB1 [DB2 DB3...]
mysqldump [OPTIONS] --all-databases [OPTIONS]
```

### 选项

```shell
# 连接选项
-h, --host=name          # 连接的主机地址
-P, --port=#             # 连接的端口号
-u, --user=name          # 连接的用户名
-p, --password[=name]    # 连接的密码
-S, --socket=name        # Unix套接字文件

# 输出选项
--add-drop-database      # 在每个CREATE DATABASE前添加DROP DATABASE
--add-drop-table         # 在每个CREATE TABLE前添加DROP TABLE
--add-locks              # 在INSERT语句前后添加LOCK TABLES和UNLOCK TABLES
--complete-insert        # 使用带列名的完整INSERT语句
--create-options         # 在CREATE TABLE中包含所有MySQL表选项
--extended-insert        # 使用多行INSERT语法（默认开启）
--insert-ignore          # 使用INSERT IGNORE替代INSERT
--no-create-db           # 不输出CREATE DATABASE语句
--no-create-info         # 不输出CREATE TABLE语句
--no-data                # 只导出表结构，不导出数据
--replace                # 使用REPLACE替代INSERT
--skip-extended-insert   # 每行使用单独的INSERT语句
--skip-triggers          # 不导出触发器
--skip-add-drop-table    # 不添加DROP TABLE语句
--triggers               # 导出触发器（默认开启）
--tz-utc                 # 在导出中添加SET TIME_ZONE='+00:00'
--hex-blob               # 使用十六进制导出二进制字段

# 数据库选择
--all-databases          # 备份所有数据库
--databases              # 指定要备份的数据库列表
--ignore-table=db.table  # 忽略指定的表
--tables                 # 覆盖--databases选项，仅导出指定表

# 性能选项
--compact                # 减少输出（去掉注释等）
--quick                  # 一次一行检索结果（默认开启）
--single-transaction     # 使用事务保证数据一致性（InnoDB）
--lock-tables            # 锁定所有表（MyISAM）
--lock-all-tables        # 锁定所有数据库的所有表
--flush-logs             # 在备份前刷新日志
--flush-privileges       # 在备份mysql数据库后刷新权限
--master-data[=#]        # 输出二进制日志位置

# 其他选项
--comments               # 添加注释（默认开启）
--dump-date              # 在结尾添加导出日期
--force                  # 忽略SQL错误继续执行
--include-master-host-port # 包含主机端口信息
--order-by-primary       # 按主键排序导出
--routines               # 导出存储过程和函数
--set-charset            # 添加SET NAMES default_character_set
--xml                    # 以XML格式输出
--where=name             # 仅导出符合条件的行
-V, --version            # 显示版本信息
--help                   # 显示帮助信息
```

### 常用实例

```shell
# 备份单个数据库
mysqldump -u root -p mydb > mydb_backup.sql

# 备份单个数据库的某些表
mysqldump -u root -p mydb users orders > tables_backup.sql

# 备份多个数据库
mysqldump -u root -p --databases db1 db2 db3 > multi_db_backup.sql

# 备份所有数据库
mysqldump -u root -p --all-databases > all_databases.sql

# 只备份表结构（不含数据）
mysqldump -u root -p --no-data mydb > mydb_structure.sql

# 只备份数据（不含表结构）
mysqldump -u root -p --no-create-info mydb > mydb_data.sql

# 使用事务保证一致性备份（推荐用于InnoDB）
mysqldump -u root -p --single-transaction --routines --triggers mydb > mydb_backup.sql

# 完整备份（包含存储过程、触发器、事件）
mysqldump -u root -p --single-transaction --routines --triggers --events mydb > full_backup.sql

# 压缩备份
mysqldump -u root -p mydb | gzip > mydb_backup.sql.gz

# 备份远程数据库
mysqldump -h 192.168.1.100 -P 3306 -u root -p mydb > remote_backup.sql

# 备份时忽略某些表
mysqldump -u root -p --ignore-table=mydb.logs --ignore-table=mydb.temp mydb > mydb_backup.sql

# 导出为XML格式
mysqldump -u root -p --xml mydb > mydb_backup.xml

# 备份符合条件的数据
mysqldump -u root -p --where="created_at > '2024-01-01'" mydb users > recent_users.sql

# 使用完整INSERT语句（包含列名）
mysqldump -u root -p --complete-insert mydb > mydb_backup.sql

# 紧凑格式（减少注释）
mysqldump -u root -p --compact mydb > mydb_backup.sql

# 备份时记录二进制日志位置（用于主从复制）
mysqldump -u root -p --master-data=2 --single-transaction mydb > mydb_backup.sql

# 刷新日志后备份
mysqldump -u root -p --flush-logs --master-data=2 mydb > mydb_backup.sql

# 备份存储过程和函数
mysqldump -u root -p --routines --no-create-info --no-data --no-create-db mysql > procedures.sql

# 备份到远程服务器
mysqldump -u root -p mydb | ssh user@remote "cat > /backup/mydb.sql"

# 从压缩备份恢复
gunzip < mydb_backup.sql.gz | mysql -u root -p mydb
```

### 备份策略示例

```shell
# 每日全量备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
mkdir -p $BACKUP_DIR

mysqldump -u root -p'password' \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --master-data=2 \
  --flush-logs \
  --all-databases | gzip > $BACKUP_DIR/all_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "all_*.sql.gz" -mtime +7 -delete

# 分库备份脚本
#!/bin/bash
BACKUP_DIR="/backup/mysql/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

for db in $(mysql -u root -p'password' -e "SHOW DATABASES" -s --skip-column-names | grep -v information_schema | grep -v performance_schema); do
  mysqldump -u root -p'password' --single-transaction $db | gzip > $BACKUP_DIR/$db.sql.gz
done
```

### 恢复数据

```shell
# 恢复数据库
mysql -u root -p mydb < mydb_backup.sql

# 恢复压缩备份
gunzip < mydb_backup.sql.gz | mysql -u root -p mydb

# 恢复所有数据库
mysql -u root -p < all_databases.sql

# 从远程恢复到本地
ssh user@remote "cat /backup/mydb.sql" | mysql -u root -p mydb

# 恢复时忽略错误继续
mysql -u root -p -f mydb < mydb_backup.sql
```

### 注意事项

1. **大数据库备份**：使用 `--single-transaction` 和 `--quick` 避免锁定表
2. **一致性备份**：对于InnoDB表，使用 `--single-transaction` 而非 `--lock-tables`
3. **字符集**：确保备份和恢复时使用相同的字符集
4. **权限**：备份用户至少需要SELECT、LOCK TABLES、SHOW VIEW权限
5. **存储空间**：备份前确保有足够的磁盘空间
