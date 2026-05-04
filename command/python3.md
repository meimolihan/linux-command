python3
===

Python 解释器

## 补充说明

**python3命令** 是Python编程语言的官方解释器。Python是一种高级、通用、解释型的编程语言，以其简洁易读的语法和强大的库支持而闻名。python3是Python 3.x系列的解释器，与Python 2.x不兼容。

Python特点：

- 简洁易读的语法
- 丰富的标准库和第三方库
- 跨平台支持（Linux、Windows、macOS）
- 动态类型系统
- 面向对象、函数式、过程式编程
- 广泛应用在Web开发、数据科学、人工智能、自动化运维等领域

### 安装Python3

Debian / Ubuntu：

```shell
sudo apt update
sudo apt install -y python3
sudo apt install -y python3-pip    # 安装pip包管理器
```

CentOS / Rocky / RHEL：

```shell
sudo yum install -y python3
sudo yum install -y python3-pip   # 安装pip
```

macOS：

```shell
# 使用Homebrew
brew install python3

# 或使用pyenv管理多版本
brew install pyenv
```

Windows：

从 https://www.python.org/downloads/ 下载安装，或使用 winget：

```shell
winget install Python.Python.3.11
```

Arch Linux：

```shell
sudo pacman -S python
```

### 语法

```shell
python3 [options] [-c command | -m module | script | -] [args]
```

### 选项

```bash
# 常用选项
-h, --help            # 显示帮助信息并退出
-V, --version        # 显示版本信息
-c command           # 执行Python代码
-m module            # 以脚本方式运行模块
-i                   # 交互模式（执行代码后进入交互式解释器）
-o                   # 优化生成.pyc文件
-W argument          # 设置警告控制（ignore, default, error, all）
-d                   # 调试模式
-t                   # 目录一致性检查
-u                   # 无缓冲输出（stdin/stdout/stderr）
-v, --verbose        # 详细输出
-x                   # 跳过第一条代码（用于跳过#!/usr/bin/env python3）
```

### 常用实例

#### 交互式运行

```shell
# 进入Python交互式解释器
python3

# 退出解释器
exit()
# 或按 Ctrl+D（Linux/macOS）
# 或按 Ctrl+Z 然后回车（Windows）
```

#### 执行脚本

```shell
# 运行Python脚本
python3 script.py

# 带参数运行
python3 script.py arg1 arg2

# 执行单行代码
python3 -c "print('Hello World')"
```

#### 模块运行

```shell
# 作为模块运行（等价于执行__main__.py）
python3 -m module_name

# 启动HTTP服务器（当前目录）
python3 -m http.server 8000

# 启动简单SMTP服务器
python3 -m smtpd -c DebuggingServer -n

# 使用pdb调试器
python3 -m pdb script.py
```

#### pip 包管理器

```shell
# 安装包
pip3 install package_name

# 升级包
pip3 install --upgrade package_name

# 卸载包
pip3 uninstall package_name

# 列出已安装的包
pip3 list

# 查看包信息
pip3 show package_name

# 安装requirements.txt中的依赖
pip3 install -r requirements.txt
```

#### 虚拟环境

```shell
# 创建虚拟环境
python3 -m venv myenv

# 激活虚拟环境（Linux/macOS）
source myenv/bin/activate

# 激活虚拟环境（Windows）
myenv\Scripts\activate

# 退出虚拟环境
deactivate
```

#### 版本管理

```shell
# 查看Python版本
python3 --version

# 检查Python路径
which python3

# 多版本切换（使用pyenv）
pyenv versions
pyenv global 3.11.0
```

### 常用模块示例

#### http.server - 简单HTTP服务器

```shell
# 启动HTTP服务器（默认8000端口）
python3 -m http.server

# 指定端口
python3 -m http.server 8080

# 指定IP和端口
python3 -m http.server 0.0.0.0:9000
```

#### json.tool - JSON格式化

```shell
# 格式化JSON文件
python3 -m json.tool data.json

# 压缩JSON
python3 -m json.tool -c data.json
```

#### http.client - HTTP客户端测试

```python
# 测试API
python3 -c "
import http.client
conn = http.client.HTTPSConnection('api.github.com')
conn.request('GET', '/users/github')
print(conn.getresponse().read().decode())
"
```

#### venv - 虚拟环境管理

```shell
# 创建虚拟环境
python3 -m venv myproject

# 使用虚拟环境
source myproject/bin/activate
pip install flask
python app.py
```

### 环境变量

```bash
PYTHONPATH        # 模块搜索路径
PYTHONHOME        # Python安装目录
PYTHONSTARTUP     # 交互式启动文件
PYTHONIOENCODING  # stdin/stdout/stderr编码
PYTHONUNBUFFERED  # 无缓冲输出
PYTHONDONTWRITEBYTECODE  # 不生成.pyc文件
```

### 常见问题

**Q: python和python3的区别？**

A: python可能指向python2或python3，python3明确指向Python 3。建议使用python3。

**Q: pip和pip3的区别？**

A: pip可能指向python2的pip，pip3明确指向python3的pip。建议使用pip3。

**Q: 如何运行Python脚本并传递参数？**

A: 使用sys.argv或argparse模块处理命令行参数。

**Q: Python如何实现后台运行？**

A: 使用nohup或systemd服务：`nohup python3 script.py &`