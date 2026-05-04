mysql_perror
===

MySQL错误代码解释工具

## 补充说明

**perror** 是MySQL提供的错误代码解释工具，用于将MySQL、操作系统或存储引擎的错误代码转换为可读的错误描述信息。它是诊断MySQL错误的重要辅助工具。

### 语法

```shell
perror [OPTIONS] [ERRORCODE [ERRORCODE...]]
```

### 选项

```shell
-h, --help               # 显示帮助信息
-I, --info               # 同--help
-s, --silent             # 只显示错误信息
-v, --verbose            # 详细输出
-V, --version            # 显示版本信息
```

### 常用实例

```shell
# 查看MySQL错误代码
perror 1005
perror 1213
perror 1215

# 查看操作系统错误代码
perror 2
perror 13
perror 28

# 查看多个错误代码
perror 1005 1006 1007 1008

# 详细输出
perror -v 1213

# 静默模式
perror -s 13

# 常见MySQL错误代码
perror 1045   # 访问被拒绝
perror 1062   # 重复条目
perror 1064   # SQL语法错误
perror 1146   # 表不存在
perror 1213   # 死锁
perror 1215   # 外键约束错误
perror 2002   # 无法连接到服务器
perror 2003   # 无法连接到主机

# 常见系统错误代码
perror 1      # 操作不允许
perror 2      # 文件不存在
perror 13     # 权限被拒绝
perror 24     # 打开文件过多
perror 28     # 磁盘空间不足
perror 30     # 只读文件系统
perror 111    # 连接被拒绝
perror 113    # 无路由到主机

# InnoDB错误代码
perror 1005   # 创建表失败
perror 1013   # 无法获取状态
perror 1015   # 无法锁定文件
perror 1016   # 无法打开文件
perror 1021   # 磁盘满
perror 1025   # 重命名错误
perror 1030   # 系统错误

# 组合查看
perror 2 13 28 111 113
```

### 常见MySQL错误代码详解

```shell
# 连接相关错误
perror 1045
# MySQL error code 1045: Access denied for user

perror 2002
# MySQL error code 2002: Can't connect to local MySQL server through socket

perror 2003
# MySQL error code 2003: Can't connect to MySQL server on host

perror 2006
# MySQL error code 2006: MySQL server has gone away

# 查询相关错误
perror 1062
# MySQL error code 1062: Duplicate entry for key

perror 1064
# MySQL error code 1064: You have an error in your SQL syntax

perror 1146
# MySQL error code 1146: Table doesn't exist

perror 1176
# MySQL error code 1176: Key doesn't exist in table

# 锁和事务相关错误
perror 1205
# MySQL error code 1205: Lock wait timeout exceeded

perror 1213
# MySQL error code 1213: Deadlock found when trying to get lock

perror 1215
# MySQL error code 1215: Cannot add foreign key constraint

# 复制相关错误
perror 1236
# MySQL error code 1236: Got fatal error from master

perror 1594
# MySQL error code 1594: Relay log read failure
```

### 常见系统错误代码详解

```shell
# 文件系统错误
perror 2
# OS error code 2: No such file or directory

perror 13
# OS error code 13: Permission denied

perror 28
# OS error code 28: No space left on device

perror 24
# OS error code 24: Too many open files

perror 30
# OS error code 30: Read-only file system

# 网络相关错误
perror 111
# OS error code 111: Connection refused

perror 113
# OS error code 113: No route to host

perror 104
# OS error code 104: Connection reset by peer

perror 110
# OS error code 110: Connection timed out
```

### 使用场景

```shell
# 场景1：分析MySQL错误日志
# 错误日志显示：[ERROR] Got error 28 from storage engine
perror 28
# OS error code 28: No space left on device
# 结论：磁盘空间不足

# 场景2：排查连接问题
# 客户端错误：Can't connect to MySQL server on 'host' (111)
perror 111
# OS error code 111: Connection refused
# 结论：MySQL服务未运行或端口被阻止

# 场景3：分析外键错误
# 创建表失败，错误代码1005
perror 1005
# MySQL error code 1005: Can't create table
# 结论：可能是外键类型不匹配

# 场景4：排查权限问题
# 错误：Error 13 writing file
perror 13
# OS error code 13: Permission denied
# 结论：检查MySQL用户对文件的权限
```

### 诊断脚本示例

```shell
#!/bin/bash
# MySQL错误代码诊断脚本

echo "MySQL Error Code Diagnostics"
echo "============================"

# 常见错误代码列表
ERROR_CODES="
1045:访问被拒绝
1062:重复条目
1064:SQL语法错误
1146:表不存在
1205:锁等待超时
1213:死锁
2002:无法通过socket连接
2003:无法连接到远程主机
2006:服务器已断开
"

echo ""
echo "常见MySQL错误代码："
echo "$ERROR_CODES"

echo ""
echo "详细查询特定错误代码："
read -p "请输入错误代码: " CODE

if [ -n "$CODE" ]; then
  echo ""
  perror -v $CODE
fi

# 批量查询
echo ""
echo "常用系统错误代码："
perror 2 13 24 28 30 111 113
```

### 与MySQL错误日志配合

```shell
# 从错误日志提取错误代码并解释
# 示例错误日志：/var/log/mysql/error.log

# 提取错误代码
grep -o "error [0-9]*" /var/log/mysql/error.log | sort | uniq -c | sort -rn | head -10

# 解释最常见的错误
grep -o "error [0-9]*" /var/log/mysql/error.log | sort | uniq -c | sort -rn | head -1 | awk '{print $3}' | xargs perror

# 一键分析错误日志中的所有错误
for code in $(grep -o "error [0-9]*" /var/log/mysql/error.log | awk '{print $2}' | sort -u); do
  echo "Error $code:"
  perror -s $code
  echo ""
done
```

### 错误代码范围说明

| 范围 | 类型 | 说明 |
|------|------|------|
| 1-999 | MySQL服务器错误 | SQL执行相关错误 |
| 1000-1999 | MySQL服务器错误 | 服务器内部错误 |
| 2000-2999 | 客户端错误 | 连接和客户端相关错误 |
| 1-199 | 系统错误 | 操作系统级错误 |

### 注意事项

1. **错误代码范围**：MySQL错误代码和系统错误代码可能重叠，perror会同时显示两者
2. **版本差异**：不同MySQL版本错误代码可能略有不同
3. **详细诊断**：perror提供基本信息，详细诊断还需查看错误日志
4. **存储引擎**：部分存储引擎有特定的错误代码
