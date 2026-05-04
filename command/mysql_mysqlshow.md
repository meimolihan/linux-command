mysql_mysqlshow
===

MySQL数据库和表信息查看工具

## 补充说明

**mysqlshow** 是MySQL提供的客户端工具，用于显示数据库、表和列的信息。它是一个快速查看数据库结构的便捷工具，无需登录MySQL客户端即可获取元数据。

### 语法

```shell
mysqlshow [OPTIONS] [database [table [column]]]
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
--character-sets-dir=name # 字符集目录
--compress               # 使用压缩协议
--count                  # 显示表的行数
-C, --compress           # 使用压缩
-?, --help               # 显示帮助信息
-I, --status             # 显示表的额外信息
-k, --keys               # 显示表的索引
--debug-info             # 显示调试信息
-m, --mysql              # 使用MySQL协议
--default-auth=name      # 默认认证插件
--no-defaults            # 不读取配置文件
--print-defaults         # 打印默认选项
--show-table-type        # 显示表类型
-i, --status             # 显示表状态信息
-t, --show-table-type    # 显示表类型（ENGINE）
-v, --verbose            # 详细输出（可多次使用）
-V, --version            # 显示版本信息
-w, --where=name         # 过滤条件
```

### 常用实例

```shell
# 显示所有数据库
mysqlshow -u root -p

# 显示指定数据库的所有表
mysqlshow -u root -p mydb

# 显示指定表的列信息
mysqlshow -u root -p mydb users

# 显示指定列的信息
mysqlshow -u root -p mydb users id name

# 显示表的行数
mysqlshow -u root -p --count mydb

# 显示表的索引信息
mysqlshow -u root -p --keys mydb users

# 显示表的详细状态
mysqlshow -u root -p --status mydb

# 显示表类型（存储引擎）
mysqlshow -u root -p --show-table-type mydb

# 详细输出（显示更多信息）
mysqlshow -u root -p -v mydb
mysqlshow -u root -p -v -v mydb

# 组合选项：显示表状态、索引和行数
mysqlshow -u root -p --status --keys --count mydb

# 显示远程数据库信息
mysqlshow -h 192.168.1.100 -u root -p mydb

# 使用通配符过滤
mysqlshow -u root -p mydb "user%"
mysqlshow -u root -p mydb users "%id"

# 显示表的完整信息
mysqlshow -u root -p -v -v mydb users
```

### 输出说明

```shell
# 显示所有数据库
+--------------------+
|     Databases      |
+--------------------+
| information_schema |
| mydb               |
| mysql              |
| performance_schema |
| sys                |
+--------------------+

# 显示数据库中的表
+----------------+
|    Tables_in_mydb |
+----------------+
| orders         |
| products       |
| users          |
+----------------+

# 显示表的列
+-----------+-------------+------+-----+---------+----------------+
| Field     | Type        | Null | Key | Default | Extra          |
+-----------+-------------+------+-----+---------+----------------+
| id        | int(11)     | NO   | PRI | NULL    | auto_increment |
| name      | varchar(100)| YES  |     | NULL    |                |
| email     | varchar(255)| YES  | UNI | NULL    |                |
| created_at| datetime    | YES  |     | NULL    |                |
+-----------+-------------+------+-----+---------+----------------+

# 带行数的输出
+---------+------------+
| Tables  | Rows       |
+---------+------------+
| orders  | 1234       |
| users   | 567        |
+---------+------------+

# 带表类型的输出
+---------+------------+
| Tables  | Table_type |
+---------+------------+
| orders  | InnoDB     |
| users   | InnoDB     |
+---------+------------+
```

### 常用场景

```shell
# 快速查看数据库列表
mysqlshow -u root -p

# 检查表是否存在
mysqlshow -u root -p mydb users 2>/dev/null && echo "表存在" || echo "表不存在"

# 查看表结构
mysqlshow -u root -p mydb users

# 查看索引
mysqlshow -u root -p --keys mydb users

# 查看所有表的行数
mysqlshow -u root -p --count mydb

# 检查远程数据库结构
mysqlshow -h remote-server -u root -p mydb

# 批量脚本：列出所有数据库和表
#!/bin/bash
for db in $(mysqlshow -u root -p | tail -n +4 | head -n -1 | awk '{print $2}'); do
  echo "=== Database: $db ==="
  mysqlshow -u root -p --count $db
done

# 查找特定表
mysqlshow -u root -p | grep -i "log"

# 查看表的详细信息（权限、注释等）
mysqlshow -u root -p -v -v mydb users
```

### 与SHOW语句对比

```shell
# mysqlshow 等效于以下SQL语句

# 显示所有数据库
mysqlshow -u root -p
# 等效于: SHOW DATABASES;

# 显示数据库中的表
mysqlshow -u root -p mydb
# 等效于: USE mydb; SHOW TABLES;

# 显示表的列
mysqlshow -u root -p mydb users
# 等效于: DESCRIBE mydb.users;
# 或: SHOW COLUMNS FROM mydb.users;

# 显示表的索引
mysqlshow -u root -p --keys mydb users
# 等效于: SHOW INDEX FROM mydb.users;

# 显示表状态
mysqlshow -u root -p --status mydb
# 等效于: SHOW TABLE STATUS FROM mydb;
```

### 实用技巧

```shell
# 快速检查服务器连接
mysqlshow -u root -p > /dev/null && echo "MySQL连接正常" || echo "MySQL连接失败"

# 导出数据库结构文档
mysqlshow -u root -p --keys --count mydb > mydb_structure.txt

# 监控表行数变化
watch -n 5 'mysqlshow -u root -p --count mydb'

# 比较两个数据库的表
diff <(mysqlshow -u root -p db1) <(mysqlshow -u root -p db2)

# 查找包含特定字段的表
for table in $(mysqlshow -u root -p mydb | tail -n +4 | awk '{print $2}'); do
  mysqlshow -u root -p mydb $table | grep -q "user_id" && echo "$table"
done
```

### 注意事项

1. **权限**：需要有SELECT权限才能查看表信息
2. **性能**：对大表使用--count可能会较慢
3. **通配符**：支持SQL LIKE语法（%和_）
4. **字符集**：输出受客户端字符集影响
