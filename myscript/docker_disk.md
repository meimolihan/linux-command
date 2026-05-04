docker_disk
===

【Docker磁盘列表】美化脚本

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_disk.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_disk.webp "截图演示")

## 补充说明

该脚本用于美化显示 Docker 磁盘使用情况，基于 `docker system df` 命令实现，适合需要快速查看 Docker 镜像、容器、数据卷等占用磁盘空间的场景。

### 功能特点

* 彩色输出：不同类型使用不同颜色标识（镜像-绿色、容器-黄色、数据卷-蓝色、构建缓存-青色）
* 表格格式化：自动使用 `column` 命令对齐输出，若系统未安装则降级为普通输出
* 中文显示：表头使用中文标注（类型、总数、活跃、大小、可回收）

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 类型 | 磁盘使用类型（Images、Containers、Local Volumes、Build Cache） |
| 总数 | 该类型的对象总数 |
| 活跃 | 正在使用的对象数量 |
| 大小 | 占用的磁盘空间大小 |
| 可回收 | 可清理的空间大小 |

### 注意事项

* 需要系统已安装 Docker 并正常运行
* 需要 `column` 命令（通常系统已自带，属于 util-linux 包）
* 脚本使用 `set -uo pipefail` 确保执行安全性，遇到错误会立即退出
* 执行后会等待用户按键才清除屏幕，方便查看结果

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

list_beautify_docker_disk() {
    {
        docker system df | awk -v gray="$gl_hui" -v green="$gl_lv" -v yellow="$gl_huang" \
            -v blue="$gl_lan" -v cyan="$gl_bufan" -v reset="$reset" '
        BEGIN {
            print gray "类型\t总数\t活跃\t大小\t可回收" reset
            print gray "----------\t--------\t--------\t----------\t----------" reset
        }
        NR > 1 {
            type = $1
            total = $2
            active = $3
            size = $4
            reclaim = $5
            if (type == "Local") {
                type = $1 " " $2
                total = $3
                active = $4
                size = $5
                reclaim = $6
            }
            if (type == "Images") color = green
            else if (type == "Containers") color = yellow
            else if (type == "Local Volumes") color = blue
            else if (type == "Build Cache") color = cyan
            else color = reset
            print color type "\t" total "\t" active "\t" size "\t" reclaim reset
        }' | column_if_available
    }
}

list_beautify_all() {
    clear
    echo -e "${gl_zi}>>> Docker磁盘使用列表${gl_bai}"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    list_beautify_docker_disk
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
- [docker_disk](../c/docker_disk.html "Docker磁盘列表")  👈 当前所在位置
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
