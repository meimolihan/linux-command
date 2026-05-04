batch_replace
===

递归批量替换当前目录及子目录下指定类型文件中的字符串，支持交互与传参模式。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/batch_replace.sh) 'set -uo pipefail' 'set -euo pipefail' md
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/batch_replace.webp "截图演示")

## 补充说明

该脚本用于递归批量替换当前目录及子目录下指定类型文件中的字符串，基于 find、sed 命令实现，适合需要批量修改配置文件、代码文件的场景。

### 功能特点

* 支持交互模式和传参模式两种使用方式
* 可自定义文件类型：支持单个或多个扩展名（空格分隔）
* 兼容 Linux/macOS 系统：自动检测系统并适配 sed 语法
* 替换前预览配置：显示旧字符串、新字符串、处理文件类型
* 二次确认机制：防止误操作，需用户确认后才执行替换
* 支持任意特殊字符：无需转义，直接输入即可
* 全局替换模式：文件中所有匹配的字符串都会被替换

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 替换配置预览 | 显示旧内容、新内容、处理文件类型 |
| 替换范围 | 提示当前目录及子目录 |
| 处理进度 | 显示各类型文件的处理数量 |
| 状态提示 | [信息]、[成功]、[警告]、[错误] 等彩色提示信息 |

### 注意事项

* 替换操作不可逆，建议在操作前备份重要文件
* 支持的文件类型需明确指定扩展名（如 sh、md、txt 等）
* macOS 系统使用 sed -i "" 语法，Linux 系统使用 sed -i 语法
* 如果未指定文件类型，默认处理 sh 和 md 文件
* 替换是全局的，同一行中的所有匹配项都会被替换
* 特殊字符（如 /、& 等）无需转义，脚本使用 # 作为 sed 分隔符

## 脚本源码

> **不传参 = 进入交互模式**
>
> 1. 替换 sh + md 文件（默认类型）
>
> > ./replace.sh "旧内容" "新内容"
>
> 2. 只替换 txt 文件
>
> > ./replace.sh "旧内容" "新内容" txt
>
> 3. 同时替换 py、js、html 文件
>
> > ./replace.sh "旧内容" "新内容" py js html

