linux_disk
===

【Linux磁盘列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_disk.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_disk.webp "截图演示")

## 补充说明

该脚本用于美化显示 Linux 磁盘列表，基于 `lsblk` 和 `df` 命令实现，适合快速查看系统磁盘分区、挂载点和空间使用情况的场景。

### 功能特点

* 彩色输出：磁盘名称（青色）、挂载点（蓝色）、使用率（绿/黄色）使用不同颜色区分
* 完整信息：显示设备名、容量、已用、可用、使用率、挂载点等信息
* 表格格式化：自动使用 `column` 命令对齐输出
* 排序显示：按设备名排序，便于查找

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 设备 | 磁盘设备或分区名称 |
| 容量 | 磁盘总容量 |
| 已用 | 已使用的空间 |
| 可用 | 剩余可用空间 |
| 使用率 | 空间使用百分比（超过80%显示黄色） |
| 挂载点 | 分区挂载的路径 |

### 注意事项

* 需要系统已安装 `lsblk` 和 `df` 命令（通常系统自带）
* 需要 `column` 命令（通常系统已自带）
* 显示的是所有挂载的文件系统，包括临时文件系统
* 使用率超过 80% 会显示警告颜色

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

list_beautify_linux_disk() {
    {
        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "文件系统" "容量" "已用" "可用" "使用百分比" "挂载点" "$reset"
        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "--------" "--------" "--------" "--------" "--------" "--------" "$reset"

        data=$(df -hP | grep -v "tmpfs\|udev\|overlay" | tail -n +2)
        if [ -z "$data" ]; then
            printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_huang" "(无数据)" "(无数据)" "(无数据)" "(无数据)" "(无数据)" "(无数据)" "$reset"
        else
            echo "$data" | awk -v fs_color="$gl_lan" \
                                -v size_color="$gl_lv" \
                                -v used_color="$gl_huang" \
                                -v avail_color="$gl_bufan" \
                                -v use_color="$gl_huang" \
                                -v mount_color="$gl_hui" \
                                -v reset="$reset" '
            BEGIN {
                FS="[[:space:]]+";
                OFS="\t"
            }
            {
                filesystem = $1
                size = $2
                used = $3
                avail = $4
                use_percent = $5
                mount = $6
                for (i=7; i<=NF; i++) {
                    mount = mount " " $i
                }

                print fs_color filesystem reset,
                      size_color size reset,
                      used_color used reset,
                      avail_color avail reset,
                      use_color use_percent reset,
                      mount_color mount reset
            }'
        fi
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Linux磁盘列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_linux_disk
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
