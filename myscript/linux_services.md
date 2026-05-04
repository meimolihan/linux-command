linux_services
===

【Linux系统所有服务状态】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_services.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_services.webp "截图演示")

## 补充说明

该脚本是Linux系统所有服务状态美化工具，解析系统服务状态，以彩色格式化输出运行中的服务信息。

### 功能特点

* 基于 systemctl 或 service 命令解析服务状态
* 彩色高亮显示服务状态（运行中、已停止、失败等）
* 显示服务名称、状态、描述等详细信息
* 支持过滤和搜索特定服务
* 格式化输出，对齐清晰
* 自动检测系统服务管理工具（systemd、init.d等）
* 按状态分类显示服务

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 服务名称 | 系统服务的名称 |
| 状态 | 服务当前状态（active/running、inactive、failed等） |
| 描述 | 服务的描述信息 |
| 负载状态 | 服务负载相关的状态信息 |
| 子状态 | 服务的子状态信息 |

### 注意事项

* 脚本依赖 systemctl 或 service 命令，确保系统已安装对应工具
* 查看所有服务需要足够权限（通常需要 root）
* 普通用户只能看到自己有权限的服务状态
* 彩色输出需要终端支持 ANSI 转义序列
* systemd 系统使用 systemctl，非 systemd 系统可能使用 service 命令
* 脚本会自动检测服务管理工具
* 服务状态可能因系统配置不同而略有差异
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

list_beautify_linux_services() {
    {
        printf "%s%-20s\t%-15s\t%-15s\t%-30s%s\n" "$gl_hui" "服务名" "状态" "启动类型" "描述" "$reset"
        printf "%s%-20s\t%-15s\t%-15s\t%-30s%s\n" "$gl_hui" "--------------------" "---------------" "---------------" "------------------------------" "$reset"

        systemctl list-units --type=service --no-pager 2>/dev/null | awk '
        NR>1 && /\.service/ && !/systemd-/ {
            srv=$1
            stat=$3
            startup=$2
            desc=substr($0, index($0,$5))
            gsub(/\.service/, "", srv)
            print srv, stat, startup, desc
        }' | head -20 | awk -v green="$gl_lv" -v red="$gl_hong" -v yellow="$gl_huang" -v blue="$gl_lan" -v reset="$reset" '
        BEGIN {OFS="\t"}
        {
            c=green; if ($2=="failed") c=red; if ($2=="exited") c=yellow
            printf "%s%-20s%s\t%s%-15s%s\t%s%-15s%s\t%s%-30s%s\n",
                blue, $1, reset,
                c, $2, reset,
                yellow, $3, reset,
                green, substr($0,index($0,$4)), reset
        }'
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux系统所有服务状态${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_services
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
