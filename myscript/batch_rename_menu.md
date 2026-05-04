batch_rename_menu
===

批量文件重命名脚本，支持添加前后缀、替换字符、序号重命名、大小写转换、去空格等一键批量操作。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/batch_rename_menu.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/batch_rename_menu.webp "截图演示")

## 补充说明

该脚本用于批量重命名当前目录下的文件，基于 bash、find、mv 命令实现，适合需要批量整理文件名的场景。

### 功能特点

* 支持 7 种重命名模式：添加前缀、添加后缀、替换字符串、序号重命名、大小写转换、移除字符、删除空格
* 智能文件列表显示：自动限制显示数量（≤20个），避免输出过长
* 交互式预览：重命名前显示新旧文件名对比，需用户确认后执行
* 彩色输出：使用 ANSI 颜色码区分信息、成功、警告、错误等提示
* 支持大小写转换的 4 种模式：小写、大写、首字母大写、单词首字母大写
* 序号重命名支持多种模板：###（三位）、##（两位）、#（一位）、%d（数字）

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 当前目录 | 显示当前工作目录路径 |
| 文件数量 | 统计当前目录下的文件总数 |
| 文件列表 | 显示文件名（最多20个） |
| 预览结果 | 显示新旧文件名对比（原文件名 -> 新文件名） |
| 重命名数量 | 显示成功重命名的文件数量 |
| 状态提示 | [信息]、[成功]、[警告]、[错误] 等彩色提示信息 |

### 注意事项

* 脚本仅处理当前目录下的文件，不递归处理子目录
* 重命名操作不可逆，建议在操作前备份重要文件
* 序号重命名会按照文件在系统中的顺序进行编号，不一定是按文件名排序
* 大小写转换功能依赖 Bash 4.0+ 的参数扩展特性（如 `${var,,}`、`${var^^}`）
* 如果文件名已符合目标格式（如已有相同前缀），将跳过该文件
* 脚本使用 `mv` 命令进行重命名，确保有足够的文件操作权限

## 脚本源码

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

