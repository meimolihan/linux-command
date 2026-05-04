linux_user
===

【Linux用户列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_user.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_user.webp "截图演示")

## 补充说明

### 功能描述
美化显示Linux系统所有用户列表，包括用户名、家目录、用户组和sudo权限信息，适用于快速了解系统用户配置的场景。

### 功能特点
- 从/etc/passwd读取所有用户信息，确保数据准确
- 使用groups命令获取每个用户所属的用户组信息
- 检测用户的sudo权限（是否拥有ALL权限）
- 使用不同颜色区分不同字段，提升可读性
- 支持column命令美化表格输出，无column时退化为普通输出

### 输出说明
| 字段 | 说明 |
|------|------|
| 用户名 | 系统用户名，如root、www-data等 |
| 用户权限 | 用户的家目录路径和默认shell |
| 用户组 | 用户所属的所有用户组 |
| sudo权限 | Yes表示该用户拥有sudo ALL权限，No表示无 |

### 注意事项
- 需要读取/etc/passwd文件的权限（一般用户均可读取）
- sudo权限检测使用`sudo -n -lU`命令，可能需要root权限才能准确检测
- 如果系统没有groups命令，用户组信息可能显示"(无组信息)"
- 某些系统用户（如daemon、bin等）也会显示在列表中

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

list_beautify_linux_user() {
    {
        printf "%s%-24s\t%-34s\t%-20s\t%-10s%s\n" "$gl_hui" "用户名" "用户权限" "用户组" "sudo权限" "$reset"
        printf "%s%-24s\t%-34s\t%-20s\t%-10s%s\n" "$gl_hui" "------------------------" "----------------------------------" "--------------------" "----------" "$reset"

        while IFS=: read -r username _ _ _ _ homedir shell; do
            groups_info=$(groups "$username" 2>/dev/null | cut -d: -f2- | sed 's/^ //')
            [ -z "$groups_info" ] && groups_info="(无组信息)"

            sudo_status="No"
            sudo_output=$(sudo -n -lU "$username" 2>/dev/null)
            if [ -n "$sudo_output" ]; then
                if echo "$sudo_output" | grep -qE '\(ALL( : ALL)?\) ALL'; then
                    sudo_status="Yes"
                fi
            fi

            printf "%s\t%s\t%s\t%s\n" "$username" "$homedir" "$groups_info" "$sudo_status"
        done </etc/passwd | awk -v green="$gl_lv" -v yellow="$gl_huang" -v blue="$gl_lan" -v cyan="$gl_bufan" -v reset="$reset" '
        BEGIN {FS="\t"; OFS="\t"}
        {
            print green $1 reset, yellow $2 reset, blue $3 reset, cyan $4 reset
        }'
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux用户列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_user
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
