docker_login
===

自动检测 Linux 发行版并安装配置 Docker 加密凭证助手，将 Docker 登录凭证通过系统密钥环安全存储。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_login.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_login.webp "截图演示")

## 补充说明

该脚本用于自动检测 Linux 发行版并安装配置 Docker 加密凭证助手，基于 GPG 密钥和 pass 工具实现，适合需要安全存储 Docker Hub 登录凭证的场景。

### 功能特点

* 自动检测包管理器：支持 apt (Debian/Ubuntu)、dnf/yum (CentOS/RHEL/Fedora)、pacman (Arch)、apk (Alpine)
* 完全清理旧配置：删除旧的 GPG 密钥、Docker 凭证、残留配置文件
* 自动安装依赖：curl、ca-certificates、rng-tools、pass、gnupg
* 下载加密助手：根据系统架构（x86_64/ARM64）下载对应的 docker-credential-pass
* 生成 GPG 密钥：创建 4096 位 RSA 密钥对用于加密存储
* 配置 pass 存储：初始化密码管理器用于存储 Docker 凭证
* 配置 Docker：设置 config.json 使用 pass 作为凭证存储后端

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 包管理器检测 | 显示检测到的系统包管理器类型 |
| 依赖安装进度 | 显示 curl、pass、gnupg、rng-tools 等依赖的安装状态 |
| 旧配置清理 | 显示清理旧密钥、GPG、Docker 凭证的结果 |
| 加密助手安装 | 显示下载和安装 docker-credential-pass 的状态 |
| GPG 密钥生成 | 显示 4096 位 RSA 密钥的生成进度和结果 |
| pass 初始化 | 显示密码存储初始化的结果 |
| Docker 配置 | 显示 config.json 配置的结果 |
| 完成提示 | 显示全部完成信息和登录示例（使用 PAT 令牌） |

### 注意事项

* 脚本需要 root 权限来安装依赖和修改系统配置
* 该脚本会完全清空旧的 Docker 凭证和 GPG 配置，请谨慎使用
* 需要提前在 Docker Hub 创建 PAT (Personal Access Token)，权限需勾选 read & write
* 生成的 GPG 密钥无密码保护，适合自动化场景
* 支持的架构：x86_64 和 ARM64 (aarch64)
* 配置完成后，使用 `docker login -u 用户名 -p dckr_pat_密钥` 登录
* 登录凭证会安全存储在系统密钥环中，无需每次都输入密码
* 如果 rng-tools 启动失败，脚本会尝试使用 rngd 作为备用

## 创建 PAT 令牌

[Docker Hub 创建 PAT 令牌](https://app.docker.com/settings/personal-access-tokens "Docker Hub 创建 PAT 令牌")

**创建步骤：**


1. 点击 **New Personal Access Token**

2. 名字随便填

3. 权限勾选：
	- `read & write`
	- `Delete`（可选）

4. 点击 **Generate**

5. **复制生成的以 `dckr_` 开头的令牌**（这就是你的新密码）

## 脚本源码

```bash
#!/bin/bash
set -euo pipefail

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
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; exit 1; }

detect_pkg() {
    if command -v apt &>/dev/null; then echo "apt"
    elif command -v dnf &>/dev/null; then echo "dnf"
    elif command -v yum &>/dev/null; then echo "yum"
    elif command -v pacman &>/dev/null; then echo "pacman"
    elif command -v apk &>/dev/null; then echo "apk"
    else echo "unknown"; fi
}

check_docker() {
    if ! command -v docker &>/dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
    fi
    log_ok "Docker 已安装"
}

clean_all_old_keys() {
    log_info "正在清理所有旧密钥、GPG、Docker 凭证、残留配置${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    pkill -f gpg-agent 2>/dev/null || true
    rm -rf /root/.gnupg /root/.password-store /root/.docker
    rm -f /usr/local/bin/docker-credential-pass /usr/local/bin/docker-credential-secretservice
    mkdir -p /root/.gnupg
    chmod 700 /root/.gnupg
    log_ok "旧密钥与配置已**完全清空**"
}

install_deps() {
    local pkg=$(detect_pkg)
    log_info "检测到包管理器：$pkg"
    log_info "安装依赖${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    case $pkg in
        apt)
            apt update -y
            apt install -y curl ca-certificates rng-tools5 pass gnupg
            ;;
        dnf)
            dnf install -y curl pass gnupg2 rng-tools
            ;;
        yum)
            yum install -y epel-release
            yum install -y curl pass gnupg2 rng-tools
            ;;
        pacman)
            pacman -S --noconfirm curl pass gnupg rng-tools
            ;;
        apk)
            apk add curl pass gnupg rng-tools
            ;;
        *)
            log_error "不支持的系统包管理器"
            ;;
    esac
    systemctl start rng-tools 2>/dev/null || rngd -r /dev/urandom 2>/dev/null || true
}

install_pass_helper() {
    local helper_path="/usr/local/bin/docker-credential-pass"
    local arch=$(uname -m)
    local url=""
    case "$arch" in
        x86_64)
            url="https://github.com/docker/docker-credential-helpers/releases/download/v0.8.0/docker-credential-pass-v0.8.0.linux-amd64"
            ;;
        aarch64)
            url="https://github.com/docker/docker-credential-helpers/releases/download/v0.8.0/docker-credential-pass-v0.8.0.linux-arm64"
            ;;
        *)
            log_error "不支持的架构: $arch"
            ;;
    esac
    log_info "下载加密助手${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    curl -fSL --connect-timeout 10 --max-time 30 -o "$helper_path" "$url"
    chmod +x "$helper_path"
    log_ok "加密助手安装成功"
}

generate_full_gpg() {
    log_info "生成【带加密能力】的 GPG 密钥${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    export GPG_TTY=$(tty 2>/dev/null || echo /dev/tty)

gpg --batch --passphrase '' --gen-key <<EOF
%echo Generating secure Docker key
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: Docker-Credential
Name-Email: docker@local
Expire-Date: 0
%no-protection
%commit
EOF

    local keyid=$(gpg --list-keys --with-colons | grep '^pub' | cut -d: -f5 | head -1)
    pass init "$keyid" >/dev/null 2>&1
    log_ok "GPG 密钥【加密可用】生成成功"
}

configure_docker() {
    mkdir -p /root/.docker
    cat > /root/.docker/config.json <<'EOF'
{
  "credsStore": "pass"
}
EOF
    chmod 600 /root/.docker/config.json
    log_ok "Docker 已配置 pass 加密存储"
}

main() {
    clear
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_lv}    Docker 加密凭证助手（终极无错版）${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo

    check_docker
    clean_all_old_keys
    install_deps
    install_pass_helper
    generate_full_gpg
    configure_docker

    echo
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_ok "✅ 全部完成！登录一次永久生效"
    echo -e "${gl_huang}使用示例：docker login -u 用户名 -p dckr_pat_密钥${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
}

main
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
