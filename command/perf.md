perf
===

Linux 性能分析工具

## 补充说明

**perf** 是 Linux 内核自带的性能分析工具，支持 CPU 性能监控、函数剖析、热点分析等。是排查性能问题的利器。

### 语法

```shell
perf [--version] [--help] [OPTIONS] [COMMAND] [ARGS]
```

### 基本统计

```shell
# 列出可用事件
perf list

# 统计程序性能
perf stat ./program

# 统计并指定事件
perf stat -e cycles,instructions ./program

# 重复统计
perf stat -r 5 ./program

# 显示详细信息
perf stat -d ./program

# 记录到文件
perf stat -o stats.txt ./program
```

### CPU 性能事件

```shell
# CPU 周期
perf stat -e cycles ./program

# 指令数
perf stat -e instructions ./program

# 分支预测
perf stat -e branches,branch-misses ./program

# 缓存命中
perf stat -e cache-references,cache-misses ./program

# 上下文切换
perf stat -e context-switches,cpu-migrations ./program

# 页面错误
perf stat -e page-faults,major-faults,minor-faults ./program
```

### 函数剖析

```shell
# 记录函数调用
perf record ./program
perf record -g ./program

# 指定事件
perf record -e cycles ./program

# 指定采样频率
perf record -F 99 ./program

# 记录时长
perf record -a -- sleep 10

# 记录指定 PID
perf record -p 1234
perf record -p $(pidof program)

# 记录到文件
perf record -o perf.data ./program
```

### 生成报告

```shell
# 查看记录的报告
perf report

# 指定数据文件
perf report -i perf.data

# 显示调用链
perf report -g

# 显示调用关系图
perf report --stdio --call-graph graph

# 过滤
perf report -i perf.data --symbol-filter=main

# 显示前 N 项
perf report -i perf.data --top=20
```

### 热点分析

```shell
# 查看热点函数
perf top

# 指定事件
perf top -e cycles

# 按进程过滤
perf top -p 1234

# 按 CPU 过滤
perf top -C 0

# 显示调用链
perf top -g

# 指定符号过滤
perf top --symbol-filter=main
```

###  annotate（源码分析）

```shell
# 查看热点指令
perf annotate

# 指定数据
perf annotate -i perf.data

# 显示源码
perf annotate --stdio --source

# 显示汇编
perf annotate --stdio --objdump=objdump
```

### 调用链分析

```shell
# 生成调用链
perf record -g ./program

# 查看调用树
perf report -g caller

# 查看调用栈
perf report -g callee

# 显示函数调用关系
perf report --stdio --call-graph graph
```

### 内存分析

```shell
# 内存访问
perf mem record ./program

# 查看内存事件
perf mem report

# 采样内存访问
perf mem -e loads,stores record ./program
```

### 调度分析

```shell
# 调度器事件
perf sched record ./program

# 查看延迟
perf sched latency

# 查看调度统计
perf sched stats

# 查看调用轨迹
perf sched trace

# 查看上下文切换
perf sched cgroup record ./program
```

### KVM 分析

```shell
# 记录 KVM 事件
perf kvm --guest record ./program

# 查看 KVM 报告
perf kvm --guest report

# 统计 KVM
perf kvm --guest stat record sleep 10
perf kvm --guest stat report
```

### trace（跟踪）

```shell
# 跟踪系统调用
perf trace ./program

# 跟踪指定 PID
perf trace -p 1234

# 跟踪指定系统调用
perf trace -e open,read,write ./program

# 跟踪网络
perf trace -e net.*

# 跟踪文件
perf trace -e syscalls:sys_enter_open
```

### 使用示例

```shell
# 1. 性能基准测试
perf stat -e cycles,instructions,cache-references ./program

# 2. 热点分析
perf top -e cycles -p $(pidof program)

# 3. 完整性能剖析
perf record -g ./program
perf report --symbol-filter=main --stdio

# 4. 跟踪特定事件
perf record -e syscalls:sys_enter_openat -a
perf report

# 5. 监控系统性能
perf stat -a -I 1000 sleep 10

# 6. 分析 CPU 使用
perf top -e cycles -d --stdio

# 7. 延迟分析
perf sched latency

# 8. 查看 CPU 迁移
perf sched migration

# 9. 内存带宽
perf stat -e mem_load_retired.l3_miss ./program

# 10. 分支预测
perf stat -e branches,branch-misses ./program
```

### 脚本

```shell
# 列出可用脚本
perf script -l

# 执行脚本
perf script -s script.py

# 生成火焰图数据
perf script > out.perf

# 常用脚本
perf script -s topdown.py     # Top-Down 分析
perf script -s offcputime.py  # Off-CPU 时间
```

### 火焰图

```shell
# 安装火焰图工具
git clone https://github.com/brendangregg/FlameGraph.git

# 记录性能数据
perf record -F 99 -a -g -- sleep 60

# 生成火焰图
perf script -i perf.data | ./FlameGraph/stackcollapse-perf.pl | ./FlameGraph/flamegraph.pl > flamegraph.svg

# CPU 火焰图
perf record -F 99 -a -g -- sleep 30
perf script | ./FlameGraph/stackcollapse-perf.pl | ./FlameGraph/flamegraph.pl > cpu.svg

# Off-CPU 火焰图
perf record -e sched:sched_stat_blocked -a -g -- sleep 30
perf script | ./FlameGraph/stackcollapse-perf.pl | ./FlameGraph/flamegraph.pl > offcpu.svg
```

### 常用选项

```shell
# 采样频率
perf record -F 99 ./program

# 事件过滤
perf record -e 'syscalls:sys_enter_*' ./program

# CPU 过滤
perf record -C 0,1 ./program

# 进程过滤
perf record -p 1234 ./program

# 内核/用户模式
perf record -a -g ./program      # 全部
perf record -g --call-graph dwarf ./program

# 内核模块
perf record -k mono ./program

# 数据大小
perf record -d ./program

# 输出文件
perf record -o perf.data ./program
```

### 权限

```shell
# 需要 root 权限
sudo perf stat ./program
sudo perf top

# 设置内核权限
echo -1 > /proc/sys/kernel/perf_event_paranoid
echo 0 > /proc/sys/kernel/kptr_restrict
```

### 常用 perf 子命令

```shell
perf stat       # 统计计数
perf top        # 实时热点
perf record     # 记录数据
perf report     # 查看报告
perf annotate   # 源码分析
perf script     # 原始数据
perf diff       # 比较两个 perf.data
perf evlist     # 列出声明
perf kmem       # 内核内存
perf lock       # 锁分析
perf sched      # 调度分析
perf probe      # 动态探针
```