```bash
#!/bin/bash
set -uo pipefail

gl_hui='\033[38;5;59m'
gl_hong='\033[38;5;9m'
gl_lv='\033[38;5;10m'
gl_huang='\033[38;5;11m'
gl_lan='\033[38;5;32m'
gl_bai='\033[38;5;15m'
gl_zi='\033[38;5;13m'
gl_bufan='\033[38;5;14m'

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

handle_y_n() {
    echo -e "${gl_hong}无效的选择，请输入 ${gl_bai}(${gl_lv}y${gl_bai}或${gl_hong}N${gl_bai})${gl_hong}。${gl_bai}"
    sleep 1
    echo -e "${gl_huang}无效的选择，请输入 ${gl_bai}(${gl_lv}y${gl_bai}或${gl_hong}N${gl_bai})${gl_huang}。${gl_bai}"
    sleep 1
    echo -e "${gl_lv}无效的选择，请输入 ${gl_bai}(${gl_lv}y${gl_bai}或${gl_hong}N${gl_bai})${gl_lv}。${gl_bai}"
    sleep 0.5
    return 2
}

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键继续${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai} \c"
    read -r -n 1 -s -r -p ""
    echo ""
    clear
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
    echo -ne "${gl_lv}即将退出 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    echo ""
    clear
}

sleep_fractional() {
    local seconds=$1
    if sleep "$seconds" 2>/dev/null; then return 0; fi
    if command -v perl >/dev/null 2>&1; then perl -e "select(undef, undef, undef, $seconds)"; return 0; fi
    if command -v python3 >/dev/null 2>&1; then python3 -c "import time; time.sleep($seconds)"; return 0; fi
    if command -v python >/dev/null 2>&1; then python -c "import time; time.sleep($seconds)"; return 0; fi
    local int_seconds=$(echo "$seconds" | awk '{print int($1+0.999)}')
    sleep "$int_seconds"
}

cancel_return() {
    local menu_name="${1:-上一级选单}"
    echo -e "${gl_lv}即将返回到 ${gl_huang}${menu_name}${gl_lv}${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai} \c"
    sleep 0.6
    echo ""
    clear
}

show_help() {
    clear
    echo -e "${gl_zi}>>> 工具使用说明${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "功能说明：递归替换当前目录下指定类型文件中的字符串"
    echo -e ""
    log_info "使用模式："
    log_info "  1. 交互模式：按提示输入 旧字符串、新字符串、文件类型"
    log_info "  2. 传参模式：./脚本.sh 旧字符串 新字符串 文件类型"
    echo -e ""
    log_info "使用示例："
    log_info "  1. 替换 sh/md 文件：./replace.sh old new"
    log_info "  2. 替换 txt/py 文件：./replace.sh old new txt py"
    log_info "  3. 替换所有类型：./replace.sh old new sh md txt py js html"
    echo -e ""
    log_info "支持特性："
    log_info "  - 兼容 Linux/macOS 系统"
    log_info "  - 支持任意特殊字符，无需转义"
    log_info "  - 自定义文件类型，空格分隔"
    log_info "  - 替换前二次确认，防止误操作"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e ""
}

batch_replace_str() {
    clear
    show_help
    echo -e "${gl_zi}>>> 批量字符串替换工具${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local OLD_STR NEW_STR FILE_TYPES
    if [ $# -ge 2 ]; then
        OLD_STR="$1"
        NEW_STR="$2"
        FILE_TYPES="${3:-sh}"
        log_info "已通过命令行传参获取配置"
    else
        read -r -e -p "$(echo -e "${gl_bai}请输入要替换的旧字符串(${gl_hong}0${gl_bai}退出): ")" OLD_STR
        [ "$OLD_STR" = "0" ] && { exit_script; }

        read -r -e -p "$(echo -e "${gl_bai}请输入替换后的新字符串(${gl_hong}0${gl_bai}退出): ")" NEW_STR
        [ "$NEW_STR" = "0" ] && { exit_script; }

        read -r -e -p "$(echo -e "${gl_bai}请输入要处理的文件后缀(${gl_huang}空格分隔，默认：sh${gl_bai})(${gl_hong}0${gl_bai}退出): ")" FILE_TYPES
        [ "$FILE_TYPES" = "0" ] && { exit_script; }
        FILE_TYPES=${FILE_TYPES:-sh md}
    fi

    if [[ -z "${OLD_STR}" || -z "${NEW_STR}" ]]; then
        log_error "旧字符串和新字符串不能为空，请重新操作！"
        sleep_fractional 1.5
        batch_replace_str
        return 1
    fi

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "替换配置预览"
    log_info "旧内容：${gl_huang}${OLD_STR}${gl_bai}"
    log_info "新内容：${gl_lv}${NEW_STR}${gl_bai}"
    log_info "处理文件类型：${gl_lan}${FILE_TYPES}${gl_bai}"
    log_warn "替换范围：当前目录及子目录下匹配的文件"
    log_warn "替换模式：全局替换（所有匹配项都会被替换）"

    read -r -e -p "$(echo -e "${gl_bai}是否确认执行替换?(${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" choice
    case "${choice}" in
        [Yy])
            log_info "开始执行批量替换，请稍候${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            
            local sed_i=(-i)
            if [[ "$(uname -s)" == "Darwin" ]]; then
                sed_i=(-i "")
                log_info "检测到 macOS 系统，自动适配 sed 语法"
            fi

            for ext in $FILE_TYPES; do
                ext=${ext#.}
                count=$(find . -type f -name "*.${ext}" | wc -l | tr -d ' ')
                if [ "$count" -gt 0 ]; then
                    find . -type f -name "*.${ext}" -exec sed "${sed_i[@]}" "s#${OLD_STR}#${NEW_STR}#g" {} +
                    log_ok "已处理 ${count} 个 .${ext} 文件"
                else
                    log_warn "未找到 .${ext} 文件，跳过该类型"
                fi
            done

            log_ok "✅ 批量替换操作全部完成！"
            ;;
        [Nn])
            log_warn "已取消替换操作"
            sleep_fractional 1
            ;;
        *)
            handle_y_n
            batch_replace_str
            return 1
            ;;
    esac

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

if [ $# -ge 2 ]; then
    batch_replace_str "$1" "$2" "${*:3}"
else
    batch_replace_str
fi
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
