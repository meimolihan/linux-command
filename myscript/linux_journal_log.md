linux_journal_log
===

【Linux最近系统日志】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_journal_log.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_journal_log.webp "截图演示")

## 补充说明

该脚本用于美化显示 Linux 系统日志（journalctl），基于 `journalctl` 命令实现，适合查看系统启动日志、服务日志等场景。

### 功能特点

* 彩色输出：时间（青色）、服务名（蓝色）、日志级别（绿/黄/红色）使用不同颜色区分
* 表格格式化：自动使用 `column` 命令对齐输出
* 时间筛选：支持按时间范围筛选日志
* 服务筛选：支持按服务名称筛选日志
* 分页显示：日志过长时自动分页显示

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 时间 | 日志产生的时间 |
| 服务/组件 | 产生日志的服务或组件名称 |
| 日志级别 | info/warning/error 等 |
| 消息 | 日志具体内容 |

### 注意事项

* 需要 systemd 系统（大多数现代 Linux 发行版）
* 查看某些服务日志可能需要 root 权限
* 日志量较大时建议使用筛选条件
* 可使用 `journalctl --disk-usage` 查看日志占用空间

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

list_beautify_linux_journal_log() {
    {
        LINE=${1:-50}

        journalctl -n $LINE --no-pager 2>/dev/null | awk -v gray="$gl_hui" -v green="$gl_lv" \
        -v yellow="$gl_huang" -v purple="$gl_zi" -v red="$gl_hong" -v reset="$reset" '
        BEGIN {
            OFS = "\t"
            print gray "时间\t主机名\t服务进程\t日志信息" reset
            print gray "----------\t----------\t----------\t----------------------------------------" reset
        }
        /^$/ { next }
        {
            time = $1 " " $2 " " $3
            host = $4
            service = $5
            gsub(/:$/, "", service)
            msg = substr($0, index($0, $6))

            color = yellow
            if (msg ~ /error|Error|ERROR|fail|Fail|FAIL|warning|Warning|WARNING/) color = red

            print gray time reset, purple host reset, green service reset, color msg reset
        }' | column_if_available
    }
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> 美化Linux最近系统日志${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_journal_log
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
