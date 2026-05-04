mysql_myisamchk
===

MyISAM表检查和修复工具

## 补充说明

**myisamchk** 是MySQL提供的MyISAM表维护工具，用于检查、修复、优化和分析MyISAM存储引擎的表。它直接操作表文件，不需要MySQL服务器运行，是MyISAM表故障恢复的重要工具。

### 语法

```shell
myisamchk [OPTIONS] tables...
```

### 选项

```shell
# 检查选项
-c, --check              # 检查表错误（默认）
-e, --extend-check       # 扩展检查（更详细但更慢）
-C, --check-only-changed # 只检查有变化的表
-F, --fast               # 只检查未正确关闭的表
-f, --force              # 发现错误时自动修复
-i, --information        # 显示表统计信息
-m, --medium-check       # 中等速度检查（默认）

# 修复选项
-r, --recover            # 修复表（大多数错误）
-o, --safe-recover       # 安全修复（使用旧方法）
-B, --backup             # 修复前备份.MYD文件
--correct-checksum       # 修正校验和
--max-record-length=#    # 最大记录长度

# 优化选项
-a, --analyze            # 分析键分布
-d, --description        # 显示表描述信息
-S, --sort-index         # 排序索引块
-R, --sort-records=#     # 按索引排序记录

# 其他选项
-q, --quick              # 快速检查/修复
-s, --silent             # 静默模式
-v, --verbose            # 详细输出
-w, --wait               # 等待表解锁
-t, --tmpdir=path        # 临时文件目录
-u, --unpack             # 解压MyISAM表
-U, --update-state       # 更新状态文件
-V, --version            # 显示版本信息
--help                   # 显示帮助信息
```

### 常用实例

```shell
# 检查单个表
myisamchk /var/lib/mysql/mydb/users.MYI

# 检查多个表
myisamchk /var/lib/mysql/mydb/*.MYI

# 检查所有MyISAM表
myisamchk /var/lib/mysql/*/*.MYI

# 扩展检查（更彻底）
myisamchk -e /var/lib/mysql/mydb/users.MYI

# 快速检查（只检查未正确关闭的表）
myisamchk --fast /var/lib/mysql/mydb/*.MYI

# 中等检查（平衡速度和检查程度）
myisamchk -m /var/lib/mysql/mydb/users.MYI

# 只检查有变化的表
myisamchk --check-only-changed /var/lib/mysql/mydb/*.MYI

# 显示表统计信息
myisamchk -i /var/lib/mysql/mydb/users.MYI

# 显示详细表描述
myisamchk -d /var/lib/mysql/mydb/users.MYI

# 修复表
myisamchk -r /var/lib/mysql/mydb/users.MYI

# 安全修复（更慢但更可靠）
myisamchk -o /var/lib/mysql/mydb/users.MYI

# 修复前备份
myisamchk --backup -r /var/lib/mysql/mydb/users.MYI

# 检查并自动修复
myisamchk --force /var/lib/mysql/mydb/users.MYI

# 强制修复（即使出错也继续）
myisamchk -r --force /var/lib/mysql/mydb/users.MYI

# 快速修复（只修复索引，不检查数据）
myisamchk -q /var/lib/mysql/mydb/users.MYI

# 分析键分布
myisamchk -a /var/lib/mysql/mydb/users.MYI

# 排序索引
myisamchk -S /var/lib/mysql/mydb/users.MYI

# 按索引排序记录（优化查询性能）
myisamchk -R 1 /var/lib/mysql/mydb/users.MYI

# 解压压缩的MyISAM表
myisamchk -u /var/lib/mysql/mydb/users.MYI

# 使用指定临时目录
myisamchk -r -t /tmp /var/lib/mysql/mydb/users.MYI

# 详细输出
myisamchk -v /var/lib/mysql/mydb/users.MYI

# 静默模式（只显示错误）
myisamchk -s /var/lib/mysql/mydb/*.MYI
```

### 检查和修复流程

```shell
# 标准维护流程

# 1. 停止MySQL服务（确保数据一致性）
service mysql stop

# 2. 检查所有MyISAM表
myisamchk -s /var/lib/mysql/*/*.MYI

# 3. 如果发现问题，进行修复
myisamchk -r /var/lib/mysql/mydb/corrupted_table.MYI

# 4. 如果标准修复失败，使用安全修复
myisamchk -o /var/lib/mysql/mydb/corrupted_table.MYI

# 5. 启动MySQL服务
service mysql start
```

