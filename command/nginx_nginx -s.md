nginx_nginx -s
===

向 nginx 主进程发送控制信号

## 补充说明

**nginx -s** 命令用于向正在运行的 nginx 主进程发送信号，实现进程控制。支持发送 `stop`、`quit`、`reload`、`reopen` 四种信号。

### 语法

```shell
nginx -s signal
```

### 信号类型

```shell
stop    # 快速关闭，类似 SIGTERM
quit    # 优雅关闭，等待当前请求处理完毕后关闭，类似 SIGQUIT
reload  # 重新加载配置文件
reopen  # 重新打开日志文件
```

### 常用实例

```shell
# 重新加载配置（常用）
nginx -s reload

# 快速停止
nginx -s stop

# 优雅停止（推荐生产环境使用）
nginx -s quit

# 重新打开日志（配合 logrotate 使用）
nginx -s reopen
```

### 信号工作原理

```
nginx 主进程（Master Process）
├── 读取并验证配置文件
├── 管理子进程（Worker Processes）
└── 接收信号并执行相应操作

nginx 子进程（Worker Processes）
└── 处理实际请求
```

### reload 流程

```shell
# 1. nginx 收到 reload 信号
# 2. 主进程重新读取配置文件
# 3. 验证配置语法
# 4. 启动新的 worker 进程
# 5. 向旧 worker 发送 quit 信号
# 6. 旧 worker 处理完当前请求后退出
```

### 注意事项

- 发送信号前确保 nginx 正在运行
- reload 不会中断正在处理的请求
- 使用 `nginx -t` 验证配置后再 reload
- quit 信号允许客户端请求处理完毕后再退出
