psql
===

PostgreSQL 命令行客户端

## 补充说明

**psql** 是 PostgreSQL 数据库的命令行客户端，用于连接数据库、执行 SQL 语句、管理数据库。功能强大，支持交互模式和脚本模式。

### 语法

```shell
psql [OPTIONS] [DBNAME [USERNAME]]
```

### 连接选项

```shell
-h, --host=HOST         # 服务器地址
-p, --port=PORT         # 端口号，默认 5432
-U, --username=NAME     # 用户名
-d, --dbname=DBNAME     # 数据库名
-w, --no-password       # 不提示密码
-W, --password          # 强制提示密码
-c, --command=COMMAND   # 执行单条 SQL
-f, --file=FILENAME     # 执行 SQL 文件
-l, --list              # 列出所有数据库
-o, --output=FILENAME   # 输出重定向到文件
-a, --echo-all          # 显示所有 SQL
-q, --quiet             # 静默模式
```

### 连接实例

```shell
# 连接本地 PostgreSQL
psql

# 连接指定数据库
psql -d mydb
psql mydb                    # 简写

# 连接远程数据库
psql -h 192.168.1.100 -p 5432 -U postgres -d mydb

# 使用连接字符串
psql "postgresql://user:password@host:5432/mydb"
psql "postgres://postgres@localhost/test"

# 使用 URI 连接
psql postgresql://user@host:port/dbname

# 只列出数据库
psql -l
psql --list

# 执行单条 SQL
psql -d mydb -c "SELECT * FROM users LIMIT 5"

# 执行 SQL 文件
psql -d mydb -f script.sql

# 静默执行命令
psql -q -d mydb -c "SELECT 1"
```

### 数据库操作

```sql
-- 查看所有数据库
\l
\l+                    -- 显示更多信息

-- 切换数据库
\c mydb
\connect mydb postgres

-- 创建数据库
CREATE DATABASE mydb;
CREATE DATABASE mydb WITH ENCODING='UTF8';

-- 删除数据库
DROP DATABASE mydb;

-- 查看当前数据库
SELECT current_database();

-- 数据库大小
SELECT pg_size_pretty(pg_database_size('mydb'));
```

### 表操作

```sql
-- 查看所有表
\dt
\dt+                   -- 显示大小
\dt public.*           -- 指定 schema

-- 查看表结构
\d table_name
\d+ table_name         -- 更详细信息

-- 查看索引
\di
\di+

-- 查看视图
\dv

-- 创建表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  age INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 修改表
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users ALTER COLUMN name TYPE TEXT;

-- 删除表
DROP TABLE users;
DROP TABLE IF EXISTS users;

-- 清空表
TRUNCATE TABLE users;
TRUNCATE users RESTART IDENTITY;  -- 重置序列
```

### 数据操作

```sql
-- 插入数据
INSERT INTO users (name, email, age) VALUES ('张三', 'zhangsan@example.com', 28);
INSERT INTO users (name, email) VALUES 
  ('李四', 'lisi@example.com'),
  ('王五', 'wangwu@example.com');

-- 查询数据
SELECT * FROM users;
SELECT name, email FROM users WHERE age > 25;
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 更新数据
UPDATE users SET age = 29 WHERE name = '张三';
UPDATE users SET age = age + 1;

-- 删除数据
DELETE FROM users WHERE id = 1;
DELETE FROM users WHERE age < 18;

-- 查询统计
SELECT COUNT(*) FROM users;
SELECT age, COUNT(*) FROM users GROUP BY age;
SELECT age, AVG(age) as avg_age FROM users GROUP BY age;
```

### 元命令

