linux_partition_mount
===

支持手动选择 / 输入分区、自动适配常见文件系统、可自定义挂载点的 Linux 图形化分区挂载工具脚本，能一键完成未挂载分区的检测、选择、确认与挂载操作。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_partition_mount.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_partition_mount.webp "截图演示")

## 补充说明

该脚本是支持手动选择/输入分区、自动适配常见文件系统、可自定义挂载点的 Linux 图形化分区挂载工具，能一键完成未挂载分区的检测、选择、确认与挂载操作。

### 功能特点

* 交互式菜单操作，图形化显示分区信息
* 自动检测未挂载的分区
* 支持手动选择分区或手动输入分区路径
* 自动识别常见文件系统：ext4、ext3、ext2、xfs、ntfs、vfat、fat32、btrfs、f2fs 等
* 支持自定义挂载点路径
* 自动创建挂载目录（如不存在）
* 显示分区详细信息：设备名、大小、文件系统类型、挂载状态
* 彩色输出，清晰展示操作状态
* 挂载前确认，避免误操作
* 显示当前已挂载的分区信息

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 未挂载分区列表 | 显示所有未挂载的分区及详细信息 |
| 分区信息 | 显示设备名、大小、文件系统类型等 |
| 选择提示 | 提示用户选择要挂载的分区 |
| 挂载点输入 | 提示输入自定义挂载点路径 |
| 挂载进度 | 显示正在挂载的分区和目标路径 |
| 挂载结果 | 显示挂载成功或失败状态 |
| 当前挂载信息 | 显示 /proc/mounts 中的挂载记录 |

### 注意事项

* 脚本需要 root 权限执行挂载操作
* 挂载点目录会自动创建（如果不存在）
* 已挂载的分区不会重复挂载
* 支持的文件系统需要系统内核支持对应文件系统驱动
* NTFS 文件系统可能需要安装 ntfs-3g 驱动
* 挂载操作不可逆，卸载需要使用 umount 命令
* 建议挂载到 /mnt 或 /media 下的子目录
* 自动识别文件系统，也可手动指定（如需要）
* 彩色输出需要终端支持 ANSI 转义序列
* 脚本以 bash 编写，确保运行环境支持 bash
* 挂载信息会写入 /etc/fstab 才能实现开机自动挂载（脚本未自动写入）

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

