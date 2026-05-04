istoreos_logread
===

iStoreOS 系统日志查看工具

## 补充说明

**logread** 是 OpenWrt/iStoreOS 的系统日志查看工具，用于查看内核消息、系统服务日志、应用程序日志等。是系统故障排查和监控的重要工具。

### 语法

```shell
logread [OPTIONS]
```

### 选项

```shell
-f              # 实时跟踪日志输出（类似 tail -f）
-l <count>      # 显示最近 N 条日志
-e <pattern>    # 只显示匹配正则表达式的日志
-p <pid>        # 只显示指定进程的日志
-h              # 显示帮助信息
-S <size>       # 设置日志缓冲区大小
-s              # 静默模式
```

### 常用实例

```shell
# 查看所有系统日志
logread

# 实时查看日志（持续监控）
logread -f

# 查看最近 50 条日志
logread -l 50

# 查看最近 100 条日志
logread -l 100

# 搜索包含 "error" 的日志
logread -e "error"

# 搜索包含 "OpenClash" 的日志
logread -e "OpenClash"

# 搜索包含 "failed" 或 "error" 的日志
logread -e "(failed|error)"

# 实时过滤特定关键词
logread -f -e "dnsmasq"

# 查看内核日志
logread -e "kernel"

# 查看网络相关日志
logread -e "network"

# 查看 DHCP 日志
logread -e "dnsmasq"

# 查看 WiFi 日志
logread -e "wifi\|wlan\|wireless"

# 查看防火墙日志
logread -e "firewall\|iptables"
```

### 日志输出示例

```shell
# logread 输出格式
# 时间戳 主机名 进程[PID]: 日志内容

# 示例输出
Mon Jan 15 10:23:45 2026 daemon.info dnsmasq[1234]: starting, version 2.88
Mon Jan 15 10:23:46 2026 daemon.info dnsmasq[1234]: compile time options: IPv6
Mon Jan 15 10:23:47 2026 kern.info kernel: [12345.678] br-lan: port 1(eth0) entered forwarding state
Mon Jan 15 10:23:48 2026 user.info firewall: Reloading firewall due to ifup of lan
Mon Jan 15 10:24:00 2026 daemon.err OpenClash[5678]: Failed to start clash core
```

### 常用日志分析

```shell
# 查看系统启动日志
logread -e "boot\|startup\|init"

# 查看服务启动日志
logread -e "init\|service\|daemon"

# 查看错误和警告
logread -e "error\|warning\|fail\|critical"

# 查看网络连接问题
logread -e "connect\|connection\|timeout"

# 查看 DNS 问题
logread -e "dns\|resolve\|dnsmasq"

# 查看内存相关问题
logread -e "memory\|oom\|Out of"

# 查看磁盘问题
logread -e "disk\|storage\|mount"

# 查看 USB 设备日志
logread -e "usb\|USB"
```

### 实时监控脚本

```shell
#!/bin/sh
# iStoreOS 实时日志监控脚本

echo "=========================================="
echo "    iStoreOS 实时日志监控"
echo "=========================================="
echo ""
echo "监控关键词: error, warning, fail, critical"
echo "按 Ctrl+C 退出"
echo ""

logread -f -e "(error|warning|fail|critical)"
```

### 日志管理

```shell
# 查看日志文件位置
ls -la /var/log/

# 清空系统日志
> /var/log/messages
> /var/log/daemon.log

# 清空日志缓冲区
logread > /dev/null

# 保存日志到文件
logread > /tmp/system_log_$(date +%Y%m%d).txt

# 保存最近 100 条日志
logread -l 100 > /tmp/recent_log.txt

# 导出错误日志
logread -e "error" > /tmp/error_log.txt

# 定期备份日志（添加到 crontab）
# 0 0 * * * logread > /mnt/backup/daily_log_$(date +\%Y\%m\%d).txt
```

### 常见问题排查

```shell
# 问题1：网络不通
logread -e "network\|interface\|eth\|wan\|lan"

# 问题2：DNS 解析失败
logread -e "dns\|dnsmasq\|resolve"

# 问题3：WiFi 连接问题
logread -e "wifi\|wlan\|wireless\|hostapd"

# 问题4：服务无法启动
logread -e "service\|daemon\|init" | grep -i "服务名"

# 问题5：防火墙问题
logread -e "firewall\|iptables\|nf_"

# 问题6：存储问题
logread -e "mount\|filesystem\|disk\|sda"

# 问题7：内存不足
logread -e "memory\|oom\|Out of memory"

# 问题8：USB 设备识别问题
logread -e "usb\|USB\|uhci\|ehci\|xhci"
```

### 与 dmesg 的区别

```shell
# logread：查看系统日志（用户空间 + 内核）
logread

# dmesg：仅查看内核消息
dmesg

# dmesg 实时输出
dmesg -w

# dmesg 查看最近消息
dmesg | tail -50
```

### 日志级别说明

```
emerg    - 紧急：系统不可用
alert    - 警报：必须立即处理
crit     - 严重：严重错误
err      - 错误：错误信息
warning  - 警告：警告信息
notice   - 通知：正常但重要的事件
info     - 信息：常规信息
debug    - 调试：调试信息
```

### 配置日志服务器

```shell
# 配置远程日志服务器（发送到远程 syslog）
uci set system.@system[0].log_ip='192.168.1.100'
uci set system.@system[0].log_port='514'
uci commit system
/etc/init.d/log restart

# 或编辑配置文件
vi /etc/config/system
# config system
#     option log_ip '192.168.1.100'
#     option log_port '514'
#     option log_remote '1'
```

### 日志分析脚本

```shell
#!/bin/sh
# 日志分析脚本

LOG_FILE="/tmp/log_analysis_$(date +%Y%m%d).txt"

echo "==========================================" > $LOG_FILE
echo "iStoreOS 日志分析报告" >> $LOG_FILE
echo "生成时间: $(date)" >> $LOG_FILE
echo "==========================================" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "--- 错误日志 ---" >> $LOG_FILE
logread -e "error" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "--- 警告日志 ---" >> $LOG_FILE
logread -e "warning" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "--- 网络相关 ---" >> $LOG_FILE
logread -e "network" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "--- DNS 相关 ---" >> $LOG_FILE
logread -e "dns" >> $LOG_FILE
echo "" >> $LOG_FILE

echo "分析报告已保存到: $LOG_FILE"
cat $LOG_FILE
```

### 注意事项

1. 日志存储在内存中，重启后清空
2. 日志缓冲区大小有限，旧日志会被覆盖
3. 实时监控（-f）会持续运行直到手动中断
4. 大量日志可能影响系统性能
5. 重要日志建议及时保存到文件
