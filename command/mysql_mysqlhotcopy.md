mysql_mysqlhotcopy
===

MySQL MyISAM表热备份工具

## 补充说明

**mysqlhotcopy** 是一个Perl脚本，用于快速备份MyISAM和ARCHIVE存储引擎的表。它通过锁定表、复制数据文件、解锁表的方式实现热备份。相比mysqldump，它的备份速度更快，但仅适用于特定存储引擎。

### 语法

```shell
mysqlhotcopy db_name[./table_regex/] [new_db_name | directory]
```

### 选项

```shell
--allowold            # 不自动覆盖，备份前重命名为old
--addtodest           # 不重命名，添加到目标目录
--checkpoint=db.table # 检查点表
--chroot=path         # chroot路径
--debug               # 启用调试输出
--dryrun              # 只打印要执行的命令，不实际执行
--flushlog            # 备份后刷新日志
--help                # 显示帮助信息
--host=host_name      # 连接的主机地址
--keepold             # 备份完成后不删除旧的备份
--method=command      # 复制方法（cp或scp）
--noindices           # 不备份索引文件（更快）
--old_server          # 兼容旧服务器
--password=password   # 连接密码
--port=port_num       # 连接端口
--quiet               # 安静模式
--regexp=pattern      # 使用正则表达式匹配要备份的表
--resetmaster         # 备份后重置二进制日志
--resetslave          # 备份后重置slave信息
--socket=path         # Unix套接字文件
--suffix=str          # 备份目录后缀
--tmpdir=path         # 临时目录
--user=user_name      # 连接用户名
--version             # 显示版本信息
```

### 常用实例

```shell
# 备份单个数据库到当前目录
mysqlhotcopy -u root -p mydb

# 备份到指定目录
mysqlhotcopy -u root -p mydb /backup/mysql/

# 备份多个数据库
mysqlhotcopy -u root -p db1 db2 /backup/mysql/

# 备份特定表（使用正则）
mysqlhotcopy -u root -p mydb./user_*/

# 使用正则表达式匹配表
mysqlhotcopy -u root -p --regexp='^mydb\.user_' /backup/

# 备份时不包含索引文件
mysqlhotcopy -u root -p --noindices mydb /backup/

# 使用SCP复制到远程服务器
mysqlhotcopy -u root -p --method=scp mydb user@remote:/backup/

# 模拟执行（显示将执行的命令）
mysqlhotcopy -u root -p --dryrun mydb /backup/

# 备份后保留旧备份
mysqlhotcopy -u root -p --allowold --keepold mydb /backup/

# 备份后刷新日志
mysqlhotcopy -u root -p --flushlog mydb /backup/

# 添加日期后缀
mysqlhotcopy -u root -p --suffix=_$(date +%Y%m%d) mydb /backup/

# 远程备份
mysqlhotcopy -h 192.168.1.100 -u root -p mydb /backup/
```

### 备份脚本示例

```shell
#!/bin/bash
# MyISAM表热备份脚本

BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_USER="root"
MYSQL_PASS="password"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份所有MyISAM数据库
for db in $(mysql -u $MYSQL_USER -p$MYSQL_PASS -e "SHOW DATABASES" -s --skip-column-names | grep -v -E "information_schema|performance_schema|mysql"); do
  # 检查是否有MyISAM表
  if mysql -u $MYSQL_USER -p$MYSQL_PASS -e "SHOW TABLE STATUS FROM $db" -s | grep -q "MyISAM"; then
    echo "Backing up $db..."
    mysqlhotcopy -u $MYSQL_USER -p $MYSQL_PASS --allowold $db $BACKUP_DIR/
    if [ $? -eq 0 ]; then
      echo "  $db backed up to $BACKUP_DIR/${db}"
    else
      echo "  Failed to backup $db"
    fi
  fi
done

# 压缩备份
cd $BACKUP_DIR
for dir in */; do
  if [ -d "$dir" ]; then
    tar -czf "${dir%/}_$DATE.tar.gz" "$dir"
    rm -rf "$dir"
  fi
done

# 清理7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed at $(date)"
```

### 恢复方法

```shell
# mysqlhotcopy备份的是数据文件，恢复时直接复制回去

# 1. 停止MySQL服务
service mysql stop

# 2. 恢复数据文件
cp -r /backup/mysql/mydb /var/lib/mysql/

# 3. 设置权限
chown -R mysql:mysql /var/lib/mysql/mydb

# 4. 启动MySQL服务
service mysql start

# 或者使用tar压缩备份恢复
tar -xzf mydb_20240115.tar.gz -C /var/lib/mysql/
chown -R mysql:mysql /var/lib/mysql/mydb
```

### 与mysqldump对比

| 特性 | mysqlhotcopy | mysqldump |
|------|-------------|-----------|
| 备份方式 | 物理备份（复制文件） | 逻辑备份（SQL语句） |
| 速度 | 快 | 较慢 |
| 存储引擎 | MyISAM/ARCHIVE | 所有引擎 |
| 跨平台 | 否（需要相同架构） | 是 |
| 锁表 | 读锁（短暂） | 可选 |
| 恢复方式 | 复制文件 | 执行SQL |
| 压缩 | 需额外处理 | 可管道压缩 |
| 增量备份 | 不支持 | 支持（配合binlog） |

### 注意事项

1. **存储引擎限制**：仅支持MyISAM和ARCHIVE表，不支持InnoDB
2. **权限要求**：需要有SELECT、LOCK TABLES权限，以及文件系统写入权限
3. **平台限制**：备份文件只能在相同架构的系统上恢复
4. **锁定时间**：虽然锁定时间短，但大表仍可能影响业务
5. **磁盘空间**：备份需要足够的磁盘空间存储数据文件副本
6. **Perl依赖**：需要Perl环境和相关模块（DBI、DBD::mysql）
7. **未来弃用**：MySQL 8.0已移除此工具，建议使用MySQL Enterprise Backup

### 替代方案

```shell
# 对于InnoDB表，建议使用：
# 1. mysqldump --single-transaction
mysqldump -u root -p --single-transaction mydb > mydb_backup.sql

# 2. MySQL Enterprise Backup (商业版)
# 3. Percona XtraBackup (开源)
xtrabackup --backup --target-dir=/backup/mysql/

# 4. 文件系统快照（LVM、ZFS等）
```
