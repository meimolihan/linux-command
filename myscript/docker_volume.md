docker_volume
===

【Docker卷列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_volume.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_volume.webp "截图演示")

## 补充说明

该脚本用于美化显示 Docker 数据卷列表，基于 `docker volume ls` 和 `docker volume inspect` 命令实现，适合查看和管理 Docker 持久化存储卷的场景。

### 功能特点

* 彩色输出：卷名称（绿色）、挂载点（蓝色）、状态（黄色）使用不同颜色区分
* 详细信息：显示每个卷的挂载点、驱动类型、创建时间等信息
* 表格格式化：自动使用 `column` 命令对齐输出
* 排序显示：按卷名称排序，便于查找

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 卷名称 | Docker 数据卷的名称 |
| 驱动 | 卷使用的驱动类型（通常为 local） |
| 挂载点 | 卷在宿主机上的实际路径 |
| 创建时间 | 卷的创建时间（中文显示） |

### 注意事项

* 需要系统已安装 Docker 并正常运行
* 需要 `column` 命令（通常系统已自带）
* 显示的是所有数据卷，包括未被容器使用的
* 可通过 `docker volume rm <卷名>` 删除不再使用的卷

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

list_beautify_docker_volume() {
    {
        printf "%s%s\t%s%s\n" "$gl_hui" "驱动" "卷名" "$reset"
        printf "%s%s\t%s%s\n" "$gl_hui" "--------" "--------" "$reset"

        data=$(docker volume ls --format "{{.Driver}}\t{{.Name}}")
        if [ -z "$data" ]; then
            printf "%s%s\t%s%s\n" "$gl_huang" "(无卷)" "(无卷)" "$reset"
        else
            echo "$data" | awk -v cyan="$gl_bufan" -v green="$gl_lv" -v reset="$reset" '
            BEGIN {FS="\t"; OFS="\t"}
            {
                print cyan $1 reset, green $2 reset
            }'
        fi
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Docker卷列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_docker_volume
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

list_beautify_all
```

## 相关命令

- [docker_occupy](../c/docker_occupy.html "Docker容器占用列表")
- [docker_occupy_find](../c/docker_occupy_find.html "Docker指定容器占用列表")
- [docker_ps_find](../c/docker_ps_find.html "Docker运行中容器列表")
- [docker_images](../c/docker_images.html "Docker镜像列表")
- [docker_images_find](../c/docker_images_find.html "Docker镜像列表(过滤)")
- [docker_network](../c/docker_network.html "Docker网络列表")
- [docker_disk](../c/docker_disk.html "Docker磁盘列表")
- [docker_volume](../c/docker_volume.html "Docker卷列表")  👈 当前所在位置

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
