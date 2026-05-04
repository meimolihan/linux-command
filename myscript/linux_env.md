linux_env
===

【Linux系统环境变量】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_env.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_env.webp "截图演示")

## 补充说明

该脚本用于美化显示 Linux 系统关键环境变量，基于 `env` 命令实现，适合需要快速查看系统环境配置（如 PATH、用户、家目录、Shell 类型等）的场景。

### 功能特点

* 彩色输出：变量名（蓝色）和变量值（绿色）使用不同颜色区分
* 筛选显示：仅显示常用环境变量，避免输出过多信息
* 表格格式化：固定列宽，自动对齐输出
* 排序输出：按变量名首字母顺序排列，便于查找

### 显示的环境变量

脚本默认显示以下环境变量：

| 变量名 | 说明 |
| --- | --- |
| PATH | 可执行程序搜索路径 |
| USER | 当前登录用户名 |
| HOME | 当前用户家目录路径 |
| SHELL | 当前使用的 Shell 类型 |
| PWD | 当前工作目录 |
| LANG | 系统语言与编码设置 |
| HOSTNAME | 主机名 |
| TERM | 终端类型 |

### 注意事项

* 脚本仅显示预定义的常用环境变量，如需查看全部可使用 `env` 命令
* 需要 `column` 命令（通常系统已自带）
* 变量值过长时可能会被截断显示
* 可在脚本中修改变量列表，增加或减少需要显示的变量

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

list_beautify_linux_env() {
    {
        printf "%s%-20s\t%-30s%s\n" "$gl_hui" "变量名" "变量值" "$reset"
        printf "%s%-20s\t%-30s%s\n" "$gl_hui" "------------------------------" "--------------------------------------------------" "$reset"

        env | grep -E '^(PATH|USER|HOME|SHELL|PWD|LANG|HOSTNAME|TERM)' | sort | \
            awk -v green="$gl_lv" -v blue="$gl_lan" -v reset="$reset" '
        BEGIN {FS="="; OFS="\t"}
        {
            key = $1
            val = substr($0, index($0, $2))
            printf "%s%-20s%s\t%s%-30s%s\n",
                blue, key, reset,
                green, val, reset
        }'
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux系统环境变量${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_env
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
