wsl
===

Windows 11 中启用 Linux 子系统，直接在 Windows 上运行 Linux 环境。

## 安装 WSL 

### 1、启用 WSL 功能

以管理员身份打开 PowerShell，然后运行以下命令启用 WSL 和虚拟机平台功能：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### 2、重启电脑

完成上述命令后，重启电脑以确保所有功能生效。

```powershell
shutdown /r /f /t 0
```

### 3、查看WSL 版本

重启后，以管理员身份打开 PowerShell，运行：

```bash
wsl -v
# wsl --version
```

### 4、安装 WSL 运行环境

重启后，以管理员身份打开 PowerShell，运行：

```powershell
wsl --install --no-distribution
```

该命令只安装 WSL 运行环境，不安装任何 Linux 系统。

## 安装 Linux 发行版

### 查看可用的发行版

```powershell
wsl --list -o
```

### 安装指定发行版

```powershell
wsl --shutdown
wsl --install -d Debian --name debian
```

### 查看已安装的发行版

```powershell
wsl -l -v
```

### 启动指定发行版

```powershell
wsl.exe -d debian
```

### 查看系统版本

```bash
cat /etc/os-release
```

## 实例

### 设置默认发行版

将 Debian 设置为默认的 WSL 系统：

```powershell
wsl --set-default debian
wsl -l -v
```

### 通过 wsl.conf 配置默认用户

有时候我们希望以 root 用户登录 WSL，可以通过修改 `wsl.conf` 配置文件来实现。

#### 1. 设置 root 密码

打开 WSL，使用创建的普通用户账号登录，然后输入命令 `sudo passwd root`，按照提示输入新的 root 密码，并再次确认。

```bash
sudo passwd root
```

#### 2. 编辑 wsl.conf 文件

```bash
sudo nano /etc/wsl.conf
```

在文件中添加以下内容：

```ini
[user]
default=root
```

> 若文件不存在则会创建一个新文件。
> 保存并关闭文件：按 `Ctrl+X`，然后按 `Y` 确认保存，最后按 `Enter` 键。

#### 3. 重启 WSL

输入 `exit` 关闭 Ubuntu 实例，在 Windows PowerShell 或命令提示符中输入：

```powershell
wsl --shutdown
```

关闭所有正在运行的 WSL 实例，再次启动 Ubuntu/Debian WSL 实例时，将以 root 用户登录。

### 更新与升级

在 WSL 环境中，定期更新软件包：

```bash
sudo apt update && sudo apt upgrade -y
```

## WSL 常用命令

| 命令 | 说明 |
|------|------|
| `wsl --list -o` | 列出所有可用的 Linux 发行版 |
| `wsl --install -d <发行版>` | 安装指定的 Linux 发行版 |
| `wsl -l -v` | 查看已安装的发行版及版本 |
| `wsl -d <发行版>` | 启动指定的发行版 |
| `wsl --set-default <发行版>` | 设置默认发行版 |
| `wsl --shutdown` | 关闭所有运行的发行版 |
| `wsl --update` | 更新 WSL 内核 |
| `wsl --status` | 查看 WSL 状态信息 |

## 帮助信息

```bash
用法: wsl.exe [命令] [选项] [参数]

命令:
  --install                   安装 WSL 和虚拟机平台功能
  --list, -l [选项]           列出发行版
  --status                    显示 WSL 状态
  --update                    更新 WSL 内核
  --shutdown                  关闭所有运行的发行版
  --set-default <发行版>       设置默认发行版
  -d, --distribution <发行版>  启动指定发行版

选项:
  --no-distribution           安装 WSL 运行环境，不安装发行版
  --verbose                   显示详细输出信息

示例:
  wsl --install --no-distribution     安装 WSL 环境
  wsl --list -o                       查看可用发行版
  wsl -d Ubuntu                       启动 Ubuntu
  wsl --set-default debian            设置默认发行版
```

## 相关命令

- [wsl](../c/wsl.html "WSL 命令详解")  👈 当前所在位置
- [wsl_ubuntu_autostart](../c/wsl_ubuntu_autostart.html "WSL Ubuntu 开机自启脚本")
- [wsl_debian_autostart](../c/wsl_debian_autostart.html "WSL Debian 开机自启脚本")
- [wsl_install_ubuntu](../c/wsl_install_ubuntu.html "WSL Ubuntu 安装配置指南")
- [wsl_install_debian](../c/wsl_install_debian.html "WSL Debian 安装配置指南")

## 参考链接

更多关于 WSL 的信息可以访问 Microsoft 官方文档：

- WSL 官方文档：<https://docs.microsoft.com/zh-cn/windows/wsl/>
- 启用虚拟化：<https://aka.ms/enablevirtualization>