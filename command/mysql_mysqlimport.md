mysql_mysqlimport
===

MySQL数据导入工具

## 补充说明

**mysqlimport** 是MySQL提供的数据导入工具，用于将文本文件中的数据导入到数据库表中。它是LOAD DATA INFILE语句的命令行接口，支持多种文本格式，是快速批量导入数据的有效工具。

### 语法

```shell
mysqlimport [OPTIONS] database textfile...
```

### 选项

```shell
# 连接选项
-h, --host=name          # 连接的主机地址
-P, --port=#             # 连接的端口号
-u, --user=name          # 连接的用户名
-p, --password[=name]    # 连接的密码
-S, --socket=name        # Unix套接字文件

# 数据格式选项
--fields-terminated-by=name   # 字段分隔符（默认\t）
--fields-enclosed-by=name     # 字段包围符
--fields-escaped-by=name      # 转义字符
--fields-optionally-enclosed-by=name # 可选包围符
--lines-terminated-by=name    # 行结束符（默认\n）
--ignore-lines=#              # 忽略前N行

# 导入选项
--delete                # 导入前清空表
--ignore                # 忽略重复键错误
--replace               # 替换重复键的记录
--local                 # 从客户端读取文件
--lock-tables           # 导入前锁定表
--low-priority          # 低优先级执行
-d, --delete            # 导入前删除表数据
-i, --ignore            # 忽略重复行
-r, --replace           # 替换重复行
-L, --local             # 从本地读取文件
-l, --lock-tables       # 锁定表

# 输出选项
--silent                # 静默模式
--verbose               # 详细输出
--force                 # 忽略错误继续
--compress              # 使用压缩协议
-V, --version           # 显示版本信息
--help                  # 显示帮助信息
```

### 常用实例

```shell
# 基本导入（文件名必须与表名对应）
# users.txt 导入到 users 表
mysqlimport -u root -p mydb users.txt

# 从本地导入文件
mysqlimport -u root -p --local mydb users.txt

# 导入多个文件
mysqlimport -u root -p --local mydb users.txt orders.txt products.txt

# 指定字段分隔符（逗号分隔，CSV格式）
mysqlimport -u root -p --local --fields-terminated-by=',' mydb users.csv

# CSV格式，带引号包围
mysqlimport -u root -p --local \
  --fields-terminated-by=',' \
  --fields-enclosed-by='"' \
  --lines-terminated-by='\n' \
  mydb users.csv

# 忽略第一行（表头）
mysqlimport -u root -p --local --ignore-lines=1 mydb users.csv

# 导入前清空表
mysqlimport -u root -p --local --delete mydb users.txt

# 替换重复记录
mysqlimport -u root -p --local --replace mydb users.txt

# 忽略重复记录
mysqlimport -u root -p --local --ignore mydb users.txt

# 导入并锁定表
mysqlimport -u root -p --local --lock-tables mydb users.txt

# 低优先级导入
mysqlimport -u root -p --local --low-priority mydb users.txt

# 详细输出
mysqlimport -u root -p --local --verbose mydb users.txt

# 静默模式
mysqlimport -u root -p --local --silent mydb users.txt

# 强制继续（忽略错误）
mysqlimport -u root -p --local --force mydb users.txt

# 使用制表符分隔（默认）
mysqlimport -u root -p --local --fields-terminated-by='\t' mydb users.txt

# 处理特殊字符
mysqlimport -u root -p --local \
  --fields-terminated-by=',' \
  --fields-enclosed-by='"' \
  --fields-escaped-by='\\' \
  --lines-terminated-by='\n' \
  mydb users.csv

# 导入到远程服务器
mysqlimport -h 192.168.1.100 -u root -p --local mydb users.txt
```

### 数据文件格式

```shell
# 默认格式（制表符分隔）
# users.txt
1\tJohn\tjohn@example.com\t2024-01-01
2\tJane\tjane@example.com\t2024-01-02

# CSV格式（逗号分隔，引号包围）
# users.csv
"id","name","email","created_at"
1,"John","john@example.com","2024-01-01"
2,"Jane","jane@example.com","2024-01-02"

# 导入命令
mysqlimport -u root -p --local \
  --fields-terminated-by=',' \
  --fields-enclosed-by='"' \
  --lines-terminated-by='\n' \
  --ignore-lines=1 \
  mydb users.csv
```

