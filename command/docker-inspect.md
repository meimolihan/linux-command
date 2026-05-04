docker-inspect
===

获取容器或镜像的底层信息

## 补充说明

**docker inspect** 命令用于获取 Docker 对象（容器、镜像、网络、卷等）的详细底层信息，返回 JSON 格式数据。

### 语法

```shell
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
```

### 选项

```shell
-f, --format string    # 使用 Go 模板格式化输出
-s, --size             # 显示总文件大小（仅容器）
--type string          # 指定返回的 JSON 类型
```

### 常用实例

```shell
# 查看容器详细信息
docker inspect my-nginx

# 获取容器IP地址
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-nginx

# 获取容器端口映射
docker inspect -f '{{json .NetworkSettings.Ports}}' my-nginx

# 获取容器环境变量
docker inspect -f '{{json .Config.Env}}' my-nginx

# 获取容器日志路径
docker inspect -f '{{.LogPath}}' my-nginx

# 获取容器挂载信息
docker inspect -f '{{json .Mounts}}' my-nginx

# 获取镜像创建时间
docker inspect -f '{{.Created}}' nginx:latest

# 获取容器启动命令
docker inspect -f '{{.Config.Cmd}}' my-nginx

# 获取容器重启策略
docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' my-nginx

# 格式化输出为可读JSON
docker inspect my-nginx | python3 -m json.tool
```
