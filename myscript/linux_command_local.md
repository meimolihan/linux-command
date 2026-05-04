linux_command_local
===

一键本地构建 linux-command 项目并 Docker 部署，支持传参指定源码与部署目录，自动检查环境、清理旧容器并启动服务。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_command_local.sh) /vol1/1000/compose/opencode/workspace/linux-command /vol1/1000/compose/linux-command 9665
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux-command_local.webp "截图演示")

## 补充说明

### 功能描述
一键本地构建linux-command项目并Docker部署，支持传参指定源码与部署目录，自动检查环境、清理旧容器并启动服务。

### 功能特点
- 支持命令行传参：源码目录、部署目录、映射端口
- 自动检查并安装Docker和Docker Compose环境
- 构建镜像前自动清理同名旧容器和相关镜像
- 自动生成docker-compose.yml配置文件
- 支持docker compose和docker-compose两种命令格式

### 输出说明
| 字段 | 说明 |
|------|------|
| 项目源码目录 | 存放linux-command源代码的目录 |
| 部署运行目录 | 存放docker-compose.yml和运行容器的目录 |
| 映射端口 | 主机端口到容器80端口的映射 |
| 访问地址 | 部署完成后显示的Web访问URL |

### 注意事项
- 需要安装Docker和Docker Compose，脚本会自动检测并安装
- 默认端口为9665，可在参数中自定义
- 脚本会清理名为linux-command的现有容器，请确保数据已备份
- 项目构建需要node.js环境（在Docker构建过程中自动处理）

## 脚本源码

传参：bash linux-command_local.sh /你的项目目录 /你的部署目录 指定端口号

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

list_beautify_docker_images() {
    local filter_image="$1"
    {
        printf "%s%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "仓库" "标签" "镜像ID" "创建时间" "大小" "$reset"
        printf "%s%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "----------" "----------" "----------" "----------" "----------" "$reset"

        if [[ -n "$filter_image" ]]; then
            docker image ls --format "{{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}" "$filter_image"
        else
            docker image ls --format "{{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}"
        fi | \
        awk -v green="$gl_lv" -v yellow="$gl_huang" -v cyan="$gl_bufan" -v blue="$gl_lan" -v white="$gl_bai" -v reset="$reset" '
        BEGIN {FS="\t"; OFS="\t"}
        {
            id = substr($3, 1, 12)
            time = $4
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
            
            print green $1 reset, yellow $2 reset, cyan id reset, blue time reset, white $5 reset
        }'
    } | column_if_available
}

