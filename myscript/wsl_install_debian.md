wsl_install_debian
===

从零开始完整安装配置 WSL2 Debian 系统的详细流程，涵盖环境准备、系统安装、基础配置、软件部署以及 Docker 环境搭建。

## 补充说明

该教程提供从零开始完整安装配置 WSL2 Debian 系统的详细流程，涵盖环境准备、系统安装、基础配置、软件部署以及 Docker 环境搭建，适合在 Windows 上使用 Debian 子系统的场景。

### 功能特点

* 完整流程：从环境检查到 Docker 部署的完整步骤
* 图文并茂：包含 PowerShell 命令示例和输出示例
* 常见问题：包含 WSL 常用命令和故障排查
* 优化配置：包含镜像加速、目录映射等优化建议
* 多系统支持：适用于 Windows 10 2004+ 和 Windows 11

### 主要章节

| 章节 | 内容 |
| --- | --- |
| 环境准备 | 检查 Windows 版本、启用虚拟化、安装 WSL |
| 安装 Debian | 查看可用发行版、安装 Debian、初始化配置 |
| 基础配置 | 换源、安装常用工具、配置时区 |
| 用户与权限 | 创建用户、配置 sudo、SSH 访问 |
| 网络与文件 | 网络配置、Windows 目录访问 |

### 注意事项

* 需要 Windows 10 2004 及以上版本或 Windows 11
* 需要在 BIOS 中启用虚拟化（Intel VT-x 或 AMD-V）
* 安装过程需要管理员权限
* 建议安装完成后配置 Docker 镜像加速器

## 环境准备

### 检查 Windows 版本

WSL2 需要 Windows 10 2004 及以上版本，或 Windows 11。

在 PowerShell 中执行：

```powershell
winver
```

若版本低于要求，请先升级系统。

### 确认虚拟化已启用

以管理员身份打开 PowerShell，检测虚拟化功能状态：

```powershell
systeminfo
```

在输出信息中查找以下字段：

```
Hyper-V 要求:                   是
虚拟机监控程序状态:              是
```

若显示"否"，需要在 BIOS/UEFI 中启用 Intel VT-x 或 AMD-V。

也可通过命令快速检查：

```powershell
Get-ComputerInfo | Select-Object WindowsVersion, OsArchitecture, HyperVisorPresent
```

### 启用 WSL 和虚拟机平台

以管理员身份打开 PowerShell，执行：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

参数说明：

- `/online`：针对当前运行的操作系统
- `/enable-feature`：启用指定功能
- `/all`：启用功能的所有子功能
- `/norestart`：不立即重启，保留到下一步再重启

### 重启电脑

完成上述命令后，重启电脑使功能生效：

```powershell
shutdown /r /f /t 0
```

## 安装 Debian

### 查看可用的发行版

重启后，以管理员身份打开 PowerShell，列出所有可用的 Linux 发行版：

```powershell
wsl --list -o
```

输出示例：

```
NAME                                   FRIENDLY NAME
Ubuntu                                 Ubuntu
Debian                                 Debian GNU/Linux
kali-linux                             Kali Linux Rolling
...
```

### 安装 Debian

执行以下命令安装 Debian：

```powershell
wsl --install -d Debian --name debian
```

参数说明：

- `-d Debian`：指定安装 Debian 发行版
- `--name debian`：设置实例名称为 debian，便于管理

安装过程会首次启动实例，提示创建普通用户账号：

```
Installing, this may take a few minutes...
Please create a default user by entering a new username. The username must not contain capital letters, spaces, or colons.
New user 'demo' password:
```

- 输入用户名后按 Enter
- 设置密码，按 Enter 确认
- 再次输入密码确认

### 查看安装结果

```powershell
wsl -l -v
```

输出示例：

```
  NAME      STATE           VERSION
* debian   Running         2
```

> `*` 表示该发行版为默认启动项，`VERSION 2` 表示使用的是 WSL2。

### 启动 Debian

```powershell
wsl.exe -d debian
```

或直接在 PowerShell 中输入 `wsl` 进入默认发行版。

## 基础配置

### 更新系统软件包

首次进入系统后，先更新软件包列表并升级：

