universal_backup
===

免交互通用目录备份脚本，支持指定源目录与备份目录，自动创建带时间戳的压缩备份，并按设定数量保留最新备份、清理旧文件。

## 一键脚本

- 配合 `1panel` 定时备份某个目录完美。

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/universal_backup.sh)  /vol1/1000/compose /vol2/1000/file/myfile/compose/backup 7
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/universal_backup.webp "截图演示")

## 补充说明

该脚本是免交互通用目录备份脚本，支持指定源目录与备份目录，自动创建带时间戳的压缩备份，并按设定数量保留最新备份、清理旧文件。

### 功能特点

* 免交互设计，适合配合1panel等定时任务使用
* 支持传参指定源目录、备份目录和保留备份数量
* 自动生成带时间戳的tar.gz压缩备份文件
* 默认保留3个最新备份，可自定义保留数量
* 自动清理超过保留数量的老备份文件
* 检查源目录和备份目录的存在性和写权限
* 显示备份文件的详细信息（大小、时间等）
* 彩色日志输出，清晰展示操作状态

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 源目录 | 显示要备份的源目录路径 |
| 备份目录 | 显示备份文件存放的目录路径 |
| 保留备份数量 | 显示设置的保留备份数量（默认3） |
| 备份前缀 | 显示备份文件名的前缀（源目录的basename） |
| 备份文件 | 显示创建的备份文件名和大小 |
| 清理结果 | 显示删除的旧备份文件数量和信息 |
| 当前备份列表 | 显示保留的最新备份文件列表及详细信息 |

### 注意事项

* 脚本需要至少2个参数：源目录和备份目录，第三个参数可选（保留数量，默认3）
* 源目录必须存在，否则脚本会报错退出
* 备份目录需要写权限，否则无法创建备份
* 依赖tar命令进行压缩，确保系统已安装tar
* 备份文件格式为tar.gz，使用gzip压缩
* 保留数量参数如果未指定，默认保留3个最新备份
* 脚本完全免交互，适合自动化任务和定时备份
* 备份文件按时间排序，保留最新的N个，删除最旧的
* 配合1panel等面板时，可作为定时备份任务使用
* 备份前缀自动使用源目录的basename，确保文件名唯一性

## 脚本源码

- 传参：`./脚本名.sh  <源目录> <备份目录> [保留备份数量]`