```shell
# 连接相关
\c[onnect] [dbname]          # 切换数据库
\conninfo                    # 显示连接信息
\encoding [ENCODING]         # 设置编码

# 查询相关
\q                           # 退出
\e                           # 编辑查询
\ef [funcname]               # 编辑函数
\p                           # 显示当前查询
\r                           # 重置查询缓冲区
\w FILE                      # 写入文件
\i FILE                      # 执行文件
\ir FILE                     # 执行文件（相对路径）

# 信息查询
\l                           # 列出数据库
\dn                          # 列出 schema
\dt                          # 列出表
\di                          # 列出索引
\dv                          # 列出视图
\df                          # 列出函数
\du                          # 列出用户
\dp                          # 列出权限
\z                           # 同 \dp

# 表结构
\d NAME                      # 描述表/视图/索引
\d+ NAME                     # 详细描述
\dd NAME                     # 查看注释

# 格式化
\x                           # 切换扩展显示模式
\a                           # 对齐模式切换
\t                           # 仅显示数据
\H                           # HTML 输出模式

# 其他
\timing                      # 显示执行时间
\! [COMMAND]                 # 执行 shell 命令
\cd [DIR]                   # 切换目录
\set                         # 显示所有变量
\unset NAME                 # 删除变量
\echo [STRING]              # 输出字符串
\qecho [STRING]             # 输出到查询输出流
```

### 事务

```sql
-- 开始事务
BEGIN;
BEGIN WORK;
START TRANSACTION;

-- 提交事务
COMMIT;
COMMIT WORK;

-- 回滚事务
ROLLBACK;
ROLLBACK WORK;

-- 保存点
SAVEPOINT my_savepoint;
ROLLBACK TO SAVEPOINT my_savepoint;
RELEASE SAVEPOINT my_savepoint;

-- 设置事务隔离级别
BEGIN;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

### 用户管理

```sql
-- 创建用户
CREATE USER myuser WITH PASSWORD 'password123';
CREATE USER myuser WITH PASSWORD 'password' CREATEDB;

-- 创建角色（推荐）
CREATE ROLE myrole WITH LOGIN PASSWORD 'password';
CREATE ROLE readonly WITH LOGIN PASSWORD 'password' NOCREATEDB;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
GRANT SELECT, INSERT, UPDATE ON users TO myuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myuser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO myuser;

-- 撤销权限
REVOKE ALL PRIVILEGES ON DATABASE mydb FROM myuser;
REVOKE SELECT ON users FROM myuser;

-- 修改密码
ALTER USER myuser WITH PASSWORD 'newpassword';

-- 删除用户
DROP USER myuser;
DROP ROLE myrole;

-- 查看用户
\du
SELECT * FROM pg_roles;
```

### 备份恢复

```shell
# 逻辑备份 - 整个数据库
pg_dump mydb > backup.sql
pg_dump -U postgres -h localhost mydb > backup.sql

# 只备份表结构
pg_dump --schema-only mydb > schema.sql

# 只备份数据
pg_dump --data-only mydb > data.sql

# 备份指定表
pg_dump -t users mydb > users.sql

# 压缩备份
pg_dump mydb | gzip > backup.sql.gz

# 备份所有数据库
pg_dumpall > all_databases.sql
pg_dumpall -U postgres > all_databases.sql

# 恢复数据库
psql mydb < backup.sql
gunzip -c backup.sql.gz | psql mydb

# 恢复所有数据库
psql -f all_databases.sql postgres

# 使用 pg_restore（自定义格式）
pg_dump -Fc mydb > backup.dump
pg_restore -d mydb backup.dump
```

### 实用命令

```sql
-- 查看版本
SELECT version();

-- 查看当前用户
SELECT current_user;

-- 查看服务器配置
SHOW ALL;
SHOW max_connections;

-- 查看运行中的查询
SELECT * FROM pg_stat_activity;
SELECT pid, query, state FROM pg_stat_activity;

-- 终止查询
SELECT pg_cancel_backend(pid);
SELECT pg_terminate_backend(pid);

-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('users'));

-- 查看索引使用情况
SELECT * FROM pg_stat_user_indexes;

-- 分析查询
EXPLAIN SELECT * FROM users WHERE age > 25;
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 25;
```
