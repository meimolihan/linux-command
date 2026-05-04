linux_txtfind
===

递归搜索当前目录及子目录文件内的指定文本内容，支持交互与命令行模式。

## 一键脚本

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/linux_txtfind.sh)
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/linux_txtfind.webp "截图演示")

## 补充说明

### 功能描述
递归搜索当前目录及所有子目录中文件内容包含指定文本的行，支持交互式和命令行两种模式，适用于快速定位文件内容的场景。

### 功能特点
- 支持命令行传参模式（`./脚本名.sh "关键词"`）和交互式输入模式
- 递归搜索所有子目录，不局限于当前目录
- 显示匹配行的文件名、行号和匹配内容（带颜色高亮）
- 基于grep实现，支持正则表达式搜索

### 输出说明
输出格式为`文件名:行号:匹配内容`，匹配关键词用红色高亮显示，方便快速定位。

### 注意事项
- 搜索大目录或大量文件时可能耗时较长，请耐心等待
- 默认搜索包括隐藏文件和目录，如需排除可修改grep参数添加`--exclude-dir=`
- 交互模式下输入`0`可退出搜索工具
- 如果需要搜索二进制文件，建议在grep命令中添加`-I`参数（忽略二进制文件）

## 脚本源码

- 传参：`./脚本名.sh "要搜索的内容"`
- 不传参：`./脚本名.sh` 交互式输入

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
log_error() { echo -e "${gl_hong}[错误]${gl_bai} $*" >&2; }

break_end() {
    echo -e "${gl_lv}操作完成${gl_bai}"
    echo -e "${gl_bai}按任意键退出${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai} \c"
    read -r -n 1 -s -r -p ""
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

do_search() {
    local keyword="$1"
    
    if [[ -z "$keyword" ]]; then
        log_error "搜索关键词不能为空！"
        return 1
    fi

    echo -e ""
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_info "正在递归搜索：${gl_huang}$keyword${gl_bai}"
    log_info "搜索范围：当前目录 + 所有子目录"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"

    grep -r -n --color=always "$keyword" .

    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    log_ok "搜索完成！"
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
    break_end
}

search_menu() {
    while true; do
        clear
        if [ -z "$(ls -A 2>/dev/null)" ]; then
            echo -e "${gl_huang}>>> 目录状态: ${gl_bai}(${gl_lv}$(pwd)${gl_bai})"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            echo -e "${gl_huang}当前目录为空${gl_bai}"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        else
            echo -e "${gl_huang}>>> 目录内容: ${gl_bai}(${gl_lv}$(pwd)${gl_bai})"
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
            ls --color=auto -xA
            echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        fi
        echo -e ""
        echo -e "${gl_zi}>>> 递归文件内容搜索工具${gl_bai}"
        echo -e "${gl_bufan}————————————————————————————————————————————————${gl_bai}"
        
        read -r -e -p "$(echo -e "${gl_bufan}请输入要搜索的关键词(${gl_hong}0${gl_bai}退出): ")" keyword
        [[ "$keyword" == "0" ]] && exit_script

        do_search "$keyword"

    done

    log_info "已退出搜索工具"
    clear
}

if [[ $# -ge 1 ]]; then
    do_search "$*"
    echo ""
else
    search_menu
fi
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
