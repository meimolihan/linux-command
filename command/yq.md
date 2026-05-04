yq
===

YAML 数据处理工具

## 补充说明

**yq** 是轻量级的命令行 YAML 处理工具，支持 YAML、JSON、XML、CSV 等格式的解析、过滤、转换。是处理 YAML 配置文件的利器。

### 语法

```shell
yq [OPTIONS] [EXPRESSION] [FILE...]
```

### 基本使用

```shell
# 美化 YAML
yq '.' file.yaml
yq '.' file.yml

# JSON 输出
yq -o=json '.' file.yaml
yq eval -o=json '.' file.yaml

# 提取字段
yq '.name' data.yaml
yq '.user.name' data.yaml
yq '.users[0].name' data.yaml

# 提取数组元素
yq '.users[0]' data.yaml
yq '.users[]' data.yaml            # 所有元素
yq '.users[:2]' data.yaml          # 前两个
yq '.users[1:]' data.yaml          # 从第二个开始
yq '.users[-1]' data.yaml          # 最后一个
```

### 输出格式

```shell
# YAML 输出（默认）
yq '.' file.yaml

# JSON 输出
yq -o=json '.' file.yaml
yq output-format=json '.' file.yaml

# JSON 单行输出
yq -o=json -I=0 '.' file.yaml

# 压缩输出
yq --no-doc '.' file.yaml          # 不带文档分隔符

# 原始输出（无引号）
yq -r '.name' file.yaml

# 彩色输出
yq -C '.' file.yaml

# 不着色输出
yq -M '.' file.yaml

# 保持注释
yq --preserve-comments '.' file.yaml
```

### 查询过滤

```shell
# 条件过滤
yq '.[] | select(.age > 25)' data.yaml
yq '.users[] | select(.name == "张三")' data.yaml
yq '.[] | select(.status | test("active"))' data.yaml

# 存在性检查
yq '.[] | select(has("email"))' data.yaml
yq '.[] | select(.email != null)' data.yaml

# 比较操作
yq '.[] | select(.age >= 18 and .age <= 60)' data.yaml
yq '.[] | select(.status == "active" or .status == "pending")' data.yaml

# 正则匹配
yq '.[] | select(.name | test("^张"))' data.yaml
yq '.[] | select(.email | test("@example\\.com$"))' data.yaml

# 字符串包含
yq '.[] | select(.name | contains("张"))' data.yaml
```

### 数组操作

```shell
# 数组长度
yq '.users | length' data.yaml

# 遍历数组
yq '.users[]' data.yaml
yq '.users[] | .name' data.yaml

# 数组切片
yq '.users[0:2]' data.yaml
yq '.users[:3]' data.yaml
yq '.users[-2:]' data.yaml

# 添加元素
yq '.users += {"name": "新用户"}' data.yaml
yq '.users += ["item"]' data.yaml

# 删除元素
yq 'del(.users[0])' data.yaml
yq 'del(.users[] | select(.name == "张三"))' data.yaml

# 过滤数组
yq '[.users[] | select(.age > 25)]' data.yaml
yq '.users | map(select(.active == true))' data.yaml

# 映射操作
yq '.users | map(.name)' data.yaml
yq '.users | map({name, age})' data.yaml

# 排序
yq '.users | sort_by(.age)' data.yaml
yq '.users | sort_by(.name)' data.yaml
yq '.users | sort_by(.age) | reverse' data.yaml  # 倒序

# 去重
yq '.users | unique_by(.name)' data.yaml
yq '.tags | unique' data.yaml

# 分组
yq '.users | group_by(.department)' data.yaml
```

### 修改操作

```shell
# 更新字段
yq '.name = "新名字"' data.yaml
yq '.user.age = 30' data.yaml

# 添加字段
yq '. += {"city": "北京"}' data.yaml
yq '.tags += ["new-tag"]' data.yaml

# 删除字段
yq 'del(.password)' data.yaml
yq 'del(.users[0].password)' data.yaml

# 条件更新
yq '(.[] | select(.name == "张三") | .age) = 30' data.yaml

# 增量更新
yq '.age += 1' data.yaml
yq '.count *= 2' data.yaml

# 合并对象
yq '. *= {"city": "北京", "country": "中国"}' data.yaml

# 重命名字段（删除旧字段，添加新字段）
yq '.fullName = .name | del(.name)' data.yaml
```

