nmap
===

网络扫描与安全审计工具

## 补充说明

**nmap** (Network Mapper) 是网络扫描和安全审计工具，用于发现网络主机、扫描端口、检测操作系统和服务版本。是网络安全领域的标准工具。

### 语法

```shell
nmap [Scan Type...] [Options] {target specification}
```

### 基本扫描

```shell
# 扫描单个主机
nmap 192.168.1.1

# 扫描多个主机
nmap 192.168.1.1 192.168.1.2
nmap 192.168.1.1-10               # 范围扫描
nmap 192.168.1.0/24               # 子网扫描
nmap 192.168.1.*                  # 通配符

# 扫描域名
nmap example.com
nmap www.example.com

# 从文件读取目标
nmap -iL targets.txt

# 排除主机
nmap 192.168.1.0/24 --exclude 192.168.1.1
nmap 192.168.1.0/24 --excludefile exclude.txt
```

### 端口扫描

```shell
# 默认扫描（1000 个常用端口）
nmap 192.168.1.1

# 扫描指定端口
nmap -p 80 192.168.1.1
nmap -p 80,443 192.168.1.1
nmap -p 80-443 192.168.1.1
nmap -p 1-1000 192.168.1.1

# 扫描所有端口
nmap -p- 192.168.1.1
nmap -p 1-65535 192.168.1.1

# 扫描常用端口
nmap -F 192.168.1.1              # 快速扫描（100 个常用端口）

# 扫描特定协议端口
nmap -p U:53,T:80,U:161,T:443 192.168.1.1   # U=UDP, T=TCP

# 扫描按名称
nmap -p http,https 192.168.1.1
nmap -p smtp,pop3,imap 192.168.1.1
```

### 扫描类型

```shell
# TCP SYN 扫描（默认，需要 root）
nmap -sS 192.168.1.1

# TCP 连接扫描（无需 root）
nmap -sT 192.168.1.1

# UDP 扫描
nmap -sU 192.168.1.1
nmap -sU -p 53,161,123 192.168.1.1

# TCP ACK 扫描（防火墙检测）
nmap -sA 192.168.1.1

# 窗口扫描
nmap -sW 192.168.1.1

# FIN/Xmas/Null 扫描
nmap -sF 192.168.1.1             # FIN 扫描
nmap -sX 192.168.1.1             # Xmas 扫描
nmap -sN 192.168.1.1             # Null 扫描

# Ping 扫描（主机发现）
nmap -sn 192.168.1.0/24

# 无端口扫描（只 ping）
nmap -sP 192.168.1.0/24

# 扫描同时 Ping
nmap -PS 192.168.1.1             # TCP SYN Ping
nmap -PA 192.168.1.1             # TCP ACK Ping
nmap -PU 192.168.1.1             # UDP Ping
nmap -PE 192.168.1.1             # ICMP Echo Ping
```

### 服务版本检测

```shell
# 检测服务版本
nmap -sV 192.168.1.1

# 详细输出
nmap -sV --version-intensity 5 192.168.1.1
nmap -sV --version-all 192.168.1.1

# 快速版本检测
nmap -sV --version-light 192.168.1.1

# 版本检测强度（0-9）
nmap -sV --version-intensity 9 192.168.1.1
```

### 操作系统检测

```shell
# 操作系统检测
nmap -O 192.168.1.1

# 激进 OS 检测
nmap -O --osscan-guess 192.168.1.1

# 限制 OS 检测
nmap -O --max-os-tries 1 192.168.1.1
```

### 脚本扫描

```shell
# 使用默认脚本
nmap -sC 192.168.1.1

# 使用指定脚本
nmap --script=http-title 192.168.1.1
nmap --script=http-headers 192.168.1.1
nmap --script=vuln 192.168.1.1
nmap --script=safe 192.168.1.1

# 使用多个脚本
nmap --script=http-title,http-headers 192.168.1.1

# 脚本类别
nmap --script=auth 192.168.1.1          # 认证相关
nmap --script=discovery 192.168.1.1     # 发现服务
nmap --script=exploit 192.168.1.1       # 漏洞利用
nmap --script=vuln 192.168.1.1          # 漏洞扫描
nmap --script=brute 192.168.1.1         # 暴力破解

# 常用脚本示例
nmap --script=http-enum 192.168.1.1     # HTTP 目录枚举
nmap --script=ssh-brute 192.168.1.1     # SSH 暴力破解
nmap --script=ftp-anon 192.168.1.1      # FTP 匿名登录检测
nmap --script=smb-enum-shares 192.168.1.1  # SMB 共享枚举
nmap --script=mysql-vuln-cve2012-2122 192.168.1.1  # MySQL 漏洞
```

