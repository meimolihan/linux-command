snap
===

Ubuntu Snap 包管理器

## 补充说明

**snap** 是 Canonical 开发的通用 Linux 包管理系统，支持跨发行版安装应用。Snap 包包含所有依赖，自动更新，沙盒隔离。

### 语法

```shell
snap [command] [options]
```

### 查找包

```shell
# 搜索 snap 包
snap find vlc
snap search vlc
snap find "video player"

# 查看包信息
snap info vlc
snap info --verbose vlc

# 查看包版本
snap info vlc | grep installed

# 浏览分类
snap find --section="media"
snap find --section="development"

# 列出商店分类
snap find --list-sections
```

### 安装包

```shell
# 安装 snap 包
snap install vlc
snap install --stable vlc           # 默认稳定版

# 安装指定 channel
snap install vlc --channel=stable
snap install vlc --channel=candidate
snap install vlc --channel=beta
snap install vlc --channel=edge

# 安装指定版本
snap install vlc --channel=3.0/stable

# 安装经典模式（无沙盒）
snap install --classic code
snap install --classic goland

# 安装危险模式（完全无沙盒）
snap install --dangerous package.snap

# 安装本地 snap 包
snap install ./package.snap
snap install --dangerous ./package.snap

# 从文件安装
snap install --file=/path/to/package.snap
```

### 更新包

```shell
# 更新单个包
snap refresh vlc

# 更新所有包
snap refresh
snap refresh --list                    # 查看可更新列表

# 更新到指定 channel
snap refresh vlc --channel=edge

# 更新到指定版本
snap refresh vlc --channel=3.0/stable

# 设置自动更新时间
snap set system refresh.timer=4:00-7:00

# 查看自动更新配置
snap get system refresh.timer

# 暂停自动更新
snap refresh --hold=24h vlc

# 取消暂停
snap refresh --hold vlc

# 锁定版本（暂停所有更新）
snap refresh --hold

# 解除锁定
snap refresh --unhold
```

### 删除包

```shell
# 删除 snap 包
snap remove vlc

# 删除包及其数据
snap remove --purge vlc
snap remove vlc --purge

# 删除指定版本
snap remove vlc --revision=123

# 删除所有版本
snap remove vlc --purge
```

### 查看已安装

```shell
# 列出已安装的包
snap list
snap list --all                    # 包含禁用的版本

# 列出指定包
snap list vlc

# 列出详细信息
snap list --verbose

# 查看 snap 依赖
snap dependencies vlc
```

### 服务控制

```shell
# 查看服务状态
snap services
snap services vlc

# 启动服务
snap start vlc
snap start --enable vlc            # 启动并设为自启

# 停止服务
snap stop vlc
snap stop --disable vlc            # 停止并禁用自启

# 重启服务
snap restart vlc

# 查看服务日志
snap logs vlc
snap logs vlc -f                    # 实时跟踪
snap logs vlc -n 100               # 最近 100 行
```

### 权限管理

```shell
# 查看连接
snap connections vlc

# 手动连接接口
snap connect vlc:audio-record
snap connect vlc:home

# 断开连接
snap disconnect vlc:audio-record

# 查看可用接口
snap interfaces
snap interface audio-record

# 查看插槽
snap interfaces --slots

# 查看插头
snap interfaces --plugs
```

### 别名管理

```shell
# 查看别名
snap aliases vlc

# 创建别名
snap alias vlc vlc-media-player

# 删除别名
snap unalias vlc-media-player

# 创建自定义命令别名
snap alias vlc vmp
```

### 版本回退

```shell
# 查看可用版本
snap list --all vlc

# 回退到上一版本
snap revert vlc

# 回退到指定版本
snap revert vlc --revision=123

# 查看历史版本
snap info vlc | grep -A 20 "channels:"
```

### 配置管理

```shell
# 获取配置
snap get vlc
snap get vlc config-key

# 设置配置
snap set vlc key=value
snap set vlc key=value key2=value2

# 导入配置
snap set vlc < config.json

# 环境变量
snap run --shell vlc
```

### 常用 Snap 包

```shell
# 开发工具
snap install --classic code           # VS Code
snap install --classic goland         # GoLand
snap install --classic pycharm-professional
snap install --classic webstorm
snap install --classic intellij-idea-community
snap install --classic gitkraken

# 浏览器
snap install firefox
snap install chromium
snap install google-chrome

# 媒体工具
snap install vlc
snap install spotify
snap install obs-studio

# 开发运行时
snap install node --classic
snap install go --classic
snap install rust --classic
snap install python --classic

# 系统工具
snap install htop
snap install nmap
snap install docker
snap install kubectl

# 办公
snap install libreoffice
snap install gimp
snap install inkscape
```

### 配置文件

```shell
# 系统配置位置
/var/snap/                          # Snap 数据目录
/snap/                              # Snap 挂载点
~/snap/                             # 用户 Snap 数据

# 用户配置
nano ~/snap/vlc/current/.config/vlc/

# 全局配置
sudo nano /var/snap/vlc/current/config

# 查看环境变量
snap run --shell vlc
sudo snap run --shell vlc

# Snap 缓存目录
/var/lib/snapd/cache/
```

### 故障排查

```shell
# 查看日志
journalctl -u snapd

# 查看 snap 状态
snap debug
snap debug connectivity
snap debug state

# 修复 snap 找不到问题
sudo systemctl restart snapd

# 重置 snapd
sudo snap install snapd --classic --stable --cohort=+

# 清理缓存
sudo rm -rf /var/lib/snapd/cache/*
sudo snap debug ensure-state-dir

# 重新安装 snapd
sudo apt purge snapd
sudo apt install snapd
```