### 与LOAD DATA对比

```shell
# mysqlimport命令
mysqlimport -u root -p --local --fields-terminated-by=',' mydb users.csv

# 等效的SQL语句
LOAD DATA LOCAL INFILE 'users.csv'
INTO TABLE users
FIELDS TERMINATED BY ',';

# mysqlimport的高级用法
mysqlimport -u root -p --local \
  --replace \
  --ignore-lines=1 \
  --fields-terminated-by=',' \
  --fields-enclosed-by='"' \
  mydb users.csv

# 等效SQL
LOAD DATA LOCAL INFILE 'users.csv'
REPLACE
INTO TABLE users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
IGNORE 1 LINES;
```

### 批量导入脚本

```shell
#!/bin/bash
# 批量CSV导入脚本

DB="mydb"
USER="root"
PASS="password"
DIR="./data"

for file in $DIR/*.csv; do
  if [ -f "$file" ]; then
    # 从文件名获取表名（去掉.csv后缀）
    table=$(basename "$file" .csv)
    
    echo "Importing $file into $table..."
    
    mysqlimport -u $USER -p$PASS --local \
      --replace \
      --ignore-lines=1 \
      --fields-terminated-by=',' \
      --fields-enclosed-by='"' \
      --lines-terminated-by='\n' \
      --verbose \
      $DB $file
    
    if [ $? -eq 0 ]; then
      echo "  $table imported successfully"
    else
      echo "  Failed to import $table"
    fi
  fi
done

echo "Import completed"
```

### 从mysqldump导入数据

```shell
# mysqldump导出数据（不包含结构）
mysqldump -u root -p --no-create-info --tab=/tmp/ mydb

# 这会生成每个表的.txt和.sql文件
# /tmp/users.txt - 数据文件
# /tmp/users.sql - 表结构

# 使用mysqlimport导入数据
mysqlimport -u root -p --local mydb /tmp/users.txt
```

### 性能优化

```shell
# 1. 禁用索引（大批量导入前）
mysql -u root -p -e "ALTER TABLE mydb.users DISABLE KEYS;"
mysqlimport -u root -p --local mydb users.txt
mysql -u root -p -e "ALTER TABLE mydb.users ENABLE KEYS;"

# 2. 使用事务
mysql -u root -p -e "SET autocommit=0; SET unique_checks=0; SET foreign_key_checks=0;"
mysqlimport -u root -p --local mydb users.txt orders.txt
mysql -u root -p -e "SET autocommit=1; SET unique_checks=1; SET foreign_key_checks=1;"

# 3. 调整MySQL参数
# my.cnf
# innodb_buffer_pool_size = 1G
# innodb_log_file_size = 256M
# innodb_flush_log_at_trx_commit = 2
```

### 常见问题处理

```shell
# 文件名与表名不匹配
# 方法1：重命名文件
mv data.txt users.txt
mysqlimport -u root -p --local mydb users.txt

# 方法2：使用符号链接
ln -s data.txt users.txt
mysqlimport -u root -p --local mydb users.txt
rm users.txt

# 处理编码问题
# 确保文件编码与数据库字符集一致
iconv -f GBK -t UTF-8 users_gbk.txt > users_utf8.txt
mysqlimport -u root -p --local mydb users_utf8.txt

# 查看导入进度
mysqlimport -u root -p --local --verbose mydb users.txt 2>&1 | tee import.log
```

### 注意事项

1. **文件命名**：文件名（不含扩展名）必须与表名一致
2. **权限**：需要INSERT权限，--local需要FILE权限
3. **字段匹配**：文件列数必须与表列数一致或使用用户变量跳过
4. **字符集**：确保文件编码与数据库字符集一致
5. **安全**：--local选项允许从客户端读取文件，注意文件路径安全
