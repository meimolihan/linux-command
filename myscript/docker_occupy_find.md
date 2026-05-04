docker_occupy_find
===

【Docker指定容器占用列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_occupy_find.sh) md
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_occupy_find.webp "截图演示")

## 补充说明

该脚本用于查看指定 Docker 容器的资源占用情况（CPU、内存、网络、磁盘等），基于 `docker stats` 和 `docker system df` 命令实现，适合排查单个容器资源使用问题的场景。

### 功能特点

* 容器选择：交互式选择或指定容器名称/ID
* 实时监控：显示容器 CPU、内存、网络 IO、磁盘 IO 等实时数据
* 磁盘信息：显示容器占用磁盘空间大小
* 彩色输出：使用不同颜色区分不同类型的资源信息
* 排序显示：自动按资源使用量排序显示

### 输出说明

脚本输出包含以下信息：

| 字段 | 说明 |
| --- | --- |
| 容器名称 | 指定容器的名称 |
| CPU 使用率 | 容器 CPU 占用百分比 |
| 内存使用 | 内存使用量 / 限制值 |
| 网络 IO | 网络接收/发送流量 |
| 磁盘 IO | 磁盘读取/写入量 |
| 磁盘占用 | 容器占用磁盘总大小 |

### 注意事项

* 需要系统已安装 Docker 并正常运行
* 实时监视模式按 Ctrl+C 退出
* 容器必须处于运行状态才能查看资源占用
* 磁盘占用计算可能需要几秒钟时间

## 脚本源码

- 传参：`./脚本名.sh` 容器名称
- 不传参：`./脚本名.sh` 查看全部容器

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

log_info()  { echo -e "${gl_lan}[信息]${gl_bai} $*"; }
log_ok()    { echo -e "${gl_lv}[成功]${gl_bai} $*"; }
log_warn()  { echo -e "${gl_huang}[警告]${gl_bai} $*"; }
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; }

column_if_available() {
    if command -v column &> /dev/null; then
        column -t -s $'\t'
    else
        cat
    fi
}

show_help() {
    echo -e "${gl_lv}使用说明:${gl_bai}"
    echo -e "  ${gl_bai}$0 ${gl_lan}[容器名称]${gl_bai}"
    echo -e ""
    echo -e "${gl_lv}参数:${gl_bai}"
    echo -e "  ${gl_lan}[容器名称]${gl_bai}  可选的容器名称或ID"
    echo -e ""
    echo -e "${gl_lv}示例:${gl_bai}"
    echo -e "  ${gl_bai}$0${gl_bai}                         # 查看所有运行中的容器"
    echo -e "  ${gl_bai}$0 ${gl_lan}nginx${gl_bai}          # 查看指定容器"
    echo -e "  ${gl_bai}$0 ${gl_lan}myapp${gl_bai}          # 查看指定容器"
    echo -e "  ${gl_bai}$0 ${gl_lan}-h${gl_bai}             # 显示帮助信息"
    echo -e ""
    exit 0
}

check_container_exists() {
    local container_name="$1"
    if ! docker inspect "$container_name" &>/dev/null; then
        log_error "容器不存在或未运行: $container_name"
        return 1
    fi
    return 0
}

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键继续${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    read -r -n 1 -s -p ""
    echo ""
    clear
}

get_running_containers() {
    docker ps --format "{{.Names}}" 2>/dev/null
}

list_beautify_specific_container() {
    local container_name="$1"
    
    if ! check_container_exists "$container_name"; then
        return 1
    fi
    
    {
        data=$(docker stats --no-stream "$container_name" --format "{{.Container}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}\t{{.PIDs}}" 2>/dev/null)
        
        if [ -z "$data" ]; then
            printf "%s%s\n" "$gl_huang" "容器 $container_name 没有资源使用数据" "$reset"
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

list_beautify_all_containers() {
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

main() {
    if ! docker info &>/dev/null; then
        log_error "Docker 服务未运行"
        exit 1
    fi
    
    local TARGET_CONTAINER=""
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                ;;
            *)
                if [[ -z "$TARGET_CONTAINER" ]]; then
                    TARGET_CONTAINER="$1"
                else
                    log_error "未知参数: $1"
                    echo -e "${gl_bai}使用 ${gl_huang}$0 -h ${gl_bai}查看帮助${gl_bai}"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    if [[ -n "$TARGET_CONTAINER" ]]; then
        clear
        echo -e "${gl_zi}>>> 容器资源占用: ${gl_huang}$TARGET_CONTAINER${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        if ! list_beautify_specific_container "$TARGET_CONTAINER"; then
            local containers=($(get_running_containers))
            if [ ${#containers[@]} -gt 0 ]; then
                echo -e "${gl_bai}运行中的容器:${gl_bai}"
                for container in "${containers[@]}"; do
                    echo -e "  ${gl_lv}•${gl_bai} $container"
                done
            fi
        fi
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        break_end
    else
        clear
        echo -e "${gl_zi}>>> Docker容器占用列表${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        list_beautify_all_containers
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        break_end
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```


## 相关命令

- [docker_occupy](../c/docker_occupy.html "Docker容器占用列表")
- [docker_occupy_find](../c/docker_occupy_find.html "Docker指定容器占用列表")  👈 当前所在位置
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
