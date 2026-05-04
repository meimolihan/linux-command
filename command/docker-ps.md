docker-ps
===

列出容器

## 补充说明

**docker ps** 命令用于列出 Docker 容器。默认只显示运行中的容器，可以通过选项显示所有容器（包括已停止的）。

### 语法

```shell
docker ps [OPTIONS]
```

### 选项

```shell
-a, --all               # 显示所有容器（包括已停止的）
-f, --filter filter      # 根据条件过滤显示内容
--format string          # 使用 Go 模板格式化输出
-n, --last int           # 显示最近创建的 n 个容器（含所有状态）
-l, --latest             # 显示最近创建的容器（含所有状态）
--no-trunc               # 不截断输出
-q, --quiet              # 只显示容器ID
-s, --size               # 显示总文件大小
```

### 常用实例

```shell
# 列出运行中的容器
docker ps

# 列出所有容器（包括停止的）
docker ps -a

# 只显示容器ID
docker ps -q

# 显示最近创建的5个容器
docker ps -n 5

# 按名称过滤
docker ps -f "name=my-nginx"

# 按状态过滤
docker ps -f "status=running"
docker ps -f "status=exited"

# 按镜像过滤
docker ps -f "ancestor=nginx:latest"

# 自定义输出格式
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"

# 只显示容器名称
docker ps --format "{{.Names}}"

# 显示容器大小
docker ps -s

# 组合过滤
docker ps -a --filter "name=web" --filter "status=running"
```

### 格式化占位符

| 占位符 | 说明 |
|--------|------|
| `.ID` | 容器ID |
| `.Image` | 镜像名称 |
| `.Command` | 运行命令 |
| `.CreatedAt` | 创建时间 |
| `.Status` | 容器状态 |
| `.Ports` | 端口映射 |
| `.Names` | 容器名称 |
| `.Networks` | 所属网络 |
| `.Size` | 容器磁盘占用 |
