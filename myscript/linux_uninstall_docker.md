linux_uninstall_docker
===

安全卸载 Docker 及全部资源，自动清理镜像 / 容器 / 配置，支持交互确认与优雅退出。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_uninstall_docker.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_uninstall_docker.webp "截图演示")

## 补充说明

该脚本用于安全卸载 Docker 及全部资源，自动清理镜像、容器、配置，支持交互确认与优雅退出。

### 功能特点

* 安全卸载：交互式确认，避免误删
* 自动检测 Docker 是否已安装
* 停止并删除所有运行中的容器
* 删除所有 Docker 镜像
* 卸载 Docker 相关软件包（docker-ce、docker-ce-cli、containerd.io 等）
* 清理 Docker 配置目录（/var/lib/docker、/etc/docker 等）
* 清理 Docker 相关网络和卷
* 支持优雅退出：用户可取消操作
* 彩色输出，清晰展示卸载进度和结果
* 自动检测并支持多种包管理器（apt、yum、dnf）

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| Docker 状态检测 | 显示 Docker 是否已安装 |
| 容器清理 | 显示停止和删除容器的进度 |
| 镜像清理 | 显示删除镜像的进度 |
| 软件包卸载 | 显示卸载 Docker 软件包的结果 |
| 配置清理 | 显示删除配置目录的进度 |
| 网络/卷清理 | 显示清理 Docker 网络和卷的结果 |
| 卸载结果 | 显示最终卸载状态 |

### 注意事项

* 脚本需要 root 权限执行卸载操作
* 卸载前会交互确认，避免误删
* 会删除所有容器和镜像，数据不可恢复
* 清理 /var/lib/docker 目录，包含所有镜像、容器、卷数据
* 仅卸载通过包管理器安装的 Docker，手动安装需额外处理
* 卸载后可能需要手动清理 Docker 相关用户组
* 彩色输出需要终端支持 ANSI 转义序列
* 脚本以 bash 编写，确保运行环境支持 bash
* 卸载前建议备份重要容器和镜像
* 支持 apt (Debian/Ubuntu)、yum/dnf (CentOS/RHEL/Fedora) 包管理器

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
    if command -v perl >/dev/null 2>&1; then perl -e "select(undef, undef, undef, $seconds)"; return 0; fi
    if command -v python3 >/dev/null 2>&1; then python3 -c "import time; time.sleep($seconds)"; return 0; fi
    if command -v python >/dev/null 2>&1; then python -c "import time; time.sleep($seconds)"; return 0; fi
    local int_seconds=$(echo "$seconds" | awk '{print int($1+0.999)}')
    sleep "$int_seconds"
}

handle_invalid_input() {
    echo -ne "\r${gl_huang}无效的输入,请重新输入! ${gl_zi}1 ${gl_bai}秒后返回"
    sleep_fractional 1
    echo -ne "\r${gl_lv}无效的输入,请重新输入! ${gl_zi}0 ${gl_bai}秒后返回"
    sleep_fractional 0.5
    echo ""
    return 2
}

exit_animation() {
    echo -ne "${gl_lv}即将退出 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.5
    echo -ne "${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    sleep_fractional 0.6
    echo ""
    clear
}

uninstall_docker_environment() {
    if ! command -v docker &>/dev/null; then
        echo -e ""
        echo -e "${gl_zi}>>> 卸载 Docker 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        log_warn "Docker 未安装，无需卸载"
        exit_animation
        return 1
    fi

	clear
    echo -e ""
    echo -e "${gl_zi}>>> 卸载 Docker 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -e -p "$(echo -e "${gl_hong}注意: ${gl_bai}确定卸载 Docker 环境吗？(${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" choice
    [ "$choice" = "0" ] && { exit_animation; return 1; }

    case "$choice" in
        [Yy])
            echo -e "${gl_zi}>>> 正在清理所有 Docker 资源${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            
            log_info "正在停止所有容器${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            docker stop $(docker ps -aq) >/dev/null 2>&1
            
            log_info "正在删除容器、镜像、网络、数据卷${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            docker system prune -a --volumes -f >/dev/null 2>&1
            
            log_info "正在卸载 Docker 相关组件${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            if command -v apt &>/dev/null; then
                apt remove -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose >/dev/null 2>&1
                apt autoremove -y >/dev/null 2>&1
            elif command -v yum &>/dev/null || command -v dnf &>/dev/null; then
                yum remove -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose >/dev/null 2>&1
            fi
            
            log_info "正在删除配置文件与残留目录${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            rm -rf /etc/docker /var/lib/docker /var/run/docker.sock >/dev/null 2>&1
            hash -r
            
            echo -e ""
            log_ok "Docker 环境已完全卸载！"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            break_end
            ;;
        [Nn])
            log_info "已取消卸载操作"
            exit_animation
            return 0
            ;;
        *)
            handle_invalid_input
            return 1
            ;;
    esac
}

uninstall_docker_environment
```


## 相关命令

- [linux_install_docker](../c/linux_install_docker.html "Docker 一键安装脚本")
- [linux_uninstall_docker](../c/linux_uninstall_docker.html "Docker 卸载脚本")  👈 当前所在位置
- [linux_install_compose](../c/linux_install_compose.html "Docker Compose 一键安装脚本")
- [linux_uninstall_compose](../c/linux_uninstall_compose.html "Docker Compose 卸载脚本")

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
