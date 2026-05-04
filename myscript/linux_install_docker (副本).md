linux_install_docker
===

自动识别系统与地区，一键安装 / 升级 Docker 环境，国内自动配置镜像加速并设置开机自启。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_docker.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_install_docker.webp "截图演示")

## 补充说明

该脚本用于自动识别系统与地区，一键安装/升级 Docker 环境，国内自动配置镜像加速并设置开机自启，适合快速部署 Docker 环境的场景。

### 功能特点

* 自动识别：自动检测系统类型（Debian/Ubuntu/CentOS等）和地区
* 一键安装：自动安装或升级 Docker 到最新版本
* 镜像加速：国内环境自动配置 Docker 镜像加速器
* 开机自启：自动设置 Docker 服务开机自启动
* 彩色输出：全程彩色提示，安装进度清晰可见

### 安装说明

脚本会自动执行以下操作：

| 步骤 | 说明 |
| --- | --- |
| 系统检测 | 识别操作系统类型和版本 |
| 地区检测 | 判断是否为国内网络环境 |
| 安装 Docker | 自动安装最新版 Docker 及插件 |
| 配置镜像加速 | 国内环境自动配置加速器 |
| 设置自启 | 设置 Docker 开机自启动 |

### 使用方法

```bash
# 一键安装/升级 Docker
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_install_docker.sh)
```

### 注意事项

* 需要 root 权限或 sudo 权限执行
* 安装前建议备份重要数据
* 国内网络环境会自动配置镜像加速器
* 如已安装 Docker，会自动升级到最新版本
* 安装完成后可使用 `docker --version` 验证

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

install_add_docker_cn() {
    local country
    country=$(curl -s ipinfo.io/country 2>/dev/null || echo "US")
    if [ "$country" = "CN" ]; then
        log_info "检测到中国地区，配置国内镜像加速"
        cat >/etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.m.ixdev.cn",
    "https://hub.rat.dev",
    "https://dockerproxy.net",
    "https://docker-registry.nmqu.com",
    "https://docker.amingg.com",
    "https://docker.hlmirror.com",
    "https://hub1.nat.tf",
    "https://hub2.nat.tf",
    "https://hub3.nat.tf",
    "https://docker.m.daocloud.io",
    "https://docker.kejilion.pro",
    "https://docker.367231.xyz",
    "https://hub.1panel.dev",
    "https://dockerproxy.cool",
    "https://docker.apiba.cn",
    "https://proxy.vvvv.ee"
  ]
}
EOF
    else
        log_info "非中国地区，不配置国内镜像"
        rm -f /etc/docker/daemon.json 2>/dev/null
    fi

    echo -e ""
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    if command -v systemctl &>/dev/null; then
        systemctl enable docker >/dev/null 2>&1
        systemctl start docker >/dev/null 2>&1
        systemctl restart docker >/dev/null 2>&1
        log_ok "Docker 已设置开机自启并重启完成"
    else
        log_warn "无 systemctl，跳过服务自启设置"
    fi
}

install_add_docker_guanfang() {
    local country
    country=$(curl -s ipinfo.io/country 2>/dev/null || echo "US")
    
    if [ "$country" = "CN" ]; then
        log_info "中国地区使用阿里云镜像安装 ${gl_huang}Docker${gl_bai}"
        cd ~ || return 1
        curl -sS -O raw.githubusercontent.com/kejilion/docker/main/install
        chmod +x install
        sh install --mirror Aliyun
        rm -f install
    else
        log_info "海外地区使用官方脚本安装"
        curl -fsSL https://get.docker.com | sh
    fi
    
    install_add_docker_cn
}

install_add_docker() {
    clear
    echo -e "${gl_zi}>>> 安装 ${gl_huang}docker${gl_zi} 环境${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    read -r -e -p "${gl_bai}确定要安装 ${gl_huang}docker${gl_bai} 环境吗？ (${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo -e "${gl_huang}已取消安装操作${gl_bai}"
        exit_animation
        return
    fi

    log_info "开始检测系统并安装 ${gl_huang}Docker${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    if [ -f /etc/os-release ] && grep -q "Fedora" /etc/os-release; then
        log_info "检测到 ${gl_huang}Fedora${gl_bai} 系统"
        install_add_docker_guanfang

    elif command -v dnf &>/dev/null; then
        log_info "检测到 ${gl_huang}RHEL 系系统${gl_bai} (dnf)"
        dnf update -y
        dnf install -y yum-utils device-mapper-persistent-data lvm2
        rm -f /etc/yum.repos.d/docker*.repo 2>/dev/null
        
        country=$(curl -s ipinfo.io/country 2>/dev/null || echo "US")
        if [ "$country" = "CN" ]; then
            curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo | tee /etc/yum.repos.d/docker-ce.repo >/dev/null
        else
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo >/dev/null
        fi
        
        dnf install -y docker-ce docker-ce-cli containerd.io
        install_add_docker_cn

    elif [ -f /etc/os-release ] && grep -q "Kali" /etc/os-release; then
        log_info "检测到 ${gl_huang}Kali Linux${gl_bai} 系统"
        apt update
        apt upgrade -y
        apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
        mkdir -p /etc/apt/keyrings
        
        country=$(curl -s ipinfo.io/country 2>/dev/null || echo "US")
        arch=$(uname -m)
        
        if [ "$country" = "CN" ]; then
            curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker-archive-keyring.gpg >/dev/null
            if [ "$arch" = "x86_64" ]; then
                echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/debian bullseye stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
            elif [ "$arch" = "aarch64" ]; then
                echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/debian bullseye stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
            fi
        else
            curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker-archive-keyring.gpg >/dev/null
            if [ "$arch" = "x86_64" ]; then
                echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bullseye stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
            elif [ "$arch" = "aarch64" ]; then
                echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bullseye stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
            fi
        fi
        
        apt update
        apt install -y docker-ce docker-ce-cli containerd.io
        install_add_docker_cn

    elif command -v apt &>/dev/null || command -v yum &>/dev/null; then
        log_info "检测到 ${gl_huang}Debian/Ubuntu/CentOS${gl_bai} 通用系统"
        install_add_docker_guanfang

    else
        log_warn "未知系统，尝试直接安装 Docker"
        install -y docker docker-compose 2>/dev/null || apt install -y docker docker-compose || yum install -y docker docker-compose
        install_add_docker_cn
    fi

    local ver
    ver=$(docker --version | awk '{print $3}' | sed 's/,//g')
    log_ok "Docker 版本：${gl_lv}$ver${gl_bai}"
    log_ok "Docker 环境安装完成！"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
}

install_add_docker
```


## 相关命令

- [linux_install_docker](../c/linux_install_docker.html "Docker 一键安装脚本")  👈 当前所在位置
- [linux_uninstall_docker](../c/linux_uninstall_docker.html "Docker 卸载脚本")
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
