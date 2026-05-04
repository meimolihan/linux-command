linux_command
===

一键克隆、构建 linux-command 项目，自动生成 Docker 镜像与 compose 配置并启动服务，输出可直接访问的地址。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_command.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_command-01.webp "截图演示")

![WEB效果预览-随机壁纸](https://file.meimolihan.eu.org/screenshot/linux_command-02.webp "截图演示")

![WEB效果预览-本地壁纸](https://file.meimolihan.eu.org/screenshot/linux_command-03.webp "截图演示")

## 补充说明

该脚本用于一键克隆、构建 linux-command 项目，自动生成 Docker 镜像与 compose 配置并启动服务，适合快速部署 linux-command 文档站点的场景。

### 功能特点

* 一键部署：自动克隆代码、构建镜像、生成配置、启动服务
* Docker 化：基于 Docker Compose 部署，环境隔离、迁移方便
* 自动配置：自动生成 compose.yml 配置，包含端口映射和卷挂载
* 壁纸功能：支持随机壁纸和本地壁纸两种模式
* 彩色输出：全程彩色提示，部署进度清晰可见

### 部署说明

脚本默认配置：

| 配置项 | 默认值 |
| --- | --- |
| 项目目录 | /opt/linux-command |
| 访问端口 | 3000 |
| 容器名称 | linux-command |

### 使用方法

```bash
# 一键部署 linux-command 项目
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_command.sh)
```

### 注意事项

* 需要系统已安装 Docker 和 Docker Compose
* 确保 3000 端口未被占用（或修改脚本中的端口配置）
* 部署完成后访问 http://服务器IP:3000 查看效果
* 项目数据持久化存储在挂载的卷中

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

log_info()  { echo -e "${gl_lan}[信息]${gl_bai} $*"; }
log_ok()    { echo -e "${gl_lv}[成功]${gl_bai} $*"; }
log_warn()  { echo -e "${gl_huang}[警告]${gl_bai} $*"; }
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; exit 1; }

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
    echo -e "${gl_bai}按任意键退出${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai} \c"
    read -r -n 1 -s -p ""
    echo ""
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
            echo -e "${gl_huang}${pkg}${gl_bai} ${gl_lv}已安装${gl_bai}" \
                "$([[ -n "$ver" ]] && echo "版本 ${gl_lv}${ver}${gl_bai}")"
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

column_if_available() {
    if command -v column &> /dev/null; then
        column -t -s $'\t'
    else
        cat
    fi
}

docker-ps-cn() {
    {
        gl_hui=$'\033[38;5;59m'
        gl_hong=$'\033[38;5;9m'
        gl_lv=$'\033[38;5;10m'
        gl_huang=$'\033[38;5;11m'
        gl_lan=$'\033[38;5;32m'
        gl_bai=$'\033[38;5;15m'
        gl_zi=$'\033[38;5;13m'
        gl_bufan=$'\033[38;5;14m'
        reset=$'\033[0m'

        local filter_name="${1:-linux-command}"

        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "容器ID" "名称" "状态" "端口" "创建时间" "镜像" "$reset"
        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "----------" "----------" "----------" "----------" "----------" "----------" "$reset"

        docker ps --filter "name=${filter_name}" --format "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.RunningFor}}\t{{.Image}}" | \
        awk -v green="$gl_lv" -v yellow="$gl_huang" -v cyan="$gl_bufan" -v blue="$gl_lan" -v white="$gl_bai" -v reset="$reset" '
        BEGIN {FS="\t"; OFS="\t"}
        {
            id = substr($1, 1, 12)
            name = $2
            status = $3
            ports = $4
            time = $5
            image = $6

            gsub(/ years ago/, "年前", time)
            gsub(/ year ago/, "年前", time)
            gsub(/ months ago/, "个月前", time)
            gsub(/ month ago/, "个月前", time)
            gsub(/ weeks ago/, "周前", time)
            gsub(/ week ago/, "周前", time)
            gsub(/ days ago/, "天前", time)
            gsub(/ day ago/, "天前", time)
            gsub(/ hours ago/, "小时前", time)
            gsub(/ hour ago/, "小时前", time)
            gsub(/ minutes ago/, "分钟前", time)
            gsub(/ minute ago/, "分钟前", time)
            gsub(/ seconds ago/, "秒前", time)
            gsub(/ second ago/, "秒前", time)
            gsub(/About /, "", time)

            print cyan id reset, green name reset, yellow status reset, blue ports reset, white time reset, gl_bai image reset
        }'
    } | column_if_available
}

DEFAULT_TAG="latest"
DEFAULT_DIR="/vol1/1000/compose/linux-command"
DEFAULT_PORT="9665"
REPO_URL="https://github.com/meimolihan/linux-command.git"
PROJECT_DIR="/tmp/linux-command"

check_node_env() {
    echo -e ""
    echo -e "${gl_huang}>>> 检查 Node.js 环境${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 && command -v git >/dev/null 2>&1; then
        log_ok "Node.js 已安装：${gl_lv}$(node -v)${gl_bai}"
        log_ok "npm 已安装：${gl_lv}$(npm -v)${gl_bai}"
        log_ok "git 安装完成：${gl_lv}$(git -v)${gl_bai}"
        log_info "检测到已存在 Node.js 环境，跳过安装步骤"
        return 0
    fi
    
    log_info "未检测到 Node.js，开始自动安装 Node.js 20"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    install -y nodejs || log_error "Node.js 安装失败"
    log_ok "Node.js 安装完成：${gl_lv}$(node -v)${gl_bai}"
    log_ok "npm 安装完成：${gl_lv}$(npm -v)${gl_bai}"
    log_ok "git 安装完成：${gl_lv}$(git -v)${gl_bai}"
}

clean_old_container() {
    echo -e "${gl_huang}>>> 清理旧容器${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    local container_name="linux-command"
    local compose_container="command"
    
    if docker ps -a --filter "name=^/${container_name}$" | grep -q "${container_name}"; then
        log_info "检测到旧容器 ${gl_huang}${container_name}${gl_bai}，正在停止并删除${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        docker stop "${container_name}" >/dev/null 2>&1
        docker rm -f "${container_name}" >/dev/null 2>&1
        log_ok "旧容器 ${container_name} 清理完成"
    fi
    
    if docker ps -a --filter "name=^/${compose_container}$" | grep -q "${compose_container}"; then
        log_info "检测到旧容器 ${gl_huang}${compose_container}${gl_bai}，正在停止并删除${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        docker stop "${compose_container}" >/dev/null 2>&1
        docker rm -f "${compose_container}" >/dev/null 2>&1
        log_ok "旧容器 ${compose_container} 清理完成"
    fi

    log_info "清理Docker残留资源${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    docker container prune -f >/dev/null 2>&1
    docker network prune -f >/dev/null 2>&1
    
    log_ok "所有旧容器/残留清理完成，无名称冲突"
}

main() {
    install git
    clear
    echo -e "${gl_zi}>>> linux-command 一键部署脚本${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    docker_check_env
    
    if [ "$(id -u)" -ne 0 ]; then
        log_error "请使用 root 权限运行脚本"
    fi

    echo -e ""
    echo -e "${gl_huang}>>> 克隆 ${gl_lv}linux-command${gl_bai} ${gl_huang}项目${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    echo -e "${gl_bai}项目地址：${gl_lv}https://github.com/meimolihan/linux-command${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "开始克隆项目到 ${gl_huang}${PROJECT_DIR}${gl_bai}"
    rm -rf "${PROJECT_DIR}"
    git clone "${REPO_URL}" "${PROJECT_DIR}" || log_error "项目克隆失败"
    cd "${PROJECT_DIR}" || log_error "进入项目目录失败"
    log_ok "项目克隆完成"
    
    check_node_env
    
    echo -e ""
    echo -e "${gl_huang}>>> 安装项目依赖并构建项目${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    npm install || log_error "依赖安装失败"
    log_ok "依赖安装完成"
    log_info "构建项目生成 .deploy 目录"
    npm run build || log_error "项目构建失败"
    log_ok "项目构建完成"
    
    echo -e ""
    echo -e "${gl_huang}>>> 构建 Docker 镜像${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}请输入 Docker 镜像标签 [默认:${gl_huang}${DEFAULT_TAG}${gl_bai}]: ")" INPUT_TAG
    IMAGE_TAG="${INPUT_TAG:-${DEFAULT_TAG}}"
    IMAGE_NAME="mobufan/linux-command:${IMAGE_TAG}"

    log_info "构建镜像：${gl_huang}${IMAGE_NAME}${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    docker build -t "${IMAGE_NAME}" . || log_error "镜像构建失败"
    log_ok "镜像构建成功"

    echo -e ""
    echo -e "${gl_huang}>>> 部署 Docker 容器${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}请输入部署目录 [默认:${gl_huang}${DEFAULT_DIR}${gl_bai}]: ")" INPUT_DIR
    COMPOSE_DIR="${INPUT_DIR:-${DEFAULT_DIR}}"

    mkdir -p "${COMPOSE_DIR}" || log_error "目录创建失败"
    cd "${COMPOSE_DIR}" || log_error "进入部署目录失败"

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}请输入映射端口 [默认:${gl_huang}${DEFAULT_PORT}${gl_bai}]: ")" INPUT_PORT
    HOST_PORT="${INPUT_PORT:-${DEFAULT_PORT}}"

    log_info "生成 docker-compose.yml"
    cat > docker-compose.yml << EOF
