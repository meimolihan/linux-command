linux_partition_unmount
===

自动列出可卸载的普通磁盘分区，支持按序号或设备路径选择、二次确认卸载，失败时给出提示并可清理挂载点。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_partition_unmount.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_partition_unmount.webp "截图演示")

## 补充说明

该脚本用于自动列出可卸载的普通磁盘分区，支持按序号或设备路径选择、二次确认卸载，失败时给出提示并可清理挂载点。

### 功能特点

* 自动检测已挂载的普通磁盘分区（排除系统关键分区）
* 交互式菜单：按序号或输入设备路径选择要卸载的分区
* 二次确认卸载，避免误操作
* 卸载失败时给出错误提示
* 支持清理空的挂载点目录
* 彩色输出，清晰展示可卸载分区列表
* 显示分区详细信息：设备名、挂载点、文件系统类型等
* 卸载前检查分区是否正在使用

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 可卸载分区列表 | 显示所有可卸载的普通磁盘分区 |
| 分区信息 | 显示设备名、挂载点、文件系统类型等 |
| 选择提示 | 提示用户选择要卸载的分区 |
| 卸载进度 | 显示正在卸载的分区 |
| 卸载结果 | 显示卸载成功或失败状态 |
| 挂载点清理 | 显示是否清理空的挂载点目录 |

### 注意事项

* 脚本需要 root 权限执行卸载操作
* 自动排除系统关键分区（如 /、/boot、/home 等）
* 卸载前建议确认分区未被使用，否则会失败
* 卸载后可选的清理挂载点目录（如果为空）
* 彩色输出需要终端支持 ANSI 转义序列
* 脚本以 bash 编写，确保运行环境支持 bash
* 卸载操作不可逆，请确认后再执行
* 部分分区可能因设备映射器（LVM、dm-0 等）有特殊处理
* 脚本不会卸载系统运行所需的关键分区

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

log_info()  { echo -e "${gl_lan}[信息]${gl_bai} $*"; }
log_ok()    { echo -e "${gl_lv}[成功]${gl_bai} $*"; }
log_warn()  { echo -e "${gl_huang}[警告]${gl_bai} $*"; }
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; }

handle_invalid_input() {
    echo -ne "\r${gl_huang}无效的输入,请重新输入! ${gl_zi} 1 ${gl_huang} 秒后返回"
    sleep 1
    echo -e "\r${gl_lv}无效的输入,请重新输入! ${gl_zi}0${gl_lv} 秒后返回"
    sleep 0.5
    return 2
}

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键继续${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai} \c"
    read -r -n 1 -s -p ""
    echo ""
    clear
}

sleep_fractional() {
    local seconds=$1
    if sleep "$seconds" 2>/dev/null; then return 0; fi
    if command -v python3 >/dev/null 2>&1; then python3 -c "import time; time.sleep($seconds)"; return 0; fi
    local int_seconds=$(echo "$seconds" | awk '{print int($1+0.999)}')
    sleep "$int_seconds"
}

exit_script() {
    echo ""
    echo -ne "${gl_hong}感谢使用，再见！${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    clear
    exit 0
}

exit_animation() {
    echo -ne "\r${gl_lv}即将退出 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    echo ""
}

linux_partition_unmount() {
    echo ""
    echo -e "${gl_zi}>>> 卸载分区"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local DEV_ARR=()
    local MP_ARR=()
    local FS_ARR=()
    local SIZE_ARR=()
    local i=1

    printf "${gl_hui}%-2s    %-14s    %-11s    %-38s    %s${gl_bai}\n" \
      "序号" "设备路径" "容量" "挂载点" "文件系统"
    printf "${gl_hui}%-4s    %-10s    %-8s    %-35s    %s${gl_bai}\n" \
      "----" "----------" "---------" "----------------------------------" "----------"

    while read -r dev mp fs; do
        [[ "$dev" != /dev/sd* ]] && continue
        [[ "$mp" == "/" ]] && continue
        [[ "$mp" =~ ^/vol[0-9]?$ ]] && continue
        [[ -z "$mp" ]] && continue

        size=$(lsblk -dno SIZE "$dev" | tr -d ' ')

        DEV_ARR[$i]="$dev"
        MP_ARR[$i]="$mp"
        FS_ARR[$i]="$fs"
        SIZE_ARR[$i]="$size"

        printf "${gl_huang}%-4s${gl_bai}    %-10s    %-9s    %-35s    %s\n" \
          "${i}." "$dev" "$size" "$mp" "$fs"

        ((i++))
    done < <(mount | grep ^/dev/ | grep -v loop | sort | awk '{print $1,$3,$5}')

    if [ ${#DEV_ARR[@]} -eq 0 ]; then
        log_warn "没有可卸载的分区！"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        exit_animation
        return
    fi

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}请选择卸载序号 (${gl_huang}1-${#DEV_ARR[@]}${gl_bai}) 或 输入设备路径(如/dev/sdd1) (${gl_huang}0${gl_bai}返回): ")" sel

    [ "$sel" = "0" ] && { exit_script; }

    local target_dev=""
    if [[ "$sel" =~ ^[0-9]+$ ]] && [ "$sel" -ge 1 ] && [ "$sel" -le ${#DEV_ARR[@]} ]; then
        target_dev="${DEV_ARR[$sel]}"
    elif [[ -b "$sel" ]]; then
        target_dev="$sel"
    else
        log_error "输入无效！"
        exit_animation
        return
    fi

    local target_mp=$(mount | grep -w "$target_dev" | awk '{print $3}')
    if [ -z "$target_mp" ]; then
        log_warn "该设备未挂载！"
        exit_animation
        return
    fi

    echo -e ""
    echo -e "${gl_huang}将要卸载：${gl_lv}$target_dev${gl_bai}"
    echo -e "${gl_huang}挂载点：${gl_lv}$target_mp${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -p "$(echo -e "${gl_bai}确认卸载？(${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
    [[ ! "$confirm" =~ ^[Yy]$ ]] && { log_info "已取消"; exit_animation; return; }

    echo ""
    umount "$target_dev" 2>/dev/null

    if [ $? -eq 0 ]; then
        log_ok "卸载成功：$target_mp"
        rmdir "$target_mp" 2>/dev/null
    else
        log_error "卸载失败！设备忙或权限不足"
    fi

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

linux_partition_unmount
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
