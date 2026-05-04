docker_ps_find
===

美化显示 Docker 运行中容器，不传参展示全部，传参则按名称筛选，自带中文时间与彩色排版。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_ps_find.sh) md dufs
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_ps_find.webp "截图演示")

## 补充说明

该脚本用于美化显示 Docker 运行中的容器列表，支持按名称筛选，基于 `docker ps` 命令实现，适合快速查找特定容器的场景。

### 功能特点

* 筛选功能：支持传入容器名称参数进行模糊匹配
* 彩色输出：容器信息使用不同颜色区分（ID-青色、镜像-蓝色、状态-黄色、名称-绿色）
* 时间本地化：自动将英文时间转换为中文显示
* 表格格式化：自动对齐各列，提升可读性
* 灵活使用：不传参显示全部运行中容器，传参则筛选显示

### 使用方法

```bash
# 显示所有运行中的容器
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_ps_find.sh)

# 筛选名称包含 "md" 或 "dufs" 的容器
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_ps_find.sh) md dufs
```

### 注意事项

* 只显示运行中的容器，不包括已停止的容器
* 筛选参数为模糊匹配，只要容器名包含该字符串就会显示
* 需要系统已安装 Docker 并正常运行
* 支持同时传入多个筛选关键词

## 脚本源码

传参：`./脚本名.sh  容器名称1 容器名称2`

不传参：`./脚本名.sh`  默认全部容器

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

docker-ps-find() {
    {
        local filters=("$@")

        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "容器ID" "名称" "状态" "端口" "创建时间" "镜像" "$reset"
        printf "%s%s\t%s\t%s\t%s\t%s\t%s%s\n" "$gl_hui" "----------" "----------" "----------" "----------" "----------" "----------" "$reset"

        docker ps --format "{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.RunningFor}}\t{{.Image}}" | \
        
        if [ $# -gt 0 ]; then
            awk -v filters="${filters[*]}" '
            BEGIN {
                split(filters, arr, " ")
                for (i in arr) pattern[arr[i]] = 1
            }
            {
                for (p in pattern) {
                    if ($2 ~ p) {
                        print
                        next
                    }
                }
            }'
        else
            cat
        fi | \

        awk -v green="$gl_lv" -v red="$gl_hong" -v yellow="$gl_huang" -v cyan="$gl_bufan" -v blue="$gl_lan" -v white="$gl_bai" -v reset="$reset" '
        BEGIN {FS="\t"; OFS="\t"}
        {
            id = substr($1, 1, 12)
            name = $2
            status = $3
            ports = $4
            time = $5
            image = $6

            gsub(/healthy/, "健康", status)
            gsub(/unhealthy/, "不健康", status)
            gsub(/starting/, "启动中", status)
            gsub(/Up /, "已运行 ", status)
            gsub(/days/, "天", status)
            gsub(/hours/, "小时", status)
            gsub(/minutes/, "分钟", status)
            gsub(/seconds/, "秒", status)

            if (status !~ /健康|不健康|启动中/) {
                status = status " (正常)"
            }

            gsub(/[0-9]+/, green "&" reset, status)

            gsub(/健康/, green "&" reset, status)    # 健康=绿色
            gsub(/不健康/, red "&" reset, status)    # 不健康=红色
            gsub(/启动中/, yellow "&" reset, status) # 启动中=黄色
            gsub(/正常/, blue "&" reset, status)     # 正常=蓝色

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
            gsub(/About /, "", time)
            
            gsub(/[0-9]+/, green "&" reset, time)

            print cyan id reset, green name reset, yellow status reset, blue ports reset, white time reset, white image reset
        }'
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Docker容器列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    docker-ps-find "$@"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

list_beautify_all "$@"
```


## 相关命令

- [docker_occupy](../c/docker_occupy.html "Docker容器占用列表")
- [docker_occupy_find](../c/docker_occupy_find.html "Docker指定容器占用列表")
- [docker_ps_find](../c/docker_ps_find.html "Docker运行中容器列表")  👈 当前所在位置
- [docker_images](../c/docker_images.html "Docker镜像列表")
- [docker_images_find](../c/docker_images_find.html "Docker镜像列表(过滤)")
- [docker_network](../c/docker_network.html "Docker网络列表")
- [docker_disk](../c/docker_disk.html "Docker磁盘列表")
- [docker_volume](../c/docker_volume.html "Docker卷列表")

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
