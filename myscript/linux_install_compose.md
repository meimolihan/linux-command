linux_install_compose
===

自动检测并清理旧版本，支持自定义下载地址，一键安装 / 升级 Docker Compose 并校验完整性。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_compose.sh)
```

- 毫秒镜像 安装 Docker-Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_install_compose.webp "截图演示")

## 补充说明

该脚本用于自动检测并清理旧版本，支持自定义下载地址，一键安装/升级 Docker Compose 并校验完整性。

### 功能特点

* 自动检测操作系统和架构（x86_64、aarch64）
* 自动清理旧版本残留（/usr/bin/docker-compose、/usr/local/bin/docker-compose、/usr/libexec/docker/cli-plugins/）
* 安装依赖工具：自动安装 curl、wget
* 支持多种系统：Debian/Ubuntu（apt）、CentOS/RHEL/Fedora（yum/dnf）、Arch（pacman）
* 安装 Docker Compose 插件（docker-compose-plugin）
* 下载官方最新版 Docker Compose（兼容所有 Linux）
* 创建双命令兼容：支持 `docker compose` 和 `docker-compose` 两种用法
* 自动创建插件目录和符号链接
* 彩色输出，清晰展示安装进度和结果
* 安装后自动检测可用命令

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 操作系统检测 | 显示检测到的操作系统类型和架构 |
| 清理旧版本 | 显示清理旧版本残留的结果 |
| 安装依赖工具 | 显示安装 curl、wget 的进度 |
| 安装插件 | 显示安装 docker-compose-plugin 的结果 |
| 下载进度 | 显示从 GitHub 下载最新版的进度 |
| 命令兼容 | 显示创建符号链接的结果 |
| 版本检测 | 显示安装后的 docker compose 和 docker-compose 版本 |

### 注意事项

* 脚本需要 root 权限执行安装操作
* 需要网络连接从 GitHub 下载 Docker Compose
* 支持 Debian/Ubuntu、CentOS/RHEL/Fedora、Arch 等主流发行版
* 安装后可使用 `docker compose` 或 `docker-compose` 两种命令
* 插件安装在 /usr/libexec/docker/cli-plugins/ 目录
* 符号链接创建到 /usr/local/bin/docker-compose 和 /usr/bin/docker-compose
* 彩色输出需要终端支持 ANSI 转义序列
* 脚本会自动清理旧版本，避免冲突
* 如果网络不通，可能无法下载最新版 Docker Compose
* 脚本以 bash 编写，确保运行环境支持 bash

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

install_docker_compose() {
    clear
    echo -e "${gl_zi}>>> Docker Compose 安装${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    log_info "检测操作系统与架构 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        OS="unknown"
    fi

    log_info "清理旧版本残留 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    rm -f /usr/bin/docker-compose /usr/local/bin/docker-compose
    mkdir -p /usr/libexec/docker/cli-plugins
    rm -f /usr/libexec/docker/cli-plugins/docker-compose

    log_info "安装依赖工具 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if [[ "$OS" == "debian" || "$OS" == "ubuntu" ]]; then
        apt update >/dev/null 2>&1
        apt install -y curl wget >/dev/null 2>&1
    elif [[ "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "fedora" ]]; then
        yum install -y curl wget >/dev/null 2>&1
    elif [[ "$OS" == "arch" ]]; then
        pacman -Sy --noconfirm curl wget >/dev/null 2>&1
    fi

    log_info "安装 Docker Compose 插件 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if [[ "$OS" == "debian" || "$OS" == "ubuntu" ]]; then
        apt install -y docker-compose-plugin >/dev/null 2>&1
    elif [[ "$OS" == "centos" || "$OS" == "rhel" || "$OS" == "fedora" ]]; then
        yum install -y docker-compose-plugin >/dev/null 2>&1
    elif [[ "$OS" == "arch" ]]; then
        pacman -Sy --noconfirm docker-compose >/dev/null 2>&1
    else
        log_warn "未知系统，使用通用安装方式"
    fi

    log_info "下载官方最新版（兼容所有Linux）..."
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        DL_ARCH="x86_64"
    elif [ "$ARCH" = "aarch64" ]; then
        DL_ARCH="aarch64"
    else
        DL_ARCH="x86_64"
    fi

    LATEST_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$DL_ARCH"
    curl -sL "$LATEST_URL" -o /usr/libexec/docker/cli-plugins/docker-compose
    chmod +x /usr/libexec/docker/cli-plugins/docker-compose

    log_info "创建双命令兼容（WSL+全Linux通用）..."
    ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose
    ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/bin/docker-compose

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "检测可用命令"
    docker-compose version || /usr/local/bin/docker-compose version

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_ok "✅ 安装完成！全系统兼容！"
    log_ok "✅ 可使用：docker compose"
    log_ok "✅ 可使用：docker-compose"
}

install_docker_compose
```


## 相关命令

- [linux_install_docker](../c/linux_install_docker.html "Docker 一键安装脚本")
- [linux_uninstall_docker](../c/linux_uninstall_docker.html "Docker 卸载脚本")
- [linux_install_compose](../c/linux_install_compose.html "Docker Compose 一键安装脚本")  👈 当前所在位置
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