### 输出说明

```shell
# 正常表检查输出
Checking MyISAM file: users.MYI
Data records:      1234   Deleted blocks:       0
- check file-size
- check record delete-chain
- check key delete-chain
- check index reference
- check data record references index
- check record links
MyISAM-table: users.MYI is ok

# 发现错误的输出
Checking MyISAM file: users.MYI
Data records:      1234   Deleted blocks:       0
- check file-size
- check record delete-chain
- check key delete-chain
myisamchk: error: Key 1 doesn't point at previous records
MyISAM-table: users.MYI is corrupted

# 修复输出
- recovering (with sort) MyISAM-table: users.MYI
Data records: 1234
- Fixing index 1
```

### 维护脚本

```shell
#!/bin/bash
# MyISAM表检查和修复脚本

MYSQL_DATA="/var/lib/mysql"
LOG_FILE="/var/log/myisam_maintenance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "=== $DATE ===" >> $LOG_FILE

# 停止MySQL
echo "Stopping MySQL..." >> $LOG_FILE
service mysql stop

# 快速检查所有表
echo "Checking tables..." >> $LOG_FILE
myisamchk --fast --silent $MYSQL_DATA/*/*.MYI >> $LOG_FILE 2>&1

# 如果发现问题，尝试修复
if [ $? -ne 0 ]; then
  echo "Found errors, attempting repair..." >> $LOG_FILE
  myisamchk --recover --force $MYSQL_DATA/*/*.MYI >> $LOG_FILE 2>&1
fi

# 启动MySQL
echo "Starting MySQL..." >> $LOG_FILE
service mysql start

echo "Maintenance completed." >> $LOG_FILE

# 每周日凌晨2点执行
# crontab -e
# 0 2 * * 0 /path/to/myisam_maintenance.sh
```

### 性能优化

```shell
# 增加内存使用（加快检查速度）
myisamchk --sort_buffer_size=64M --key_buffer_size=64M -r table.MYI

# 排序索引块（提高读取性能）
myisamchk -S table.MYI

# 按主键排序记录（优化范围查询）
myisamchk -R 1 table.MYI

# 分析表更新统计信息
myisamchk -a table.MYI

# 完整优化流程
myisamchk -r -S -a table.MYI
```

### 错误处理

```shell
# 常见错误和解决方案

# 错误: Can't open file: 'table.MYI'
# 原因: 文件不存在或权限问题
ls -la /var/lib/mysql/mydb/table.*
chmod 660 /var/lib/mysql/mydb/table.*
chown mysql:mysql /var/lib/mysql/mydb/table.*

# 错误: Incorrect key file for table
# 解决: 重建索引
myisamchk -r table.MYI

# 错误: Table is marked as crashed
# 解决: 修复表
myisamchk -r --force table.MYI

# 修复失败时
# 1. 使用安全修复
myisamchk -o table.MYI

# 2. 从备份恢复
# 3. 尝试提取数据
myisamchk --max-record-length=1048576 -r table.MYI
```

### 与mysqlcheck对比

| 特性 | myisamchk | mysqlcheck |
|------|-----------|------------|
| 运行方式 | 独立工具 | MySQL客户端 |
| 服务器状态 | 需停止或确保无访问 | 在线运行 |
| 存储引擎 | MyISAM/ARCHIVE | 多种引擎 |
| 锁表 | 直接操作文件 | 通过服务器锁表 |
| 故障恢复 | 可以修复严重损坏 | 仅能处理一般问题 |
| 备份恢复 | 独立于服务器运行 | 依赖服务器运行 |

### 注意事项

1. **服务器状态**：运行myisamchk时确保MySQL服务器不访问该表
2. **备份数据**：修复前建议备份.MYD文件
3. **磁盘空间**：修复过程可能需要额外的磁盘空间
4. **权限**：需要有数据文件的读写权限
5. **InnoDB表**：不适用于InnoDB表，应使用mysqlcheck或其他工具
6. **现代MySQL**：MyISAM已逐渐被InnoDB取代，新项目建议使用InnoDB
