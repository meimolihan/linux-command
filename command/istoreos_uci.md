istoreos_uci
===

iStoreOS 统一配置接口

## 补充说明

**uci** (Unified Configuration Interface) 是 OpenWrt/iStoreOS 的统一配置接口，用于管理系统配置。所有系统配置都存储在 `/etc/config/` 目录下的配置文件中，通过 uci 命令进行读写操作。

### 语法

```shell
uci [OPTIONS] COMMAND [ARGUMENTS]
```

### 命令

```shell
uci get <config>.<section>.<option>      # 获取配置值
uci set <config>.<section>.<option>=<value>  # 设置配置值
uci add <config> <type>                   # 添加匿名section
uci add_list <config>.<section>.<option>=<value>  # 添加列表项
uci del_list <config>.<section>.<option>=<value>  # 删除列表项
uci delete <config>.<section>.<option>    # 删除选项
uci rename <config>.<section>.<option>=<newname>  # 重命名
uci revert <config>                       # 撤销未提交的更改
uci commit <config>                       # 提交更改到配置文件
uci changes <config>                      # 查看未提交的更改
uci show <config>                         # 显示所有配置
uci export <config>                       # 导出配置
uci import <config>                       # 导入配置
```

### 常用实例

```shell
# ========== 网络配置 ==========

# 获取 LAN IP 地址
uci get network.lan.ipaddr
# 输出：192.168.100.1

# 获取 LAN 网关
uci get network.lan.gateway
# 输出：192.168.1.1

# 获取 LAN DNS
uci get network.lan.dns
# 输出：8.8.8.8 8.8.4.4

# 获取 WAN 协议类型
uci get network.wan.proto
# 输出：dhcp 或 pppoe

# 设置 LAN IP 地址
uci set network.lan.ipaddr='192.168.1.1'

# 设置 LAN 网关
uci set network.lan.gateway='192.168.0.1'

# 设置 LAN DNS
uci set network.lan.dns='114.114.114.114'

# 设置静态 IP
uci set network.lan.proto='static'
uci set network.lan.ipaddr='192.168.1.100'
uci set network.lan.netmask='255.255.255.0'
uci set network.lan.gateway='192.168.1.1'

# 设置 DHCP 自动获取
uci set network.lan.proto='dhcp'

# 提交更改并重启网络
uci commit network
/etc/init.d/network restart

# ========== 无线配置 ==========

# 查看无线配置
uci show wireless

# 获取 WiFi 名称
uci get wireless.@wifi-iface[0].ssid

# 设置 WiFi 名称
uci set wireless.@wifi-iface[0].ssid='MyWiFi'

# 设置 WiFi 密码
uci set wireless.@wifi-iface[0].key='password123'

# 开启 WiFi
uci set wireless.radio0.disabled='0'

# 关闭 WiFi
uci set wireless.radio0.disabled='1'

# 提交并重启无线
uci commit wireless
wifi reload

# ========== 防火墙配置 ==========

# 查看防火墙配置
uci show firewall

# 开放端口
uci add firewall rule
uci set firewall.@rule[-1].name='Allow-SSH'
uci set firewall.@rule[-1].src='wan'
uci set firewall.@rule[-1].dest_port='22'
uci set firewall.@rule[-1].proto='tcp'
uci set firewall.@rule[-1].target='ACCEPT'
uci commit firewall
/etc/init.d/firewall restart

# 端口转发
uci add firewall redirect
uci set firewall.@redirect[-1].name='SSH-Forward'
uci set firewall.@redirect[-1].src='wan'
uci set firewall.@redirect[-1].src_dport='2222'
uci set firewall.@redirect[-1].dest='lan'
uci set firewall.@redirect[-1].dest_ip='192.168.1.100'
uci set firewall.@redirect[-1].dest_port='22'
uci set firewall.@redirect[-1].proto='tcp'
uci commit firewall
/etc/init.d/firewall restart

# ========== DHCP 配置 ==========

# 查看 DHCP 配置
uci show dhcp

# 设置 DHCP 范围
uci set dhcp.lan.start='100'
uci set dhcp.lan.limit='150'
uci set dhcp.lan.leasetime='12h'

# 设置静态 IP 绑定
uci add dhcp host
uci set dhcp.@host[-1].name='my-pc'
uci set dhcp.@host[-1].mac='AA:BB:CC:DD:EE:FF'
uci set dhcp.@host[-1].ip='192.168.1.50'
uci commit dhcp
/etc/init.d/dnsmasq restart

# ========== 系统配置 ==========

# 查看系统配置
uci show system

# 设置主机名
uci set system.@system[0].hostname='iStoreOS'

# 设置时区
uci set system.@system[0].zonename='Asia/Shanghai'
uci set system.@system[0].timezone='CST-8'

# 设置 NTP 服务器
uci set system.ntp.server='ntp.aliyun.com'

# 提交更改
uci commit system
/etc/init.d/system restart
```

### 配置文件列表

```shell
/etc/config/network     # 网络配置
/etc/config/wireless    # 无线配置
/etc/config/firewall    # 防火墙配置
/etc/config/dhcp        # DHCP 配置
/etc/config/system      # 系统配置
/etc/config/luci        # LuCI Web 界面配置
/etc/config/dropbear    # SSH 服务配置
/etc/config/uhttpd      # HTTP 服务配置
/etc/config/timeserver  # 时间服务器配置
```

### 配置查询技巧

```shell
# 显示所有网络配置
uci show network

# 显示指定 section 的所有配置
uci show network.lan

# 导出配置为 UCI 格式
uci export network

# 查看未提交的更改
uci changes network

# 撤销未提交的更改
uci revert network

# 批量查看多个配置
for cfg in network firewall dhcp; do
  echo "=== $cfg ==="
  uci show $cfg
done
```

### 高级用法

```shell
# 添加匿名 section
uci add network interface
uci set network.@interface[-1].name='vpn'
uci set network.@interface[-1].proto='none'
uci set network.@interface[-1].device='tun0'

# 添加列表项
uci add_list firewall.@zone[1].network='vpn'

# 删除列表项
uci del_list firewall.@zone[1].network='vpn'

# 删除整个 section
uci delete network.vpn

# 重命名 section
uci rename network.lan='lan1'

# 批量设置
uci batch <<EOF
set network.lan.ipaddr='192.168.1.1'
set network.lan.netmask='255.255.255.0'
set network.lan.gateway='192.168.0.1'
commit network
EOF
```

### 配置备份与恢复

```shell
# 备份配置
uci export network > /tmp/network.backup

# 恢复配置
uci import network < /tmp/network.backup

# 或直接复制配置文件
cp /etc/config/network /mnt/backup/
cp /etc/config/network /mnt/backup/
```

### 脚本示例

```shell
#!/bin/sh
# iStoreOS 网络配置脚本

# 获取当前 LAN IP
LAN_IP=$(uci get network.lan.ipaddr)
echo "当前 LAN IP: $LAN_IP"

# 设置新的 LAN IP
NEW_IP="192.168.2.1"
uci set network.lan.ipaddr="$NEW_IP"
uci commit network

# 重启网络
/etc/init.d/network restart

echo "LAN IP 已更改为: $NEW_IP"
```

### 注意事项

1. 修改配置后必须 `uci commit` 才能保存
2. 部分配置需要重启对应服务生效
3. 错误的配置可能导致系统无法访问
4. 建议修改前备份原配置
5. 使用 `uci changes` 检查修改是否正确
