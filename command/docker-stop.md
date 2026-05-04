docker-stop
===

停止一个或多个运行中的容器

## 补充说明

**docker stop** 命令用于停止一个或多个正在运行的容器。Docker 会先向容器发送 SIGTERM 信号，如果在指定超时时间（默认10秒）内容器未停止，则发送 SIGKILL 信号强制终止。

### 语法

```shell
docker stop [OPTIONS] CONTAINER [CONTAINER...]
```

### 选项

```shell
-t, --time int    # 等待停止的秒数（默认10秒）
```

### 常用实例

```shell
# 停止容器
docker stop my-nginx

# 停止多个容器
docker stop container1 container2 container3

# 设置超时时间为30秒
docker stop -t 30 my-nginx

# 停止所有运行中的容器
docker stop $(docker ps -q)

# 立即停止容器（超时0秒）
docker stop -t 0 my-nginx
```
