systemctl
===

systemd 服务管理工具

## 补充说明

**systemctl** 是 Linux 系统中 systemd 的命令行管理工具，用于控制 systemd 系统和服务管理器。可以启动、停止、重启服务，管理开机自启，查看系统状态等。

### 语法

```shell
systemctl [OPTIONS] COMMAND [NAME...]
```

### 服务管理

```shell
# 启动服务
systemctl start nginx
systemctl start docker

# 停止服务
systemctl stop nginx
systemctl stop docker

# 重启服务
systemctl restart nginx
systemctl restart docker

# 重载配置（不中断服务）
systemctl reload nginx
systemctl reload nginx --now

# 查看服务状态
systemctl status nginx
systemctl status docker
systemctl status                          # 所有服务状态

# 查看简要状态
systemctl is-active nginx               # 是否运行中
systemctl is-enabled nginx              # 是否开机自启
systemctl is-failed nginx               # 是否失败

# 查看服务是否运行
systemctl is-active --quiet nginx && echo "运行中"

# 尝试重启服务（如果已运行）
systemctl try-restart nginx

# 彻底重启服务（停止后启动）
systemctl reload-or-restart nginx

# 立即终止服务
systemctl kill nginx
systemctl kill nginx --signal=SIGKILL
```

### 开机自启

```shell
# 开启开机自启
systemctl enable nginx
systemctl enable nginx --now            # 启用并立即启动

# 关闭开机自启
systemctl disable nginx
systemctl disable nginx --now           # 禁用并立即停止

# 查看自启状态
systemctl is-enabled nginx

# 屏蔽服务（无法手动启动）
systemctl mask nginx

# 取消屏蔽
systemctl unmask nginx

# 查看服务预设状态
systemctl preset nginx
```

### 服务查看

```shell
# 列出所有服务
systemctl list-units --type=service
systemctl list-units --type=service --all

# 列出运行中的服务
systemctl list-units --type=service --state=running

# 列出失败的服务
systemctl list-units --type=service --state=failed
systemctl --failed

# 列出所有单元文件
systemctl list-unit-files

# 列出服务单元文件
systemctl list-unit-files --type=service

# 列出启用的服务
systemctl list-unit-files --state=enabled

# 列出自启失败的服务
systemctl list-unit-files --state=disabled
```

### 查看服务详情

```shell
# 查看服务详情
systemctl show nginx
systemctl show nginx --property=ActiveState
systemctl show nginx --property=MainPID

# 查看服务依赖
systemctl list-dependencies nginx
systemctl list-dependencies nginx --reverse

# 查看服务日志
journalctl -u nginx
journalctl -u nginx -f                   # 实时跟踪

# 查看服务配置文件
systemctl cat nginx

# 编辑服务配置
systemctl edit nginx
systemctl edit nginx --full              # 编辑完整配置

# 查看服务默认配置
systemctl cat nginx | head -20
```

### 系统管理

```shell
# 重启系统
systemctl reboot

# 关机
systemctl poweroff

# 挂起系统
systemctl suspend

# 休眠
systemctl hibernate

# 混合睡眠
systemctl hybrid-sleep

# 退出登录
systemctl exit

# 切换运行级别（rescueemergency）
systemctl rescue
systemctl emergency

# 切换运行目标
systemctl isolate multi-user.target
systemctl isolate graphical.target

# 切换默认目标（图形界面命令行界面）
systemctl set-default graphical.target
systemctl set-default multi-user.target
systemctl get-default

# 查看所有目标
systemctl list-units --type=target
```

### 管理单元文件

```shell
# 创建服务文件
# /etc/systemd/system/myapp.service

[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/myapp
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target

# 重载配置文件
systemctl daemon-reload

# 创建符号链接（启用服务）
systemctl link /path/to/myapp.service
```

### 服务文件示例

```ini
# 标准 Web 服务示例
[Unit]
Description=Nginx Web Server
After=network.target remote-fs.target nss-lookup.target

[Service]
Type=forking
PIDFile=/run/nginx.pid
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -HUP $MAINPID
KillSignal=SIGQUIT
TimeoutStopSec=5
KillMode=process
PrivateTmp=true

[Install]
WantedBy=multi-user.target

# 简单服务示例
[Unit]
Description=My Node.js App
After=network.target

[Service]
Type=simple
User=nodeuser
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node /opt/myapp/app.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=myapp
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# 定时器服务示例
[Unit]
Description=Run backup daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### 查询命令

```shell
# 查看系统启动时间
systemctl show --property=KernelTimestamp

# 查看启动耗时
systemd-analyze time

# 查看启动图形
systemd-analyze plot > boot.svg

# 查看启动关键链
systemd-analyze critical-chain

# 查看启动最慢的服务
systemd-analyze blame

# 查看服务启动时间
systemd-analyze blame | grep nginx

# 搜索单元
systemctl list-units nginx*

# 查看环境变量
systemctl show-environment

# 设置环境变量
systemctl set-environment MY_VAR=value

# 取消环境变量
systemctl unset-environment MY_VAR
```

### 故障排查

```shell
# 查看失败的服务
systemctl --failed

# 查看失败原因
systemctl status nginx

# 查看详细日志
journalctl -xeu nginx

# 检查服务配置
systemd-analyze verify /etc/systemd/system/nginx.service

# 重置服务失败状态
systemctl reset-failed

# 诊断服务问题
journalctl -u nginx --since "1 hour ago"

# 查看服务内存限制
systemctl show nginx | grep Memory

# 查看资源使用
systemd-cgtop
```
