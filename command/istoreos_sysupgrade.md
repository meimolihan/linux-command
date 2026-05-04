istoreos_sysupgrade
===

iStoreOS 系统升级与备份工具

## 补充说明

**sysupgrade** 是 OpenWrt/iStoreOS 官方提供的系统升级和备份恢复工具。用于固件升级、系统配置备份与恢复。这是 iStoreOS 系统维护的核心命令。

### 语法

```shell
sysupgrade [OPTIONS] <firmware-file>
sysupgrade -b <backup-file>     # 创建备份
sysupgrade -r <backup-file>     # 恢复备份
```

### 选项

```shell
-b <file>            # 创建配置备份文件
-r <file>            # 从备份文件恢复配置
-l                   # 列出备份包含的文件
-L <file>            # 列出备份文件中的内容
-T <file>            # 验证固件文件是否合法
-f <file>            # 指定要恢复的备份文件
-n                   # 升级时不保存配置（全新安装）
-c                   # 升级时尝试保存所有修改过的文件
-F                   # 强制升级（忽略校验失败）
-q                   # 安静模式
-v                   # 详细输出模式
--ignore-minor-compat  # 忽略版本兼容性检查
--force              # 强制刷写（危险）
--help               # 显示帮助信息
```

### 系统备份

```shell
# 创建系统配置备份
sysupgrade -b /mnt/backup/istoreos_backup_$(date +%Y%m%d).tar.gz

# 创建备份到默认位置
sysupgrade -b /tmp/backup.tar.gz

# 备份到 U 盘
sysupgrade -b /mnt/sda1/backup/istoreos_config.tar.gz

# 备份到 TFTP 服务器（需先挂载）
sysupgrade -b /tmp/upload/backup.tar.gz

# 查看备份包含的文件
sysupgrade -l

# 查看备份文件内容
sysupgrade -L /path/to/backup.tar.gz
```

### 系统恢复

```shell
# 从备份文件恢复配置
sysupgrade -r /mnt/backup/istoreos_backup.tar.gz

# 从 U 盘恢复
sysupgrade -r /mnt/sda1/backup/istoreos_config.tar.gz

# 恢复后系统会自动重启
```

### 固件升级

```shell
# 验证固件文件是否合法
sysupgrade -T /tmp/openwrt-x86-64-generic-ext4-combined.img.gz

# 升级固件（保留配置）
sysupgrade /tmp/openwrt-x86-64-generic-ext4-combined.img.gz

# 升级固件（不保留配置，全新安装）
sysupgrade -n /tmp/openwrt-x86-64-generic-ext4-combined.img.gz

# 强制升级（忽略版本检查）
sysupgrade -F /tmp/firmware.img.gz

# 升级时尝试保存所有修改过的文件
sysupgrade -c /tmp/firmware.img.gz
```

### 完整升级流程

```shell
# 1. 备份当前配置
sysupgrade -b /mnt/backup/backup_before_upgrade.tar.gz

# 2. 下载新固件
cd /tmp
wget https://example.com/istoreos-x86-64.img.gz

# 3. 验证固件
sysupgrade -T istoreos-x86-64.img.gz

# 4. 执行升级
sysupgrade istoreos-x86-64.img.gz

# 系统会自动重启完成升级
```

### 备份目录说明

```shell
# sysupgrade 备份包含以下目录和文件：
/etc/config/          # 系统配置文件
/etc/dropbear/        # SSH 密钥
/etc/uhttpd.*         # HTTP 服务配置
/etc/opkg.conf        # 软件源配置
/etc/firewall.user    # 用户防火墙规则
/etc/sysctl.conf      # 内核参数配置
/root/                # root 用户文件
/usr/share/           # 用户安装的数据文件

# 查看完整备份列表
cat /etc/sysupgrade.conf
```

### 自定义备份内容

```shell
# 编辑备份文件列表
vi /etc/sysupgrade.conf

# 添加自定义文件到备份
echo "/etc/myapp/config.conf" >> /etc/sysupgrade.conf
echo "/mnt/data/important.db" >> /etc/sysupgrade.conf

# 确保下次备份包含自定义文件
sysupgrade -b /tmp/custom_backup.tar.gz
```

### 脚本示例

```shell
#!/bin/sh
# iStoreOS 自动备份脚本

BACKUP_DIR="/mnt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/istoreos_backup_$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
echo "开始备份系统配置..."
sysupgrade -b $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "备份成功: $BACKUP_FILE"
    # 显示备份大小
    ls -lh $BACKUP_FILE
else
    echo "备份失败！"
    exit 1
fi

# 保留最近 7 个备份
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs rm -f 2>/dev/null

echo "备份完成，已保留最近 7 个备份文件"
```

### 恢复出厂设置

```shell
# 方法1：使用 firstboot 命令
firstboot -y && reboot

# 方法2：清除 overlay 分区
rm -rf /overlay/* && reboot

# 方法3：通过 LuCI Web 界面
# 系统 -> 备份/升级 -> 重置路由器
```

### 固件类型说明

```shell
# iStoreOS/OpenWrt 固件类型：

# 1. combined.img.gz - 磁盘镜像（完整安装）
# 适用于：全新安装、物理机、虚拟机
sysupgrade openwrt-x86-64-combined.img.gz

# 2. rootfs.tar.gz - 根文件系统（升级用）
# 适用于：已有系统升级
sysupgrade openwrt-x86-64-rootfs.tar.gz

# 3. .ipk 包格式
# 使用 opkg 安装
opkg install kmod-xxx.ipk
```

### 升级注意事项

1. **备份重要数据**：升级前务必备份配置
2. **检查存储空间**：确保 /tmp 有足够空间存放固件
3. **验证固件**：使用 -T 参数验证固件合法性
4. **电源稳定**：升级过程不要断电
5. **兼容性**：确认固件版本与硬件匹配
6. **配置兼容**：跨大版本升级可能不兼容旧配置

### 故障恢复

```shell
# 如果升级后无法启动，尝试以下方法：

# 1. 进入 failsafe 模式
# 启动时按住 Reset 键或按 "f" 键

# 2. 挂载 overlay
mount_root

# 3. 恢复备份
sysupgrade -r /mnt/backup/backup.tar.gz

# 4. 重置系统
firstboot -y
reboot
```

### 相关命令

```shell
# 查看系统版本
cat /etc/openwrt_release

# 查看固件信息
cat /tmp/sysinfo/board_name

# 查看分区信息
cat /proc/mtd
df -h

# 查看当前运行固件
cat /proc/cmdline
```
