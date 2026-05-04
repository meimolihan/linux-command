linux_uptime
===

【Linux系统开机时间/运行时长】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_uptime.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_uptime.webp "截图演示")

## 补充说明

该脚本是Linux系统开机时间/运行时长美化工具，解析系统运行时间并以彩色格式化输出。

### 功能特点

* 基于 uptime 命令解析系统运行时长
* 彩色高亮显示开机时间和运行时长
* 显示当前系统时间
* 格式化输出：将秒数转换为年、周、天、小时、分钟的可读格式
* 支持中文单位显示（年、周、天、小时、分钟）
* 输出格式清晰，包含开机时间、运行时长、当前时间三个字段
* 自动适配不同系统的 uptime 输出格式

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 开机时间 | 系统本次启动的时间 |
| 运行时长 | 系统持续运行的时间（格式化为可读形式） |
| 当前时间 | 脚本执行时的当前系统时间 |

### 注意事项

* 脚本依赖 uptime 命令，确保系统已安装 procps 包
* 需要读取系统运行时长信息，普通用户通常可读
* 格式化输出基于 uptime -p 和 uptime -s 命令
* 部分嵌入式系统可能不支持 uptime 的 -p 或 -s 参数
* 彩色输出需要终端支持 ANSI 转义序列
* 脚本以 bash 编写，确保运行环境支持 bash
* 运行时长单位会自动转换（年>周>天>小时>分钟）
* 如果系统刚启动，可能显示“分钟”级别的运行时长

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

list_beautify_linux_uptime() {
    {
        printf "%s%-18s\t%-30s\t%-20s%s\n" \
            "$gl_hui" "开机时间" "运行时长" "当前时间" "$reset"
        printf "%s%-18s\t%-30s\t%-20s%s\n" \
            "$gl_hui" "------------------" "------------------------------" "--------------------" "$reset"

        boot_time=$(uptime -s 2>/dev/null || who -b 2>/dev/null | awk '{print $3,$4}')
        up_time=$(uptime -p 2>/dev/null | sed 's/up //' \
            | sed -E 's/ years?/年/g' \
            | sed -E 's/ months?/月/g' \
            | sed -E 's/ weeks?/周/g' \
            | sed -E 's/ days?/天/g' \
            | sed -E 's/ hours?/小时/g' \
            | sed -E 's/ minutes?/分钟/g' \
            | sed -E 's/ seconds?/秒/g' \
            | sed 's/,/，/g')
        now_time=$(date +"%Y-%m-%d %H:%M:%S")

        printf "%s%-18s%s\t%s%-30s%s\t%s%-20s%s\n" \
            "$gl_lan" "${boot_time:-未知}" "$reset" \
            "$gl_huang" "${up_time:-未知}" "$reset" \
            "$gl_lv" "${now_time}" "$reset"
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux系统开机时间/运行时长${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_uptime
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
