git_all_push
===

适用于多 Linux 发行版、彩色美化输出、支持传参自定义且不传参则默认批量推送当前目录 Git 仓库的一键批量提交推送脚本。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/git_all_push.sh) /自定义目录 "提交信息" "排除目录"
```

## 效果预览

```bash
root@FnOS:~# ls /vol1/1000/compose
beszel  cloud-saver  command  dufs   hd-Icons  istoreos  it-tools  md  metube
root@FnOS:~# bash /tmp/git_push_all.sh /vol1/1000/compose "日常更新" "cloud-saver  command  dufs  hd-Icons  istoreos  it-tools metube"
```

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/git_all_push.webp "截图演示")

## 补充说明

该脚本用于批量提交并推送指定目录下所有 Git 仓库的更改，支持自定义提交信息和排除目录，适合同时管理多个 Git 项目的提交场景。

### 功能特点

* 批量提交推送：自动扫描并提交推送指定目录下所有 Git 仓库的更改
* 统一提交信息：所有仓库使用相同的提交信息
* 排除目录：支持排除不需要处理的目录
* 智能检测：只处理有更改的仓库，无更改的仓库自动跳过
* 彩色输出：实时显示每个仓库的处理状态

### 使用方法

```bash
# 推送当前目录下所有 Git 仓库，使用默认提交信息 "update"
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/git_all_push.sh)

