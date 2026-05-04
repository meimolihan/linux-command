valgrind
===

内存调试工具

## 补充说明

**valgrind** 是强大的程序调试和剖析工具，主要用于内存错误检测，包括内存泄漏、未初始化内存访问、越界访问等。

### 语法

```shell
valgrind [valgrind-options] program [program-options]
```

### 基本用法

```shell
# 基本内存检查
valgrind ./program

# 带参数运行
valgrind ./program arg1 arg2

# 指定输出文件
valgrind -o output.txt ./program

# 详细程度
valgrind -v ./program
valgrind --verbose ./program

# 安静模式
valgrind -q ./program
valgrind --quiet ./program
```

### 内存检测（memcheck）

```shell
# 启用内存检查
valgrind --tool=memcheck ./program

# 检测未初始化内存
valgrind --track-origins=yes ./program

# 检测越界访问
valgrind --tool=memcheck ./program

# 检测内存泄漏
valgrind --leak-check=full ./program

# 显示泄漏详情
valgrind --show-leak-kinds=all ./program

# 统计泄漏
valgrind --leak-check=full --show-reachable=yes ./program
```

### 内存泄漏类型

```
定义泄漏（definitely lost）：
  程序分配但无法释放的内存

间接泄漏（indirectly lost）：
  泄漏对象引用的其他对象

可能泄漏（possibly lost）：
  可能泄漏，需要更仔细分析

可达泄漏（still reachable）：
  程序结束时仍可达的内存，不算真正泄漏
```

### 堆分析

```shell
# 启用堆信息
valgrind --track-origins=yes ./program

# 完整的堆信息
valgrind --verbose --track-origins=yes ./program

# 部分堆调试
valgrind --freelist-vol=10000000 ./program
```

### GDB 集成

```shell
# GDB 支持
valgrind --vgdb=yes ./program

# 交互式调试
valgrind --vgdb=error ./program
# 在另一个终端运行：gdb ./program
# GDB 中：target remote | vgdb

# GDB 断点
valgrind --vgdb=full --vgdb-error=0 ./program
```

### Callgrind（调用图）

```shell
# 生成调用图
valgrind --tool=callgrind ./program

# 输出文件
valgrind --tool=callgrind --callgrind-out-file=callgrind.out.1234 ./program

# 使用 KCachegrind 查看
kcachegrind callgrind.out.1234

# 采样率
valgrind --tool=callgrind --dump-instr=yes --dump-line=yes --collect-jumps=yes ./program
```

### Cachegrind（缓存分析）

```shell
# 缓存分析
valgrind --tool=cachegrind ./program

# L1/L2 缓存分析
valgrind --tool=cachegrind --cache-sim=yes --cacheuse=yes ./program

# 注释源码
cg_annotate cachegrind.out.1234
cg_annotate --show=Dr,Dw --statable cachegrind.out.1234

# 合并输出
cg_annotate --auto=yes callgrind.out.*
```

### Helgrind（线程分析）

```shell
# 线程错误检测
valgrind --tool=helgrind ./program

# 检测锁顺序
valgrind --tool=helgrind --order-tool=helgrind ./program

# 历史记录
valgrind --tool=helgrind --history-level=full ./program
```

### DRD（线程分析）

```shell
# DRD 工具
valgrind --tool=drd ./program

# 互斥锁分析
valgrind --tool=drd --segment-merging=yes ./program

# 报告所有互斥锁
valgrind --tool=drd --show-concurrency=yes ./program
```

### Massif（堆分析）

```shell
# 堆内存分析
valgrind --tool=massif ./program

# 详细程度
valgrind --tool=massif --detailed-freq=100 ./program

# 输出文件
valgrind --tool=massif --massif-out-file=massif.out.%p ./program

# 查看快照
ms_print massif.out.1234

# 峰值的更多信息
valgrind --tool=massif --peak-instrs=yes ./program

# 时间命令
valgrind --tool=massif --time-unit=i ./program
```

### 常用示例

```shell
# 检测内存泄漏
valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./program

# 检测越界
valgrind --tool=memcheck --track-origins=yes ./program

# 性能分析
valgrind --tool=callgrind ./program
kcachegrind callgrind.out.1234

# 线程安全
valgrind --tool=helgrind ./thread_program

# 堆使用
valgrind --tool=massif ./program
ms_print massif.out.1234

# 快速检查
valgrind --error-exitcode=1 ./program

# GDB 调试
valgrind --vgdb=full --vgdb-error=0 ./program
```

### 输出控制

```shell
# 错误数量
valgrind --errors-for-leak-kinds=definite,possible --error-exitcode=1 ./program

# 忽略错误
valgrind --ignore-range-below-sp=1 ./program

# 过滤错误
valgrind --gen-suppressions=all ./program 2>&1 | grep "Supp"

# 生成抑制文件
valgrind --gen-suppressions=yes ./program > suppressions.txt

# 使用抑制文件
valgrind --suppressions=suppressions.txt ./program
```

### 编译要求

```shell
# 使用调试符号编译
gcc -g program.c -o program

# 使用 gdb 调试符号
gcc -ggdb3 program.c -o program

# 优化级别 0（避免混淆）
gcc -g -O0 program.c -o program

# 保留符号表
gcc -g program.c -o program
strip --keep-symbols program
```

### 报告解读

```shell
# Memcheck 报告示例
==12345== Invalid read of size 4
==12345==    at 0x400542: main (test.c:10)
==12345==  Address 0x100600020 is 0 bytes inside a block of size 10 alloc'd
==12345==    at 0x400410: malloc (vg_malloc.c:100)

# 泄漏报告
==12345== definitely lost: 1,234 bytes in 10 blocks
==12345==    at 0x4005F0: malloc (vg_malloc.c:100)
==12345==    by 0x400520: main (test.c:20)
```

### 常用选项速查

```shell
# 内存检查
--leak-check=full        # 详细泄漏检查
--show-leak-kinds=all   # 显示所有泄漏类型
--track-origins=yes     # 跟踪未初始化内存来源
--undef-value-errors=no # 关闭未定义值错误

# 输出控制
--quiet                  # 安静模式
--verbose               # 详细输出
--error-limit=no        # 不限制错误数
--error-exitcode=1      # 错误时返回非零

# GDB
--vgdb=no|yes|full      # GDB 集成
--vgdb-error=0           # 首次错误时停止

# 性能
--num-callers=20        # 调用栈深度
--max-threads=1000      # 最大线程数
```

### 与其他工具集成

```shell
# GDB 调试 valgrind 程序
valgrind --vgdb=full --vgdb-error=0 ./program &
gdb ./program
(gdb) target remote | vgdb

# 生成火焰图
valgrind --tool=callgrind ./program
kcachegrind2火焰图.py callgrind.out.1234 > flamegraph.svg

# CI/CD 集成
valgrind --error-exitcode=1 --leak-check=full ./program
if [ $? -eq 0 ]; then
    echo "Memory check passed"
else
    echo "Memory errors detected"
    exit 1
fi
```