```bash
apt update && apt upgrade -y
```

### 安装基础工具

推荐安装以下常用工具：

```bash
apt install -y curl wget git vim nano sudo zip unzip bash-completion locales
```

### 配置中文 locale

解决中文乱码问题：

```bash
# 查看当前 locale 设置
locale

# 安装中文语言包
apt install -y locales

# 生成 zh_CN.UTF-8
sed -i '/^#.*zh_CN.UTF-8/s/^#//' /etc/locale.gen
locale-gen

# 设置环境变量
echo 'export LANG=zh_CN.UTF-8' >> ~/.bashrc
source ~/.bashrc
```

### 配置时区

```bash
dpkg-reconfigure tzdata
```

在交互界面中选择 `Asia/Shanghai`。

### 配置 DNS

WSL2 默认 DNS 可能不稳定，建议配置固定的 DNS 服务器：

```bash
sudo nano /etc/resolv.conf
```

添加或修改内容：

```
nameserver 8.8.8.8
nameserver 114.114.114.114
```

> 注意：WSL 重启后 `/etc/resolv.conf` 可能被重置，可配合脚本或 wsl.conf 保持配置。

## 用户与权限配置

### 添加用户到 sudo 组

```bash
# 切换到 root 用户
su -

# 将用户添加到 sudo 组（将 demo 替换为实际用户名）
usermod -aG sudo demo

# 验证 sudo 权限
su - demo
sudo whoami
```

输出 `root` 表示配置成功。

### 设置默认用户为 root

参考 [wsl](./c/wsl.html) 中的「通过 wsl.conf 配置默认用户」章节，将默认登录用户改为 root。

## 网络与文件访问

### 从 Windows 访问 WSL 文件

在 PowerShell 或 CMD 中可直接访问：

```powershell
# 进入 Debian 主目录
cd \\wsl$\debian\home\demo

# 列出文件
dir \\wsl$\debian\home
```

### 从 WSL 访问 Windows 文件

Windows 磁盘挂载在 `/mnt/` 目录下：

```
/mnt/c    -> C:\ 盘
/mnt/d    -> D:\ 盘
```

### 配置静态 IP（可选）

WSL2 使用动态 IP，若需固定 IP 可参考以下脚本：

```bash
sudo nano /etc/wsl.conf
```

添加以下内容防止 resolv.conf 被重置：

```ini
[network]
generateResolvConf = false
```

然后手动配置 DNS 和静态 IP。

## 安装 Docker

### 安装 Docker 引擎

```bash
# 更新软件包
sudo apt update

# 安装依赖
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# 添加 Docker GPG 密钥
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list

# 安装 Docker
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 将当前用户添加到 docker 组（免 sudo）
sudo usermod -aG docker $USER
```

### 启动 Docker 服务

```bash
# 手动启动
sudo service docker start

# 或设置开机自启
sudo systemctl enable docker
```

### 验证 Docker 安装

```bash
docker --version
docker run --rm hello-world
```

### 配合 WSL 自启 Docker

参考 [wsl_debian_autostart](./c/wsl_debian_autostart.html) 脚本，实现 Windows 开机自动启动 WSL 和 Docker 服务。

## 安装其他常用软件

### Node.js（通过 nvm）

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell
source ~/.bashrc

# 安装 Node.js LTS 版本
nvm install --lts

# 验证
node -v
npm -v
```

### Python

```bash
# Debian 12 默认已安装 Python3
python3 --version

# 安装 pip
sudo apt install -y python3-pip python3-venv

# 验证
pip3 --version
```

### Java（OpenJDK）

```bash
# 安装 JDK 17
sudo apt install -y openjdk-17-jdk

# 验证
java -version
```

## 性能优化

### 分配更多内存和 CPU

默认 WSL2 会占用系统一半的内存，建议在 Windows 的 `.wslconfig` 文件中限制：

在 PowerShell 中创建或编辑配置文件：

```powershell
notepad $env:USERPROFILE\.wslconfig
```

添加以下内容：

```ini
[wsl2]
memory=4GB
processors=2
localhostResolution=true
```

保存后重启 WSL：

```powershell
wsl --shutdown
wsl
```

### 禁用 WSL 休眠（可选）

在 Windows 计划任务中禁止系统休眠导致 WSL 断开连接：

```powershell
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
```

### 清理磁盘空间

定期清理 WSL 的缓存和旧版本：

```bash
# 在 PowerShell 中执行
wsl --shutdown

