docker_network
===

【Docker网络列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_network.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_network.webp "截图演示")

## 补充说明

该脚本用于美化显示 Docker 网络列表，基于 docker network ls 命令和 awk 文本处理实现，适合快速查看 Docker 网络配置。

### 功能特点

* 美化输出：使用 ANSI 颜色码区分不同字段（网络ID、名称、驱动、作用域）
* 网络 ID 简化：只显示前 12 位字符，便于阅读
* 表格对齐：使用 column 命令自动对齐列（如果可用）
* 空列表处理：当没有网络时显示友好提示
* 简洁输出：只显示关键信息（ID、名称、驱动、作用域）
* 一键执行：通过管道直接运行，无需下载脚本

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 网络ID | 网络 ID 的前 12 位（青色显示） |
| 名称 | 网络的名称（绿色显示） |
| 驱动 | 网络驱动类型如 bridge、host、overlay 等（黄色显示） |
| 作用域 | 网络作用域（local 或 swarm）（蓝色显示） |

### 注意事项

* 脚本需要 Docker 环境可用且 Docker 服务正在运行
* 如果系统没有 column 命令，表格可能无法对齐，但不影响功能
* 常见的网络驱动：bridge（桥接）、host（主机）、overlay（覆盖网络）、macvlan、none
* 作用域 local 表示本地网络，swarm 表示集群范围网络
* 该脚本只显示网络列表，不提供网络管理功能
* 适合与其他 Docker 管理脚本配合使用（如 compose_admin_menu.sh）

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

list_beautify_docker_network() {
    {
        printf "%s%s\t%s\t%s\t%s%s\n" "$gl_hui" "网络ID" "名称" "驱动" "作用域" "$reset"
        printf "%s%s\t%s\t%s\t%s%s\n" "$gl_hui" "--------" "--------" "--------" "--------" "$reset"

        data=$(docker network ls --format "{{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}")
        if [ -z "$data" ]; then
            printf "%s%s\t%s\t%s\t%s%s\n" "$gl_huang" "(无网络)" "(无网络)" "(无网络)" "(无网络)" "$reset"
        else
            echo "$data" | awk -v cyan="$gl_bufan" -v green="$gl_lv" -v yellow="$gl_huang" -v blue="$gl_lan" -v reset="$reset" '
            BEGIN {FS="\t"; OFS="\t"}
            {
                id = substr($1, 1, 12)
                name = $2
                driver = $3
                scope = $4
                print cyan id reset, green name reset, yellow driver reset, blue scope reset
            }'
        fi
    } | column_if_available
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Docker网络列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_docker_network
	
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
- [docker_network](../c/docker_network.html "Docker网络列表")  👈 当前所在位置
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
