install-git
===

各平台安装 Git 完整教程

## 补充说明

Git 是目前世界上最流行的分布式版本控制系统，由 Linux 创始人 Linus Torvalds 开发，用于管理 Linux 内核代码迭代。本教程提供 Windows、Linux、macOS 三大主流平台安装 Git 的详细步骤，涵盖官方安装包、系统包管理器等多种安装方式。

## 实例

### Windows 平台安装

#### 官方安装包安装（推荐）
1. 访问 [Git 官方下载页](https://git-scm.com/download/win) 下载最新版 Git for Windows 安装包
2. 双击运行安装包，按向导提示完成安装：
   - 安装路径保持默认或自定义
   - 组件选择建议勾选「Add Git to the system PATH」方便命令行调用
   - 后续步骤保持默认配置，点击「Install」完成安装
3. 验证安装：按下 `Win+R` 输入 `cmd` 打开命令提示符，执行：
```shell
git --version
```
显示版本号即安装成功。

#### Chocolatey 包管理器安装
若已安装 [Chocolatey](https://chocolatey.org/)，可一键安装：
```shell
choco install git -y
```

### Linux 平台安装

#### Ubuntu/Debian 系
```shell
sudo apt update
sudo apt install git -y
git --version
```

#### CentOS/RHEL 系
```shell
# CentOS 7/RHEL 7 及以下
sudo yum install git -y
# CentOS 8+/RHEL 9+ 使用 dnf
sudo dnf install git -y
```

#### Arch Linux 系
```shell
sudo pacman -S git --noconfirm
```

#### Fedora
```shell
sudo dnf install git -y
```

### macOS 平台安装

#### 官方安装包安装
访问 [Git 官方下载页](https://git-scm.com/download/mac) 下载 dmg 安装包，双击挂载后按提示完成安装。

#### Homebrew 包管理器安装（推荐）
若已安装 [Homebrew](https://brew.sh/)，执行：
```shell
brew install git
git --version
```

#### MacPorts 包管理器安装
若使用 MacPorts，执行：
```shell
sudo port install git
```

### 安装后通用配置
安装完成后建议配置全局用户信息，用于代码提交标识：
```shell
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱地址"
git config --list
```