linux_partition_mount() {
    echo ""
    echo -e "${gl_zi}>>> 挂载分区"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    echo -e "${gl_bai}可用的未挂载分区列表：${gl_bai}"
    echo -e "${gl_hui}序号 分区名称   大小      文件系统  挂载点  类型${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    local PARTITION_NAMES=()
    local PARTITION_SIZES=()
    local PARTITION_FSTYPES=()
    local PARTITION_TYPES=()
    local PARTITION_MOUNTS=()
    local i=1
    
    PARTITIONS=()
    while IFS= read -r line; do
        fstype=$(lsblk -lno FSTYPE "/dev/$line" 2>/dev/null)

        if [[ "$fstype" =~ ^(ext[234]|xfs|btrfs|ntfs|vfat|exfat)$ ]]; then
            PARTITIONS+=("$line")
        fi
    done < <(lsblk -lno NAME,TYPE,MOUNTPOINT | awk '$2=="part" && $3=="" {print $1}')

    if [ ${#PARTITIONS[@]} -eq 0 ]; then
        log_error "没有找到未挂载的可用分区！"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        exit_animation
        return
    fi
    
    for idx in "${!PARTITIONS[@]}"; do
        PARTITION_NAME="${PARTITIONS[$idx]}"
        PARTITION_INFO=$(lsblk -lno NAME,SIZE,FSTYPE,MOUNTPOINT,TYPE "/dev/$PARTITION_NAME" 2>/dev/null)
        if [ -n "$PARTITION_INFO" ]; then
            NAME=$(echo "$PARTITION_INFO" | awk '{print $1}')
            SIZE=$(echo "$PARTITION_INFO" | awk '{print $2}')
            FSTYPE=$(echo "$PARTITION_INFO" | awk '{print $3}')
            MOUNTPOINT=$(echo "$PARTITION_INFO" | awk '{print $4}')
            TYPE=$(echo "$PARTITION_INFO" | awk '{print $5}')
            
            echo -e "${gl_huang}  $((idx + 1)).${gl_bai}  $NAME  $SIZE  $FSTYPE  ${MOUNTPOINT:-"未挂载"}  $TYPE"
            
            PARTITION_NAMES[$((idx + 1))]="$NAME"
            PARTITION_SIZES[$((idx + 1))]="$SIZE"
            PARTITION_FSTYPES[$((idx + 1))]="$FSTYPE"
            PARTITION_TYPES[$((idx + 1))]="$TYPE"
            PARTITION_MOUNTS[$((idx + 1))]="$MOUNTPOINT"
        fi
    done
    
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}请选择分区序号 (${gl_huang}1${gl_bai}-${gl_lv}${#PARTITION_NAMES[@]}${gl_bai}) 或输入分区名称(${gl_huang}0${gl_bai}返回): ")" SELECTION
    [ "$SELECTION" = "0" ] && { exit_script; }
    
    if [[ "$SELECTION" =~ ^[0-9]+$ ]] && [ "$SELECTION" -ge 1 ] && [ "$SELECTION" -le ${#PARTITIONS[@]} ]; then
        PARTITION="${PARTITION_NAMES[$SELECTION]}"
        PARTITION_SIZE="${PARTITION_SIZES[$SELECTION]}"
        PARTITION_FSTYPE="${PARTITION_FSTYPES[$SELECTION]}"
    elif [[ -n "$SELECTION" ]]; then
        FOUND=0
        for idx in "${!PARTITIONS[@]}"; do
            if [[ "${PARTITIONS[$idx]}" == "$SELECTION" ]]; then
                PARTITION="$SELECTION"
                PARTITION_INFO=$(lsblk -lno NAME,SIZE,FSTYPE,MOUNTPOINT,TYPE "/dev/$PARTITION" 2>/dev/null)
                if [ -n "$PARTITION_INFO" ]; then
                    PARTITION_SIZE=$(echo "$PARTITION_INFO" | awk '{print $2}')
                    PARTITION_FSTYPE=$(echo "$PARTITION_INFO" | awk '{print $3}')
                fi
                FOUND=1
                break
            fi
        done
        
        if [ $FOUND -eq 0 ]; then
            if lsblk -o NAME | grep -w "$SELECTION" >/dev/null; then
                fstype=$(lsblk -lno FSTYPE "/dev/$SELECTION" 2>/dev/null)
                if [[ ! "$fstype" =~ ^(ext[234]|xfs|btrfs|ntfs|vfat|exfat)$ ]]; then
                    log_error "分区 '$SELECTION' 不是普通文件系统类型或未格式化！"
                    echo -e "${gl_bai}文件系统类型: ${fstype:-"未格式化"}"
                    echo -e "${gl_bai}可用的文件系统类型: ext2/3/4, xfs, btrfs, ntfs, vfat, exfat"
                    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
                    return
                fi
                PARTITION="$SELECTION"
                PARTITION_INFO=$(lsblk -lno NAME,SIZE,FSTYPE,MOUNTPOINT,TYPE "/dev/$PARTITION" 2>/dev/null)
                if [ -n "$PARTITION_INFO" ]; then
                    PARTITION_SIZE=$(echo "$PARTITION_INFO" | awk '{print $2}')
                    PARTITION_FSTYPE=$(echo "$PARTITION_INFO" | awk '{print $3}')
                fi
            else
                log_error "分区 '$SELECTION' 不存在！"
                echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
                exit_animation
                return
            fi
        fi
    else
        log_error "未输入任何内容！"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        exit_animation
        return
    fi

    if mount | grep -q "/dev/$PARTITION "; then
        log_warn "分区已经挂载！"
        echo -e "${gl_bai}当前挂载信息：${gl_bai}"
        mount | grep "/dev/$PARTITION"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        exit_animation
        return
    fi

    echo -e ""
    echo -e "${gl_huang}您选择了分区: ${gl_lv}/dev/$PARTITION${gl_bai}"
    echo -e "${gl_hui}————————————————————————————————————————————————${gl_bai}"
    
    echo -e "${gl_bai}分区详细信息:${gl_bai}"
    lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,TYPE,UUID,LABEL | grep -w "$PARTITION"
    echo -e "${gl_hui}————————————————————————————————————————————————${gl_bai}"
    
    read -r -p "$(echo -e "${gl_bai}是否确认挂载该分区? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        log_info "操作已取消"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        exit_animation
        return
    fi
    
    echo ""

    DEFAULT_MOUNT="/mnt/$PARTITION"
    echo -e "${gl_bai}默认挂载点为: ${gl_huang}${DEFAULT_MOUNT}${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}请输入挂载点路径（直接回车使用默认）: ")" MOUNT_POINT
    [ "$MOUNT_POINT" = "0" ] && { cancel_return "上一级选单"; return 1; }

    if [ -z "$MOUNT_POINT" ]; then
        MOUNT_POINT="$DEFAULT_MOUNT"
    else
        if [[ ! "$MOUNT_POINT" =~ ^/ ]]; then
            log_error "挂载点必须是绝对路径！"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            exit_animation
            return
        fi

        if mountpoint -q "$MOUNT_POINT" 2>/dev/null; then
            log_error "挂载点已被占用！"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            exit_animation
            return
        fi
    fi

    mkdir -p "$MOUNT_POINT"

    mount "/dev/$PARTITION" "$MOUNT_POINT"

    if [ $? -eq 0 ]; then
        log_ok "分区挂载成功: $MOUNT_POINT"
        echo -e ""
        echo -e "${gl_bai}挂载信息：${gl_bai}"
        df -h "$MOUNT_POINT"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    else
        log_warn "自动挂载失败，正在尝试使用常见文件系统类型挂载${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        
        local FS_TYPES=("vfat" "ntfs" "ext4" "ext3" "xfs" "btrfs")
        local mounted=false
        
        for fs_type in "${FS_TYPES[@]}"; do
            mount -t "$fs_type" "/dev/$PARTITION" "$MOUNT_POINT" 2>/dev/null
            if [ $? -eq 0 ]; then
                log_ok "分区挂载成功 (使用 $fs_type 文件系统): $MOUNT_POINT"
                mounted=true
                break
            fi
        done
        
        if [ "$mounted" = false ]; then
            log_error "分区挂载失败！可能的原因："
            log_error "1. 文件系统损坏或不支持"
            log_error "2. 需要特殊挂载参数"
            log_error "3. 权限不足"
            echo ""
            log_warn "建议检查："
            log_warn "1. 使用 'blkid /dev/$PARTITION' 查看文件系统UUID和类型"
            log_warn "2. 使用 'sudo dmesg | tail' 查看详细错误信息"
            log_warn "3. 使用 'file -sL /dev/$PARTITION' 检测文件系统"
            
            rmdir "$MOUNT_POINT" 2>/dev/null && log_info "已清理挂载点目录"
        else
            echo -e ""
            echo -e "${gl_bai}挂载信息：${gl_bai}"
            df -h "$MOUNT_POINT"
        fi
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    fi
    break_end
}

linux_partition_mount
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
