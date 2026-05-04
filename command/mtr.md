mtr
===

网络诊断工具（my traceroute）

## 补充说明

**mtr** (My Traceroute) 结合了 ping 和 traceroute 的功能，实时显示到目标主机的路由路径和丢包率。是网络故障排查的利器。

### 语法

```shell
mtr [OPTIONS] HOSTNAME
```

### 基本使用

```shell
# 基本追踪
mtr google.com
mtr 8.8.8.8

# 指定发送包数量后退出
mtr -c 10 google.com             # 发送 10 个包后退出
mtr --report google.com
mtr -c 50 --report google.com

# 报告模式（输出后退出）
mtr -r google.com
mtr --report google.com
mtr -r -c 50 google.com          # 发送 50 个包

# 宽报告模式
mtr -w google.com
mtr --report-wide google.com

# 显示 IP 地址而非主机名
mtr -n google.com
mtr --no-dns google.com

# 显示字段说明
mtr --help
```

### 输出列说明

```
# mtr 输出列说明
Host            - 路由节点主机名/IP
Loss%           - 丢包率
Snt             - 已发送数据包数
Last            - 最近一次响应时间
Avg             - 平均响应时间
Best            - 最小响应时间
Wrst            - 最大响应时间
StDev           - 标准差（波动程度）
```

### 常用选项

```shell
# 显示字段选择
mtr -o "LRS BA JMXI" google.com  # 自定义显示列

# 可用字段代码：
# L - Loss%     丢包率
# R - Reply     返回的包数
# S - Sent      发送的包数
# B - Best      最小延迟
# A - Avg       平均延迟
# W - Worst     最大延迟
# J - Jitter    抖动
# M - Med       中位数
# X - Jmax      最大抖动
# I - Iavg      ICMP 错误

# 不解析 DNS（更快）
mtr -n 8.8.8.8

# 显示 IP 和主机名
mtr -b google.com
mtr --show-ips google.com

# 指定间隔时间
mtr -i 2 google.com               # 每 2 秒发送一次
mtr --interval 5 google.com

# 指定包大小
mtr -s 100 google.com             # 100 字节
mtr --psize 100 google.com

# 指定发送数量
mtr -c 100 google.com

# 显示 TCP 层追踪（非 ICMP）
mtr --tcp google.com
mtr -T google.com

# 使用 UDP
mtr --udp google.com
mtr -u google.com

# 指定端口（TCP 模式）
mtr -T -P 443 google.com

# 显示 AS 号（自治系统号）
mtr -z google.com
mtr --aslookup google.com

# 设置最大跳数
mtr -m 30 google.com              # 最大 30 跳
mtr --max-ttl 30 google.com

# 设置首次跳数 TTL
mtr -f 5 google.com               # 从第 5 跳开始
mtr --first-ttl 5 google.com

# 设置超时
mtr -t 5 google.com               # 5 秒超时
mtr --timeout 5 google.com

# 指定源地址
mtr -a 192.168.1.100 google.com
mtr --address 192.168.1.100 google.com

# 指定源端口
mtr -s 5000 google.com            # 源端口 5000

# 设置套接字超时
mtr -Z 2 google.com               # 2 秒
```

### 输出模式

```shell
# 实时交互模式（默认）
mtr google.com

# 报告模式（发送 10 个包后输出报告）
mtr -r google.com
mtr --report google.com

# 宽报告模式（显示完整主机名）
mtr -rw google.com
mtr --report-wide google.com

# CSV 输出
mtr --csv google.com
mtr --csv -c 10 google.com > mtr_report.csv

# JSON 输出
mtr --json google.com
mtr --json -c 10 google.com > mtr_report.json

# XML 输出
mtr --xml google.com

# 输出到文件
mtr -r -c 50 google.com > mtr_report.txt
```

### 常用组合

```shell
# 快速诊断网络问题
mtr -r -c 20 google.com

# 追踪 TCP 端口
mtr -T -P 443 google.com

# 显示完整信息
mtr -rwb google.com               # 报告+宽格式+显示 IP

# 检测特定路径的丢包
mtr -r -c 100 -n 192.168.1.1

# 保存诊断报告
mtr -r -c 50 google.com > mtr_google_$(date +%Y%m%d).txt

# 对比多个目标
mtr -r -c 20 google.com &
mtr -r -c 20 baidu.com &
wait

# 监控网络质量
mtr -r -c 10 -o "L B A W" google.com

# 大包测试
mtr -s 1000 -c 50 google.com

# 追踪并显示 AS 号
mtr -z google.com
mtr -z -r -c 20 google.com

# 从特定网络接口发送
mtr -I eth0 google.com

# 检查中间路由问题
mtr -r -n -c 100 target.com | grep -v "0.0%"

# 只显示有问题的跳
mtr -r -c 50 google.com | awk '$2 !~ /0.0%/'
```

### 交互模式快捷键

```shell
# 在交互模式下的快捷键
mtr google.com

# 按键操作：
h 或 ?     - 显示帮助
q          - 退出
p          - 暂停/继续
d          - 切换显示模式
n          - 切换显示主机名/IP
r          - 重置计数器
j          - 切换延迟显示
s          - 切换显示列
u          - 切换用户界面
```

### 故障排查示例

```shell
# 问题1：网络延迟高
mtr -r -c 100 target.com
# 查看哪一跳延迟突然增大

# 问题2：间歇性丢包
mtr -r -c 200 target.com
# Loss% 列显示丢包率

# 问题3：特定端口不通
mtr -T -P 443 target.com
# 使用 TCP 模式追踪 443 端口

# 问题4：DNS 解析问题
mtr -n target.com
# 使用 -n 跳过 DNS 解析

# 问题5：防火墙拦截
mtr -T target.com
mtr -u target.com
# 对比 ICMP、TCP、UDP 的结果

# 生成诊断报告
echo "=== MTR Report ===" > network_report.txt
echo "Date: $(date)" >> network_report.txt
echo "" >> network_report.txt
echo "--- Google ---" >> network_report.txt
mtr -r -c 50 google.com >> network_report.txt
echo "" >> network_report.txt
echo "--- Local Gateway ---" >> network_report.txt
mtr -r -c 50 192.168.1.1 >> network_report.txt
```

### 与 traceroute 对比

```shell
# mtr 优势：
# 1. 实时更新
# 2. 显示丢包率
# 3. 统计功能（平均、最大、最小延迟）
# 4. 支持 TCP/UDP
# 5. 更快

# traceroute 基本用法
traceroute google.com

# mtr 等效用法
mtr -r -c 30 google.com
```
