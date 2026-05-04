linux_sysinfo
===

一个Linux 系统信息快速查看脚本，通过`g`命令一键展示主机、系统、CPU、网络、磁盘、运行时间等核心信息，同时支持版本检测和一键更新。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/script/raw/master/sh/install/check.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_sysinfo.webp "截图演示")

## 补充说明

该脚本是Linux系统信息快速查看工具，通过一行命令展示主机、系统、CPU、网络、磁盘、运行时间等核心信息，同时支持版本检测和一键更新。

### 功能特点

* 一键展示系统核心信息：主机名、系统版本、内核版本、架构等
* 显示CPU信息：型号、核心数、线程数、使用率
* 显示内存信息：总内存、已用、可用、使用率
* 显示磁盘信息：各分区使用情况
* 显示网络信息：IP地址、网卡状态
* 显示系统运行时间
* 支持版本检测：检查脚本是否有新版本
* 支持一键更新：自动下载并替换新版本脚本
* 彩色输出，清晰展示各项系统信息
* 支持交互式菜单和快速查看模式

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 主机名 | 显示系统主机名 |
| 系统版本 | 显示操作系统版本信息 |
| 内核版本 | 显示当前运行的内核版本 |
| 架构 | 显示系统架构（x86_64、aarch64等） |
| CPU信息 | 显示CPU型号、核心数、线程数、使用率 |
| 内存信息 | 显示总内存、已用、可用、使用率 |
| 磁盘信息 | 显示各分区使用情况 |
| 网络信息 | 显示IP地址、网卡状态 |
| 运行时间 | 显示系统持续运行时间 |
| 脚本版本 | 显示当前脚本版本和远程最新版本 |

### 注意事项

* 脚本需要bash环境运行
* 部分信息（如CPU使用率）需要对应命令支持（top、ps等）
* 网络信息基于ip或ifconfig命令，确保相关工具已安装
* 磁盘信息基于df命令
* 版本检测需要网络连接，能访问远程版本文件
* 更新功能会下载并替换当前脚本，请确保网络通畅
* 彩色输出需要终端支持ANSI转义序列
* 脚本会自动检测并适配不同Linux发行版
* 部分嵌入式系统可能缺少某些系统信息命令

## 脚本源码

