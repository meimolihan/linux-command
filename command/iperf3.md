iperf3
===

网络带宽测速工具

## 补充说明

**iperf3命令** 是业界标准、最常用的内网/跨主机网络带宽压测与性能测速工具。

主要用途：

- 实测TCP最大传输带宽
- 实测UDP丢包率、延迟、抖动
- 检测交换机、网线、WiFi、服务器网卡是否跑满限速
- 排查网络卡顿、链路不稳定、网速不达标称值问题

核心特点：

- **iperf3与iperf2不互通**，两端设备必须统一使用iperf3
- 一端做服务端（监听），一端做客户端（发包测试）
- 默认监听端口：**5201/TCP+UDP**

> 防火墙务必放行：**5201端口TCP/UDP**

### 安装iperf3

对于windows版的iperf3，可从 https://iperf.fr/iperf-download.php 下载免压即用版，解压后在CMD/PowerShell直接运行即可。

Debian / Ubuntu：

```shell
sudo apt update
sudo apt install -y iperf3
```

CentOS / Rocky / RHEL：

```shell
sudo yum install -y iperf3
```

macOS：

```shell
brew install iperf3
```

### 语法

```shell
iperf3 -s [options]        # 服务端模式
iperf3 -c <server> [options]  # 客户端模式
```

### 选项

```bash
# 服务端选项
-s        # 启动服务端监听
-D        # 后台守护进程运行
-p port   # 指定自定义监听端口（默认5201）
-u        # UDP模式测速
--one-off # 一次测试后自动退出

# 客户端选项
-c <server>    # 指定服务端IP，启动测速
-t seconds     # 设置测速时长（默认10秒）
-i seconds     # 每秒打印一次测速结果
-P num         # 多线程并发跑满网卡
-R             # 反向测速（下载方向）
-u             # UDP模式
-b bandwidth   # UDP限制发送速率（10M、100M、1G）
-f m           # 结果单位显示为Mbps
```

### 工作原理

- **服务端（-s）**：被动监听端口，等待客户端连接，接收流量统计数据
- **客户端（-c IP）**：主动连接服务端，持续发包，测试网络吞吐与稳定性
- 测速必须**两台设备**：一台服务端、一台客户端

### 实例

#### 服务端启动

```shell
# 默认前台运行（最常用）
iperf3 -s

# 后台守护进程运行（服务器长期待命）
iperf3 -s -D

# 指定自定义端口（示例5202）
iperf3 -s -p 5202

# UDP测速专用服务端
iperf3 -s -u

# 单次测试完成自动退出
iperf3 -s --one-off
```

#### TCP测速

TCP模式默认测试**上传带宽**（客户端→服务端）

```shell
# 基础测速（默认10秒）
iperf3 -c 192.168.1.1

# 测速30秒，每秒输出一次进度
iperf3 -c 192.168.1.1 -t 30 -i 1

# 反向测试（测下载：服务端→客户端）
iperf3 -c 192.168.1.1 -R

# 多线程压满千兆/万兆网卡（推荐）
iperf3 -c 192.168.1.1 -P 8 -t 30

# 指定端口测速
iperf3 -c 192.168.1.1 -p 5202

# 结果以Mbps单位显示
iperf3 -c 192.168.1.1 -f m
```

#### UDP测速

UDP不会自动限流，**必须手动指定测速带宽**，否则直接跑满占满带宽。

```shell
# 服务端
iperf3 -s -u

# 客户端限制500M带宽测试
iperf3 -c 192.168.1.1 -u -b 500M -t 30

# 反向测速（下载方向）
iperf3 -c 192.168.1.1 -u -b 100M -R
```

#### 实战场景

**场景1：内网千兆网卡跑满测速**

服务端：

```shell
iperf3 -s
```

客户端：

```shell
iperf3 -c 192.168.x.x -t 30 -P 8 -f m
```

**场景2：WiFi下载速度测试**

```shell
iperf3 -c 192.168.x.x -R -t 20 -P 4
```

**场景3：视频/语音网络稳定性UDP测试**

服务端：

```shell
iperf3 -s -u
```

客户端：

```shell
iperf3 -c 192.168.x.x -u -b 10M -t 30
```

### 结果解读

#### TCP结果重点看

- **Bandwidth**：实际最大带宽
- 千兆内网正常标准：**940Mbps左右**

#### UDP结果重点看

- **Jitter**：网络抖动（越小越好，<20ms优秀）
- **Lost**：<1%稳定，越高越卡顿

### 常见问题

1. **连接失败**：防火墙未放行5201端口
2. **速度跑不满**：网卡协商速率低、网线劣质、未加多线程`-P`
3. **UDP丢包高**：交换机性能弱、WiFi干扰、网络拥堵