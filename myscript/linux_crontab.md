linux_crontab
===

【Linux定时任务列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_crontab.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_crontab.webp "截图演示")

## 补充说明

该脚本用于美化显示 Linux 定时任务（crontab）列表，基于 `crontab -l` 命令实现，适合查看和管理用户定时任务的场景。

### 功能特点

* 彩色输出：任务序号（青色）、执行时间（蓝色）、命令（绿色）使用不同颜色区分
* 表格格式化：自动使用 `column` 命令对齐输出
* 时间解析：自动解析 cron 表达式，显示可读的时间描述
* 排序显示：按任务在 crontab 中的顺序排列

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 序号 | 任务在 crontab 中的行号 |
| 分钟 | 分钟字段（0-59） |
| 小时 | 小时字段（0-23） |
| 日期 | 日期字段（1-31） |
| 月份 | 月份字段（1-12） |
| 星期 | 星期字段（0-7，0和7均为周日） |
| 命令 | 要执行的命令 |

### 注意事项

* 显示的是当前用户的 crontab 任务（非系统级）
* 需要用户有查看 crontab 的权限
* 如未配置任何任务，会提示"no crontab for user"
* 如需编辑任务，使用 `crontab -e` 命令

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

list_beautify_linux_crontab() {
    {
        printf "%s%-12s\t%-8s\t%-8s\t%-8s\t%-12s\t%-40s%s\n" \
            "$gl_hui" "分钟" "小时" "日期" "月份" "星期" "执行命令" "$reset"
        printf "%s%-12s\t%-8s\t%-8s\t%-8s\t%-12s\t%-40s%s\n" \
            "$gl_hui" "------------" "--------" "--------" "--------" "------------" "----------------------------------------" "$reset"

        crontab -l 2>/dev/null | grep -v '^#' | awk NF | \
            awk -v green="$gl_lv" -v yellow="$gl_huang" \
                -v blue="$gl_lan" -v reset="$reset" '
        BEGIN {OFS="\t"}
        {
            if ($1 ~ /^@/) {
                minute = $1
                hour = ""
                day = ""
                month = ""
                week = ""
                cmd = substr($0, index($0, $2))
            } else {
                minute = $1
                hour = $2
                day = $3
                month = $4
                week = $5
                cmd = substr($0, index($0, $6))
            }
            printf "%s%-12s%s\t%s%-8s%s\t%s%-8s%s\t%s%-8s%s\t%s%-12s%s\t%s%-40s%s\n",
                blue, minute, reset,
                yellow, hour, reset,
                blue, day, reset,
                yellow, month, reset,
                blue, week, reset,
                green, cmd, reset
        }'
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux定时任务列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_crontab
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
