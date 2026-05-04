istoreos_crontab
===

iStoreOS 计划任务管理

## 补充说明

**crontab** 是 iStoreOS/OpenWrt 的计划任务管理工具，用于设置定时执行的任务。支持按分钟、小时、日、月、周设置定时任务。

### 语法

```shell
crontab [OPTIONS]
```

### 命令

```shell
crontab -e      # 编辑计划任务
crontab -l      # 查看计划任务
crontab -r      # 删除所有计划任务
crontab -u <user>  # 指定用户
```

### 时间格式

```bash
*    *    *    *    *    要执行的命令
┬    ┬    ┬    ┬    ┬
│    │    │    │    │
│    │    │    │    └─── 星期几 (0-7, 0和7都表示周日)
│    │    │    └──────── 月份 (1-12)
│    │    └───────────── 日期 (1-31)
│    └────────────────── 小时 (0-23)
└─────────────────────── 分钟 (0-59)
```

### 特殊字符

```shell
*       # 任意值
,       # 列表分隔符，如 1,3,5
-       # 范围，如 1-5
/n      # 步长，如 */5 表示每5个单位
```

### 常用实例

```shell
# 编辑计划任务
crontab -e

# 查看当前计划任务
crontab -l

# 删除所有计划任务
crontab -r

# 重启 cron 服务
/etc/init.d/cron restart

# 查看 cron 日志
logread -e "cron"
```

### 实用定时任务示例

```shell
# ========== 系统维护 ==========

# 每天凌晨 3 点重启系统
0 3 * * * reboot

# 每周日凌晨 4 点重启
0 4 * * 0 reboot

# 每天凌晨 2 点清理缓存
0 2 * * * sync && echo 3 > /proc/sys/vm/drop_caches

# 每小时同步时间
0 * * * * ntpd -q

# ========== 日志管理 ==========

# 每天凌晨 0 点清空日志
0 0 * * * > /var/log/messages

# 每周清理日志
0 0 * * 0 rm -rf /var/log/*.log

# 每天备份日志到 U 盘
0 1 * * * logread > /mnt/sda1/backup/log_$(date +\%Y\%m\%d).txt

# ========== 系统备份 ==========

# 每天凌晨 2 点备份配置
0 2 * * * sysupgrade -b /mnt/backup/istoreos_$(date +\%Y\%m\%d).tar.gz

# 每周日凌晨备份
0 3 * * 0 sysupgrade -b /mnt/backup/weekly_$(date +\%Y\%m\%d).tar.gz

# 每月 1 号备份
0 4 1 * * sysupgrade -b /mnt/backup/monthly_$(date +\%Y\%m).tar.gz

# ========== 网络维护 ==========

# 每小时检查网络并重启
0 * * * * ping -c 1 8.8.8.8 > /dev/null || /etc/init.d/network restart

# 每 5 分钟检查网络
*/5 * * * * ping -c 1 8.8.8.8 > /dev/null || (ifdown wan && sleep 5 && ifup wan)

# 每天凌晨 5 点重启网络服务
0 5 * * * /etc/init.d/network restart

# 每天 6 点重启 DNS
0 6 * * * /etc/init.d/dnsmasq restart

# ========== 服务管理 ==========

# 每天凌晨 3 点重启 OpenClash
0 3 * * * /etc/init.d/openclash restart

# 每小时重启指定服务
0 * * * * /etc/init.d/passwall restart

# ========== 清理任务 ==========

# 每天清理临时文件
0 3 * * * rm -rf /tmp/*

# 每周清理 opkg 缓存
0 2 * * 0 rm -rf /tmp/opkg-* /var/opkg-lists/*

# 每月清理旧备份
0 0 1 * * find /mnt/backup -name "*.tar.gz" -mtime +30 -delete

# ========== 监控任务 ==========

# 每 10 分钟检查 CPU 温度
*/10 * * * * cat /sys/class/thermal/thermal_zone0/temp >> /tmp/cpu_temp.log

# 每小时记录系统状态
0 * * * * uptime >> /var/log/uptime.log

# 每 5 分钟检查内存使用
*/5 * * * * free -m >> /tmp/memory.log

# ========== 自动更新 ==========

# 每周检查软件更新
0 6 * * 0 opkg update

# 每月检查固件更新（示例）
0 7 1 * * wget -O /tmp/check_update.sh http://example.com/check.sh && sh /tmp/check_update.sh
```

### cron 服务管理

```shell
# 启动 cron 服务
/etc/init.d/cron start

# 停止 cron 服务
/etc/init.d/cron stop

# 重启 cron 服务
/etc/init.d/cron restart

# 启用开机自启
/etc/init.d/cron enable

# 禁用开机自启
/etc/init.d/cron disable

# 查看 cron 服务状态
/etc/init.d/cron status
```

### 完整示例脚本

```shell
#!/bin/sh
# iStoreOS 定时任务配置脚本

# 备份当前 crontab
crontab -l > /tmp/crontab.bak 2>/dev/null

# 添加新的定时任务
cat << EOF >> /tmp/crontab.new
# iStoreOS 系统维护任务

# 每天凌晨 2 点备份系统配置
0 2 * * * sysupgrade -b /mnt/backup/istoreos_\$(date +\%Y\%m\%d).tar.gz

# 每天凌晨 3 点清理缓存
0 3 * * * sync && echo 3 > /proc/sys/vm/drop_caches

# 每小时检查网络连接
0 * * * * ping -c 1 8.8.8.8 > /dev/null || /etc/init.d/network restart

# 每周日凌晨 4 点重启系统
0 4 * * 0 reboot

# 每月清理 30 天前的备份
0 0 1 * * find /mnt/backup -name "*.tar.gz" -mtime +30 -delete
EOF

# 应用新的 crontab
crontab /tmp/crontab.new

# 重启 cron 服务
/etc/init.d/cron restart

echo "定时任务配置完成！"
echo "当前定时任务："
crontab -l
```

### 注意事项

1. crontab 中的命令使用绝对路径
2. 百分号 % 需要转义为 \%
3. 任务执行时没有环境变量，需手动设置
4. 任务输出默认通过系统日志记录
5. 复杂任务建议写成脚本，crontab 只调用脚本
6. 编辑后需要重启 cron 服务生效

### 调试技巧

```shell
# 查看任务是否执行
logread -e "cron"

# 手动执行任务测试
ping -c 1 8.8.8.8 > /dev/null && echo "OK" || echo "FAIL"

# 查看任务执行时间
date && crontab -l

# 将任务输出重定向到文件
*/5 * * * * /path/to/script.sh >> /tmp/cron.log 2>&1
```