log_info() { echo -e "${gl_lan}[信息]${gl_bai} $*"; }
log_ok() { echo -e "${gl_lv}[成功]${gl_bai} $*"; }
log_warn() { echo -e "${gl_huang}[警告]${gl_bai} $*"; }
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; }

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键继续${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    read -r -n 1 -s -p ""
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
    local menu_name="${1:-退出脚本}"
    echo -ne "${gl_lv}即将 ${gl_huang}${menu_name}${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
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

handle_y_n() {
    echo -ne "\r${gl_hong}无效的选择，请输入 ${gl_bai}(${gl_lv}y${gl_bai}或${gl_hong}N${gl_bai})${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.3
    echo -ne "\r${gl_huang}无效的选择，请输入 ${gl_bai}(${gl_lv}y${gl_bai}或${gl_hong}N${gl_bai})${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.3
    echo -ne "\r${gl_lv}无效的选择，请输入 ${gl_bai}(${gl_lv}y${gl_bai}或${gl_hong}N${gl_bai})${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    echo ""
    return 2
}

exit_animation() {
    echo -ne "\r${gl_lv}即将退出 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    echo ""
    clear
}

cancel_empty() {
    local menu_name="${1:-上一级选单}"
    echo -e "${gl_hong}空输入，返回 ${gl_huang}${menu_name}${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    echo ""
    clear
}

handle_invalid_input() {
    echo -ne "\r${gl_hong}无效的输入，请重新输入 ${gl_zi} 2 ${gl_hong}秒后返回 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.3
    echo -ne "\r${gl_huang}无效的输入，请重新输入 ${gl_zi} 1 ${gl_huang}秒后返回 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.3
    echo -e "\r${gl_lv}无效的输入，请重新输入 ${gl_zi} 0 ${gl_lv}秒后返回 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    continue
}

go_parent_directory() {
    if [[ "$(pwd)" != "/" ]]; then
        local current_path="$(pwd)"
        cd ..
        echo -ne "${gl_lv}已返回上级目录: ${gl_huang}$(pwd) ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
        exit_animation
    else
        echo -ne "${gl_huang}已经在根目录: ${gl_hong}/ ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
        exit_animation
    fi
}

batch_rename_files() {
    while true; do
        local current_dir=$(pwd)
        local files=()
        
        while IFS= read -r -d $'\0' file; do
            if [[ -f "$file" ]]; then
                files+=("$file")
            fi
        done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
        
        local file_count=${#files[@]}
        
        clear
        echo -e ""
        echo -e "${gl_zi}>>> 批量重命名文件${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        
        if [[ $file_count -eq 0 ]]; then
            echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        else
            echo -e "${gl_bai}当前目录: ${gl_lv}${current_dir}${gl_bai}  ${gl_bai}文件数量: ${gl_lv}${file_count}${gl_bai}"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            
            if [[ $file_count -le 20 ]]; then
                echo -e "${gl_bai}文件列表:${gl_bai}"
                for i in "${!files[@]}"; do
                    local file="${files[$i]}"
                    local filename=$(basename "$file")
                    echo -e "  ${gl_huang}$((i + 1))${gl_bai}. ${gl_bufan}${filename}${gl_bai}"
                done
            else
                echo -e "${gl_bai}显示前 20 个文件:${gl_bai}"
                for i in {0..19}; do
                    if [[ $i -lt $file_count ]]; then
                        local file="${files[$i]}"
                        local filename=$(basename "$file")
                        echo -e "  ${gl_huang}$((i + 1))${gl_bai}. ${gl_bufan}${filename}${gl_bai}"
                    fi
                done
                echo -e "  ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}还有 $((file_count - 20)) 个文件${gl_bai}"
            fi
        fi
        
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_bufan}1.  ${gl_bai}添加前缀              ${gl_bufan}2.  ${gl_bai}添加后缀"
        echo -e "${gl_bufan}3.  ${gl_bai}替换字符串            ${gl_bufan}4.  ${gl_bai}序号重命名"
        echo -e "${gl_bufan}5.  ${gl_bai}大小写转换            ${gl_bufan}6.  ${gl_bai}移除字符"
        echo -e "${gl_bufan}7.  ${gl_bai}删除所有空格"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_hong}0.  ${gl_bai}退出脚本"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        read -r -e -p "$(echo -e "${gl_bai}请选择重命名模式: ")" rename_mode

        case "$rename_mode" in
        1) rename_files_add_prefix ;;
        2) rename_files_add_suffix ;;
        3) rename_files_replace_string ;;
        4) rename_files_sequential ;;
        5) rename_files_change_case ;;
        6) rename_files_remove_chars ;;
        7) rename_files_remove_spaces ;;
        0) exit_script ;;
        *) handle_invalid_input ;;
        esac
    done
}

