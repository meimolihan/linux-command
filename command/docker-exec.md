docker-exec
===

在运行中的容器内执行命令

## 补充说明

**docker exec** 命令用于在正在运行的容器中执行命令。这是调试容器问题、在容器内运行管理任务最常用的方式。

### 语法

```shell
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
```

### 选项

```shell
-d, --detach                  # 后台运行命令
--detach-keys string          # 覆盖分离容器的快捷键
-e, --env list                # 设置环境变量
--env-file list               # 读取环境变量文件
-i, --interactive             # 保持标准输入打开
--privileged                  # 赋予命令扩展权限
-t, --tty                     # 分配伪终端
-u, --user string             # 指定用户 (格式: <name|uid>[:<group|gid>])
-w, --workdir string          # 指定工作目录
```

### 常用实例

```shell
# 进入容器交互式终端
docker exec -it my-nginx /bin/bash
docker exec -it my-nginx /bin/sh    # Alpine 镜像

# 在容器中执行单条命令
docker exec my-nginx ls /etc/nginx
docker exec my-nginx cat /etc/nginx/nginx.conf

# 以指定用户执行命令
docker exec -u root my-nginx apt-get update

# 设置环境变量执行命令
docker exec -e MYSQL_PWD=123456 mysql mysql -u root -e "SHOW DATABASES;"

# 后台执行命令
docker exec -d my-nginx nginx -s reload

# 指定工作目录
docker exec -w /var/log my-nginx ls

# 复制容器内的文件到宿主机（变通方式）
docker exec my-nginx cat /etc/nginx/nginx.conf > ./nginx.conf
```
