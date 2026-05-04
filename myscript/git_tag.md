git_tag
===

Git 标签管理脚本，支持创建、删除、推送、查看标签，彩色输出、交互式操作。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/git_tag.sh)
```

## 补充说明

该脚本提供 Git 标签（Tag）的完整管理功能，支持创建、删除、推送、查看标签，带有交互式彩色菜单，适合管理版本发布的场景。

### 功能特点

* 交互式菜单：彩色菜单引导操作，降低操作错误率
* 标签管理：支持创建（带注释）、删除（本地/远程）、推送、列表查看等完整操作
* 版本规范：支持语义化版本号（如 v1.0.0）输入提示
* 安全保护：删除标签前有确认提示，避免误删
* 彩色输出：不同操作状态使用不同颜色区分

### 菜单功能

| 选项 | 功能 |
| --- | --- |
| 查看标签 | 列出所有本地和远程标签 |
| 创建标签 | 创建带注释的标签并推送到远程 |
| 删除本地标签 | 删除指定的本地标签 |
| 删除远程标签 | 删除指定的远程标签 |
| 推送标签 | 推送所有本地标签到远程 |

### 注意事项

* 需要有 Git 仓库才能使用标签管理功能
* 删除远程标签需要推送权限
* 建议使用带注释的标签（annotated tag）而非轻量标签
* 标签推送后无法直接修改，如需修改需删除后重新创建

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

sleep_fractional() {
    local seconds=$1
    if sleep "$seconds" 2>/dev/null; then
        return 0
    fi
    
    if command -v perl >/dev/null 2>&1; then
        perl -e "select(undef, undef, undef, $seconds)"
        return 0
    fi
    
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import time; time.sleep($seconds)"
        return 0
    elif command -v python >/dev/null 2>&1; then
        python -c "import time; time.sleep($seconds)"
        return 0
    fi
    
    local int_seconds=$(echo "$seconds" | awk '{print int($1+0.999)}')
    sleep "$int_seconds"
}

exit_animation() {
    echo -ne "${gl_lv}即将退出 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
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

cancel_return() {
    local menu_name="${1:-上一级选单}"
    echo -e "${gl_lv}即将返回到 ${gl_huang}${menu_name}${gl_lv}${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai} \c"
    sleep 0.6
    echo ""
    clear
}

check_git_repo() {
    if ! command -v git &>/dev/null; then
        log_error "Git 未安装，请先安装 Git"
        return 1
    fi
    
    if [[ ! -d ".git" ]]; then
        log_error "当前目录不是 Git 仓库"
        return 1
    fi
    
    return 0
}

list_tags() {
    clear
    echo -e ""
    echo -e "${gl_zi}>>> 所有标签列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    local tag_count=$(git tag 2>/dev/null | wc -l)
    if [[ "$tag_count" -eq 0 ]]; then
        echo -e "${gl_hui}  无标签${gl_bai}"
    else
        git tag -n | while IFS= read -r tag_line; do
            echo -e "${gl_bai}  $tag_line"
        done
    fi
    
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}标签数量: ${gl_lv}$tag_count${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

create_lightweight_tag() {
    echo -e ""
    read -r -e -p "$(echo -e "${gl_bai}请输入标签名称(${gl_huang}0${gl_bai}返回): ")" tag_name
    [ "$tag_name" = "0" ] && { cancel_return "Git 标签管理"; return 1; }
    
    if [[ -z "$tag_name" ]]; then
        log_error "标签名称不能为空"
        break_end
        return 1
    fi
    
    if git rev-parse --verify --quiet "$tag_name" >/dev/null; then
        log_error "标签 ${gl_huang}$tag_name ${gl_hong}已存在"
        break_end
        return 1
    fi
    
    read -r -e -p "$(echo -e "${gl_bai}在哪个提交创建标签? (默认: 最新提交, 输入 commit hash 或分支名): ")" commit_ref
    commit_ref="${commit_ref:-HEAD}"
    
    echo -e ""
    if git tag "$tag_name" "$commit_ref" 2>/dev/null; then
        log_ok "轻量标签 ${gl_huang}$tag_name ${gl_lv}创建成功"
        
        read -r -e -p "$(echo -e "${gl_bai}是否立即推送到远程仓库? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" push_now
        
        if [[ "$push_now" =~ ^[Yy]$ ]]; then
            if git push origin "$tag_name" 2>/dev/null; then
                log_ok "标签已推送到远程仓库"
            else
                log_warn "推送失败，请手动执行: git push origin $tag_name"
            fi
        fi
    else
        log_error "标签创建失败"
    fi
    
    break_end
}

create_annotated_tag() {
    echo -e ""
    read -r -e -p "$(echo -e "${gl_bai}请输入标签名称(${gl_huang}0${gl_bai}返回): ")" tag_name
    [ "$tag_name" = "0" ] && { cancel_return "Git 标签管理"; return 1; }
    
    if [[ -z "$tag_name" ]]; then
        log_error "标签名称不能为空"
        break_end
        return 1
    fi
    
    if git rev-parse --verify --quiet "$tag_name" >/dev/null; then
        log_error "标签 ${gl_huang}$tag_name ${gl_hong}已存在"
        break_end
        return 1
    fi
    
    read -r -e -p "$(echo -e "${gl_bai}请输入标签描述: ")" tag_message
    if [[ -z "$tag_message" ]]; then
        tag_message="Release $tag_name"
    fi
    
    read -r -e -p "$(echo -e "${gl_bai}在哪个提交创建标签? (默认: 最新提交, 输入 commit hash 或分支名): ")" commit_ref
    commit_ref="${commit_ref:-HEAD}"
    
    echo -e ""
    if git tag -a "$tag_name" -m "$tag_message" "$commit_ref" 2>/dev/null; then
        log_ok "附注标签 ${gl_huang}$tag_name ${gl_lv}创建成功"
        
        read -r -e -p "$(echo -e "${gl_bai}是否立即推送到远程仓库? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" push_now
        
        if [[ "$push_now" =~ ^[Yy]$ ]]; then
            if git push origin "$tag_name" 2>/dev/null; then
                log_ok "标签已推送到远程仓库"
            else
                log_warn "推送失败，请手动执行: git push origin $tag_name"
            fi
        fi
    else
        log_error "标签创建失败"
    fi
    
    break_end
}

delete_local_tag() {
    echo -e ""
    echo -e "${gl_bai}当前标签列表:${gl_bai}"
    git tag -n
    
    echo -e ""
    read -r -e -p "$(echo -e "${gl_bai}请输入要删除的标签名称(${gl_huang}0${gl_bai}返回): ")" tag_name
    [ "$tag_name" = "0" ] && { cancel_return "Git 标签管理"; return 1; }
    
    if [[ -z "$tag_name" ]]; then
        log_error "标签名称不能为空"
        break_end
        return 1
    fi
    
    if ! git rev-parse --verify --quiet "$tag_name" >/dev/null; then
        log_error "标签 ${gl_huang}$tag_name ${gl_hong}不存在"
        break_end
        return 1
    fi
    
    echo -e ""
    read -r -e -p "$(echo -e "${gl_hong}确认删除标签 ${gl_huang}$tag_name${gl_hong}? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_warn "取消删除"
        break_end
        return 0
    fi
    
    if git tag -d "$tag_name" 2>/dev/null; then
        log_ok "本地标签 ${gl_huang}$tag_name ${gl_lv}已删除"
    else
        log_error "标签删除失败"
    fi
    
    break_end
}

push_tag() {
    echo -e ""
    echo -e "${gl_bai}当前标签列表:${gl_bai}"
    git tag -n
    
    echo -e ""
    read -r -e -p "$(echo -e "${gl_bai}请输入要推送的标签名称(留空推送所有标签, ${gl_huang}0${gl_bai}返回): ")" tag_name
    [ "$tag_name" = "0" ] && { cancel_return "Git 标签管理"; return 1; }
    
    if [[ -z "$tag_name" ]]; then
        read -r -e -p "$(echo -e "${gl_hong}确认推送所有标签到远程? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm_all
        
        if [[ "$confirm_all" =~ ^[Yy]$ ]]; then
            echo -e ""
            if git push --tags; then
                log_ok "所有标签已推送到远程"
            else
                log_error "标签推送失败"
            fi
        else
            log_warn "取消推送"
        fi
    else
        if ! git rev-parse --verify --quiet "$tag_name" >/dev/null; then
            log_error "标签 ${gl_huang}$tag_name ${gl_hong}不存在"
            break_end
            return 1
        fi
        
        echo -e ""
        read -r -e -p "$(echo -e "${gl_bai}确认推送标签 ${gl_huang}$tag_name ${gl_bai}到远程? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
        
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            if git push origin "$tag_name"; then
                log_ok "标签 ${gl_huang}$tag_name ${gl_lv}已推送到远程"
            else
                log_error "标签推送失败"
            fi
        else
            log_warn "取消推送"
        fi
    fi
    
    break_end
}

delete_remote_tag() {
    echo -e ""
    echo -e "${gl_bai}当前标签列表:${gl_bai}"
    git tag -n
    
    echo -e ""
    read -r -e -p "$(echo -e "${gl_bai}请输入要删除的远程标签名称(${gl_huang}0${gl_bai}返回): ")" tag_name
    [ "$tag_name" = "0" ] && { cancel_return "Git 标签管理"; return 1; }
    
    if [[ -z "$tag_name" ]]; then
        log_error "标签名称不能为空"
        break_end
        return 1
    fi
    
    if ! git rev-parse --verify --quiet "$tag_name" >/dev/null; then
        log_error "标签 ${gl_huang}$tag_name ${gl_hong}不存在"
        break_end
        return 1
    fi
    
    echo -e ""
    echo -e "${gl_hong}警告: 将删除远程标签 ${gl_huang}$tag_name${gl_hong}${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}确认删除? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_warn "取消删除"
        break_end
        return 0
    fi
    
    echo -e ""
    if git push origin --delete "$tag_name" 2>/dev/null; then
        log_ok "远程标签 ${gl_huang}$tag_name ${gl_lv}已删除"
        
        read -r -e -p "$(echo -e "${gl_bai}是否同时删除本地标签? (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" delete_local
        
        if [[ "$delete_local" =~ ^[Yy]$ ]]; then
            if git tag -d "$tag_name" 2>/dev/null; then
                log_ok "本地标签 ${gl_huang}$tag_name ${gl_lv}已删除"
            else
                log_warn "本地标签删除失败"
            fi
        fi
    else
        log_error "远程标签删除失败"
    fi
    
    break_end
}

show_tag() {
    echo -e ""
    echo -e "${gl_bai}当前标签列表:${gl_bai}"
    git tag -n
    
    echo -e ""
    read -r -e -p "$(echo -e "${gl_bai}请输入要查看的标签名称(${gl_huang}0${gl_bai}返回): ")" tag_name
    [ "$tag_name" = "0" ] && { cancel_return "Git 标签管理"; return 1; }
    
    if [[ -z "$tag_name" ]]; then
        log_error "标签名称不能为空"
        break_end
        return 1
    fi
    
    clear
    echo -e ""
    echo -e "${gl_zi}>>> 标签详情: ${gl_huang}$tag_name${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    if git rev-parse --verify --quiet "$tag_name" >/dev/null; then
        echo -e "${gl_bai}标签类型: ${gl_lv}$(git cat-file -t "$tag_name" 2>/dev/null)${gl_bai}"
        echo -e "${gl_bai}标签信息:${gl_bai}"
        git show --quiet --stat "$tag_name"
        
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_bai}标签内容:${gl_bai}"
        git cat-file -p "$tag_name" 2>/dev/null
    else
        log_error "标签 ${gl_huang}$tag_name ${gl_hong}不存在"
    fi
    
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

git_tag_menu() {
    local target_dir="${1:-$(pwd)}"
    
    if [[ ! -d "$target_dir" ]]; then
        log_error "目录不存在: ${gl_huang}$target_dir${gl_bai}"
        break_end
        return 1
    fi
    
    if ! cd "$target_dir" 2>/dev/null; then
        log_error "无法进入目录: ${gl_huang}$target_dir${gl_bai}"
        break_end
        return 1
    fi
    
    if ! check_git_repo; then
        break_end
        return 1
    fi
    
    while true; do
        clear
        echo -e ""
        echo -e "${gl_zi}>>> Git 标签管理${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        
        local repo_name=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "未知仓库")
        local current_branch=$(git branch --show-current 2>/dev/null || echo "")
        local tag_count=$(git tag 2>/dev/null | wc -l)
        
        echo -e "${gl_bai}仓库: ${gl_huang}$repo_name"
        echo -e "${gl_bai}分支: ${gl_lv}$current_branch"
        echo -e "${gl_bai}标签: ${gl_lan}$tag_count${gl_bai}"
        
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_bufan}1.  ${gl_bai}查看所有标签        ${gl_bufan}2.  ${gl_bai}创建轻量标签"
        echo -e "${gl_bufan}3.  ${gl_bai}创建附注标签        ${gl_bufan}4.  ${gl_bai}删除本地标签"
        echo -e "${gl_bufan}5.  ${gl_bai}推送标签到远程      ${gl_bufan}6.  ${gl_bai}删除远程标签"
        echo -e "${gl_bufan}7.  ${gl_bai}查看标签详情"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_huang}0.  ${gl_bai}返回上一级选单      ${gl_hong}00. ${gl_bai}退出脚本"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        read -r -e -p "$(echo -e "${gl_bai}请输入你的选择: ")" choice
        
        case $choice in
            1) list_tags ;;
            2) create_lightweight_tag ;;
            3) create_annotated_tag ;;
            4) delete_local_tag ;;
            5) push_tag ;;
            6) delete_remote_tag ;;
            7) show_tag ;;
            0) cancel_return; break ;;
            00|000|0000) exit_script ;;
            *) handle_invalid_input ;;
        esac
    done
}

main() {
    git_tag_menu "${1:-}"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
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