```bash
#!/bin/bash
set -uo pipefail

gl_hui='\e[37m'
gl_hong='\033[31m'
gl_lv='\033[32m'
gl_huang='\033[33m'
gl_lan='\033[34m'
gl_zi='\033[35m'
gl_bufan='\033[96m'
gl_bai='\033[97m'

log_info()  { echo -e "${gl_lan}[信息]${gl_bai} $*"; }
log_ok()    { echo -e "${gl_lv}[成功]${gl_bai} $*"; }
log_warn()  { echo -e "${gl_huang}[警告]${gl_bai} $*"; }
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; }

echo -e "${gl_bai}
╔══════════════════════════════════════════════════════════════════════════════╗
║    ${gl_bai}通用目录备份脚本（免交互版本） ${gl_huang}★ v2.3 ★${gl_bai}                                   ║
║    ${gl_bai}自动保留指定数量 · 彩色日志 · 完全免交互                                  ║
║    ${gl_huang}脚本功能:${gl_bai}                                                                 ║
║       ${gl_huang}- ${gl_bai}备份指定源目录                                                       ║
║       ${gl_huang}- ${gl_bai}自动保留指定数量的备份文件（${gl_huang}默认3个${gl_bai}）                                ║
║       ${gl_huang}- ${gl_bai}生成带时间戳的备份文件                                               ║
║       ${gl_huang}- ${gl_bai}完全免交互，适合自动化任务                                           ║
║    ${gl_bai}使用方法: ${gl_zi}bash universal_backup.sh${gl_bai} <${gl_hong}源目录${gl_bai}> <${gl_huang}备份目录${gl_bai}> [${gl_lv}保留备份数量${gl_bai}]     ║
║    ${gl_bai}使用示例: ${gl_zi}bash universal_backup.sh ${gl_hong}/path/to/source${gl_bai} ${gl_huang}/path/to/backup${gl_bai} ${gl_lv}5${gl_bai}      ║
╚══════════════════════════════════════════════════════════════════════════════╝
${gl_bai}"

if [ $# -lt 2 ]; then
    log_error "必须指定源目录和备份目录"
    log_info "使用方法: ${gl_zi}$0${gl_bai} <${gl_hong}源目录${gl_bai}> <${gl_huang}备份目录${gl_bai}> [${gl_lv}保留备份数量${gl_bai}]"
    log_info "示例: ${gl_zi}$0${gl_bai} ${gl_hong}/path/to/source${gl_bai} ${gl_huang}/path/to/backup${gl_bai} ${gl_lv}5${gl_bai}"
    exit 1
fi

BACKUP_SRC_DIR="$1"
BACKUP_DEST="$2"
KEEP_COUNT=${3:-3}

BACKUP_PREFIX=$(basename "$BACKUP_SRC_DIR")
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ ! -d "$BACKUP_SRC_DIR" ]; then
    log_error "源目录 '$BACKUP_SRC_DIR' 不存在！"
    exit 1
fi

echo -e "${gl_huang}>>> 创建备份目录中${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
mkdir -p "$BACKUP_DEST"

if [ $? -ne 0 ]; then
    log_error "无法创建备份目录 '$BACKUP_DEST'，请检查权限！"
    exit 1
fi

if [ ! -w "$BACKUP_DEST" ]; then
    log_error "没有写权限到备份目录 '$BACKUP_DEST'！"
    exit 1
fi

echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
log_info "${gl_bai}源目录: ${gl_hong}$BACKUP_SRC_DIR${gl_bai}"
log_info "${gl_bai}备份目录: ${gl_huang}$BACKUP_DEST${gl_bai}"
log_info "${gl_bai}保留备份数量: ${gl_lv}$KEEP_COUNT${gl_bai}"
log_info "${gl_bai}备份前缀: ${gl_zi}$BACKUP_PREFIX${gl_bai}"

echo -e ""
echo -e "${gl_huang}>>> 创建备份文件中${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
BACKUP_FILE="${BACKUP_DEST}/${BACKUP_PREFIX}_${TIMESTAMP}.tar.gz"
log_warn "${gl_bai}正在创建备份文件: ${gl_huang}$(basename "$BACKUP_FILE")${gl_bai}"
tar -czf "$BACKUP_FILE" -C "$(dirname "$BACKUP_SRC_DIR")" "$(basename "$BACKUP_SRC_DIR")"

if [ $? -eq 0 ]; then
    log_ok "${gl_bai}备份成功完成: ${gl_lv}$(basename "$BACKUP_FILE")${gl_bai}"
    log_ok "${gl_bai}备份大小: ${gl_lv}$(du -h "$BACKUP_FILE" | cut -f1)${gl_bai}"
else
    log_error "备份失败，请检查错误信息"
    exit 1
fi

echo -e ""
echo -e  "${gl_huang}>>> 清理旧备份文件中${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
cd "$BACKUP_DEST" || exit

BACKUP_FILES=($(ls -1t ${BACKUP_PREFIX}_*.tar.gz 2>/dev/null))
FILE_COUNT=${#BACKUP_FILES[@]}

if [ $FILE_COUNT -gt $KEEP_COUNT ]; then
    for ((i = $KEEP_COUNT; i < $FILE_COUNT; i++)); do
        log_warn "${gl_bai}删除旧备份: ${gl_huang}${BACKUP_FILES[i]}${gl_bai}"
        rm -f "${BACKUP_FILES[i]}"
    done
    log_ok "${gl_bai}已删除 ${gl_huang}$(($FILE_COUNT - $KEEP_COUNT)) ${gl_bai}个旧备份文件"
fi

echo -e ""
echo -e  "${gl_huang}>>> 当前备份文件列表"
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
echo -e "  ${gl_lv}•${gl_bai} 备份目录: ${gl_huang}$BACKUP_DEST${gl_bai}"
ls -1t ${BACKUP_PREFIX}_*.tar.gz 2>/dev/null | head -n $KEEP_COUNT | while read -r file; do
    size=$(du -h "$file" | cut -f1)
    date=$(date -r "$file" "+%Y-%m-%d %H:%M:%S")
    echo -e "  ${gl_zi}•${gl_bai} ${gl_hui}$file${gl_bai}  ${gl_huang}($size)${gl_bai}  ${gl_bufan}$date${gl_bai}"
done

echo -e ""
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
CURRENT_COUNT=$(ls -1 ${BACKUP_PREFIX}_*.tar.gz 2>/dev/null | wc -l)
log_ok "备份完成! 总共保留 ${gl_lv}$CURRENT_COUNT${gl_bai} 个备份文件"
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
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
