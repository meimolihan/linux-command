redis-cli
===

Redis 命令行客户端

## 补充说明

**redis-cli** 是 Redis 数据库的命令行客户端，用于连接 Redis 服务器、执行命令、管理数据。是 Redis 运维和开发的核心工具。

### 语法

```shell
redis-cli [OPTIONS] [COMMAND [ARG...]]
```

### 连接选项

```shell
-h <host>          # 服务器地址，默认 127.0.0.1
-p <port>          # 端口号，默认 6379
-a <password>      # 密码认证
--user <user>      # 用户名（Redis 6.0+ ACL）
-n <db>            # 数据库编号，默认 0
--raw              # 原始输出模式
--no-raw           # 禁用原始输出
--csv              # CSV 格式输出
--stat             # 实时统计
--latency          # 延迟统计
--rdb <filename>   # 导出 RDB 文件
--pipe             # 管道模式
--bigkeys          # 查找大键
--scan             # 扫描模式
```

### 连接实例

```shell
# 连接本地 Redis
redis-cli

# 连接指定主机和端口
redis-cli -h 192.168.1.100 -p 6379

# 带密码连接
redis-cli -h 192.168.1.100 -p 6379 -a mypassword

# 连接指定数据库
redis-cli -n 1

# 使用 URL 连接
redis-cli -u redis://user:password@host:6379/0

# Unix socket 连接
redis-cli -s /var/run/redis/redis.sock

# 交互模式连接后测试
redis-cli ping
# PONG
```

### 字符串操作

```shell
# 设置值
SET key value
SET key value EX 3600          # 设置过期时间（秒）
SET key value PX 3600000       # 设置过期时间（毫秒）
SET key value NX               # 仅当键不存在时设置
SET key value XX               # 仅当键存在时设置
SETEX key 3600 value           # 设置值并指定过期时间

# 获取值
GET key
GET key EX                     # 获取值并延长过期时间
GETDEL key                     # 获取值后删除

# 批量操作
MSET key1 value1 key2 value2   # 批量设置
MGET key1 key2                 # 批量获取

# 数值操作
INCR key                       # 递增 1
INCRBY key 10                  # 递增指定值
DECR key                       # 递减 1
DECRBY key 10                  # 递减指定值
INCRBYFLOAT key 2.5            # 浮点数递增

# 追加操作
APPEND key value               # 追加字符串
STRLEN key                     # 获取字符串长度
GETRANGE key 0 10              # 获取子串
SETRANGE key 0 value           # 替换子串
```

### 哈希操作

```shell
# 设置哈希字段
HSET hashkey field value
HMSET hashkey field1 value1 field2 value2

# 获取哈希字段
HGET hashkey field
HMGET hashkey field1 field2
HGETALL hashkey                 # 获取所有字段和值
HKEYS hashkey                   # 获取所有字段名
HVALS hashkey                   # 获取所有值
HLEN hashkey                    # 获取字段数量

# 检查字段存在
HEXISTS hashkey field

# 删除字段
HDEL hashkey field

# 仅当字段不存在时设置
HSETNX hashkey field value

# 数值递增
HINCRBY hashkey field 1
HINCRBYFLOAT hashkey field 2.5
```

### 列表操作

```shell
# 左推入
LPUSH list value1 value2
LPUSHX list value              # 仅当列表存在时推入

# 右推入
RPUSH list value1 value2
RPUSHX list value

# 左弹出
LPOP list
BLPOP list 5                   # 阻塞弹出（5秒超时）

# 右弹出
RPOP list
BRPOP list 5

# 获取列表元素
LINDEX list 0                  # 获取索引位置的元素
LRANGE list 0 -1               # 获取所有元素
LLEN list                      # 获取长度

# 删除元素
LREM list 2 value              # 删除2个等于value的元素
LTRIM list 0 999               # 只保留指定范围

# 移动元素
RPOPLPUSH src dest             # 从src右弹出，推入dest左侧
```

### 集合操作

```shell
# 添加元素
SADD set member1 member2

# 获取集合所有元素
SMEMBERS set

# 检查元素是否存在
SISMEMBER set member

# 移除元素
SREM set member1 member2

# 获取集合大小
SCARD set

# 随机弹出元素
SPOP set
SRANDMEMBER set               # 随机获取元素（不删除）

# 集合运算
SINTER set1 set2              # 交集
SUNION set1 set2              # 并集
SDIFF set1 set2               # 差集
SINTERSTORE dest set1 set2    # 交集存入 dest
```

