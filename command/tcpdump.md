tcpdump
===

数据包抓取分析工具

## 补充说明

**tcpdump** 是命令行网络数据包抓取工具，用于捕获和分析网络流量。是网络故障排查和安全分析的核心工具。

### 语法

```shell
tcpdump [OPTIONS] [expression]
```

### 基本使用

```shell
# 抓取所有流量
tcpdump

# 抓取指定接口
tcpdump -i eth0
tcpdump -i any                    # 所有接口

# 抓取指定数量的包
tcpdump -c 10
tcpdump -c 100 -i eth0

# 不解析主机名（更快）
tcpdump -n
tcpdump -nn                       # 不解析主机名和端口名

# 显示详细信息
tcpdump -v
tcpdump -vv
tcpdump -vvv

# 显示十六进制和 ASCII
tcpdump -X
tcpdump -XX                       # 包含链路层

# 显示时间戳
tcpdump -t                        # 不显示时间
tcpdump -tt                       # Unix 时间戳
tcpdump -ttt                      # 相对时间
tcpdump -tttt                     # 日期时间

# 实时输出（不缓冲）
tcpdump -l
```

### 主机过滤

```shell
# 抓取指定主机的流量
tcpdump host 192.168.1.1
tcpdump host www.example.com

# 抓取源主机
tcpdump src host 192.168.1.1
tcpdump src 192.168.1.1

# 抓取目标主机
tcpdump dst host 192.168.1.1
tcpdump dst 192.168.1.1

# 抓取多个主机
tcpdump host 192.168.1.1 or host 192.168.1.2
tcpdump host 192.168.1.1 && host 192.168.1.2
```

### 端口过滤

```shell
# 抓取指定端口
tcpdump port 80
tcpdump port 443
tcpdump port ssh

# 抓取源端口
tcpdump src port 80
tcpdump src port 8080

# 抓取目标端口
tcpdump dst port 80
tcpdump dst port 443

# 抓取端口范围
tcpdump portrange 80-88
tcpdump portrange 8000-9000

# 抓取多个端口
tcpdump port 80 or port 443
tcpdump port 80 || port 443
```

### 协议过滤

```shell
# TCP 流量
tcpdump tcp
tcpdump tcp port 80

# UDP 流量
tcpdump udp
tcpdump udp port 53

# ICMP 流量
tcpdump icmp

# ARP 流量
tcpdump arp

# IP 流量
tcpdump ip

# IPv6 流量
tcpdump ip6

# HTTP 流量
tcpdump tcp port 80

# DNS 流量
tcpdump udp port 53
tcpdump port 53

# SSH 流量
tcpdump port 22

# SMTP 流量
tcpdump port 25

# 组合过滤
tcpdump tcp and port 80
tcpdump udp and port 53
tcpdump icmp and host 192.168.1.1
```

### 网络过滤

```shell
# 抓取指定网段
tcpdump net 192.168.1.0/24
tcpdump net 192.168.1.0 mask 255.255.255.0

# 抓取源网段
tcpdump src net 192.168.1.0/24

# 抓取目标网段
tcpdump dst net 192.168.1.0/24

# 抓取广播流量
tcpdump broadcast

# 抓取组播流量
tcpdump multicast
```

### 组合过滤

```shell
# AND (&& 或 and)
tcpdump host 192.168.1.1 && port 80
tcpdump host 192.168.1.1 and port 80

# OR (|| 或 or)
tcpdump port 80 || port 443
tcpdump port 80 or port 443

# NOT (! 或 not)
tcpdump not port 22
tcpdump ! port 22

# 复杂过滤
tcpdump host 192.168.1.1 && (port 80 || port 443)
tcpdump src host 192.168.1.1 && dst port 80
tcpdump tcp && (port 80 || port 443 || port 8080)
tcpdump ip host 192.168.1.1 && ! port 22
```

### TCP 标志过滤

```shell
# TCP 标志
# SYN: S, ACK: A, FIN: F, RST: R, PSH: P, URG: U

# 抓取 SYN 包
tcpdump 'tcp[tcpflags] & tcp-syn != 0'
tcpdump 'tcp[tcpflags] & (tcp-syn) != 0'

# 抓取 SYN-ACK 包
tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn|tcp-ack'

# 抓取 FIN 包
tcpdump 'tcp[tcpflags] & tcp-fin != 0'

# 抓取 RST 包
tcpdump 'tcp[tcpflags] & tcp-rst != 0'

# 抓取新连接（SYN 包）
tcpdump 'tcp[tcpflags] == tcp-syn'
tcpdump 'tcp[13] & 2 != 0'       # 使用数字

# 抓取握手包
tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0'
```

### 保存与读取

```shell
# 保存到文件
tcpdump -w capture.pcap
tcpdump -w capture.pcap -c 1000
tcpdump -w capture.pcap port 80

# 从文件读取
tcpdump -r capture.pcap
tcpdump -r capture.pcap -nn

# 保存时显示内容
tcpdump -w capture.pcap -v

# 限制文件大小
tcpdump -w capture.pcap -C 10    # 每个 10 MB
tcpdump -w capture.pcap -C 10 -W 5  # 最多 5 个文件

# 循环写入
tcpdump -w capture.pcap -G 60    # 每 60 秒一个文件
tcpdump -w capture_%Y%m%d_%H%M%S.pcap -G 60 -W 10

# 读取时过滤
tcpdump -r capture.pcap port 80
tcpdump -r capture.pcap tcp
```

### 包大小过滤

```shell
# 抓取大于指定大小的包
tcpdump greater 100
tcpdump greater 500

# 抓取小于指定大小的包
tcpdump less 100
tcpdump less 500

# 抓取指定大小的包
tcpdump greater 100 && less 200

# 指定抓包长度（截断）
tcpdump -s 0                     # 抓取完整包
tcpdump -s 100                   # 只抓前 100 字节
tcpdump -s 1500                  # 抓取 MTU 大小
```

### 高级过滤

```shell
# 基于字节过滤
tcpdump 'tcp[13] & 8 != 0'       # PSH 标志
tcpdump 'tcp[13] & 16 != 0'      # ACK 标志

# HTTP 过滤（端口 80）
tcpdump port 80 and 'tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x47455420'  # GET
tcpdump port 80 and 'tcp[((tcp[12:1] & 0xf0) >> 2):4] = 0x504f5354'  # POST

# 抓取 HTTP 请求
tcpdump -A -s 0 'tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)'

# 显示 ASCII
tcpdump -A port 80
tcpdump -A port 25

# 显示十六进制和 ASCII
tcpdump -XX port 80
```

### 实用组合

```shell
# 抓取 Web 流量
tcpdump -i eth0 -nn -XX port 80

# 抓取 DNS 查询
tcpdump -i eth0 -nn port 53

# 抓取 SSH 流量（不包含本机）
tcpdump -i eth0 -nn 'port 22 and not host 192.168.1.100'

# 抓取 ICMP 流量（ping）
tcpdump -i eth0 -nn icmp

# 抓取 MySQL 流量
tcpdump -i eth0 -nn -XX port 3306

# 抓取完整的 HTTP 会话
tcpdump -i eth0 -A -s 0 port 80

# 抓取特定主机的 TCP SYN 包
tcpdump -i eth0 -nn 'tcp[tcpflags] & tcp-syn != 0' and host 192.168.1.1

# 抓取并保存
tcpdump -i eth0 -w /tmp/capture.pcap -c 1000

# 实时分析 HTTP
tcpdump -i eth0 -A -s 0 port 80 | grep -i 'GET\|POST\|Host'

# 监控网络流量统计
tcpdump -i eth0 -q
```
