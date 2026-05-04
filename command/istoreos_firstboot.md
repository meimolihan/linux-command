istoreos_firstboot
===

iStoreOS 恢复出厂设置命令

## 补充说明

**firstboot** 是 OpenWrt/iStoreOS 的系统重置命令，用于清除所有用户配置和数据，将系统恢复到出厂状态。该命令会删除 overlay 分区中的所有数据。

### 语法

```shell
firstboot [-y]
```

### 选项

```shell
-y        # 跳过确认提示，直接执行重置
-h        # 显示帮助信息
```

### 常用实例

```shell
# 交互式重置（需要确认）
firstboot
# 系统提示：This will erase all settings and remove any installed packages.
# 输入 y 确认后执行重置

# 直接重置（无需确认）
firstboot -y

# 重置后重启系统
firstboot -y && reboot

# 组合命令：先备份后重置
sysupgrade -b /tmp/backup.tar.gz && firstboot -y && reboot
```

### 重置流程

```bash
firstboot 执行流程：
┌──────────────────────────┐
│  1. 警告用户数据将丢失   │
│  2. 等待用户确认         │
│  3. 清除 overlay 分区    │
│  4. 保留底层系统只读     │
│  5. 需要重启生效         │
└──────────────────────────┘
```

### 重置效果

```shell
# firstboot 会清除：
- 所有网络配置（LAN/WAN/无线）
- 所有已安装的软件包
- 所有用户数据和配置
- SSH 密钥和证书
- LuCI 界面设置
- 防火墙规则
- DHCP 配置

# firstboot 会保留：
- 底层系统文件（只读分区）
- 固件版本
- 硬件驱动
```

### 使用场景

```shell
# 场景1：配置混乱需要重置
firstboot -y && reboot

# 场景2：忘记管理密码
# 通过串口进入系统后执行
firstboot -y && reboot

# 场景3：系统异常无法修复
firstboot -y && reboot

# 场景4：移交设备前清除数据
firstboot -y && reboot

# 场景5：测试环境重置
# 先备份当前配置
sysupgrade -b /mnt/backup/test_config.tar.gz
# 重置系统
firstboot -y && reboot
```

### 其他重置方法

```shell
# 方法1：命令行重置（推荐）
firstboot -y && reboot

# 方法2：删除 overlay 数据
rm -rf /overlay/* && reboot

# 方法3：格式化 overlay 分区
jffs2reset -y && reboot

# 方法4：LuCI Web 界面重置
# 系统 -> 备份/升级 -> 执行重置

# 方法5：Reset 按钮
# 长按设备 Reset 按钮 10 秒以上
```

### 重置后初始配置

```shell
# 重置后默认配置：
# LAN IP: 192.168.100.1（iStoreOS 默认）
# 用户名: root
# 密码: 空（无密码）
# SSH: 已启用
# LuCI: 已启用

# 重置后首次登录
ssh root@192.168.100.1

# 设置密码
passwd

# 运行设置向导
quickstart
```

### 安全备份脚本

```shell
#!/bin/sh
# 安全重置脚本：备份后重置

BACKUP_DIR="/mnt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/before_reset_$DATE.tar.gz"

echo "=========================================="
echo "    iStoreOS 安全重置脚本"
echo "=========================================="
echo ""

# 检查备份目录
if [ ! -d "$BACKUP_DIR" ]; then
    echo "创建备份目录: $BACKUP_DIR"
    mkdir -p $BACKUP_DIR
fi

# 备份当前配置
echo "正在备份当前配置..."
sysupgrade -b $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "备份完成: $BACKUP_FILE"
    echo ""
    echo "即将执行系统重置..."
    echo "所有配置和数据将被清除！"
    echo ""
    
    # 5秒倒计时
    for i in 5 4 3 2 1; do
        echo "$i 秒后开始重置，按 Ctrl+C 取消..."
        sleep 1
    done
    
    firstboot -y
    echo "重置完成，系统正在重启..."
    reboot
else
    echo "备份失败，已取消重置操作！"
    exit 1
fi
```

### 重置 vs 升级

```shell
# firstboot：恢复出厂设置
# - 清除所有配置
# - 卸载所有软件包
# - 回到初始状态
firstboot -y && reboot

# sysupgrade -n：升级时不保留配置
# - 更新系统固件
# - 清除所有配置
# - 使用新固件的默认配置
sysupgrade -n new_firmware.img.gz
```

### 故障排除

```shell
# 问题1：firstboot 命令不存在
# 解决：系统可能已损坏，尝试重新刷写固件

# 问题2：重置后无法启动
# 解决：进入 failsafe 模式
# 1. 启动时按住 Reset 键
# 2. 或启动时按 "f" 键
# 3. 进入 failsafe 后执行 firstboot -y

# 问题3：重置后空间不足
# 解决：检查 overlay 分区
df -h /overlay
# 可能需要扩展 overlay 分区

# 问题4：重置后密码仍存在
# 解决：确保执行了 reboot
firstboot -y
reboot
```

### 注意事项

1. **不可恢复**：重置后数据无法恢复，请谨慎操作
2. **必须重启**：firstboot 后必须 reboot 才能生效
3. **备份重要**：重要数据务必先备份
4. **电源稳定**：执行过程中不要断电
5. **网络断开**：重置期间会中断网络连接
6. **重新配置**：重置后需要重新配置系统