### 有序集合操作

```shell
# 添加元素
ZADD zset 1 member1 2 member2

# 获取分数
ZSCORE zset member

# 获取排名
ZRANK zset member             # 从低到高排名
ZREVRANK zset member          # 从高到低排名

# 获取范围元素
ZRANGE zset 0 -1              # 按排名获取
ZRANGE zset 0 -1 WITHSCORES
ZREVRANGE zset 0 -1
ZRANGEBYSCORE zset 0 100      # 按分数获取

# 删除元素
ZREM zset member

# 增加分数
ZINCRBY zset 5 member

# 获取集合大小
ZCARD zset
ZCOUNT zset 0 100             # 指定分数范围内的数量
```

### 键管理

```shell
# 查看所有键
KEYS *
KEYS pattern:*
SCAN 0 MATCH pattern:* COUNT 100  # 扫描遍历

# 检查键存在
EXISTS key                    # 返回 1 或 0

# 删除键
DEL key1 key2
UNLINK key                    # 异步删除

# 设置过期
EXPIRE key 3600               # 3600秒后过期
EXPIREAT key 1609459200       # Unix 时间戳过期
PEXPIRE key 3600000           # 毫秒过期
PERSIST key                   # 移除过期时间

# 查看剩余时间
TTL key                       # 返回秒
PTTL key                      # 返回毫秒

# 查看键类型
TYPE key

# 重命名
RENAME key newkey
RENAMENX key newkey           # 仅当新键不存在时重命名
```

### 数据库管理

```shell
# 切换数据库
SELECT 0
SELECT 1

# 查看键数量
DBSIZE

# 清空当前数据库
FLUSHDB
FLUSHDB ASYNC                 # 异步清空

# 清空所有数据库
FLUSHALL
FLUSHALL ASYNC

# 查看数据库信息
INFO keyspace
```

### 服务器信息

```shell
# 查看服务器信息
INFO
INFO memory
INFO replication
INFO cpu
INFO keyspace

# 查看统计
INFO stats

# 实时监控命令
MONITOR

# 查看慢查询日志
SLOWLOG GET
SLOWLOG GET 10
SLOWLOG LEN

# 查看客户端列表
CLIENT LIST
CLIENT KILL ip:port

# 查看配置
CONFIG GET *
CONFIG GET maxmemory
CONFIG SET maxmemory 1gb

# 保存 RDB 快照
SAVE                         # 同步保存
BGSAVE                       # 后台保存
LASTSAVE                     # 上次保存时间

# 加载 RDB 文件
# 在启动时指定 RDB 文件即可自动加载
```

### 复制与集群

```shell
# 复制相关
INFO replication              # 查看复制状态
SLAVEOF host port            # 设置主从（旧版）
REPLICAOF host port          # 设置主从（新版）
SLAVEOF NO ONE               # 取消复制

# 集群相关
CLUSTER INFO                 # 集群信息
CLUSTER NODES                # 节点信息
CLUSTER MEET ip port         # 添加节点
CLUSTER FORGET node-id       # 移除节点
CLUSTER REPLICAOF node-id    # 设置从节点
```

### 发布订阅

```shell
# 订阅频道
SUBSCRIBE channel
PSUBSCRIBE pattern*          # 模式订阅
UNSUBSCRIBE channel

# 发布消息
PUBLISH channel message
```

### 事务

```shell
# 开启事务
MULTI
SET key1 value1
SET key2 value2
EXEC                         # 执行事务
DISCARD                      # 取消事务

# 监视键（乐观锁）
WATCH key1 key2
MULTI
...
EXEC
UNWATCH                      # 取消监视
```

### 实用技巧

```shell
# 查找大键
redis-cli --bigkeys

# 实时统计
redis-cli --stat

# 延迟检测
redis-cli --latency

# 管道批量导入
cat commands.txt | redis-cli --pipe

# 备份数据库
redis-cli --rdb backup.rdb

# 导出所有键
redis-cli KEYS '*' > keys.txt

# 批量删除键
redis-cli KEYS 'prefix:*' | xargs redis-cli DEL
```