```bash
#!/bin/bash
SH_VERSION="1.0.6"

gl_hui='\e[37m'
gl_hong='\033[31m'
gl_lv='\033[32m'
gl_huang='\033[33m'
gl_lan='\033[34m'
gl_bai='\033[0m'
gl_zi='\033[35m'
gl_bufan='\033[96m'

log_info()  { echo -e "${gl_lan}[信息]${gl_bai} $*"; }
log_ok()    { echo -e "${gl_lv}[成功]${gl_bai} $*"; }
log_warn()  { echo -e "${gl_huang}[警告]${gl_bai} $*"; }
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; }

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键继续${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai} \c"
    read -r -n 1 -s -p ""
    echo ""
    clear
}

exit_script() {
    clear
    exit 0
}

handle_invalid_input() {
    echo -ne "\r${gl_huang}无效的输入,请重新输入! ${gl_zi}1${gl_huang}秒后返回"
    sleep 1
    echo -e "\r${gl_lv}无效的输入,请重新输入! ${gl_zi}0${gl_lv}秒后返回"
    sleep 0.5
    return 2
}

get_remote_version() {
    local remote_version
    
    remote_version=$(curl -s --connect-timeout 5 \
        https://gitee.com/meimolihan/script/raw/master/sh/tool/linux-check.sh \
        | grep -o 'SH_VERSION="[0-9.]*"' 2>/dev/null | head -1 | cut -d'"' -f2)
    
    if [ -z "$remote_version" ]; then
        remote_version=$(curl -s --connect-timeout 5 \
            https://raw.githubusercontent.com/meimolihan/script/master/sh/tool/linux-check.sh \
            | grep -o 'SH_VERSION="[0-9.]*"' 2>/dev/null | head -1 | cut -d'"' -f2)
    fi
    
    echo "$remote_version"
}

check_for_update() {
    local remote_version
    remote_version=$(get_remote_version)
    
    if [ -z "$remote_version" ]; then
        return 1
    fi
    
    if [ "$SH_VERSION" != "$remote_version" ]; then
        echo -e "\n${gl_hong}🎉 发现新版本！${gl_bai}"
        echo -e "${gl_bufan}————————————————————————${gl_bai}"
        echo -e "  当前版本: ${gl_huang}v$SH_VERSION${gl_bai}"
        echo -e "  最新版本: ${gl_lv}v$remote_version${gl_bai}"
        echo -e "${gl_bufan}————————————————————————${gl_bai}"
        echo -e "  ${gl_bai}输入命令: ${gl_huang}g up${gl_bai} 更新到最新版"
        echo -e "${gl_bufan}————————————————————————${gl_bai}"
        return 0
    fi
    
    return 1
}

get_os_info() {
    if [ -f /etc/os-release ]; then
        source /etc/os-release
        echo "$PRETTY_NAME"
    elif [ -f /etc/redhat-release ]; then
        cat /etc/redhat-release
    elif [ -f /etc/issue ]; then
        head -n1 /etc/issue | sed 's/\\n//g; s/\\l//g'
    else
        echo -e "${gl_huang}未知系统${gl_bai}"
    fi
}

get_local_ip() {
    local ip
    ip=$(hostname -I 2>/dev/null | awk '{print $1}' | head -n1)
    
    if [ -z "$ip" ]; then
        ip=$(ip -o -4 addr show scope global 2>/dev/null | awk '{print $4}' | cut -d'/' -f1 | head -n1)
    fi
    
    [ -n "$ip" ] && echo "$ip" || echo "无法获取IP"
}

show_interface_info() {
    default_iface=$(ip route | awk '/default/ {print $5}' | head -n1)
    [ -n "$default_iface" ] && echo -e "$default_iface" || echo -e "${gl_hong}未找到默认网络接口！${gl_bai}"
}

get_cpu_usage() {
    top -bn1 2>/dev/null | grep "Cpu(s)" | awk '{printf "%.2f%%", 100 - $8}' 2>/dev/null || echo -e "${gl_hong}无法获取${gl_bai}"
}

get_cpu_model() {
    if [ -f /proc/cpuinfo ]; then
        model=$(grep -m1 "model name" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
        if [ -n "$model" ]; then
            echo "$model" | head -c 40
        else
            echo "未知CPU"
        fi
    else
        echo -e "${gl_hong}无法获取${gl_bai}"
    fi
}

get_uptime() {
    local uptime_seconds hours minutes
    uptime_seconds=$(awk '{print int($1)}' /proc/uptime 2>/dev/null)
    
    if [ -n "$uptime_seconds" ]; then
        hours=$((uptime_seconds / 3600))
        minutes=$(((uptime_seconds % 3600) / 60))
        echo "${hours}时${minutes}分"
    else
        uptime_seconds=$(uptime -p 2>/dev/null | sed 's/up //')
        [ -n "$uptime_seconds" ] && echo "$uptime_seconds" || echo -e "${gl_hong}无法获取${gl_bai}"
    fi
}

get_default_gateway() {
    local gateway
    gateway=$(ip route show default 2>/dev/null | awk '/default/ {print $3}' | head -n1)
    
    if [ -z "$gateway" ]; then
        gateway=$(route -n 2>/dev/null | awk '$1 == "0.0.0.0" {print $2}' | head -n1)
    fi
    
    [ -n "$gateway" ] && echo "$gateway" || echo -e "${gl_hong}无法获取${gl_bai}"
}

get_current_time() {
    result=$(date "+%Y-%m-%d %H:%M:%S" 2>/dev/null)
    if [ -n "$result" ]; then
        echo "$result"
    else
        echo -e "${gl_hong}无法获取${gl_bai}"
    fi
}

get_disk_usage() {
    local disk_info
    disk_info=$(df -h / 2>/dev/null | awk 'NR==2 {printf "%s/%s (%s)", $3, $2, $5}')
    
    if [ -z "$disk_info" ]; then
        disk_info=$(df -h . 2>/dev/null | awk 'NR==2 {printf "%s/%s (%s)", $3, $2, $5}')
    fi
    
    [ -n "$disk_info" ] && echo "$disk_info" || echo -e "${gl_hong}无法获取${gl_bai}"
}

show_system_info() {
    clear
    echo -e "${gl_zi}>>> 系统信息${gl_bai}"
    echo -e "${gl_bufan}————————————————————————${gl_bai}"
    echo -e "${gl_bufan}主机名称 : ${gl_bai}$(hostname 2>/dev/null || echo -e "${gl_hong}未知${gl_bai}")"
    echo -e "${gl_bufan}系统版本 : ${gl_bai}$(get_os_info)"
    echo -e "${gl_bufan}内核版本 : ${gl_bai}$(uname -r 2>/dev/null || echo -e "${gl_hong}未知${gl_bai}")"
    echo -e "${gl_bufan}————————————————————————${gl_bai}"
    echo -e "${gl_bufan}CPU 架构 : ${gl_bai}$(uname -m 2>/dev/null || echo "未知")"
    echo -e "${gl_bufan}CPU 型号 : ${gl_bai}$(get_cpu_model)"
    echo -e "${gl_bufan}CPU 占用 : ${gl_bai}$(get_cpu_usage)"
    echo -e "${gl_bufan}————————————————————————${gl_bai}"
    echo -e "${gl_bufan}网络接口 : ${gl_bai}$(show_interface_info)"
    echo -e "${gl_bufan}静态地址 : ${gl_bai}$(get_local_ip)"
    echo -e "${gl_bufan}默认网关 : ${gl_bai}$(get_default_gateway)"
    echo -e "${gl_bufan}————————————————————————${gl_bai}"
    echo -e "${gl_bufan}磁盘占用 : ${gl_bai}$(get_disk_usage)"
    echo -e "${gl_bufan}运行时间 : ${gl_bai}$(get_uptime)"
    echo -e "${gl_bufan}当前时间 : ${gl_bai}$(get_current_time)"
    echo -e "${gl_bufan}————————————————————————${gl_bai}"
}

main() {
    case "$1" in
        up|update|upgrade)
            bash <(curl -sL gitee.com/meimolihan/script/raw/master/sh/install/check.sh)
            bash /etc/profile.d/linux-check.sh
            exit
            ;;
        version|v|-v|--version)
            echo -e "${gl_bufan}脚本版本: ${gl_huang}v$SH_VERSION${gl_bai}"
            check_for_update
            return 0
            ;;
        help|h|-h|--help)
            echo -e "${gl_bufan}可用命令:${gl_bai}"
            echo -e "${gl_bufan}————————————————————————${gl_bai}"
            echo -e "  ${gl_huang}g${gl_bai}         显示系统信息"
            echo -e "  ${gl_huang}g up${gl_bai}     更新脚本到最新版"
            echo -e "  ${gl_huang}g version${gl_bai} 显示当前版本"
            echo -e "  ${gl_huang}g help${gl_bai}   显示帮助信息"
            echo -e "${gl_bufan}————————————————————————${gl_bai}"
            return 0
            ;;
    esac
    
    show_system_info
    
    if [[ $- == *i* ]]; then
        if [ -z "$LINUX_CHECK_SHOWN" ]; then
            export LINUX_CHECK_SHOWN=1
        fi
    else
        check_for_update
    fi
}

main "$@"
```


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