services:
    linux-command:
        image: ${IMAGE_NAME}
        container_name: linux-command
        ports:
            - ${HOST_PORT}:3000
        restart: always
EOF
    log_ok "配置文件生成完成"

    echo -e ""

    clean_old_container
    
    echo -e ""
    echo -e "${gl_huang}>>> 启动 Docker 容器${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    read -r -e -p "$(echo -e "${gl_bai}是否启动 Docker 容器(${gl_lv}y${gl_bai}/${gl_hong}N${gl_bai}): ")" START_CHOICE
    case "${START_CHOICE}" in
        [Yy])
            log_info "尝试启动容器 (docker compose up -d)${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            if docker compose up -d; then
                log_ok "容器启动成功"
            else
                log_warn "docker compose 启动失败，尝试兼容版 docker-compose${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
                docker-compose up -d || log_error "容器启动失败"
                log_ok "容器启动成功"
            fi
            ;;
        [Nn])
            cancel_return "主菜单"
            return
            ;;
        *) handle_y_n ;;
    esac

    echo -e ""
    echo -e "${gl_huang}>>> 容器运行状态${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    docker-ps-cn linux-command
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_ok "部署完成！"
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    log_info "访问地址：${gl_lv}http://${LOCAL_IP}:${HOST_PORT}${gl_bai}"
    log_info "部署目录：${gl_huang}${COMPOSE_DIR}${gl_bai}"
    log_info "使用镜像：${gl_huang}${IMAGE_NAME}${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "开始清理临克隆项目目录：${gl_huang}${PROJECT_DIR}${gl_bai}"
    rm -rf "${PROJECT_DIR}"
    if [ ! -d "${PROJECT_DIR}" ]; then
        log_ok "临时目录清理成功"
    else
        log_warn "临时目录清理失败，请手动检查"
    fi
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

main
exit_script
```

## 一键完全卸载命令

```bash
# 停止并删除容器 + 删除镜像 + 删除部署目录(按需修改)
docker rm -f linux-command && docker rmi -f mobufan/linux-command:latest && rm -rf /vol1/1000/compose/linux-command
```

## 相关命令

- [linux_command](../c/linux_command.html "在线安装 linux-command")  👈 当前所在位置
- [linux_command_local](../c/linux_command_local.html "本地安装 linux-command")

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
