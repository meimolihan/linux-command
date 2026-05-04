sqlite3
===

SQLite 数据库命令行工具

## 补充说明

**sqlite3** 是 SQLite 数据库的命令行管理工具，用于创建、查询、管理 SQLite 数据库文件。SQLite 是轻量级的嵌入式数据库，无需服务器，单文件存储。

### 语法

```shell
sqlite3 [OPTIONS] [FILENAME] [SQL]
```

### 命令选项

```shell
-init FILE        # 初始化时执行文件
-h FILE           # 数据库文件（同参数）
-bail             # 首次错误时退出
-batch            # 批处理模式
-column           # 列模式输出
-csv              # CSV 格式输出
-header           # 显示列头
-noheader         # 不显示列头
-echo             # 显示执行的 SQL
-nullvalue STR    # NULL 值显示为 STR
-separator SEP    # 设置分隔符
-version          # 显示版本
-help             # 显示帮助
```

### 基本使用

```shell
# 创建/打开数据库
sqlite3 mydb.db
sqlite3 /path/to/database.db

# 打开内存数据库
sqlite3 :memory:

# 执行 SQL 后退出
sqlite3 mydb.db "SELECT * FROM users;"

# 执行 SQL 文件
sqlite3 mydb.db < script.sql

# 导入 CSV
sqlite3 mydb.db <<EOF
.mode csv
.import data.csv mytable
EOF

# 导出为 CSV
sqlite3 mydb.db <<EOF
.mode csv
.headers on
.output data.csv
SELECT * FROM users;
EOF
```

### 点命令

```shell
# 帮助
.help

# 数据库相关
.databases              # 列出所有数据库
.open FILE             # 打开数据库
.open ':memory:'       # 打开内存数据库
.save FILE             # 保存内存数据库到文件
.clone NEWDB           # 克隆数据库

# 表相关
.tables [PATTERN]      # 列出表
.schema [TABLE]        # 显示表结构
.indices [TABLE]       # 列出索引
.type TABLE            # 查看表类型

# 格式化输出
.mode MODE             # 设置输出模式
  csv                   # CSV 格式
  column                # 列对齐
  list                  # 列表（默认）
  html                  # HTML 表格
  insert                # INSERT 语句
  line                  # 每行一行
  tabs                   # 制表符分隔
  tcl                    # TCL 列表

.headers ON|OFF        # 显示/隐藏列头
.separator SEP         # 设置分隔符
.nullvalue STR         # NULL 值显示
.width N N N           # 设置列宽
.output FILE           # 输出到文件
.output                # 输出到屏幕
.once FILE             # 输出到文件一次
.echo ON|OFF           # 显示执行的命令

# 导入导出
.import FILE TABLE     # 导入 CSV 到表
.dump [TABLE]          # 导出为 SQL
.load FILE             # 加载扩展

# 显示信息
.show                  # 显示当前设置
.stats ON|OFF          # 显示统计

# 其他
.quit                  # 退出
.exit                  # 退出
.system CMD            # 执行系统命令
.read FILE             # 执行 SQL 文件
.timer ON|OFF          # 计时
```

### 数据库操作

```sql
-- 创建表
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建带索引的表
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT,
  price REAL,
  category TEXT
);
CREATE INDEX idx_category ON products(category);

-- 查看所有表
.tables
SELECT name FROM sqlite_master WHERE type='table';

-- 查看表结构
.schema users
PRAGMA table_info(users);

-- 删除表
DROP TABLE users;
DROP TABLE IF EXISTS users;

-- 修改表（SQLite 限制较多）
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users RENAME TO members;
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
SELECT name, email FROM users WHERE age >= 25;
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
SELECT DISTINCT category FROM products;

-- 更新数据
UPDATE users SET age = 29 WHERE name = '张三';
UPDATE users SET age = age + 1;

-- 删除数据
DELETE FROM users WHERE id = 1;
DELETE FROM users WHERE age < 18;
DELETE FROM users;  -- 清空表

-- 聚合查询
SELECT COUNT(*) FROM users;
SELECT age, COUNT(*) FROM users GROUP BY age;
SELECT category, AVG(price) FROM products GROUP BY category;
```

### 导入导出

```shell
# 导出整个数据库为 SQL
sqlite3 mydb.db .dump > backup.sql

# 导出单表
sqlite3 mydb.db "dump users" > users.sql

# 导入 SQL 文件恢复
sqlite3 newdb.db < backup.sql

# 导出为 CSV
sqlite3 mydb.db <<EOF
.mode csv
.headers on
.output users.csv
SELECT * FROM users;
.quit
EOF

# 导入 CSV
sqlite3 mydb.db <<EOF
.mode csv
.import users.csv users
.quit
EOF

# 导出为 JSON（需要扩展）
sqlite3 mydb.db <<EOF
.mode list
.separator ,
.output users.txt
SELECT * FROM users;
.quit
EOF
```

### 实用技巧

```shell
# 查看数据库大小
ls -lh mydb.db

# 压缩数据库
sqlite3 mydb.db "VACUUM;"
sqlite3 mydb.db "VACUUM INTO 'mydb_copy.db';"

# 检查数据库完整性
sqlite3 mydb.db "PRAGMA integrity_check;"

# 分析查询
sqlite3 mydb.db "EXPLAIN QUERY PLAN SELECT * FROM users WHERE age > 25;"

# 查看数据库配置
sqlite3 mydb.db "PRAGMA database_list;"

# 加密数据库（需要 SEE 版本）
sqlite3 mydb.db "PRAGMA key='password';"

# 查看编译选项
sqlite3 :memory: "SELECT * FROM pragma_compile_options;"

# 查看版本
sqlite3 --version

# 交互模式美化输出
sqlite3 mydb.db <<EOF
.mode column
.headers on
.width 5 20 30 5
SELECT * FROM users LIMIT 5;
EOF

# 批处理脚本
cat <<EOF | sqlite3 mydb.db
CREATE TABLE IF NOT EXISTS config (key TEXT, value TEXT);
INSERT INTO config VALUES ('version', '1.0');
INSERT INTO config VALUES ('created', datetime('now'));
SELECT * FROM config;
EOF
```

### 常见问题

```sql
-- 开启外键约束（默认关闭）
PRAGMA foreign_keys = ON;

-- 查看外键状态
PRAGMA foreign_keys;

-- 查看表信息
PRAGMA table_info(users);

-- 查看索引
PRAGMA index_list(users);

-- 优化数据库
PRAGMA optimize;

-- 设置缓存大小
PRAGMA cache_size = 10000;

-- 设置临时存储
PRAGMA temp_store = MEMORY;
```

### Python 操作示例

```python
import sqlite3

# 连接数据库
conn = sqlite3.connect('mydb.db')
cursor = conn.cursor()

# 创建表
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT
)
''')

# 插入数据
cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", 
               ('张三', 'zhangsan@example.com'))

# 批量插入
users = [('李四', 'lisi@example.com'), ('王五', 'wangwu@example.com')]
cursor.executemany("INSERT INTO users (name, email) VALUES (?, ?)", users)

# 查询
cursor.execute("SELECT * FROM users")
for row in cursor.fetchall():
    print(row)

# 提交并关闭
conn.commit()
conn.close()
```
