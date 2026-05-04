jq
===

JSON 数据处理工具

## 补充说明

**jq** 是轻量级、灵活的命令行 JSON 处理工具，支持解析、过滤、转换 JSON 数据。是 DevOps 和开发者的必备工具。

### 语法

```shell
jq [OPTIONS] 'FILTER' [FILE...]
jq [OPTIONS] -f FILTER_FILE [FILE...]
```

### 基本使用

```shell
# 美化 JSON
jq '.' file.json
cat data.json | jq '.'

# 提取字段
jq '.name' data.json
jq '.user.name' data.json
jq '.users[0].name' data.json     # 数组元素
jq '.users[2]' data.json           # 第三个元素

# 提取多个字段
jq '.name, .age' data.json
jq '{name: .name, age: .age}' data.json

# 提取所有元素
jq '.[]' data.json                 # 遍历数组
jq '.users[]' data.json            # 遍历嵌套数组
jq '.[] | .name' data.json         # 提取每个 name
```

### 输出格式

```shell
# 压缩输出（无空格）
jq -c '.' data.json
jq --compact-output '.' data.json

# 彩色输出
jq -C '.' data.json
jq --color-output '.' data.json

# 不着色输出
jq -M '.' data.json
jq --monochrome-output '.' data.json

# 原始输出（去除字符串引号）
jq -r '.name' data.json
jq --raw-output '.name' data.json

# 输出行分隔
jq -r '.[]' data.json              # 每行一个元素

# 排序键
jq -S '.' data.json
jq --sort-keys '.' data.json
```

### 数组操作

```shell
# 获取数组长度
jq 'length' data.json
jq '.users | length' data.json

# 数组切片
jq '.[0:2]' data.json              # 前两个
jq '.[1:3]' data.json              # 第二三个
jq '.[:-1]' data.json              # 除最后一个
jq '.[-1:]' data.json              # 最后一个
jq '.[2:]' data.json               # 从第三个开始
jq '.[:3]' data.json               # 前三个

# 数组操作
jq '.[]' data.json                 # 展开数组
jq '.[] | select(.age > 25)' data.json  # 过滤
jq 'map(.name)' data.json          # 提取所有 name
jq 'map(.age * 2)' data.json       # 所有 age 乘 2
jq 'unique' data.json              # 去重
jq 'sort' data.json                # 排序
jq 'sort_by(.age)' data.json       # 按字段排序
jq 'group_by(.category)' data.json # 分组
jq 'flatten' data.json             # 扁平化
jq 'reverse' data.json             # 反转
```

### 过滤与条件

```shell
# 条件过滤
jq '.[] | select(.age > 25)' data.json
jq '.[] | select(.name == "张三")' data.json
jq '.[] | select(.status | contains("active"))' data.json

# 比较操作
jq '.[] | select(.age >= 18)' data.json
jq '.[] | select(.name != "admin")' data.json
jq '.[] | select(.age < 30 and .status == "active")' data.json
jq '.[] | select(.age > 60 or .age < 18)' data.json
jq '.[] | select(.name | startswith("张"))' data.json
jq '.[] | select(.name | endswith("三"))' data.json
jq '.[] | select(.name | test("^张"))' data.json  # 正则

# 存在性检查
jq '.[] | select(.email != null)' data.json
jq '.[] | select(has("email"))' data.json
jq '.[] | select(.email | type == "string")' data.json

# 空值处理
jq '.name // "未知"' data.json     # 如果 name 不存在，使用 "未知"
jq '.name? // "未知"' data.json   # 忽略错误
```

### 统计与计算

```shell
# 计数
jq 'length' data.json
jq '.[] | select(.active) | length' data.json

# 数学运算
jq '.price * 1.1' data.json
jq '.[] | .price * .quantity' data.json
jq '[.[] | .price] | add' data.json         # 总和
jq '[.[] | .price] | min' data.json          # 最小值
jq '[.[] | .price] | max' data.json          # 最大值
jq '[.[] | .price] | unique | length' data.json # 去重计数

# 平均值
jq '[.[] | .age] | add / length' data.json

# 统计
jq '[.[] | select(.age > 30)] | length' data.json
jq 'group_by(.category) | map({category: .[0].category, count: length})' data.json
```

### 构建新对象

```shell
# 创建新对象
jq '{name, age}' data.json
jq '{fullname: .name, years: .age}' data.json

# 构建数组
jq '[.[] | {name, age}]' data.json
jq '[.[] | .name]' data.json

# 合并对象
jq '. + {city: "北京"}' data.json

# 删除字段
jq 'del(.password)' data.json
jq 'del(.[] | .password)' data.json

# 更新值
jq '.age += 1' data.json
jq '.status = "active"' data.json
jq '.tags += ["new"]' data.json
```

### 字符串操作

```shell
# 字符串长度
jq '.name | length' data.json

# 大小写转换
jq '.name | ascii_downcase' data.json
jq '.name | ascii_upcase' data.json

# 字符串分割
jq '.name | split(",")' data.json
jq '.path | split("/")' data.json

# 字符串连接
jq '.firstName + " " + .lastName' data.json
jq 'join(", ")' data.json           # 数组连接为字符串

# 字符串替换
jq '.name | gsub("z"; "Z")' data.json

# 正则替换
jq '.name | sub("^[a-z]+"; "X")' data.json

# 包含检查
jq '.name | contains("张")' data.json
jq '.name | startswith("张")' data.json
jq '.name | endswith("三")' data.json

# trim 空格
jq '.name | rtrimstr(" ")' data.json
```

### 高级用法

```shell
# 变量定义
jq --arg name "张三" '.[] | select(.name == $name)' data.json
jq --argjson config '{"key":"value"}' '. + $config' data.json

# 环境变量
jq --arg HOME "$HOME" '{"home": $HOME}' data.json

# 多文件处理
jq -s '.[0] * .[1]' a.json b.json   # 合并两个文件

# 从标准输入获取 key
jq --arg key "name" '.[$key]' data.json

# 递归提取
jq '.. | objects | select(has("id")) | .id' data.json

# 批量处理
jq -r '.[] | "\(.name),\(.age)"' data.json

# CSV 转 JSON（需要先拼好）
echo 'name,age
张三,25
李四,30' | jq -R 'split(",") | select(length > 1)' | jq -s '.[0] as $header | .[1:] | map([$header, .] | transpose | map({(.[0]): .[1]}) | add)'

# 从文件读取过滤器
jq -f filter.jq data.json

# 合并多个 JSON
jq -s '.' a.json b.json c.json    # 合并为数组
jq -s 'add' a.json b.json c.json  # 合并对象
jq -n '[inputs]' a.json b.json    # 合并为数组
```

### 实用示例

```shell
# 提取 API 响应中的数据
curl -s 'https://api.example.com/users' | jq '.data[] | {id, name}'

# 解析 Docker 镜像列表
docker images --format json | jq '.[] | select(.Repository != "<none>") | {Repository, Tag, ID: .ID[:12]}'

# 解析 Kubernetes 资源
kubectl get pods -o json | jq '.items[] | {name: .metadata.name, status: .status.phase}'

# 分析日志文件（如果是 JSON 格式）
jq -s '.' logs/*.json | jq '[.[] | select(.level == "error")]'

# 格式化 JSON 配置文件
jq '.' config.json > config_formatted.json

# 批量提取字段
cat users.json | jq -r '.[] | "\(.id),\(.name),\(.email)"'

# 统计分析
cat data.json | jq -s '[.[].status] | group_by(.) | map({status: .[0], count: length})'
```