### 输出格式

```shell
# 正常输出
nmap 192.168.1.1 -oN output.txt

# XML 输出
nmap 192.168.1.1 -oX output.xml

# Grepable 输出
nmap 192.168.1.1 -oG output.gnmap

# 所有格式
nmap 192.168.1.1 -oA output

# 详细输出
nmap -v 192.168.1.1
nmap -vv 192.168.1.1

# 调试输出
nmap -d 192.168.1.1
nmap -ddd 192.168.1.1

# 显示原因
nmap --reason 192.168.1.1

# 只显示开放端口
nmap --open 192.168.1.1
```

### 性能选项

```shell
# 设置时间模板（T0-T5）
nmap -T0 192.168.1.1              # 最慢（隐蔽）
nmap -T1 192.168.1.1
nmap -T2 192.168.1.1
nmap -T3 192.168.1.1              # 默认
nmap -T4 192.168.1.1              # 快速
nmap -T5 192.168.1.1              # 最快（激进）

# 设置最小发包间隔
nmap --min-rate 100 192.168.1.1
nmap --max-rate 100 192.168.1.1

# 设置并发主机数
nmap --min-hostgroup 50 192.168.1.0/24
nmap --max-hostgroup 10 192.168.1.0/24

# 设置超时
nmap --host-timeout 30m 192.168.1.0/24
nmap --max-rtt-timeout 100ms 192.168.1.1

# 设置重试次数
nmap --max-retries 1 192.168.1.1
```

### 绕过防火墙

```shell
# 分片扫描
nmap -f 192.168.1.1

# 使用诱饵
nmap -D RND:10 192.168.1.1       # 随机 10 个诱饵
nmap -D decoy1,decoy2,me 192.168.1.1

# 源地址欺骗
nmap -S 192.168.1.100 192.168.1.1
nmap -S spoofed.example.com 192.168.1.1

# 源端口欺骗
nmap --source-port 53 192.168.1.1
nmap -g 53 192.168.1.1

# 使用 MAC 地址欺骗
nmap --spoof-mac 0 192.168.1.1
nmap --spoof-mac Apple 192.168.1.1
nmap --spoof-mac 00:11:22:33:44:55 192.168.1.1

# 添加随机数据
nmap --data-length 50 192.168.1.1
```

### 常用组合

```shell
# 全扫描（端口+服务+OS+脚本）
nmap -A 192.168.1.1
nmap -sS -sV -O -sC 192.168.1.1

# 快速扫描
nmap -T4 -F 192.168.1.1

# 详细全端口扫描
nmap -p- -sV -O -A 192.168.1.1

# 网络发现
nmap -sn 192.168.1.0/24
nmap -sn 192.168.1.0/24 -oG - | grep "Up"

# 扫描并保存结果
nmap -sV -O -oA scan_results 192.168.1.1

# 漏洞扫描
nmap --script=vuln 192.168.1.1

# Web 服务器扫描
nmap -sV --script=http-enum,http-headers,http-title -p 80,443 192.168.1.1

# 全面扫描
nmap -v -A -T4 -p- 192.168.1.1

# 隐蔽扫描
nmap -sS -T2 -f --data-length 100 192.168.1.1
```

### 实用技巧

```shell
# 查看路由
nmap --traceroute 192.168.1.1

# 查看数据包
nmap --packet-trace 192.168.1.1

# 解析域名
nmap -R 192.168.1.1              # 总是解析
nmap -n 192.168.1.1              # 不解析

# IPv6 扫描
nmap -6 ::1
nmap -6 2001:db8::1

# 使用代理
nmap --proxies http://proxy:8080 192.168.1.1
```