docker_check_env() {
    if ! command -v docker &>/dev/null; then
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
        echo -e ""
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

clean_old_container() {
    if [ $# -eq 0 ]; then
        log_warn "未传入任何容器名称参数，跳过清理"
        return 1
    fi

    local targets=("$@")

    echo -e "${gl_huang}>>> 清理容器与相关镜像（目标：${targets[*]}）${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    for container_name in "${targets[@]}"; do
        if docker ps -a --filter "name=^/${container_name}$" --format "{{.Names}}" | grep -q "^${container_name}$"; then
            log_info "检测到容器 ${gl_huang}${container_name}${gl_bai}，正在停止并删除${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
            docker rm -f "${container_name}" >/dev/null 2>&1
            log_ok "容器 ${container_name} 清理完成"
        else
            log_ok "容器 ${container_name} 不存在，跳过"
        fi
    done

    log_info "开始模糊清理相关镜像（关键词：${targets[*]}）${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    local image_ids=$(docker images --format "{{.ID}}" | grep -f <(printf "%s\n" "${targets[@]}" | sed 's/^/-i /;s/ / -i /g'))
    if [ -n "$image_ids" ]; then
        echo "$image_ids" | xargs docker rmi -f >/dev/null 2>&1
        log_ok "相关镜像已全部删除"
    else
        log_ok "未找到相关镜像"
    fi

    log_info "清理悬空镜像与未使用镜像 ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    docker image prune -a -f >/dev/null 2>&1
    log_ok "未使用镜像清理完成"

    log_info "清理Docker无用资源（容器/网络/卷/构建缓存）${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    docker system prune -a -f --volumes >/dev/null 2>&1
    docker builder prune -af >/dev/null 2>&1
    log_ok "Docker系统资源清理完成"

    log_info "验证清理结果${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    local remain=0
    for name in "${targets[@]}"; do
        docker ps -a --filter "name=^/${name}$" --format "{{.Names}}" | grep -q "^${name}$" && remain=$((remain+1))
    done

    if [ "$remain" -eq 0 ]; then
        log_ok "所有指定容器、镜像、残留资源已彻底清理，无名称冲突"
    else
        log_warn "仍有 ${gl_huang}${remain}${gl_bai} 个相关容器未清理，请手动检查"
    fi
}

deploy_linux_command() {
    clear
    echo -e "${gl_zi}>>> linux-command 项目本地构建一键部署${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    echo -e ""
    docker_check_env

    DEFAULT_PROJECT_DIR="/vol1/1000/compose/opencode/workspace/linux-command"
    DEFAULT_DEPLOY_DIR="/vol1/1000/compose/linux-command"
    DEFAULT_PORT="9665"

    if [ $# -ge 1 ]; then
        PROJECT_DIR="$1"
        log_info "已通过传参指定项目源码目录：${gl_huang}${PROJECT_DIR}${gl_bai}"
    else
        read -r -e -p "${gl_bai}请输入项目源码目录（回车默认：${gl_huang}${DEFAULT_PROJECT_DIR}${gl_bai}）(${gl_hong}0${gl_bai} 退出)：" PROJECT_DIR
        PROJECT_DIR=${PROJECT_DIR:-$DEFAULT_PROJECT_DIR}
    fi

    if [ "$PROJECT_DIR" = "0" ]; then
        exit_script
        return 1
    fi

    if [ $# -ge 2 ]; then
        DEPLOY_DIR="$2"
        log_info "已通过传参指定部署运行目录：${gl_huang}${DEPLOY_DIR}${gl_bai}"
    else
        read -r -e -p "${gl_bai}请输入部署运行目录（回车默认：${gl_huang}${DEFAULT_DEPLOY_DIR}${gl_bai}）(${gl_hong}0${gl_bai} 退出)：" DEPLOY_DIR
        DEPLOY_DIR=${DEPLOY_DIR:-$DEFAULT_DEPLOY_DIR}
    fi

    if [ "$DEPLOY_DIR" = "0" ]; then
        exit_script
        return 1
    fi

    if [ $# -ge 3 ]; then
        HOST_PORT="$3"
        log_info "已通过传参指定映射端口：${gl_lv}${HOST_PORT}${gl_bai}"
    else
        read -r -e -p "${gl_bai}请输入映射端口（回车默认：${gl_huang}${DEFAULT_PORT}${gl_bai}）(${gl_hong}0${gl_bai} 退出)：" HOST_PORT
        HOST_PORT=${HOST_PORT:-$DEFAULT_PORT}
    fi

    if [ "$HOST_PORT" = "0" ]; then
        exit_script
        rm -rf "${DEPLOY_DIR}"
        return 1
    fi

    log_info "项目源码目录：${gl_huang}${PROJECT_DIR}${gl_bai}"
    log_info "部署运行目录：${gl_huang}${DEPLOY_DIR}${gl_bai}"
    log_info "使用端口：${gl_lv}${HOST_PORT}${gl_bai}"
    mkdir -p "${DEPLOY_DIR}" || { log_error "部署目录创建失败"; exit_animation; return 1; }

    echo -e ""

    if [ ! -d "${PROJECT_DIR}" ]; then
        log_error "项目源码目录不存在：${PROJECT_DIR}"
        exit_animation
        return 1
    fi

    clean_old_container "linux-command" "command"

    echo -e ""
    echo -e "${gl_huang}>>> 开始构建项目：${gl_hong}docker build ${gl_bai}→ ${gl_huang}npm install ${gl_bai}→ ${gl_lv}npm run build ${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    cd "${PROJECT_DIR}" || { log_error "进入项目目录失败"; break_end; return 1; }

    log_info "执行 docker build 构建镜像${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    docker build -t mobufan/linux-command:latest . || { log_error "镜像构建失败"; break_end; return 1; }

    log_ok "项目构建 + 镜像制作完成！"
    echo -e ""
    echo -e "${gl_huang}>>> 镜像详情${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_docker_images "mobufan/linux-command:latest"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    echo -e ""
    log_info "生成 docker-compose.yml 配置文件${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    cd "${DEPLOY_DIR}" || { log_error "进入部署目录失败"; exit_animation; return 1; }

    cat > docker-compose.yml << EOF
services:
    linux-command:
        image: mobufan/linux-command:latest
        container_name: linux-command
        restart: always
        ports:
            - ${HOST_PORT}:80
EOF

    if [ -f "docker-compose.yml" ]; then
        log_ok "配置文件创建成功"
    else
        log_error "配置文件创建失败"
        exit_animation; return 1
    fi

    echo -e ""
    log_info "启动容器 (docker compose up -d)${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    if docker compose up -d; then
        log_ok "容器启动成功"
    else
        log_warn "docker compose 启动失败，尝试兼容版 docker-compose${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        docker-compose up -d || { log_error "容器启动失败"; exit_animation; return 1; }
        log_ok "容器启动成功"
    fi

    echo -e ""
    echo -e "${gl_huang}>>> 容器运行状态${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    docker-ps-cn linux-command
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    LOCAL_IP=$(hostname -I | awk '{print $1}')
    log_info "部署完成！"
    log_info "访问地址：${gl_lv}http://${LOCAL_IP}:${HOST_PORT}${gl_bai}"
    log_info "项目源码目录：${gl_huang}${PROJECT_DIR}${gl_bai}"
    log_info "部署运行目录：${gl_huang}${DEPLOY_DIR}${gl_bai}"
    log_info "容器名称：${gl_lv}linux-command${gl_bai}"
    log_info "使用镜像：${gl_lv}mobufan/linux-command:latest${gl_bai}"

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

deploy_linux_command "${1:-}" "${2:-}" "${3:-}"
```


## 相关命令

- [linux_command](../c/linux_command.html "在线安装 linux-command")
- [linux_command_local](../c/linux_command_local.html "本地安装 linux-command")  👈 当前所在位置

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
