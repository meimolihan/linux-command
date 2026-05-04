docker-rm
===

删除一个或多个容器

## 补充说明

**docker rm** 命令用于删除一个或多个已停止的容器。如果要删除运行中的容器，需要先停止或使用 `-f` 强制删除。

### 语法

```shell
docker rm [OPTIONS] CONTAINER [CONTAINER...]
```

### 选项

```shell
-f, --force       # 强制删除运行中的容器（使用SIGKILL）
-l, --link        # 删除指定链接而非容器
-v, --volumes     # 删除容器关联的匿名卷
```

### 常用实例

```shell
# 删除已停止的容器
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx

# 删除多个容器
docker rm container1 container2

# 删除所有已停止的容器
docker rm $(docker ps -a -q --filter "status=exited")

# 删除容器及其关联的匿名卷
docker rm -v my-nginx

# 删除所有容器（包括运行中的）
docker rm -f $(docker ps -aq)

# 按名称模式删除
docker rm $(docker ps -a -q --filter "name=test*")
```
