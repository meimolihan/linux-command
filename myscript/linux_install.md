linux_install
===

全平台自动识别包管理器的独立安装脚本，通过命令行参数传入软件包，已安装软件仅提示状态、不重复安装。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install.sh) wget
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_install.webp "截图演示")

## 补充说明

该脚本是全平台自动识别包管理器的独立安装脚本，通过命令行参数传入软件包，已安装软件仅提示状态、不重复安装。

### 功能特点

* 全平台支持：自动识别系统包管理器（apt、yum、dnf、opkg、apk、pacman、zypper、pkg等）
* 命令行传参：支持一次性安装多个软件包
* 智能检测：已安装的软件包仅提示状态，不重复安装
* 版本检测：显示已安装软件的版本号
* 多包管理器支持：apt (Debian/Ubuntu)、dnf/yum (Fedora/RHEL/CentOS)、opkg (OpenWrt/iStoreOS)、apk (Alpine)、pacman (Arch/Manjaro)、zypper (openSUSE)、pkg (FreeBSD)
* 特殊包处理：7zip/7z 等包名特殊处理
* 彩色日志输出：清晰展示安装状态和结果

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 软件包状态 | 显示每个软件包是否已安装 |
| 版本信息 | 显示已安装软件的版本号（如能获取） |
| 安装进度 | 显示正在使用的包管理器和安装进度 |
| 安装结果 | 显示每个软件包安装成功或失败状态 |
| 使用方法 | 未传参时显示脚本使用方法 |

### 注意事项

* 脚本需要至少一个软件包参数，否则会显示使用方法并退出
* 需要对应系统的包管理器正常可用
* 安装软件需要足够的权限（通常需要 root 或 sudo）
* 已安装的软件包不会重复安装，仅显示状态
* 7zip/7z 包在 opkg 系统中会安装 p7zip
* 版本检测基于命令的 --version 输出，部分软件可能无法获取版本
* 脚本会自动检测已安装软件，避免不必要的重复安装
* 安装失败时建议检查网络连接和软件包名称是否正确
* 彩色输出需要终端支持 ANSI 转义序列
* 脚本以 bash 编写，确保运行环境支持 bash

## 脚本源码

- 传参：`./脚本名.sh  wget`

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

install_packages() {
    [[ $# -eq 0 ]] && {
        log_error "未提供软件包参数!"
        log_info "使用方法: $0 软件包1 软件包2 软件包3..."
        log_info "示例: $0 git curl wget"
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
            echo -e "${gl_huang}${pkg}${gl_bai} ${gl_lv}已安装${gl_bai} $([[ -n "$ver" ]] && echo "版本 ${gl_lv}${ver}${gl_bai}")"
            continue
        fi
        
        echo -e ""
        log_info "开始安装：${pkg}"
        
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
            log_ok "${pkg} 安装成功"
        else
            log_error "${pkg} 安装失败"
        fi
        
    done
}

install_packages "$@"
```


## 相关命令

- [linux_install](../c/linux_install.html "Linux 软件一键安装脚本")  👈 当前所在位置
- [linux_uninstall](../c/linux_uninstall.html "Linux 软件一键卸载脚本")


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
