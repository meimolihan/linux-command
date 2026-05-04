istoreos_network
===

iStoreOS 网络服务管理

## 补充说明

iStoreOS 继承了 OpenWrt 的网络架构，网络服务通过 `/etc/init.d/network` 脚本管理。该脚本负责启动、停止、重启网络服务，以及管理网络接口、路由、DNS 等。

### 语法

```shell
/etc/init.d/network [start|stop|restart|reload|enable|disable]
```

### 命令

```shell
/etc/init.d/network start     # 启动网络服务
/etc/init.d/network stop      # 停止网络服务
/etc/init.d/network restart   # 重启网络服务
/etc/init.d/network reload    # 重载网络配置
/etc/init.d/network enable    # 设置开机自启
/etc/init.d/network disable   # 禁用开机自启
```

### 常用实例

```shell
# 重启网络服务（最常用）
/etc/init.d/network restart

# 重载网络配置（不断开连接）
/etc/init.d/network reload

# 停止网络服务
/etc/init.d/network stop

# 启动网络服务
/etc/init.d/network start

# 查看网络服务状态
/etc/init.d/network status
```

### 网络接口管理

```shell
# 查看所有网络接口
ifconfig

# 查看指定接口
ifconfig eth0
ifconfig br-lan

# 查看 IP 地址
ip addr show

# 查看路由表
ip route show

# 查看 ARP 表
ip neigh show

# 查看网络统计
ip -s link

# 启用接口
ifup eth0
ifup lan

# 禁用接口
ifdown eth0
ifdown wan
```

### 网络配置

```shell
# 查看网络配置
uci show network

# 查看 LAN 配置
uci show network.lan

# 查看 WAN 配置
uci show network.wan

# 设置 LAN IP
uci set network.lan.ipaddr='192.168.1.1'
uci commit network
/etc/init.d/network restart

# 设置静态 IP
uci set network.lan.proto='static'
uci set network.lan.ipaddr='192.168.1.100'
uci set network.lan.netmask='255.255.255.0'
uci set network.lan.gateway='192.168.1.1'
uci commit network
/etc/init.d/network restart

# 设置 DHCP 自动获取
uci set network.lan.proto='dhcp'
uci commit network
/etc/init.d/network restart

# 设置 PPPoE 拨号
uci set network.wan.proto='pppoe'
uci set network.wan.username='user@isp'
uci set network.wan.password='password'
uci commit network
/etc/init.d/network restart
```

### 网络诊断

```shell
# 测试网络连通性
ping -c 4 8.8.8.8

# 测试 DNS 解析
ping -c 4 www.baidu.com

# 查看 DNS 解析
nslookup www.baidu.com

# 跟踪路由
traceroute www.baidu.com

# 查看端口占用
netstat -tulnp

# 查看已建立的连接
netstat -an | grep ESTABLISHED

# 查看监听端口
netstat -tlnp

# 使用 ss 命令（更快）
ss -tulnp

# 查看网络流量
ifconfig eth0 | grep "RX packets\|TX packets"

# 实时网络流量
iftop -i eth0
```

### DNS 服务管理

```shell
# 重启 DNS 服务
/etc/init.d/dnsmasq restart

# 重载 DNS 配置
/etc/init.d/dnsmasq reload

# 查看 DNS 配置
cat /etc/dnsmasq.conf

# 查看 DNS 缓存
killall -USR1 dnsmasq
logread -e "dnsmasq" | grep "cache"

# 清除 DNS 缓存
/etc/init.d/dnsmasq restart

# 查看 hosts 文件
cat /etc/hosts

# 添加静态 DNS 解析
echo "192.168.1.100 myserver.local" >> /etc/hosts
```

### 无线网络管理

```shell
# 查看无线配置
uci show wireless

# 开启 WiFi
wifi up

# 关闭 WiFi
wifi down

# 重载 WiFi 配置
wifi reload

# 扫描 WiFi 网络
iw dev wlan0 scan | grep SSID

# 查看连接的客户端
iw dev wlan0 station dump

# 查看 WiFi 信道
iw dev wlan0 info

# 查看 WiFi 信号强度
iwconfig wlan0
```

### 网络故障排查

```shell
# 1. 检查接口状态
ifconfig -a
ip addr show

# 2. 检查路由
ip route show

# 3. 检查 DNS
cat /etc/resolv.conf
nslookup www.baidu.com

# 4. 检查防火墙
iptables -L -n
/etc/init.d/firewall status

# 5. 查看网络日志
logread -e "network\|interface"

# 6. 检查网络服务
/etc/init.d/network status

# 7. 检查物理连接
ethtool eth0

# 8. 抓包分析
tcpdump -i eth0 -n
tcpdump -i eth0 port 80
```

### 常见网络问题

```shell
# 问题1：无法获取 IP
# 检查 DHCP 服务
/etc/init.d/dnsmasq status
logread -e "dhcp"

# 问题2：DNS 解析失败
# 检查 DNS 配置
cat /etc/resolv.conf
uci get network.lan.dns

# 问题3：无法访问外网
# 检查网关和路由
ip route show
ping -c 4 网关IP
ping -c 4 8.8.8.8

# 问题4：WiFi 无法连接
# 检查无线配置
uci show wireless
logread -e "wifi\|wlan"

# 问题5：端口无法访问
# 检查防火墙规则
iptables -L -n
/etc/init.d/firewall restart
```

### 网络优化

```shell
# 调整 MTU
uci set network.lan.mtu='1500'
uci commit network
/etc/init.d/network restart

# 设置 DNS 服务器
uci set network.lan.dns='114.114.114.114 8.8.8.8'
uci commit network
/etc/init.d/network restart

# 开启 TCP Fast Open
echo 3 > /proc/sys/net/ipv4/tcp_fastopen

# 优化网络参数
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.wmem_max=16777216
```

### 网络服务列表

```shell
# iStoreOS 网络相关服务
/etc/init.d/network    # 网络服务
/etc/init.d/firewall   # 防火墙服务
/etc/init.d/dnsmasq    # DNS/DHCP 服务
/etc/init.d/odhcpd     # IPv6 DHCP 服务
/etc/init.d/uhttpd     # HTTP 服务
/etc/init.d/dropbear   # SSH 服务
```

### 注意事项

1. 重启网络服务会暂时断开连接
2. 修改配置后需 commit 并重启服务
3. 远程操作时注意不要锁定自己
4. 错误配置可能导致无法访问系统
5. 建议配置前先备份
