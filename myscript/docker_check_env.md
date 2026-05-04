docker_check_env
===

一键检查并自动安装 Docker 和 Docker Compose 完整运行环境。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_check_env.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_check_env.webp "截图演示")

## 补充说明

该脚本用于一键检查并自动安装 Docker 和 Docker Compose 完整运行环境，基于包管理器（apt、yum、dnf 等）实现，适合快速准备 Docker 运行环境。

### 功能特点

* 提供两种检查模式：单独检查（仅检查 Docker 或 Compose）、全面检查（同时检查两者）
* 自动检测 Docker 安装状态：已安装则显示版本号，未安装则自动安装
* 自动检测 Docker Compose 安装状态：支持 docker-compose 和 docker compose 两种形式
* 智能安装：未安装时自动调用 linux_install_docker.sh 或 linux_install_compose.sh
* 版本信息显示：已安装时显示具体的版本号
* 静默模式：已安装时静默退出，适合在部署脚本中调用
* 完整的函数封装：check_docker_env、check_compose_env、docker_check_env 三种函数

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| Docker 环境检查 | 显示 Docker 是否已安装及版本信息 |
| Docker Compose 检查 | 显示 Docker Compose 是否已安装及版本信息 |
| 安装进度 | 未安装时显示自动安装过程 |
| 安装结果 | 显示 Docker/Docker Compose 安装成功或失败信息 |
| 环境准备状态 | 最终显示 Docker 运行环境是否准备完成 |

### 注意事项

* 脚本需要 root 权限或 sudo 权限来安装 Docker 和 Docker Compose
* 自动安装功能依赖官方安装脚本 linux_install_docker.sh 和 linux_install_compose.sh
* 支持的包管理器：apt (Debian/Ubuntu)、yum/dnf (CentOS/RHEL/Fedora)
* 单独检查模式适合仅需验证单个组件的场景
* 全面检查模式（docker_check_env 函数）在已安装时会静默退出，适合在部署脚本开头调用
* 如果自动安装失败，脚本会提示手动安装后重试
* 安装过程会显示动画效果（省略号动画）

## 脚本源码

- 单独检查

```bash
## 检查 Docker 是否安装
check_docker_env() {
    log_info "正在检查 Docker 环境是否安装${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    
    if command -v docker &>/dev/null; then
        local ver
        ver=$(docker --version | awk '{print $3}' | sed 's/,//g')
        log_ok "Docker 已安装，版本：${gl_lv}$ver${gl_bai}"
        return 0
    else
        log_warn "Docker 未安装，即将自动安装 Docker 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        install_add_docker
    fi

    if ! command -v docker &>/dev/null; then
        log_error "Docker 安装失败，请手动安装后重试！"
        exit_animation
        exit 1
    fi

    log_ok "Docker 环境准备完成！"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    sleep 1
}

check_docker_env

## 检查 Docker compose 是否安装
check_compose_env() {
    log_info "正在检查 Docker Compose 环境是否安装${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    
    if command -v docker-compose &>/dev/null; then
        local ver
        ver=$(docker-compose --version 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        [ -z "$ver" ] && ver=$(docker-compose --version 2>/dev/null | awk '{print $3}' | sed 's/,//g')
        log_ok "Docker Compose 已安装，版本：${gl_lv}$ver${gl_bai}"
        return 0
    else
        log_warn "Docker Compose 未安装，即将自动安装${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        install_docker_compose
    fi

    if ! command -v docker-compose &>/dev/null; then
        log_error "Docker Compose 安装失败，请手动安装后重试！"
        exit_animation
        exit 1
    fi

    log_ok "Docker Compose 环境准备完成！"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    sleep 1
}

check_compose_env

## 全面检查函数（已安装静默退出）
docker_check_env() {
    if ! command -v docker &>/dev/null; then
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        log_info "正在检查 Docker 运行环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        log_warn "Docker 未安装，即将自动安装 Docker 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_docker.sh)

        if ! command -v docker &>/dev/null; then
            log_error "Docker 安装失败，请手动安装后重试！"
            sleep 1
            exit 1
        fi
        log_ok "Docker 安装成功！"
    fi

    if ! command -v docker-compose &>/dev/null; then
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        log_info "正在检查 Docker Compose 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        log_warn "Docker Compose 未安装，即将自动安装${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_compose.sh)

        if ! command -v docker-compose &>/dev/null; then
            log_error "Docker Compose 安装失败，请手动安装后重试！"
            sleep 1
            exit 1
        fi
        log_ok "Docker Compose 安装成功！"
    fi
}

docker_check_env
```

- 全面检查

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

docker_check_env() {
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "正在检查 Docker 运行环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"

    if command -v docker &>/dev/null; then
        local ver
        ver=$(docker --version | awk '{print $3}' | sed 's/,//g')
        log_ok "Docker 已安装，版本：${gl_lv}$ver${gl_bai}"
    else
        log_warn "Docker 未安装，即将自动安装 Docker 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_docker.sh)

        if ! command -v docker &>/dev/null; then
            log_error "Docker 安装失败，请手动安装后重试！"
            exit_animation
            exit 1
        fi
        log_ok "Docker 安装成功！"
    fi

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "正在检查 Docker Compose 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"

    if command -v docker-compose &>/dev/null; then
        local ver
        ver=$(docker-compose --version 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1)
        [ -z "$ver" ] && ver=$(docker-compose --version 2>/dev/null | awk '{print $3}' | sed 's/,//g')
        log_ok "Docker Compose 已安装，版本：${gl_lv}$ver${gl_bai}"
    else
        log_warn "Docker Compose 未安装，即将自动安装${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_compose.sh)

        if ! command -v docker-compose &>/dev/null; then
            log_error "Docker Compose 安装失败，请手动安装后重试！"
            exit_animation
            exit 1
        fi
        log_ok "Docker Compose 安装成功！"
    fi

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_ok "Docker 运行环境准备完成！"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    sleep 1
}

docker_check_env
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
