bbr3
===

TCP BBR 拥堵控制算法

## 补充说明

**BBR (Bottleneck Bandwidth and RTT)** 是Google开发的TCP拥堵控制算法，于2016年发布。BBR通过测量带宽和RTT来控制发送速率，而非传统的丢包检测方式。BBR3是BBR算法的最新版本，在BBR v2基础上进一步优化，在高丢包和复杂网络环境下表现更佳。

BBR核心特点：

- 不依赖丢包来判断拥堵
- 最大化利用带宽，同时降低延迟
- 在高延迟、高丢包网络下表现优异
- BBR需要Linux内核4.9及以上版本

### 语法

```shell
# 查看当前可用的拥堵控制算法
sysctl net.ipv4.tcp_available_congestion_control

# 查看当前使用的拥堵控制算法
sysctl net.ipv4.tcp_congestion_control

# 启用BBR
sysctl -w net.ipv4.tcp_congestion_control=bbr

# 持久化配置（写入sysctl.conf）
```

### 选项

```bash
# 查看BBR相关参数
sysctl net.ipv4.tcp_congestion_control      # 当前算法
sysctl net.ipv4.tcp_available_congestion_control  # 可用算法

# BBR参数（内核4.9+）
net.ipv4.tcp_congestion_control    # 选择拥堵控制算法
net.core.default_qdisc              # 队列规则，建议使用fq或fq_codel

# BBR v2 参数（内核5.18+）
net.ipv4.tcp_bbr2_min_rtt_whitelist  # 最小RTT白名单（默认8s）
net.ipv4.tcp_bbr2_bw_hi               # 带宽上限（高阶段）
net.ipv4.tcp_bbr2_bw_lo              # 带宽下限（低阶段）
net.ipv4.tcp_bbr2_probe_rtt_cap      # RTT探测阈值
net.ipv4.tcp_bbr2_probe_rtt_mode     # RTT探测模式
net.ipv4.tcp_bbr2_min_tso_rate      # 最小TSO速率
```

### 安装BBR

BBR已集成到Linux内核4.9及以上版本。检查当前内核版本：

```shell
uname -r
```

如果内核版本低于4.9，需要升级内核。部分云服务器可能需要单独开启：

```shell
# 检查BBR模块是否可用
lsmod | grep bbr

# 加载BBR模块（如果未自动加载）
modprobe tcp_bbr
modprobe tcp_bbr2  # BBR v2/v3
```

### 启用BBR

```shell
# 临时启用BBR
sysctl -w net.ipv4.tcp_congestion_control=bbr
sysctl -w net.core.default_qdisc=fq

# 持久化配置
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf

# 应用配置
sysctl -p
```

### 启用BBR3 (BBR v2)

BBR3实际上是BBR v2的更新版本，在内核5.18+中可用：

```shell
# 启用BBR v2/BBR3
sysctl -w net.ipv4.tcp_congestion_control=bbr2
sysctl -w net.core.default_qdisc=fq

# 查看版本
sysctl net.ipv4.tcp_congestion_control
```

### 验证BBR是否生效

```shell
# 检查当前算法
sysctl net.ipv4.tcp_congestion_control

# 输出示例：net.ipv4.tcp_congestion_control = bbr

# 检查队列规则
sysctl net.core.default_qdisc

# 输出示例：net.core.default_qdisc = fq
```

### BBR与BBR2/BBR3对比

| 特性 | BBR v1 | BBR v2/BBR3 |
|------|--------|-------------|
| 内核版本 | 4.9+ | 5.18+ |
| ECN支持 | 不支持 | 支持 |
| 高丢包环境 | 一般 | 优化 |
| 带宽估算 | 激进 | 更保守 |
| 生产环境 | 稳定 | 推荐 |

### 适用场景

- 高延迟跨国网络加速
- 高丢包网络（如部分物联网环境）
- 需要最大化带宽利用的业务
- 视频流媒体、CDN回源
- 大文件传输

### 注意事项

1. **不适用于所有场景**：在低延迟、低丢包的局域网环境下，BBR可能不如Cubic或Reno
2. **与丢包重传机制**：BBR在高丢包环境下可能需要配合丢包重传优化
3. **队列规则**：建议配合fq或fq_codel队列规则使用
4. **与ECN兼容**：BBR v2/BBR3支持ECN，但需要两端都支持
5. **多路径场景**：在多路径TCP场景下表现更佳

### 常见问题

**Q: BBR和Cubic哪个好？**

A: 取决于网络环境。BBR在高延迟、高丢包场景下表现更好；Cubic在稳定网络下表现稳定。

**Q: 启用BBR后速度变慢？**

A: 检查队列规则是否为fq；确认内核版本支持BBR；检查是否有其他网络限制。

**Q: BBR3如何开启？**

A: 需要内核5.18以上版本，使用`net.ipv4.tcp_congestion_control=bbr2`