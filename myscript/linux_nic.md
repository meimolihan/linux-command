linux_nic
===

【Linux网卡信息列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_nic.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_nic.webp "截图演示")

## 补充说明

该脚本是Linux网卡信息列表美化工具，解析系统网卡配置，以彩色格式化输出网卡详细信息。

### 功能特点

* 基于 ip 或 ifconfig 命令解析网卡信息
* 彩色高亮显示网卡状态（UP/DOWN、RUNNING等）
* 显示网卡名称、状态、IP地址、MAC地址等详细信息
* 支持显示所有网卡（包括lo回环接口）
* 格式化输出，对齐清晰
* 自动检测可用网络工具（ip、ifconfig）
* 显示网卡类型（以太网、无线、回环等）

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 网卡名称 | 网络接口名称（如 eth0、ens33、wlan0等） |
| 状态 | 网卡状态（UP/DOWN、RUNNING等） |
| IP地址 | 网卡的IPv4/IPv6地址 |
| MAC地址 | 网卡的MAC硬件地址 |
| 类型 | 网卡类型（以太网、无线、回环等） |
| MTU | 最大传输单元 |
| 其他信息 | 额外的网卡配置信息 |

### 注意事项

* 脚本依赖 ip 或 ifconfig 命令，确保系统已安装 iproute2 或 net-tools 包
* 查看所有网卡信息通常需要足够权限（普通用户可看部分信息）
* 彩色输出需要终端支持 ANSI 转义序列
* 部分网卡状态可能因驱动或配置不同而有差异
* 脚本会优先使用 ip 命令，不存在时尝试 ifconfig
* 回环接口（lo）通常也会显示
* 无线网卡可能显示额外信息（如SSID、信号强度等，取决于工具）
* 脚本以 bash 编写，确保运行环境支持 bash

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

list_beautify_linux_nic() {
    {
        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "接口名" "状态" "IPv4地址" "MAC地址" "MTU" "速度" "$reset"
        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "--------" "--------" "------------------" "--------------------" "----" "----" "$reset"

        for nic in $(ls /sys/class/net 2>/dev/null); do
            state=$(cat /sys/class/net/$nic/operstate 2>/dev/null)
            ipaddr=$(ip -4 addr show $nic 2>/dev/null | awk '/inet /{print $2}' | head -n1)
            mac=$(cat /sys/class/net/$nic/address 2>/dev/null)
            mtu=$(cat /sys/class/net/$nic/mtu 2>/dev/null)
            speed_path="/sys/class/net/$nic/speed"
            if [ -f "$speed_path" ]; then
                speed=$(cat "$speed_path" 2>/dev/null)
                if [[ "$speed" =~ ^[0-9]+$ ]] && [ "$speed" -gt 0 ]; then
                    speed="${speed}Mb/s"
                else
                    speed="未知"
                fi
            else
                speed="N/A"
            fi
            
            state=${state:-unknown}
            ipaddr=${ipaddr:-无}
            mac=${mac:-无}
            mtu=${mtu:-未知}
            
            case $state in
                "up")
                    state_color=$gl_lv
                    state_display="${state_color}up$reset"
                    ;;
                "down")
                    state_color=$gl_hui
                    state_display="${state_color}down$reset"
                    ;;
                "unknown")
                    state_color=$gl_hong
                    state_display="${state_color}unknown$reset"
                    ;;
                *)
                    state_color=$gl_huang
                    state_display="${state_color}$state$reset"
                    ;;
            esac
            
            printf "%s%s%s\t%s\t%s%s%s\t%s%s%s\t%s%s%s\t%s%s%s\n" \
                "$gl_lan" "$nic" "$reset" \
                "$state_display" \
                "$gl_bufan" "$ipaddr" "$reset" \
                "$gl_huang" "$mac" "$reset" \
                "$gl_zi" "$mtu" "$reset" \
                "$gl_hui" "$speed" "$reset"
        done
        
        if [ -z "$(ls /sys/class/net 2>/dev/null)" ]; then
            printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hong" "(无网络接口)" "(无网络接口)" "(无网络接口)" "(无网络接口)" "(无网络接口)" "(无网络接口)" "$reset"
        fi
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux网卡信息列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_nic
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

list_beautify_all
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
