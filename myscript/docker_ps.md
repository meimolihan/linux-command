docker_ps
===

【Docker容器列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_ps.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_ps.webp "截图演示")

## 补充说明

该脚本用于美化显示 Docker 容器列表，基于 `docker ps -a` 命令实现，适合需要查看所有容器（包括已停止）运行状态、端口映射等信息的场景。

### 功能特点

* 彩色输出：容器 ID（青色）、镜像（蓝色）、状态（黄色）、名称（绿色）使用不同颜色区分
* 时间本地化：自动将英文时间转换为中文显示（如 "2 days ago" → "2天前"）
* 表格格式化：自动对齐各列，提升可读性
* 显示全面：同时显示运行中与已停止的容器

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 容器ID | 容器唯一标识（截取前12位） |
| 镜像 | 容器使用的镜像名称 |
| 命令 | 容器启动时执行的命令 |
| 创建时间 | 容器创建至今的时间（中文显示） |
| 状态 | 容器当前状态及运行时长（中文显示） |
| 端口 | 容器端口与主机端口的映射关系 |
| 名称 | 容器的名称 |

### 注意事项

* 需要系统已安装 Docker 并正常运行
* 需要 `column` 命令（通常系统已自带）
* 时间转换支持：年/月/周/天/小时/分钟/秒的中文显示
* 脚本会显示所有容器（包括已停止的），不仅仅是运行中的容器

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

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键继续${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}\c"
    read -r -n 1 -s -r -p ""
    echo ""
    clear
}

column_if_available() {
    if command -v column &> /dev/null; then
        column -t -s $'\t'
    else
        cat
    fi
}

list_beautify_docker_ps() {
    {
        printf "%s%s\t%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "容器ID" "镜像" "命令" "创建时间" "状态" "端口" "名称" "$reset"
        printf "%s%s\t%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "--------" "--------" "--------" "--------" "--------" "--------" "--------" "$reset"

        docker ps -a --format "{{.ID}}\t{{.Image}}\t{{.Command}}\t{{.RunningFor}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}" | \
        awk -v cyan="$gl_bufan" -v green="$gl_lv" -v yellow="$gl_huang" -v blue="$gl_lan" -v white="$gl_bai" -v reset="$reset" '
        BEGIN {FS="\t"; OFS="\t"}
        {
            id = substr($1, 1, 12)
            image = $2
            cmd = $3
            created = $4
            status = $5
            ports = $6
            name = $7

            gsub(/ years ago/, "年前", created)
            gsub(/ year ago/, "年前", created)
            gsub(/ months ago/, "个月前", created)
            gsub(/ month ago/, "个月前", created)
            gsub(/ weeks ago/, "周前", created)
            gsub(/ week ago/, "周前", created)
            gsub(/ days ago/, "天前", created)
            gsub(/ day ago/, "天前", created)
            gsub(/ hours ago/, "小时前", created)
            gsub(/ hour ago/, "小时前", created)
            gsub(/ minutes ago/, "分钟前", created)
            gsub(/ minute ago/, "分钟前", created)
            gsub(/ seconds ago/, "秒前", created)
            gsub(/ second ago/, "秒前", created)
            gsub(/About /, "", created)

            gsub(/ years ago/, "年前", status)
            gsub(/ year ago/, "年前", status)
            gsub(/ months ago/, "个月前", status)
            gsub(/ month ago/, "个月前", status)
            gsub(/ weeks ago/, "周前", status)
            gsub(/ week ago/, "周前", status)
            gsub(/ days ago/, "天前", status)
            gsub(/ day ago/, "天前", status)
            gsub(/ hours ago/, "小时前", status)
            gsub(/ hour ago/, "小时前", status)
            gsub(/ minutes ago/, "分钟前", status)
            gsub(/ minute ago/, "分钟前", status)
            gsub(/ seconds ago/, "秒前", status)
            gsub(/ second ago/, "秒前", status)
            gsub(/About /, "", status)

            print cyan id reset, blue image reset, white cmd reset, blue created reset, yellow status reset, white ports reset, green name reset
        }'
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Docker容器列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_docker_ps
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

list_beautify_all
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
