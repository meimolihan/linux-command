linux_load
===

【Linux系统负载/CPU平均负载】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_load.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_load.webp "截图演示")

## 补充说明

### 功能描述
美化显示Linux系统负载/CPU平均负载信息，适用于快速了解系统负载状况的场景。

### 功能特点
- 显示1分钟、5分钟、15分钟的系统平均负载
- 自动检测CPU逻辑核心数用于对比判断
- 负载超过CPU核心数时自动用红色高亮警示
- 使用不同颜色区分不同字段，提升可读性
- 支持column命令美化表格输出，无column时退化为普通输出

### 输出说明
| 字段 | 说明 |
|------|------|
| 负载指标 | 固定显示"系统平均负载" |
| 1分钟 | 过去1分钟的平均负载值 |
| 5分钟 | 过去5分钟的平均负载值 |
| 15分钟 | 过去15分钟的平均负载值 |
| CPU逻辑核心数 | 系统CPU逻辑核心数量，用于判断负载是否过高 |

### 注意事项
- 需要系统支持/proc/cpuinfo文件（所有Linux发行版均支持）
- 负载值接近或超过CPU核心数时表示系统负载较高
- 使用uptime命令获取数据，无需额外安装软件包

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

list_beautify_linux_load() {
    {
        printf "%s%-18s\t%-10s\t%-10s\t%-10s\t%-20s%s\n" \
            "$gl_hui" "负载指标" "1分钟" "5分钟" "15分钟" "CPU逻辑核心数" "$reset"
        printf "%s%-18s\t%-10s\t%-10s\t%-10s\t%-20s%s\n" \
            "$gl_hui" "------------------" "----------" "----------" "----------" "--------------------" "$reset"

        cpu_num=$(grep -c '^processor' /proc/cpuinfo 2>/dev/null || echo "未知")

        uptime | awk -v cpu="$cpu_num" -v green="$gl_lv" -v yellow="$gl_huang" \
            -v red="$gl_hong" -v blue="$gl_lan" -v reset="$reset" '
        {
            m1 = $(NF-2); gsub(/,/, "", m1)
            m5 = $(NF-1); gsub(/,/, "", m5)
            m15 = $(NF);   gsub(/,/, "", m15)

            c1 = green; if (m1+0 > cpu+0) c1 = red
            c5 = green; if (m5+0 > cpu+0) c5 = red
            c15= green; if (m15+0> cpu+0) c15= red

            printf "%s%-18s%s\t%s%-10s%s\t%s%-10s%s\t%s%-10s%s\t%s%-20s%s\n",
                blue, "系统平均负载", reset,
                c1, m1, reset,
                c5, m5, reset,
                c15, m15, reset,
                yellow, cpu, reset
        }'
    } | column_if_available
}


list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux系统负载/CPU平均负载${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_load
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
