mongosh
===

MongoDB Shell 数据库客户端

## 补充说明

**mongosh** 是 MongoDB 官方的新一代命令行客户端，用于连接 MongoDB 数据库、执行查询、管理数据。支持现代 JavaScript 语法，是 mongo 命令的升级替代。

### 语法

```shell
mongosh [options] [connection string]
```

### 连接选项

```shell
--host <hostname>      # 服务器地址
--port <port>          # 端口号
--username <user>      # 用户名
--password <pwd>       # 密码
--authenticationDatabase <db>  # 认证数据库
--tls                  # 使用 TLS
--tlsAllowInvalidCertificates  # 允许无效证书
--quiet                # 静默模式
--eval <script>        # 执行 JavaScript 代码
--file <file.js>       # 执行脚本文件
```

### 连接实例

```shell
# 连接本地 MongoDB
mongosh

# 连接指定主机和端口
mongosh --host 192.168.1.100 --port 27017

# 使用连接字符串连接
mongosh "mongodb://user:pass@host:27017/dbname"
mongosh "mongodb+srv://user:pass@cluster/dbname"

# 需要认证连接
mongosh -u 用户名 -p 密码 --authenticationDatabase admin

# 连接并指定数据库
mongosh mongodb://localhost/test

# 连接副本集
mongosh "mongodb://host1,host2,host3/?replicaSet=rs0"

# 连接 Atlas 云数据库
mongosh "mongodb+srv://cluster0.x.mongodb.net" -u user -p
```

### 数据库操作

```javascript
// 查看所有数据库
show dbs
show databases

// 切换数据库（不存在则创建）
use mydb

// 查看当前数据库
db

// 删除数据库
db.dropDatabase()

// 创建集合
db.createCollection("users")
db.createCollection("logs", { capped: true, size: 5242880 })

// 查看集合
show collections
show tables

// 删除集合
db.users.drop()
```

### 插入文档

```javascript
// 插入单个文档
db.users.insertOne({
  name: "张三",
  age: 28,
  email: "zhangsan@example.com",
  createdAt: new Date()
})

// 插入多个文档
db.users.insertMany([
  { name: "李四", age: 25, city: "北京" },
  { name: "王五", age: 30, city: "上海" },
  { name: "赵六", age: 28, city: "广州" }
])

// 插入并返回 _id
var result = db.users.insertOne({ name: "测试" })
result.insertedId  // 返回插入的 _id
```

### 查询文档

```javascript
// 查询所有文档
db.users.find()
db.users.find().pretty()  // 格式化输出

// 条件查询
db.users.find({ name: "张三" })
db.users.find({ age: 28 })
db.users.find({ age: { $gt: 25 } })  // 年龄大于25

// 多条件查询（AND）
db.users.find({ age: 28, city: "北京" })

// OR 查询
db.users.find({ $or: [{ age: 25 }, { age: 30 }] })

// IN 查询
db.users.find({ age: { $in: [25, 28, 30] } })

// 查询字段存在
db.users.find({ email: { $exists: true } })

// 正则匹配
db.users.find({ name: /^张/ })

// 投影（只返回指定字段）
db.users.find({}, { name: 1, age: 1, _id: 0 })

// 排序
db.users.find().sort({ age: 1 })   // 升序
db.users.find().sort({ age: -1 })  // 降序

// 分页
db.users.find().skip(10).limit(10)

// 统计数量
db.users.countDocuments({})
db.users.countDocuments({ age: { $gt: 25 } })

// 查询单个文档
db.users.findOne({ name: "张三" })
```

### 比较操作符

```javascript
$eq    // 等于
$ne    // 不等于
$gt    // 大于
$gte   // 大于等于
$lt    // 小于
$lte   // 小于等于
$in    // 在数组中
$nin   // 不在数组中

// 示例
db.products.find({ price: { $gte: 100, $lte: 500 } })
db.products.find({ category: { $in: ["电子", "服装"] } })
```

### 更新文档

```javascript
// 更新单个文档
db.users.updateOne(
  { name: "张三" },
  { $set: { age: 29, email: "new@example.com" } }
)

// 更新多个文档
db.users.updateMany(
  { city: "北京" },
  { $set: { region: "华北" } }
)

// 替换文档
db.users.replaceOne(
  { name: "张三" },
  { name: "张三", age: 30, city: "深圳" }
)

// 更新操作符
{ $set: { field: value } }      // 设置字段值
{ $unset: { field: "" } }       // 删除字段
{ $inc: { counter: 1 } }        // 数值递增
{ $mul: { price: 1.1 } }        // 数值乘法
{ $rename: { old: "new" } }     // 重命名字段
{ $push: { tags: "new" } }      // 数组添加元素
{ $pull: { tags: "old" } }      // 数组删除元素
{ $addToSet: { tags: "unique" } }  // 数组添加不重复元素

// 更新或插入（不存在则创建）
db.users.updateOne(
  { name: "新用户" },
  { $set: { age: 20 } },
  { upsert: true }
)
```

### 删除文档

```javascript
// 删除单个文档
db.users.deleteOne({ name: "张三" })

// 删除多个文档
db.users.deleteMany({ age: { $lt: 18 } })

// 删除所有文档
db.users.deleteMany({})
```

### 聚合查询

```javascript
// 简单聚合
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])

// 常用聚合管道
$match    // 筛选
$group    // 分组
$sort     // 排序
$project  // 投影
$limit    // 限制
$skip     // 跳过
$lookup   // 关联查询
$unwind   // 展开数组
$addFields // 添加字段

// 分组统计
db.orders.aggregate([
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 },
      avgPrice: { $avg: "$price" },
      maxPrice: { $max: "$price" },
      minPrice: { $min: "$price" }
    }
  }
])

// 关联查询
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  }
])
```

### 索引操作

```javascript
// 创建索引
db.users.createIndex({ name: 1 })              // 升序索引
db.users.createIndex({ name: 1, age: -1 })     // 复合索引
db.users.createIndex({ email: 1 }, { unique: true })  // 唯一索引
db.users.createIndex({ location: "2dsphere" }) // 地理索引
db.users.createIndex({ desc: "text" })          // 文本索引

// 查看索引
db.users.getIndexes()

// 删除索引
db.users.dropIndex("name_1")
db.users.dropIndexes()  // 删除所有索引

// 查看查询执行计划
db.users.find({ name: "张三" }).explain()
```

### 用户管理

```javascript
// 切换到 admin 数据库
use admin

// 创建管理员
db.createUser({
  user: "admin",
  pwd: "password123",
  roles: [ "root" ]
})

// 创建普通用户
db.createUser({
  user: "appuser",
  pwd: "password",
  roles: [
    { role: "readWrite", db: "mydb" }
  ]
})

// 查看用户
db.getUsers()

// 删除用户
db.dropUser("appuser")

// 修改密码
db.changeUserPassword("appuser", "newpassword")
```

### 实用命令

```javascript
// 查看服务器状态
db.serverStatus()

// 查看数据库统计
db.stats()

// 查看集合统计
db.users.stats()

// 查看当前操作
db.currentOp()

// 杀死操作
db.killOp(opid)

// 执行 JavaScript
db.eval("return 1 + 1")

// 批量执行脚本
load("script.js")
```
