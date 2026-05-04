git_apply_ignore
===

一键清理 Git 缓存并重新提交推送，让 `.gitignore` 规则立即生效，全程带步骤状态判断与标准化彩色提示。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/git_apply_ignore.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/git_apply_ignore.webp "截图演示")

## 补充说明

### 功能描述
一键清理Git缓存并重新提交推送，让`.gitignore`规则立即生效，适用于更新.gitignore后需要清理已跟踪文件的场景。

### 功能特点
- 自动清除Git缓存（保留本地文件）
- 重新添加所有文件，应用.gitignore规则
- 自动提交更改并推送到远程仓库
- 全程带步骤状态判断与标准化彩色提示
- 操作简单，一键完成所有步骤

### 注意事项
- 需要确保当前目录是Git仓库
- 需要有远程仓库的推送权限
- 操作会提交一个新的commit到仓库
- 如果不想推送，可以修改脚本去掉git push步骤

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
    read -r -n 1 -s -p ""
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

git_clean_cache() {
    clear
    echo -e "${gl_zi}>>> Git缓存清理 & .gitignore规则应用${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    log_info "正在清除Git缓存（保留本地文件）${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if git rm -r --cached .; then
        log_ok "Git缓存清除成功"
    else
        log_error "Git缓存清除失败"
        exit_animation
        exit 1
    fi

    echo -e ""
    log_info "正在重新添加文件，应用.gitignore规则${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if git add .; then
        log_ok "文件重新添加成功，.gitignore已生效"
    else
        log_error "文件添加失败"
        exit_animation
        exit 1
    fi

    echo -e ""
    log_info "正在提交更改${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if git commit -m "🎯 应用 .gitignore 规则，清理不必要的跟踪文件"; then
        log_ok "提交成功"
    else
        log_warn "无文件可提交或提交失败"
        exit_animation
        exit 1
    fi

    echo -e ""
    log_info "正在推送至远程仓库${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if git push; then
        log_ok "远程推送成功"
    else
        log_error "远程推送失败，请检查网络/权限/分支配置"
        exit_animation
        exit 1
    fi

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_ok "全部操作执行完成！.gitignore规则已完全生效"
    break_end
    exit 0
}

git_clean_cache
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
