ubuntu-typora
===

Ubuntu 手动安装 Typora 便携版完整教程

## 补充说明

Typora 是一款简洁优雅的 Markdown 编辑器，支持实时预览、多种主题和丰富的导出格式。本文提供在 Ubuntu 系统上手动安装 Typora 便携版的完整步骤，适用于无法使用官方源安装或需要特定版本的场景。

本教程涵盖：下载安装包、解压配置、依赖安装、创建桌面快捷方式、设置默认程序等内容。

## 实例

### 一、下载软件

**创建软件目录**

```shell
mkdir -p ~/软件
cd ~/软件
```

**下载 Typora 安装包**

```shell
wget https://dufs.mobufan.eu.org:666/file/ubuntu/downloads/Typora-linux-x64.tar.gz
```

**解压安装包**

```shell
tar -zxvf Typora-linux-x64.tar.gz
cd Typora-linux-x64
```

解压完成后，Typora 核心文件路径为：`/home/mobufan/软件/Typora-linux-x64/`

### 二、安装软件

**安装必要依赖**

```shell
sudo apt update
sudo apt install libxss1 -y
```

**修复 chrome-sandbox 权限**

Typora 基于 Electron 开发，依赖 `chrome-sandbox`，需配置 root 权限：

```shell
sudo chown root:root chrome-sandbox
sudo chmod 4755 chrome-sandbox
```

**创建应用快捷方式**

```shell
cat > ~/.local/share/applications/typora.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Name=Typora
Comment=A Markdown Editor
Exec=/home/mobufan/软件/Typora-linux-x64/Typora
Icon=/home/mobufan/软件/Typora-linux-x64/resources/typora-256x256.png
Terminal=false
Type=Application
Categories=Office;TextEditor;
StartupNotify=true
EOF
```

**添加快捷方式执行权限**

```shell
chmod +x ~/.local/share/applications/typora.desktop
```

**验证快捷方式是否正常**

```shell
gtk-launch typora.desktop
```

如果 Typora 能正常启动，说明快捷方式创建成功。

**更新系统应用菜单**

```shell
update-desktop-database ~/.local/share/applications/
```

**将 Typora 设为 .md 文件的默认程序**

```shell
xdg-mime default typora.desktop text/markdown
```

**发送到桌面**

```shell
cp ~/.local/share/applications/typora.desktop ~/桌面/typora.desktop
chmod +x ~/桌面/typora.desktop
```

若桌面目录为英文环境，使用 `~/Desktop/` 路径。若提示「未信任」，右键图标选择「允许启动」。

### 三、完成

现在你可以：
- 在系统应用菜单中搜索 `Typora` 启动
- 双击桌面快捷方式启动
- 直接双击 `.md` 文件自动用 Typora 打开

> 本教程适用于 Ubuntu 系列系统手动安装旧版 Typora（便携版）。
