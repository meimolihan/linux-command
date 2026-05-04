compose_install_siyuan
===

Docker Compose 一键部署 思源笔记

## 补充说明

`compose_install_siyuan` 是基于 Docker Compose 的思源笔记自动化部署脚本，支持交互式传参和命令行传参两种使用方式，自动检测并安装 Docker 及 Docker Compose 环境，生成对应配置文件并启动容器，同时提供一键卸载功能。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/compose_install_siyuan.sh) 6806 /vol1/1000/compose/siyuan
```

## 效果预览

![](https://file.meimolihan.eu.org/screenshot/compose_install_siyuan-01.webp)

![WEB效果预览](https://file.meimolihan.eu.org/screenshot/compose_install_siyuan-02.webp)

## 脚本源码

> 1. 不传参 → 正常交互式 
>
>   > 脚本.sh 
> 2. 先目录后端口 
>
>   > 脚本.sh /vol1/1000/compose/siyuan 6806
> 3. 先端口后目录 
>
>   > 脚本.sh 8088 /vol1/1000/compose/siyuan
> 4. 只传目录 
>
>   > 脚本.sh /vol1/1000/compose/siyuan
> 5. 只传端口 
>
>   > 脚本.sh 6806



```bash
#!/bin/bash
set -uo pipefail

# ====================== 【可自定义配置区】 在这里修改所有默认参数 ======================
# 项目标题
DEFAULT_TITLE="思源笔记 一键部署"

# 部署目录（不传参时的默认路径）
DEFAULT_COMPOSE_DIR="/vol1/1000/compose/siyuan"

# 默认访问端口（不传参时使用）
DEFAULT_PORT="6806"

# 默认容器名称（可自定义）
DEFAULT_CONTAINER_NAME="siyuan"
# ====================================================================================

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
        local filter_name="$1"
        local docker_filter=""

        if [ -n "$filter_name" ]; then
            docker_filter="--filter name=${filter_name}"
        fi

        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "容器ID" "名称" "状态" "端口" "创建时间" "镜像" "$reset"
        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "----------" "----------" "----------" "----------" "----------" "----------" "$reset"

        docker ps ${docker_filter} --format "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.RunningFor}}\t{{.Image}}" | \
        awk -v green="$gl_lv" -v yellow="$gl_huang" -v cyan="$gl_bufan" -v blue="$gl_lan" -v white="$gl_bai" -v reset="$reset" -v gl_bai="$gl_bai" '
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

    log_info "清理悬空镜像与未使用镜像${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
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

deploy_app() {
    local COMPOSE_DIR=""
    local HOST_PORT=""

    clear
    echo -e "${gl_zi}>>> ${DEFAULT_TITLE}${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    
    echo -e ""
    docker_check_env

    for arg in "$@"; do
        if [[ "$arg" =~ ^[0-9]+$ ]]; then
            HOST_PORT="$arg"
        else
            COMPOSE_DIR="$arg"
        fi
    done

    if [ -z "${COMPOSE_DIR}" ]; then
        read -r -e -p "${gl_bai}请输入 docker-compose 存放路径（回车默认：${gl_huang}${DEFAULT_COMPOSE_DIR}${gl_bai}）(${gl_hong}0${gl_bai} 退出安装)：" input_dir
        COMPOSE_DIR=${input_dir:-$DEFAULT_COMPOSE_DIR}
    else
        log_info "已通过传参指定部署目录：${gl_huang}${COMPOSE_DIR}${gl_bai}"
    fi

    if [ "$COMPOSE_DIR" = "0" ]; then
        exit_script
        return 1
    fi

    log_info "部署目录：${gl_huang}${COMPOSE_DIR}${gl_bai}"
    mkdir -p "${COMPOSE_DIR}" || { log_error "目录创建失败"; break_end; return 1; }
    cd "${COMPOSE_DIR}" || { log_error "进入目录失败"; break_end; return 1; }

    echo -e ""

    if [ -z "${HOST_PORT}" ]; then
        read -r -e -p "${gl_bai}请输入映射端口（回车默认：${gl_huang}${DEFAULT_PORT}${gl_bai}）(${gl_hong}0${gl_bai} 退出安装)：" input_port
        HOST_PORT=${input_port:-$DEFAULT_PORT}
    else
        log_info "已通过传参指定端口：${gl_lv}${HOST_PORT}${gl_bai}"
    fi

    if [ "$HOST_PORT" = "0" ]; then
        exit_script
        rm -rf "${COMPOSE_DIR}"
        return 1
    fi

    log_info "使用端口：${gl_lv}${HOST_PORT}${gl_bai}"
    echo -e ""

    clean_old_container "${DEFAULT_CONTAINER_NAME}"

    echo -e ""
    echo -e "${gl_huang}>>> 生成 ${gl_lv}docker-compose.yml${gl_huang} 文件${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    cat > docker-compose.yml << EOF
services:
   ${DEFAULT_CONTAINER_NAME}:
      container_name: ${DEFAULT_CONTAINER_NAME}
      image: b3log/siyuan:latest
      restart: always
      ports:
         - ${HOST_PORT}:6806
      volumes:
         - ./workspace:/siyuan/workspace
      environment:
         - TZ=Asia/Shanghai
         - PUID=1000
         - PGID=1000
      command:
         - --workspace=/siyuan/workspace/
         - --accessAuthCode=123456 # 默认密码
EOF

    if [ -f "docker-compose.yml" ]; then
        log_ok "配置文件创建成功"
    else
        log_error "配置文件创建失败"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        break_end
        return 1
    fi

    echo -e ""
    echo -e "${gl_huang}>>> 尝试启动容器${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    if docker-compose up -d; then
        log_ok "容器启动成功"
    else
        log_warn "docker-compose 启动失败，尝试兼容版 docker compose${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        docker compose up -d || { log_error "容器启动失败"; break_end; return 1; }
        log_ok "容器启动成功"
    fi

    echo -e ""
    echo -e "${gl_huang}>>> 容器运行状态${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    docker-ps-cn ${DEFAULT_CONTAINER_NAME}
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    log_info "部署完成！"
    log_info "访问地址：${gl_lv}http://${LOCAL_IP}:${HOST_PORT}${gl_bai}"
    log_info "部署目录：${gl_huang}${COMPOSE_DIR}${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

deploy_app "$@"
```

## 一键完全卸载命令

```bash
# 停止并删除容器 + 删除镜像 + 删除部署目录(按需修改)
docker rm -f siyuan && docker rmi -f b3log/siyuan:latest && rm -rf /vol1/1000/compose/siyuan
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
