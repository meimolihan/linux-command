docker_occupy
===

【Docker容器占用列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_occupy.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_occupy.webp "截图演示")

## 补充说明

该脚本用于美化显示 Docker 容器资源占用列表，基于 docker stats 命令和 awk 文本处理实现，适合实时监控容器资源使用情况。

### 功能特点

* 实时快照：使用 `--no-stream` 参数获取当前时刻的资源占用快照
* 美化输出：使用 ANSI 颜色码区分不同字段（容器ID、名称、CPU%、内存、网络IO、块IO、PIDs）
* 容器 ID 简化：只显示前 12 位字符
* 表格对齐：使用 column 命令自动对齐列（如果可用）
* 空列表处理：当没有运行中的容器时显示友好提示
* 多维度监控：同时显示 CPU、内存、网络、磁盘 IO 等多个指标
* 一键执行：通过管道直接运行，无需下载脚本

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 容器ID | 容器 ID 的前 12 位（青色显示） |
| 名称 | 容器的名称（绿色显示） |
| CPU% | CPU 使用百分比（黄色显示） |
| 内存使用/限制 | 已用内存/内存限制（蓝色显示） |
| 内存% | 内存使用百分比（黄色显示） |
| 网络I/O | 网络输入/输出流量（白色显示） |
| 块I/O | 磁盘块读写流量（白色显示） |
| PIDs | 容器内的进程数量（白色显示） |

### 注意事项

* 脚本需要 Docker 环境可用且 Docker 服务正在运行
* 只显示运行中的容器，已停止的容器不会出现在列表中
* 如果系统没有 column 命令，表格可能无法对齐，但不影响功能
* `docker stats` 命令需要 Docker API 的访问权限
* 内存使用量格式如 `100MiB / 1GiB`，百分比如 `10.00%`
* 网络 IO 格式如 `1.2kB / 3.4kB`（输入/输出）
* 块 IO 格式类似网络 IO，显示磁盘读写量
* 适合用于快速排查资源占用异常的容器
* 如需持续监控，可以使用 `docker stats` 命令（不带 `--no-stream`）

## 脚本源码

```bash
#!/bin/bash
set -uo pipefail

list_color_init() {
    export gl_hui=$'\033[38;5;59m'
    export gl_hong=$'\033[38;5;9m'
    export gl_lv=$'\033[38;5;10m'
    export gl_huang=$'\033[38;5;11m'
    export gl_lan=$'\033[38;5;32m'
    export gl_bai=$'\033[38;5;15m'
    export gl_zi=$'\033[38;5;13m'
    export gl_bufan=$'\033[38;5;14m'
    export reset=$'\033[0m'
}
list_color_init

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键继续${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    read -r -n 1 -s -r -p ""
    echo ""
    clear
}

column_if_available() {
    if command -v column &> /dev/null; then
        column -t -s $'\t'
    else
        cat
    fi
}

list_beautify_docker_occupy() {
    {
        data=$(docker stats --no-stream --format "{{.Container}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}" 2>/dev/null)
        
        if [ -z "$data" ]; then
            printf "%s%s\n" "$gl_huang" "没有运行中的容器" "$reset"
            return
        fi

        printf "%s%-12s\t%-20s\t%-8s\t%-20s\t%-8s\t%-12s\t%-12s\t%-6s%s\n" \
            "$gl_hui" "容器ID" "名称" "CPU%" "内存使用/限制" "内存%" "网络I/O" "块I/O" "PIDs" "$reset"
        printf "%s%-12s\t%-20s\t%-8s\t%-20s\t%-8s\t%-12s\t%-12s\t%-6s%s\n" \
            "$gl_hui" "------------" "--------------------" "--------" "--------------------" "--------" "------------" "------------" "------" "$reset"

        echo "$data" | awk -v cyan="$gl_bufan" -v green="$gl_lv" -v yellow="$gl_huang" \
            -v blue="$gl_lan" -v white="$gl_bai" -v reset="$reset" '
        BEGIN {FS="\t"; OFS="\t"}
        {
            id = substr($1, 1, 12)
            name = $2
            cpu = $3
            mem_usage = $4
            mem_perc = $5
            net_io = $6
            block_io = $7
            pids = $8

            print cyan id reset, green name reset, yellow cpu reset, blue mem_usage reset, \
                  yellow mem_perc reset, white net_io reset, white block_io reset, white pids reset
        }'
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Docker容器占用列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_docker_occupy
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

list_beautify_all
```


## 相关命令

- [docker_occupy](../c/docker_occupy.html "Docker容器占用列表")  👈 当前所在位置
- [docker_occupy_find](../c/docker_occupy_find.html "Docker指定容器占用列表")
- [docker_ps_find](../c/docker_ps_find.html "Docker运行中容器列表")
- [docker_images](../c/docker_images.html "Docker镜像列表")
- [docker_images_find](../c/docker_images_find.html "Docker镜像列表(过滤)")
- [docker_network](../c/docker_network.html "Docker网络列表")
- [docker_disk](../c/docker_disk.html "Docker磁盘列表")
- [docker_volume](../c/docker_volume.html "Docker卷列表")

## 创建本地脚本

```bash
new_script="new_test.sh"

cat > "$new_script" << 'EOF'
#!/bin/bash

# 粘贴脚本源码

EOF

# 保留本地脚本，去掉 rm -f "$new_script"
chmod +x "$new_script" && ./"$new_script" && rm -f "$new_script"
```