rename_files_add_prefix() {
    local current_dir=$(pwd)
    local files=()
    while IFS= read -r -d $'\0' file; do
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    local file_count=${#files[@]}
    
    if [[ $file_count -eq 0 ]]; then
        echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        exit_animation
        return
    fi
    
    echo -e ""
    echo -e "${gl_zi}>>> 批量添加前缀${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -e -p "$(echo -e "${gl_bai}请输入要添加的前缀(${gl_huang}0${gl_bai}返回): ")" prefix
    if [[ -z "$prefix" ]]; then
        log_warn "前缀不能为空"
        exit_animation
        return
    fi

    [ "$prefix" == "0" ] && { cancel_return "上一级选单"; return 1; }  

    echo -e "${gl_bai}预览重命名结果:${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local rename_count=0
    local rename_files=()
    for file in "${files[@]}"; do
        local filename=$(basename "$file")
        local dir=$(dirname "$file")
        local newname="${dir}/${prefix}${filename}"

        if [[ "$filename" != "${prefix}${filename}" ]]; then
            rename_files+=("$file:$newname")
            echo -e "  ${gl_bufan}${filename}${gl_bai} -> ${gl_lv}${prefix}${filename}${gl_bai}"
        fi
    done

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}将重命名 ${gl_lv}${#rename_files[@]}${gl_bai} 个文件${gl_bai}"

    if [[ ${#rename_files[@]} -gt 0 ]]; then
        read -r -e -p "$(echo -e "${gl_bai}确认执行重命名? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
        [ "$confirm" = "0" ] && { cancel_return "上一级选单"; return 1; }  
        case "$confirm" in
        [Yy])
            for rename_pair in "${rename_files[@]}"; do
                IFS=':' read -r old_name new_name <<<"$rename_pair"
                if mv "$old_name" "$new_name" 2>/dev/null; then
                    ((rename_count++))
                    log_info "已重命名: ${gl_bufan}$(basename "$old_name")${gl_bai} -> ${gl_lv}$(basename "$new_name")${gl_bai}"
                else
                    log_error "重命名失败: ${gl_bufan}$(basename "$old_name")${gl_bai}"
                fi
            done
            ;;
        [Nn])
            log_warn "操作已取消"
            ;;
        *) handle_y_n ;;
        esac
    else
        log_warn "没有文件需要重命名（可能文件已有相同前缀）"
    fi

    if [[ $rename_count -gt 0 ]]; then
        log_ok "成功重命名 ${rename_count} 个文件"
    fi
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

rename_files_add_suffix() {
    local current_dir=$(pwd)
    local files=()
    while IFS= read -r -d $'\0' file; do
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    local file_count=${#files[@]}
    
    if [[ $file_count -eq 0 ]]; then
        echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        exit_animation
        return
    fi
    
    echo -e ""
    echo -e "${gl_zi}>>> 批量添加后缀${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -e -p "$(echo -e "${gl_bai}请输入要添加的后缀 (不含扩展名)(${gl_huang}0${gl_bai}返回): ")" suffix
    if [[ -z "$suffix" ]]; then
        log_warn "后缀不能为空"
        exit_animation
        return
    fi

    [[ "$suffix" == "0" ]] && { cancel_return "上一级选单"; return 1; }

    echo -e "${gl_bai}预览重命名结果:${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local rename_count=0
    local rename_files=()
    for file in "${files[@]}"; do
        local filename=$(basename "$file")
        local dir=$(dirname "$file")
        local newname

        if [[ "$filename" =~ \. ]]; then
            local ext="${filename##*.}"
            local name="${filename%.*}"
            if [[ "$name" == "$ext" ]]; then
                newname="${dir}/${filename}${suffix}"
            else
                newname="${dir}/${name}${suffix}.${ext}"
            fi
        else
            newname="${dir}/${filename}${suffix}"
        fi

        if [[ "$filename" != "$(basename "$newname")" ]]; then
            rename_files+=("$file:$newname")
            echo -e "  ${gl_bufan}${filename}${gl_bai} -> ${gl_lv}$(basename "$newname")${gl_bai}"
        fi
    done

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}将重命名 ${gl_lv}${#rename_files[@]}${gl_bai} 个文件${gl_bai}"

    if [[ ${#rename_files[@]} -gt 0 ]]; then
        read -r -e -p "$(echo -e "${gl_bai}确认执行重命名? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
        case "$confirm" in
        [Yy])
            for rename_pair in "${rename_files[@]}"; do
                IFS=':' read -r old_name new_name <<<"$rename_pair"
                if mv "$old_name" "$new_name" 2>/dev/null; then
                    ((rename_count++))
                    log_info "已重命名: ${gl_bufan}$(basename "$old_name")${gl_bai} -> ${gl_lv}$(basename "$new_name")${gl_bai}"
                else
                    log_error "重命名失败: ${gl_bufan}$(basename "$old_name")${gl_bai}"
                fi
            done
            ;;
        [Nn])
            log_warn "操作已取消"
            ;;
        *) handle_y_n ;;
        esac
    else
        log_warn "没有文件需要重命名"
    fi

    if [[ $rename_count -gt 0 ]]; then
        log_ok "成功重命名 ${rename_count} 个文件"
    fi
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

rename_files_replace_string() {
    local current_dir=$(pwd)
    local files=()
    while IFS= read -r -d $'\0' file; do
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    local file_count=${#files[@]}
    
    if [[ $file_count -eq 0 ]]; then
        echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        exit_animation
        return
    fi
    
    echo -e ""
    echo -e "${gl_zi}>>> 替换字符${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -e -p "$(echo -e "${gl_bai}请输入要替换的字符串(${gl_huang}0${gl_bai}返回): ")" old_str

    [[ "$old_str" == "0" ]] && { cancel_return "上一级选单"; return 1; }

    if [[ -z "$old_str" ]]; then
        log_warn "要替换的字符串不能为空"
        exit_animation
        return
    fi

    read -r -e -p "$(echo -e "${gl_bai}请输入替换为的字符串: ")" new_str
    [ "$new_str" == "0" ] && { cancel_return "上一级选单"; return 1; }   

    echo -e "${gl_bai}预览重命名结果:${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local rename_count=0
    local rename_files=()
    for file in "${files[@]}"; do
        local filename=$(basename "$file")
        local dir=$(dirname "$file")
        local newname="${dir}/${filename//$old_str/$new_str}"

        if [[ "$filename" != "$(basename "$newname")" ]]; then
            rename_files+=("$file:$newname")
            echo -e "  ${gl_bufan}${filename}${gl_bai} -> ${gl_lv}$(basename "$newname")${gl_bai}"
        fi
    done

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}将重命名 ${gl_lv}${#rename_files[@]}${gl_bai} 个文件${gl_bai}"

    if [[ ${#rename_files[@]} -gt 0 ]]; then
        read -r -e -p "$(echo -e "${gl_bai}确认执行重命名? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
        [ "$confirm" == "0" ] && { cancel_return "上一级选单"; return 1; }  
        case "$confirm" in
        [Yy])
            for rename_pair in "${rename_files[@]}"; do
                IFS=':' read -r old_name new_name <<<"$rename_pair"
                if mv "$old_name" "$new_name" 2>/dev/null; then
                    ((rename_count++))
                    log_info "已重命名: ${gl_bufan}$(basename "$old_name")${gl_bai} -> ${gl_lv}$(basename "$new_name")${gl_bai}"
                else
                    log_error "重命名失败: ${gl_bufan}$(basename "$old_name")${gl_bai}"
                fi
            done
            ;;
        [Nn])
            log_warn "操作已取消"
            ;;
        *) handle_y_n ;;
        esac
    else
        log_warn "没有找到匹配的字符串 '$old_str'"
    fi

    if [[ $rename_count -gt 0 ]]; then
        log_ok "成功重命名 ${rename_count} 个文件"
    fi
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

rename_files_sequential() {
    local current_dir=$(pwd)
    local files=()
    while IFS= read -r -d $'\0' file; do
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    local file_count=${#files[@]}
    
    if [[ $file_count -eq 0 ]]; then
        echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        exit_animation
        return
    fi
    
    echo -e ""
    echo -e "${gl_huang}>>> 序号重命名模板说明:${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "  ${gl_huang}###${gl_bai} 表示三位数字序号 (如: 001, 002)"
    echo -e "  ${gl_huang}##${gl_bai}  表示两位数字序号 (如: 01, 02)"
    echo -e "  ${gl_huang}#${gl_bai}   表示一位数字序号 (如: 1, 2)"
    echo -e "  ${gl_huang}%d${gl_bai}  表示数字序号 (如: 1, 2, 3)"
    echo -e ""
    echo -e "${gl_bai}示例:${gl_bai}"
    echo -e "  ${gl_huang}image-###.jpg${gl_bai}   -> ${gl_lv}image-001.jpg, image-002.jpg, ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "  ${gl_huang}document_##.txt${gl_bai} -> ${gl_lv}document_01.txt, document_02.txt, ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "  ${gl_huang}file_#.pdf${gl_bai}      -> ${gl_lv}file_1.pdf, file_2.pdf, ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    echo -e ""
    echo -e "${gl_zi}>>> 序号重命名${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -e -p "$(echo -e "${gl_bai}请输入文件名模板(${gl_huang}0${gl_bai}返回): ")" template
    [[ "$template" == "0" ]] && { cancel_return "上一级选单"; return 1; }

    if [[ -z "$template" ]]; then
        log_warn "模板不能为空"
        exit_animation
        return
    fi

    echo -e "${gl_bai}预览重命名结果:${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local rename_count=0
    local rename_files=()
    local idx=1

    for file in "${files[@]}"; do
        local dir=$(dirname "$file")
        local filename=$(basename "$file")
        local ext="${filename##*.}"
        local name_without_ext="${filename%.*}"
        
        if [[ "$filename" =~ \. ]] && [[ "$name_without_ext" != "$ext" ]]; then
            local newname_template="${template%.*}"
            if [[ -z "$newname_template" ]]; then
                newname_template="$template"
            fi
            
            if [[ "$newname_template" =~ "###" ]]; then
                newname_template="${newname_template//###/$(printf "%03d" $idx)}"
            elif [[ "$newname_template" =~ "##" ]]; then
                newname_template="${newname_template//##/$(printf "%02d" $idx)}"
            elif [[ "$newname_template" =~ "#" ]]; then
                newname_template="${newname_template//#/$idx}"
            elif [[ "$newname_template" =~ "%d" ]]; then
                newname_template="${newname_template//%d/$idx}"
            else
                newname_template="${newname_template}_${idx}"
            fi
            
            local newname="${dir}/${newname_template}.${ext}"
        else
            local newname_template="$template"
            
            if [[ "$newname_template" =~ "###" ]]; then
                newname_template="${newname_template//###/$(printf "%03d" $idx)}"
            elif [[ "$newname_template" =~ "##" ]]; then
                newname_template="${newname_template//##/$(printf "%02d" $idx)}"
            elif [[ "$newname_template" =~ "#" ]]; then
                newname_template="${newname_template//#/$idx}"
            elif [[ "$newname_template" =~ "%d" ]]; then
                newname_template="${newname_template//%d/$idx}"
            else
                newname_template="${newname_template}_${idx}"
            fi
            
            local newname="${dir}/${newname_template}"
        fi
        
        rename_files+=("$file:$newname")
        echo -e "  ${gl_bufan}${filename}${gl_bai} -> ${gl_lv}$(basename "$newname")${gl_bai}"
        ((idx++))
    done

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}将重命名 ${gl_lv}${#rename_files[@]}${gl_bai} 个文件${gl_bai}"

    if [[ ${#rename_files[@]} -gt 0 ]]; then
        read -r -e -p "$(echo -e "${gl_bai}确认执行重命名? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
        [ "$confirm" == "0" ] && { cancel_return "上一级选单"; return 1; }
        case "$confirm" in
        [Yy])
            for rename_pair in "${rename_files[@]}"; do
                IFS=':' read -r old_name new_name <<<"$rename_pair"
                if mv "$old_name" "$new_name" 2>/dev/null; then
                    ((rename_count++))
                    log_info "已重命名: ${gl_bufan}$(basename "$old_name")${gl_bai} -> ${gl_lv}$(basename "$new_name")${gl_bai}"
                else
                    log_error "重命名失败: ${gl_bufan}$(basename "$old_name")${gl_bai}"
                fi
            done
            ;;
        [Nn])
            log_warn "操作已取消"
            ;;
        *) handle_y_n ;;
        esac
    fi

    if [[ $rename_count -gt 0 ]]; then
        log_ok "成功重命名 ${rename_count} 个文件"
    fi
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

rename_files_change_case() {
    local current_dir=$(pwd)
    local files=()
    while IFS= read -r -d $'\0' file; do
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    local file_count=${#files[@]}
    
    if [[ $file_count -eq 0 ]]; then
        echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        exit_animation
        return
    fi
    
    while true; do
        echo -e ""
        echo -e "${gl_zi}>>> 大小写转换${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_bufan}1.  ${gl_bai}转为小写              ${gl_bufan}2.  ${gl_bai}转为大写"
        echo -e "${gl_bufan}3.  ${gl_bai}首字母大写            ${gl_bufan}4.  ${gl_bai}单词首字母大写"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_huang}0.  ${gl_bai}返回上一级选单"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        read -r -e -p "$(echo -e "${gl_bai}请选择转换模式: ")" case_mode

        case "$case_mode" in
        0) cancel_return;  return  ;;
        1 | 2 | 3 | 4)
            local rename_count=0
            local rename_files=()

            echo -e "${gl_bai}预览重命名结果:${gl_bai}"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

            for file in "${files[@]}"; do
                local filename=$(basename "$file")
                local dir=$(dirname "$file")
                local newname

                case "$case_mode" in
                1) newname="${dir}/${filename,,}" ;;
                2) newname="${dir}/${filename^^}" ;;
                3) newname="${dir}/${filename^}" ;;
                4)
                    newname="$filename"
                    if [[ "$newname" =~ [a-zA-Z] ]]; then
                        newname=$(echo "$newname" | sed -E 's/(^|_)([a-z])/\1\u\2/g' 2>/dev/null || echo "$newname")
                    fi
                    newname="${dir}/${newname}"
                    ;;
                esac

                if [[ "$filename" != "$(basename "$newname")" ]]; then
                    rename_files+=("$file:$newname")
                    echo -e "  ${gl_bufan}${filename}${gl_bai} -> ${gl_lv}$(basename "$newname")${gl_bai}"
                fi
            done

            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            echo -e "${gl_bai}将重命名 ${gl_lv}${#rename_files[@]}${gl_bai} 个文件${gl_bai}"

            if [[ ${#rename_files[@]} -gt 0 ]]; then
                read -r -e -p "$(echo -e "${gl_bai}确认执行重命名? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
                [ "$confirm" = "0" ] && { cancel_return "上一级选单"; continue; }
                case "$confirm" in
                [Yy])
                    for rename_pair in "${rename_files[@]}"; do
                        IFS=':' read -r old_name new_name <<<"$rename_pair"
                        if mv "$old_name" "$new_name" 2>/dev/null; then
                            ((rename_count++))
                            log_info "已重命名: ${gl_bufan}$(basename "$old_name")${gl_bai} -> ${gl_lv}$(basename "$new_name")${gl_bai}"
                        else
                            log_error "重命名失败: ${gl_bufan}$(basename "$old_name")${gl_bai}"
                        fi
                    done
                    ;;
                [Nn])
                    log_warn "操作已取消"
                    ;;
                *) handle_y_n ;;
                esac
            else
                log_warn "没有文件需要转换大小写"
            fi

            if [[ $rename_count -gt 0 ]]; then
                log_ok "成功重命名 ${rename_count} 个文件"
            fi
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            break_end
            return
            ;;
        *) handle_invalid_input ;;
        esac
    done
}

rename_files_remove_chars() {
    local current_dir=$(pwd)
    local files=()
    while IFS= read -r -d $'\0' file; do
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    local file_count=${#files[@]}
    
    if [[ $file_count -eq 0 ]]; then
        echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        exit_animation
        return
    fi
    
    echo -e ""
    echo -e "${gl_zi}>>> 移除字符${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -e -p "$(echo -e "${gl_bai}请输入要移除的字符或模式(${gl_huang}0${gl_bai}返回): ")" remove_pattern

    [[ "$remove_pattern" == "0" ]] && { cancel_return "上一级选单"; return 1; }

    if [[ -z "$remove_pattern" ]]; then
        log_warn "要移除的字符不能为空"
        exit_animation
        return
    fi

    echo -e "${gl_bai}预览重命名结果:${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local rename_count=0
    local rename_files=()
    for file in "${files[@]}"; do
        local filename=$(basename "$file")
        local dir=$(dirname "$file")
        local newname="${dir}/${filename//$remove_pattern/}"

        if [[ "$filename" != "$(basename "$newname")" ]]; then
            rename_files+=("$file:$newname")
            echo -e "  ${gl_bufan}${filename}${gl_bai} -> ${gl_lv}$(basename "$newname")${gl_bai}"
        fi
    done

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}将重命名 ${gl_lv}${#rename_files[@]}${gl_bai} 个文件${gl_bai}"

    if [[ ${#rename_files[@]} -gt 0 ]]; then
        read -r -e -p "$(echo -e "${gl_bai}确认执行重命名? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
        [[ "$confirm" == "0" ]] && { cancel_return "上一级选单"; return 1; }
        case "$confirm" in
        [Yy])
            for rename_pair in "${rename_files[@]}"; do
                IFS=':' read -r old_name new_name <<<"$rename_pair"
                if mv "$old_name" "$new_name" 2>/dev/null; then
                    ((rename_count++))
                    log_info "已重命名: ${gl_bufan}$(basename "$old_name")${gl_bai} -> ${gl_lv}$(basename "$new_name")${gl_bai}"
                else
                    log_error "重命名失败: ${gl_bufan}$(basename "$old_name")${gl_bai}"
                fi
            done
            ;;
        [Nn])
            log_warn "操作已取消"
            ;;
        *) handle_y_n ;;
        esac
    else
        log_warn "没有找到匹配的字符 '$remove_pattern'"
    fi

    if [[ $rename_count -gt 0 ]]; then
        log_ok "成功重命名 ${rename_count} 个文件"
    fi
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

rename_files_remove_spaces() {
    local current_dir=$(pwd)
    local files=()
    while IFS= read -r -d $'\0' file; do
        if [[ -f "$file" ]]; then
            files+=("$file")
        fi
    done < <(find "$current_dir" -maxdepth 1 -type f -print0 2>/dev/null)
    
    local file_count=${#files[@]}
    
    if [[ $file_count -eq 0 ]]; then
        echo -e "${gl_huang}当前目录下没有找到任何文件${gl_bai}"
        exit_animation
        return
    fi
    
    echo -e ""
    echo -e "${gl_zi}>>> 删除文件名中的所有空格${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    echo -e "${gl_bai}注意: 此操作将删除文件名中的所有空格字符${gl_bai}"
    echo -e "${gl_bai}包括文件名开头、中间和结尾的空格${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    echo -e "${gl_bai}预览重命名结果:${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    local rename_count=0
    local rename_files=()
    for file in "${files[@]}"; do
        local filename=$(basename "$file")
        local dir=$(dirname "$file")
        local newname="${dir}/${filename// /}"

        if [[ "$filename" != "$(basename "$newname")" ]]; then
            rename_files+=("$file:$newname")
            echo -e "  ${gl_bufan}${filename}${gl_bai} -> ${gl_lv}$(basename "$newname")${gl_bai}"
        fi
    done

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}将重命名 ${gl_lv}${#rename_files[@]}${gl_bai} 个文件${gl_bai}"

    if [[ ${#rename_files[@]} -gt 0 ]]; then
        read -r -e -p "$(echo -e "${gl_bai}确认执行重命名? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
        [[ "$confirm" == "0" ]] && { cancel_return "上一级选单"; return 1; }
        case "$confirm" in
        [Yy])
            for rename_pair in "${rename_files[@]}"; do
                IFS=':' read -r old_name new_name <<<"$rename_pair"
                if mv "$old_name" "$new_name" 2>/dev/null; then
                    ((rename_count++))
                    log_info "已重命名: ${gl_bufan}$(basename "$old_name")${gl_bai} -> ${gl_lv}$(basename "$new_name")${gl_bai}"
                else
                    log_error "重命名失败: ${gl_bufan}$(basename "$old_name")${gl_bai}"
                fi
            done
            ;;
        [Nn])
            log_warn "操作已取消"
            ;;
        *) handle_y_n ;;
        esac
    else
        log_warn "没有文件名包含空格"
    fi

    if [[ $rename_count -gt 0 ]]; then
        log_ok "成功重命名 ${rename_count} 个文件"
    fi
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

batch_rename_files
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