# 推送指定目录，自定义提交信息，排除指定目录
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/git_all_push.sh) /vol1/1000/compose "日常更新" "cloud-saver command dufs"
```

### 注意事项

* 会自动执行 `git add .`，请确认工作区没有敏感文件
* 建议先配置好 Git 用户信息（user.name 和 user.email）
* 需要有远程仓库的推送权限
* 排除目录参数用空格分隔多个目录名
* 脚本会递归扫描子目录中的 Git 仓库

## 脚本源码

- 传参：`./脚本名.sh /自定义目录 "提交信息" "排除目录1 排除目录2"`
- 不传参：`./脚本名.sh "当前目录"  "update" "无排除目录"`

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

exit_animation() {
    echo -ne "${gl_lv}即将退出 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    echo ""
}

install() {
    [[ $# -eq 0 ]] && {
        log_error "未提供软件包参数!"
        return 1
    }

    local pkg mgr ver cmd_ver pkg_ver installed=false
    for pkg in "$@"; do
        installed=false
        ver=""
        
        if command -v "$pkg" &>/dev/null; then
            cmd_ver=$("$pkg" --version 2>/dev/null | head -n1 | tr -cd '[:print:]' | grep -oE '[0-9]+(\.[0-9]+)+' | head -n1 || echo "")
            [[ -n "$cmd_ver" ]] && ver="$cmd_ver"
            installed=true
        fi
        
        if [[ "$pkg" == "7zip" || "$pkg" == "7z" ]]; then
            if command -v 7z &>/dev/null; then
                ver=$(7z 2>&1 | grep -oE '[0-9]+(\.[0-9]+)+' | head -n1 || echo "")
                [[ -n "$ver" ]] && installed=true
            fi
        fi
        
        if [[ "$installed" == false ]]; then
            if command -v opkg &>/dev/null; then
                if opkg list-installed | grep -q "^${pkg} "; then
                    installed=true
                    ver=$(opkg list-installed | grep "^${pkg} " | awk '{print $3}' 2>/dev/null || echo "")
                fi
            elif command -v dpkg-query &>/dev/null; then
                if dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "install ok installed"; then
                    installed=true
                    ver=$(dpkg-query -W -f='${Version}' "$pkg" 2>/dev/null || echo "")
                fi
            elif command -v rpm &>/dev/null; then
                if rpm -q "$pkg" &>/dev/null; then
                    installed=true
                    ver=$(rpm -q --qf '%{VERSION}' "$pkg" 2>/dev/null || echo "")
                fi
            elif command -v apk &>/dev/null; then
                if apk info "$pkg" 2>/dev/null | grep -q "^installed"; then
                    installed=true
                    ver=$(apk info -a "$pkg" 2>/dev/null | grep -oE '[0-9]+(\.[0-9]+)+' | head -n1 || echo "")
                fi
            elif command -v pacman &>/dev/null; then
                if pacman -Qi "$pkg" &>/dev/null; then
                    installed=true
                    ver=$(pacman -Qi "$pkg" 2>/dev/null | grep -i "version" | grep -oE '[0-9]+(\.[0-9]+)+' | head -n1 || echo "")
                fi
            fi
        fi
        
        if [[ "$installed" == true ]]; then
            continue
        fi
        
        echo -e ""
        echo -e "${gl_huang}开始安装：${gl_bai}${pkg}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        
        local install_success=false
        
        for mgr in opkg dnf yum apt apk pacman zypper pkg; do
            if ! command -v "$mgr" &>/dev/null; then
                continue
            fi
            
            case $mgr in
            opkg)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}opkg (OpenWrt/iStoreOS)${gl_bai}"
                if [[ "$pkg" == "7zip" || "$pkg" == "7z" ]]; then
                    echo -e "${gl_bai}正在安装: ${gl_lv}p7zip${gl_bai}"
                    opkg update && opkg install p7zip && install_success=true
                else
                    opkg update && opkg install "$pkg" && install_success=true
                fi
                ;;
            dnf)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}dnf (Fedora/RHEL)${gl_bai}"
                dnf -y update && dnf install -y "$pkg" && install_success=true
                ;;
            yum)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}yum (CentOS/RHEL)${gl_bai}"
                yum -y update && yum install -y "$pkg" && install_success=true
                ;;
            apt)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}apt (Debian/Ubuntu)${gl_bai}"
                apt update -y && apt install -y "$pkg" && install_success=true
                ;;
            apk)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}apk (Alpine)${gl_bai}"
                apk update && apk add "$pkg" && install_success=true
                ;;
            pacman)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}pacman (Arch/Manjaro)${gl_bai}"
                pacman -Syu --noconfirm && pacman -S --noconfirm "$pkg" && install_success=true
                ;;
            zypper)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}zypper (openSUSE)${gl_bai}"
                zypper refresh && zypper install -y "$pkg" && install_success=true
                ;;
            pkg)
                echo -e "${gl_bai}使用包管理器: ${gl_zi}pkg (FreeBSD)${gl_bai}"
                pkg update && pkg install -y "$pkg" && install_success=true
                ;;
            esac
            
            [[ "$install_success" == true ]] && break
        done
        
        if [[ "$install_success" == true ]]; then
            echo -e "${gl_lv}✓ ${pkg} 安装成功${gl_bai}"
        else
            echo -e "${gl_hong}✗ ${pkg} 安装失败${gl_bai}"
        fi
        
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    done
}

git_push_all() {
    local start_dir="${1:-$(pwd)}"
    local commit_msg="${2:-update}"
    local exclude_dirs="${3:-}"

    clear
    echo -e "${gl_zi}>>> 正在推送所有仓库更改${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "目标目录：${gl_lv}$start_dir${gl_bai}"

    cd "$start_dir" || {
        log_error "无法进入目录：$start_dir"
        exit_animation
        return 1
    }

    local find_cmd="find . -type d -name \".git\""
    if [ -n "$exclude_dirs" ]; then
        for dir in $exclude_dirs; do
            find_cmd="$find_cmd -not -path \"*/$dir/*\""
        done
    fi

    eval "$find_cmd" | while read -r git_dir; do
        repo_dir=$(dirname "$git_dir")

        if [ ! -f "$git_dir/config" ]; then
            continue
        fi

        echo
        echo -e "${gl_huang}正在处理仓库：${gl_lv}$(basename "$repo_dir")${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

        (
            if git -C "$repo_dir" status --porcelain | grep -q '.'; then
                log_info "检测到更改，正在提交${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
                git -C "$repo_dir" add .
                git -C "$repo_dir" commit -m "$commit_msg"
            else
                log_info "工作区干净，无需提交"
            fi

            git -C "$repo_dir" pull --rebase 2>/dev/null || true
            git -C "$repo_dir" push 2>/dev/null || {
                log_error "推送失败：$(basename "$repo_dir")"
                false
            }
        )

        if [ $? -eq 0 ]; then
            log_ok "推送完成 ${gl_lv}$(basename "$repo_dir")${gl_bai}"
        else
            log_error "推送失败 ${gl_lv}$(basename "$repo_dir")${gl_bai}"
        fi
    done

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

git_push_all "$1" "$2" "$3"
```


## 相关命令

- [git_push](../c/git_push.html "Git 单项目推送脚本")
- [git_push_all](../c/git_push_all.html "Git 批量推送脚本")  👈 当前所在位置
- [git_pull](../c/git_pull.html "Git 单项目拉取脚本")
- [git_pull_all](../c/git_pull_all.html "Git 批量拉取脚本")

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
