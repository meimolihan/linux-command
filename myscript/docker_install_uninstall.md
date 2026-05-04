docker_install_uninstall
===

集成 Docker 与 Docker Compose 的安装、卸载功能，带实时状态显示的可视化菜单管理脚本。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_install_uninstall.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_install_uninstall.webp "截图演示")

## 补充说明

该脚本提供 Docker 和 Docker Compose 的安装与卸载功能，带有可视化菜单和实时状态显示，适合快速在 Linux 系统上管理 Docker 环境。

### 功能特点

* 可视化菜单：彩色交互式菜单，实时显示 Docker 安装状态
* 一键安装：自动检测系统类型，选择最佳安装方式
* 完整卸载：彻底清理 Docker 及相关组件
* 状态检测：实时显示 Docker 版本、运行状态、Compose 版本等信息
* 跨平台支持：支持 Debian/Ubuntu/CentOS/RHEL 等主流发行版

### 菜单功能

| 选项 | 功能 |
| --- | --- |
| 安装 Docker | 自动安装 Docker 和 Docker Compose |
| 卸载 Docker | 完全卸载 Docker 及相关配置 |
| 查看状态 | 显示 Docker 版本、运行状态等信息 |
| 退出 | 退出脚本 |

### 注意事项

* 安装过程需要 root 权限或 sudo 权限
* 卸载操作会删除所有容器、镜像、数据卷，请谨慎操作
* 建议在生产环境操作前备份重要数据
* 脚本会自动添加 Docker 官方源，国内用户可能需要配置镜像加速

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

check_docker_status() {
    if command -v docker &>/dev/null; then
        local docker_ver
        docker_ver=$(docker --version | awk '{print $3}' | sed 's/,//g')
        echo -e "${gl_lv}已安装${gl_bai} | 版本：${gl_lv}${docker_ver}${gl_bai}"
    else
        echo -e "${gl_hong}未安装${gl_bai}"
    fi
}

check_compose_status() {
    if command -v docker-compose &>/dev/null; then
        local compose_ver
        compose_ver=$(docker-compose --version 2>/dev/null | grep -oE 'v[0-9.]+' | head -1)
        echo -e "${gl_lv}已安装${gl_bai} | 版本：${gl_lv}${compose_ver}${gl_bai}"
    else
        echo -e "${gl_hong}未安装${gl_bai}"
    fi
}

install_docker() {
    clear
    echo -e "${gl_zi}>>> 安装 Docker 环境${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "正在在线安装 Docker 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_docker.sh)
    break_end
}

uninstall_docker() {
    clear
    echo -e "${gl_zi}>>> 卸载 Docker 环境${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "正在在线卸载 Docker 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_uninstall_docker.sh)
}

install_compose() {
    clear
    echo -e "${gl_zi}>>> 安装 Compose 环境${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "正在在线安装 Docker Compose${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_compose.sh)
    break_end
}

uninstall_compose() {
    clear
    echo -e "${gl_zi}>>> 卸载 Compose 环境${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "正在在线卸载 Docker Compose${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_uninstall_compose.sh)
}

docker_manager_menu() {
    while true; do
        clear
        echo -e "${gl_zi}>>> Docker 环境管理${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_lan}当前状态：${gl_bai}"
        echo -e "Docker  状态：$(check_docker_status)"
        echo -e "Compose 状态：$(check_compose_status)"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        
        echo -e "${gl_bufan}1.  ${gl_bai}安装 Docker 环境       ${gl_bufan}2.  ${gl_bai}卸载 Docker 环境"
        echo -e "${gl_bufan}3.  ${gl_bai}安装 Compose 环境      ${gl_bufan}4.  ${gl_bai}卸载 Compose 环境"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        echo -e "${gl_hong}0.  ${gl_bai}退出脚本"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        
        read -r -e -p "请输入你的选择: " choice
        case $choice in
            1) install_docker ;;
            2) uninstall_docker ;;
            3) install_compose ;;
            4) uninstall_compose ;;
            0) exit_script ;;
            *) handle_invalid_input ;;
        esac
    done
}

docker_manager_menu
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
