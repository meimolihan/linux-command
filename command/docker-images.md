docker-images
===

列出本地镜像

## 补充说明

**docker images** 命令用于列出本地主机上的所有 Docker 镜像，包括镜像的仓库、标签、镜像ID、创建时间和大小等信息。

### 语法

```shell
docker images [OPTIONS] [REPOSITORY[:TAG]]
```

### 选项

```shell
-a, --all               # 显示所有镜像（包括中间层镜像）
--digests               # 显示镜像摘要
-f, --filter filter      # 根据条件过滤显示内容
--format string          # 使用 Go 模板格式化输出
--no-trunc               # 显示完整的镜像ID
-q, --quiet              # 只显示镜像ID
```

### 常用实例

```shell
# 列出本地所有镜像
docker images

# 只显示镜像ID
docker images -q

# 显示镜像摘要
docker images --digests

# 显示完整镜像ID（不截断）
docker images --no-trunc

# 按仓库名过滤
docker images nginx

# 按仓库名和标签过滤
docker images nginx:latest

# 过滤悬空镜像（无标签的镜像）
docker images -f "dangling=true"

# 按引用过滤
docker images -f "reference=nginx*"

# 自定义输出格式
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# 显示所有镜像（包括中间层）
docker images -a
```

### 格式化占位符

| 占位符 | 说明 |
|--------|------|
| `.Repository` | 镜像仓库 |
| `.Tag` | 镜像标签 |
| `.ID` | 镜像ID |
| `.CreatedSince` | 创建以来时长 |
| `.CreatedAt` | 创建时间 |
| `.Size` | 镜像大小 |
| `.Digest` | 镜像摘要 |