### 格式转换

```shell
# YAML 转 JSON
yq -o=json '.' file.yaml > output.json
yq eval -o=json '.' file.yaml

# JSON 转 YAML
yq '.' file.json > output.yaml
yq -p=json '.' file.json

# YAML 转 XML
yq -p=yaml -o=xml '.' file.yaml

# XML 转 YAML
yq -p=xml '.' file.xml

# YAML 转 CSV（需要扁平结构）
yq -o=csv '.users[]' data.yaml

# CSV 转 YAML
yq -p=csv '.' data.csv

# Properties 转 YAML
yq -p=props '.' config.properties

# 支持 format
yq --input-format=yaml --output-format=json '.' file.yaml
yq -I=yaml -O=json '.' file.yaml

# 支持的格式:
# yaml, yml
# json
# xml
# csv
# tsv
# props (properties)
# ubuntu (ubuntu config)
```

### 多文件操作

```shell
# 合并多个 YAML 文件
yq -s '.' file1.yaml file2.yaml

# 合并为数组
yq -n '[inputs]' file1.yaml file2.yaml

# 合并对象
yq -n 'reduce inputs as $item ({}; . * $item)' file1.yaml file2.yaml

# 批量处理
yq '.' file1.yaml
yq '.users' *.yaml

# 从标准输入读取
cat data.yaml | yq '.name'
curl -s http://example.com/data.yaml | yq '.'

# 多文档处理
yq '.' multi-doc.yaml            # 处理所有文档
yq '.[]' multi-doc.yaml          # 遍历所有文档
yq 'select(.kind == "Deployment")' k8s-resources.yaml
```

### Kubernetes 配置处理

```shell
# 提取 Kubernetes Deployment 名称
yq '.metadata.name' deployment.yaml

# 提取所有镜像
yq '.spec.template.spec.containers[].image' deployment.yaml

# 获取服务端口
yq '.spec.ports[] | select(.port == 80)' service.yaml

# 批量修改镜像
yq '.spec.template.spec.containers[0].image = "nginx:latest"' deployment.yaml

# 提取所有 ConfigMap 数据
yq '.data' configmap.yaml

# 查看 Secret（base64 解码）
yq '.data | with_entries(.value = (.value | @base64d))' secret.yaml

# 提取资源配额
yq '.spec.containers[].resources' deployment.yaml

# 修改副本数
yq '.spec.replicas = 3' deployment.yaml
```

### 常量

```shell
# 使用变量
yq --arg NAME "张三" '.name = $NAME' data.yaml
yq --argjson AGE 30 '.age = $AGE' data.yaml

# 环境变量
yq '.name = env(USER)' data.yaml
yq '.home = env(HOME)' data.yaml
env | grep USER | yq -r '.[]'

# 时间函数
yq 'now' data.yaml
yq 'now | tz("Asia/Shanghai")' data.yaml
yq '.timestamp = now' data.yaml

# 文件信息
yq '.filename = input_filename' data.yaml
yq '.index = input_index' data.yaml
```

### 实用示例

```shell
# 修改 Docker Compose 服务镜像
yq '.services.web.image = "nginx:latest"' docker-compose.yaml

# 提取 GitHub Actions 步骤
yq '.jobs.build.steps[]' workflow.yaml

# 美化配置文件
yq '.' config.yaml > config_formatted.yaml

# 验证 YAML 语法
yq '.' ci-cd.yaml

# 合并配置
yq '. *= load("defaults.yaml")' values.yaml

# 批量修改配置文件
yq '.app.env = "production"' config.yaml -i

# 导出字段为 CSV
yq -r '.users[] | "\(.id),\(.name),\(.email)"' data.yaml > export.csv
```

### 常用组合

```shell
# 格式化并验证 YAML
yq '.' config.yaml && echo "YAML 格式正确"

# 批量修改项目配置
for f in *.yaml; do yq '.version = "2.0"' "$f" -i; done

# 统计 Kubernetes 资源
yq 'kind' resources.yaml | sort | uniq -c

# 快速查看配置值
yq '.database.host' config.yaml

# 提取并排序
yq '.users[].name | sort' data.yaml
```