# 优化虚拟硬盘
optimize-vhd -Path "$env:USERPROFILE\AppData\Local\wsl\distro.vhdx" -Mode Full
```

## 备份与迁移

### 导出备份

```powershell
# 停止 WSL
wsl --shutdown

# 导出 Debian 系统
wsl --export debian C:\Users\Administrator\wsl-debian-backup.tar
```

### 导入恢复

```powershell
# 导入为新实例
wsl --import debian-new C:\Users\Administrator\wsl-debian C:\Users\Administrator\wsl-debian-backup.tar --version 2

# 查看结果
wsl -l -v
```

### 设置默认用户

导入后默认用户可能变为 root，需重新配置：

```powershell
debian config --default-user demo
```

## 常见问题

### 安装卡在 "Installing"

检查网络连接，或尝试使用国内镜像源：

```powershell
wsl --install -d Debian --name debian
# 若失败，手动下载安装
```

### WSL2 无法启动

检查虚拟化是否启用：

```powershell
bcdedit /set hypervisorlaunchtype auto
# 重启电脑
```

### 网络访问缓慢

检查 DNS 配置，并尝试修改 `/etc/resolv.conf`：

```bash
sudo nano /etc/resolv.conf
nameserver 8.8.8.8
nameserver 114.114.114.114
```

### 磁盘空间不足

在 PowerShell 中扩展虚拟硬盘大小：

```powershell
diskpart
select vdisk file="C:\Users\Administrator\AppData\Local\wsl\debian\ext4.vhdx"
expand vdisk maximum=100000
attach vdisk
list volume
select volume X
extend
detach vdisk
exit
```

## 验证安装结果

全部完成后，验证各项功能：

```bash
# 系统信息
cat /etc/os-release
uname -a

# 网络连通性
ping -c 3 google.com

# Docker 测试
docker run --rm hello-world

# Node.js 测试（如已安装）
node -v

# 磁盘使用情况
df -h
```

## 最常用 Windows 目录（通用版）

```bash
# 桌面
cd /mnt/c/Users/$(cmd.exe /c echo %USERNAME% | tr -d '\r')/Desktop

# 下载
cd /mnt/c/Users/$(cmd.exe /c echo %USERNAME% | tr -d '\r')/Downloads

# 文档
cd /mnt/c/Users/$(cmd.exe /c echo %USERNAME% | tr -d '\r')/Documents

# 图片
cd /mnt/c/Users/$(cmd.exe /c echo %USERNAME% | tr -d '\r')/Pictures

# 视频
cd /mnt/c/Users/$(cmd.exe /c echo %USERNAME% | tr -d '\r')/Videos

# 音乐
cd /mnt/c/Users/$(cmd.exe /c echo %USERNAME% | tr -d '\r')/Music

# 桌面快捷访问（一键直达）
cd /mnt/c/Users/$(cmd.exe /c echo %USERNAME% | tr -d '\r')/Desktop
```

## 相关命令

- [wsl](../c/wsl.html "WSL 命令详解")
- [wsl_ubuntu_autostart](../c/wsl_ubuntu_autostart.html "WSL Ubuntu 开机自启脚本")
- [wsl_debian_autostart](../c/wsl_debian_autostart.html "WSL Debian 开机自启脚本")
- [wsl_install_ubuntu](../c/wsl_install_ubuntu.html "WSL Ubuntu 安装配置指南")
- [wsl_install_debian](../c/wsl_install_debian.html "WSL Debian 安装配置指南")  👈 当前所在位置

## 参考链接

- [WSL 官方文档](https://docs.microsoft.com/zh-cn/windows/wsl/ "Microsoft WSL 官方文档")
- [Debian 官方文档](https://www.debian.org/doc/ "Debian 官方文档")
- [Docker 官方安装指南](https://docs.docker.com/engine/install/debian/ "Docker 官方安装指南")