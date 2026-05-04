docker-logs
===

获取容器的日志

## 补充说明

**docker logs** 命令用于获取容器的日志输出，是排查容器问题的重要工具。支持实时跟踪日志、限制行数、指定时间范围等功能。

### 语法

```shell
docker logs [OPTIONS] CONTAINER
```

### 选项

```shell
--details               # 显示日志的额外详细信息
-f, --follow            # 实时跟踪日志输出
--since string          # 显示自指定时间以来的日志 (如 "2024-01-01" 或 "1h30m")
--tail string           # 从日志末尾显示的行数（默认"all"）
-t, --timestamps        # 显示时间戳
--until string          # 显示指定时间之前的日志
```

### 常用实例

```shell
# 查看容器全部日志
docker logs my-nginx

# 实时跟踪日志
docker logs -f my-nginx

# 查看最近100行日志
docker logs --tail 100 my-nginx

# 实时跟踪最近50行日志
docker logs -f --tail 50 my-nginx

# 显示时间戳
docker logs -t my-nginx

# 查看最近1小时的日志
docker logs --since 1h my-nginx

# 查看指定时间范围的日志
docker logs --since "2024-01-01T00:00:00" --until "2024-01-02T00:00:00" my-nginx

# 显示额外详细信息
docker logs --details my-nginx

# 组合使用
docker logs -f --tail 100 --since 30m -t my-nginx
```
