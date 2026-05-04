shellcheck
===

Shell脚本语法和规范检查工具

## 补充说明

**ShellCheck** 是一个用于Shell脚本（bash、sh、dash等）的静态分析工具。它能够检测脚本中的语法错误、常见问题、风格问题以及潜在的bug，并提供详细的修复建议。

ShellCheck支持多种Shell方言：

- bash
- sh
- dash
- ash
- busybox等

主要功能：

- 语法错误检测
- 常见Shell编程错误警告
- 代码风格建议
- 潜在Bug提示
- 性能优化建议

### 安装ShellCheck

Debian / Ubuntu：

```shell
sudo apt update
sudo apt install -y shellcheck
```

CentOS / Rocky / RHEL：

```shell
sudo yum install -y epel-release
sudo yum install -y ShellCheck
```

macOS：

```shell
brew install shellcheck
```

Arch Linux：

```shell
sudo pacman -S shellcheck
```

### 语法

```shell
shellcheck [OPTIONS] <files>
shellcheck [OPTIONS] - <stdin>
```

### 选项

```bash
# 常用选项
-e, --exclude=CODE1,CODE2  # 排除指定规则警告
-f, --format=FORMAT        # 输出格式（checkstyle, diff, gcc, json, json1, quiet, tty）
-c, --color=WHEN          # 颜色输出（never, always, auto）
-s, --shell=NAME          # 指定Shell类型（bash, sh, dash, ash）
-x, --external-sources    # 允许检查外部源文件
-w, --wiki               # 输出对应规则的维基百科链接
-V, --version            # 显示版本信息

# 检查范围
--shell=bash             # 检查bash脚本
--shell=sh               # 检查sh脚本
```

### 输出格式

```shell
# 默认格式（人类可读）
shellcheck script.sh

# JSON格式（适合程序处理）
shellcheck -f json script.sh

# GCC格式（适合IDE集成）
shellcheck -f gcc script.sh

# Checkstyle格式（适合CI/CD）
shellcheck -f checkstyle script.sh
```

### 常用实例

```shell
# 检查单个脚本
shellcheck myscript.sh

# 检查多个脚本
shellcheck script1.sh script2.sh

# 排除指定规则
shellcheck -e SC1090,SC1091 myscript.sh

# 指定Shell类型
shellcheck -s bash myscript.sh

# 从stdin读取
cat myscript.sh | shellcheck -

# 输出Wiki链接（方便查看规则说明）
shellcheck -w myscript.sh
```

### 常见错误代码

| 代码 | 说明 |
|------|------|
| SC1000 | 未闭合的双引号 |
| SC1001 | 奇怪的转义字符 |
| SC1018 | 未声明的单词(变量) |
| SC1035 | 缺少fi关键字 |
| SC1047 | 缺少do关键字 |
| SC1068 | 括号缺少闭合 |
| SC1071 | 缺少then关键字 |
| SC1083 | 转义字符问题 |
| SC1090 | 无法读取源文件 |
| SC1091 | source文件不存在 |
| SC2001 | 未声明的变量 |
| SC2004 | 使用$()代替$[ ] |
| SC2028 | echo不支持转义 |
| SC2034 | 变量未使用 |
| SC2044 | 使用find -print0 |
| SC2086 | 引号问题导致参数扩展 |
| SC2148 | 需要set -e |
| SC2154 | 变量未声明 |
| SC2162 | read缺少-p选项 |
| SC2196 | 某些特性不支持 |

### 在编辑器中使用

**Vim/Neovim**：

使用vim-shellcheck插件或手动集成：

```vim
" vimrc
autocmd FileType sh nnoremap <buffer> <leader>s :!shellcheck -x %<CR>
```

**VS Code**：

安装ShellCheck扩展后自动启用检查。

### 在CI/CD中使用

GitLab CI示例：

```yaml
test:shellcheck:
  script:
    - shellcheck scripts/*.sh
```

GitHub Actions示例：

```yaml
- name: ShellCheck
  uses: ludeeus/action-shellcheck@master
```

### 忽略特定检查

在脚本中添加注释忽略检查：

```shell
# shellcheck disable=SC2086
# 忽略SC2086规则（引号问题）
echo $var_without_quotes
```

### 检查Shell脚本最佳实践

```shell
# 启用严格模式检查
shellcheck -o all script.sh

# 检查所有Shell类型
shellcheck -s bash -s sh script.sh
```

### 修复建议示例

输入脚本：

```shell
#!/bin/bash
echo $1
```

ShellCheck输出：

```
Line 2:
echo $1
^-- SC2086: Double quote to prevent globbing and word splitting.
```

修复后：

```shell
#!/bin/bash
echo "$1"
```

### 常见问题

**Q: ShellCheck报错"not executed as root"？**

A: 使用sudo运行ShellCheck，或忽略此警告。

**Q: 如何检查远程脚本？**

A: 使用curl获取远程脚本并通过管道传递给ShellCheck：

```shell
curl -s https://example.com/script.sh | shellcheck -
```

**Q: ShellCheck支持哪些Shell？**

A: 主要支持bash、sh、dash、ash、BusyBox ash等。