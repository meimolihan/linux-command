docker-cp
===

在容器和本地文件系统之间复制文件

## 补充说明

**docker cp** 命令用于在容器和宿主机之间复制文件或目录，是容器与外部交换文件的主要方式。

### 语法

```shell
docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH
docker cp [OPTIONS] SRC_PATH CONTAINER:DEST_PATH
```

### 选项

```shell
-a, --archive     # 归档模式（保留UID/GID信息）
-L, --follow-link # 始终跟踪符号链接
-q, --quiet       # 静默输出
```

### 常用实例

```shell
# 从容器复制文件到宿主机
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf

# 从容器复制目录到宿主机
docker cp my-nginx:/etc/nginx ./nginx-config/

# 从宿主机复制文件到容器
docker cp ./app.conf my-nginx:/etc/nginx/conf.d/app.conf

# 从宿主机复制目录到容器
docker cp ./html/ my-nginx:/usr/share/nginx/html/

# 复制时保留权限
docker cp -a my-nginx:/var/log/nginx/ ./logs/

# 使用容器ID复制
docker cp abc123def:/app/data.json ./
```
