flatpak
===

Linux Flatpak 包管理器

## 补充说明

**flatpak** 是 Linux 的通用包管理工具，用于在沙盒环境中安装和运行应用程序。支持跨发行版，自动更新，沙盒隔离。

### 语法

```shell
flatpak [OPTION...] COMMAND [ARG...]
```

### 仓库管理

```shell
# 添加 Flathub 仓库（官方推荐）
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo

# 添加分类仓库
flatpak remote-add flathub-beta https://flathub.org/beta-repo/flathub-beta.flatpakrepo

# 查看已添加的仓库
flatpak remote-list
flatpak remotes

# 查看仓库详细信息
flatpak remote-info flathub

# 删除仓库
flatpak remote-delete flathub
flatpak remote-remove flathub

# 修改仓库名称
flatpak remote-modify --title="New Name" flathub

# 启用仓库
flatpak remote-modify --enable flathub

# 禁用仓库
flatpak remote-modify --disable flathub

# 设置仓库优先级
flatpak remote-modify --priority=1 flathub
```

### 安装应用

```shell
# 安装 Flatpak 应用（从仓库安装）
flatpak install flathub org.videolan.VLC
flatpak install flathub vlc

# 简写形式（自动搜索仓库名和包名）
flatpak install vlc

# 安装指定版本
flatpak install flathub org.videolan.VLC//stable
flatpak install flathub org.videolan.VLC//beta

# 安装时选择分支
flatpak install flathub org.videolan.VLC --branch=stable

# 从文件安装（.flatpak 文件）
flatpak install ./package.flatpak
flatpak install --bundle ./package.flatpak

# 从 ref 安装（.flatpakref 文件）
flatpak install --from ./package.flatpakref

# 安装运行时
flatpak install flathub org.freedesktop.Platform//22.08

# 安装 SDK
flatpak install flathub org.freedesktop.Sdk//22.08

# 安装系统级（默认用户级）
flatpak install --system flathub vlc

# 安装指定用户（多用户系统）
flatpak install --user flathub vlc

# 安装特定架构
flatpak install --arch=x86_64 flathub vlc

# 安装调试符号
flatpak install --devel flathub org.gnome.Builder
```

### 更新应用

```shell
# 更新所有应用
flatpak update

# 更新指定应用
flatpak update org.videolan.VLC

# 更新运行时
flatpak update org.freedesktop.Platform

# 查看可更新的应用
flatpak update --no-deploy

# 仅下载更新（不安装）
flatpak update --no-deploy --download

# 检查更新但不执行
flatpak update --no-pull

# 更新到指定分支
flatpak update --branch=beta org.videolan.VLC
```

### 查看应用

```shell
# 列出所有已安装的应用
flatpak list
flatpak list --app               # 只显示应用
flatpak list --runtime           # 只显示运行时
flatpak list --system            # 系统级安装
flatpak list --user              # 用户级安装

# 查看应用详细信息（推荐）
flatpak info org.videolan.VLC

# 查看详细信息
flatpak info --show-details org.videolan.VLC

# 查看应用权限
flatpak info --show-permissions org.videolan.VLC

# 查看应用位置
flatpak info --show-location org.videolan.VLC

# 查看应用文件系统访问
flatpak info --file-access org.videolan.VLC

# 查看使用的运行时
flatpak info --runtime org.videolan.VLC

# 查看缓存大小
flatpak info --size org.videolan.VLC
```

### 搜索应用

```shell
# 搜索应用
flatpak search vlc
flatpak search --columns=all vlc

# 搜索结果列指定
flatpak search --columns=name,description,version vlc

# 列出所有列名
flatpak search --columns=help

# 在指定仓库搜索
flatpak search --repo flathub vlc
```

### 卸载应用

```shell
# 卸载应用
flatpak uninstall org.vvideolan.VLC

# 卸载应用及其数据
flatpak uninstall --delete-data org.videolan.VLC

# 卸载运行时
flatpak uninstall org.freedesktop.Platform//22.08

# 强制卸载（有依赖时）
flatpak uninstall --force org.videolan.VLC

# 卸载所有未使用的运行时
flatpak uninstall --unused

# 卸载所有未使用的应用和运行时
flatpak uninstall --unused --delete-data

# 交互式卸载
flatpak uninstall --interactive
```

### 运行应用

```shell
# 运行应用
flatpak run org.videolan.VLC
flatpak run vlc                       # 使用简写（如果唯一）

# 运行并传递参数
flatpak run org.videolan.VLC movie.mp4

# 指定环境变量运行
flatpak run --env=VAR=value org.videolan.VLC

# 运行命令（不启动应用）
flatpak run --command=sh org.videolan.VLC
flatpak run --command=bash org.gnome.Builder

# 进入沙盒环境调试
flatpak run --devel --command=bash org.gnome.Builder

# 覆盖权限运行
flatpak run --filesystem=/tmp org.videolan.VLC

# 强制单实例
flatpak run --single-instance org.videolan.VLC
```

### 权限管理

```shell
# 查看权限
flatpak info --show-permissions org.videolan.VLC

# 授权文件系统访问
flatpak override --filesystem=home org.videolan.VLC
flatpak override --filesystem=/media org.videolan.VLC
flatpak override --filesystem=host org.videolan.VLC

# 授权设备访问
flatpak override --device=all org.videolan.VLC
flatpak override --device=dri org.videolan.VLC

# 授权网络
flatpak override --share=network org.videolan.VLC

# 授权 socket
flatpak override --socket=x11 org.videolan.VLC
flatpak override --socket=pulseaudio org.videolan.VLC

# 授权 DBus
flatpak override --talk-name=org.gnome.Shell org.videolan.VLC

# 设置环境变量
flatpak override --env=VAR=value org.videolan.VLC

# 重置权限
flatpak override --reset org.videolan.VLC

# 编辑权限配置文件
flatpak override --edit org.videolan.VLC
```

### 故障修复

```shell
# 修复安装
flatpak repair

# 清理缓存
flatpak clean
flatpak uninstall --unused

# 重置应用权限
flatpak override --reset org.videolan.VLC

# 查看文档
flatpak run --command=flatpak-doc org.videolan.VLC

# 查看应用日志
flatpak --verbose org.videolan.VLC

# 查看版本
flatpak --version
```

### 常用应用安装

```shell
# 常用 Flatpak 应用

# 浏览器
flatpak install flathub org.mozilla.firefox
flatpak install flathub com.google.Chrome
flatpak install flathub org.chromium.Chromium

# 媒体播放器
flatpak install flathub org.videolan.VLC
flatpak install flathub com.spotify.Client

# 开发工具
flatpak install flathub org.gnome.Builder
flatpak install flathub com.jetbrains.IntelliJ-IDEA-Community
flatpak install flathub com.visualstudio.code

# 办公软件
flatpak install flathub org.libreoffice.LibreOffice
flatpak install flathub org.gimp.GIMP
flatpak install flathub org.inkscape.Inkscape

# 通讯工具
flatpak install flathub org.telegram.desktop
flatpak install flathub org.signal.Signal
flatpak install flathub im.riot.Riot
```
