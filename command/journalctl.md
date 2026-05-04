journalctl
===

systemd 日志查看工具

## 补充说明

**journalctl** 是 systemd 的日志查看工具，用于查询和显示 systemd journal 日志。可以查看系统日志、服务日志、内核日志等。

### 语法

```shell
journalctl [OPTIONS...] [MATCHES...]
```

### 基本使用

```shell
# 查看所有日志
journalctl

# 查看最新日志
journalctl -n
journalctl -n 50                       # 最近 50 条
journalctl --lines=100

# 实时跟踪日志
journalctl -f
journalctl --follow

# 查看内核日志
journalctl -k
journalctl --dmesg

# 查看本次启动日志
journalctl -b
journalctl -b 0                        # 本次启动
journalctl -b -1                       # 上次启动
journalctl -b -2                       # 上上次启动

# 查看指定时间范围
journalctl --since "2024-01-01"
journalctl --since "2024-01-01 10:00:00"
journalctl --since "1 hour ago"
journalctl --since "yesterday"
journalctl --since today
journalctl --since "2024-01-01" --until "2024-01-02"
journalctl --since "09:00" --until "1 hour ago"

# 查看当前启动时间范围
journalctl --since "$(last reboot | head -1 | awk '{print $5, $6, $7, $8}')"
```

### 服务日志

```shell
# 查看指定服务日志
journalctl -u nginx
journalctl -u nginx.service
journalctl -u docker

# 查看多个服务日志
journalctl -u nginx -u php-fpm

# 实时跟踪服务日志
journalctl -u nginx -f

# 查看服务最近日志
journalctl -u nginx -n 50

# 查看服务启动以来的日志
journalctl -u nginx -b

# 查看服务失败日志
journalctl -u nginx --priority=err

# 查看多个单元
journalctl -u nginx -u mysql -u php

# 匹配单元模式
journalctl -u "docker*"
```

### 日志过滤

```shell
# 按优先级过滤
journalctl -p err                      # 错误级别
journalctl -p warning                 # 警告级别
journalctl -p info                    # 信息级别

# 优先级列表（从高到低）
# emerg    - 紧急：系统不可用
# alert    - 警报：必须立即处理
# crit     - 严重：严重错误
# err      - 错误：错误信息
# warning  - 警告：警告信息
# notice   - 通知：正常但重要
# info     - 信息：常规信息
# debug    - 调试：调试信息

# 范围过滤
journalctl -p err..alert              # 错误到警报
journalctl -p warning..crit

# 按进程 ID 过滤
journalctl _PID=1234

# 按可执行文件过滤
journalctl /usr/bin/nginx

# 按用户过滤
journalctl _UID=1000

# 按 group 过滤
journalctl _GID=1000

# 按设备过滤
journalctl /dev/sda
```

### 搜索过滤

```shell
# 搜索关键字
journalctl | grep "error"
journalctl | grep -i "nginx"

# 使用 --grep（需要 --since）
journalctl --since "1 hour ago" --grep "error"

# 过滤消息
journalctl MESSAGE="connection failed"

# 模糊匹配
journalctl MESSAGE=error

# 排除匹配
journalctl MESSAGE!="error"

# 组合过滤
journalctl -u nginx -p err

# 多字段过滤
journalctl _SYSTEMD_UNIT=nginx.service + _SYSTEMD_UNIT=php-fpm.service
```

### 输出格式

```shell
# JSON 输出
journalctl -o json
journalctl -o json-pretty
journalctl -u nginx -o json

# 导出格式（备份用）
journalctl -o export

# 详细输出
journalctl -o verbose

# 简洁输出（单行）
journalctl -o cat

# 指定输出字段
journalctl -o verbose --output-fields=MESSAGE,PRIORITY

# 显示完整信息
journalctl -o verbose -n 1

# 显示日志元数据
journalctl --output=verbose --no-pager -n 1
```

### 高级选项

```shell
# 显示日志字段
journalctl -F _SYSTEMD_UNIT
journalctl -F PRIORITY
journalctl -F _HOSTNAME

# 显示所有可用字段
journalctl --output=verbose -n 1 | grep '='

# 显示进程树
journalctl --cursor=file.cursor

# 显示所有引导
journalctl --list-boots

# 验证日志文件
journalctl --verify

# 磁盘使用
journalctl --disk-usage

# 清理日志（保留最近 N 天）
journalctl --vacuum-time=7d
journalctl --vacuum-time=1month

# 清理日志（保留最大大小）
journalctl --vacuum-size=100M
journalctl --vacuum-size=1G

# 限制日志大小（保留最近）
journalctl --vacuum-files=10

# 显示日志目录
journalctl --header

# 不分页显示
journalctl --no-pager

# 显示完整行（不截断）
journalctl --no-tail
```

### 常用组合

```shell
# 查看最近一小时错误日志
journalctl --since "1 hour ago" -p err

# 查看特定时间范围日志
journalctl --since "09:00" --until "18:00"

# 实时查看 nginx 错误
journalctl -u nginx -p err -f

# 查看某个服务的启动失败日志
journalctl -u nginx --since "1 hour ago" | grep -i "failed\|error"

# 查看本次启动错误
journalctl -b -p err

# 查看上次启动失败的日志
journalctl -b -1 -p err

# 查看内核错误
journalctl -k -p err

# 导出日志到文件
journalctl --since today > /tmp/today.log
journalctl --since "2024-01-01" --until "2024-01-02" -o json > logs.json

# 分析日志中的 IP 访问
journalctl -u nginx | grep -oP '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' | sort | uniq -c | sort -nr
```

### 日志管理

```shell
# 查看日志大小
journalctl --disk-usage

# 清理旧日志
sudo journalctl --vacuum-time=7d
sudo journalctl --vacuum-size=500M

# 配置日志保留
# /etc/systemd/journald.conf
SystemMaxUse=500M
RuntimeMaxUse=100M
MaxRetentionSec=7day

# 重启日志服务
sudo systemctl restart systemd-journald

# 查看日志配置
systemctl cat systemd-journald

# 日志文件位置
/var/log/journal/              # 持久化日志
/run/log/journal/              # 运行时日志
```
