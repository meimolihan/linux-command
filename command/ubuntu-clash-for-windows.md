ubuntu-clash-for-windows
===

Ubuntu 桌面版安装 Clash for Windows 中文增强版完整教程

## 补充说明

Clash for Windows 是一款功能强大的代理客户端，基于 Clash 内核开发，支持 Windows、macOS 和 Linux 平台。本文提供从下载、安装到配置完整的 Ubuntu 桌面版安装教程，适用于 Ubuntu 26.04 及相近版本。

本教程涵盖：下载安装包、解压配置、权限设置、依赖安装、启动程序、创建桌面快捷方式及开机自启配置。

## 实例

### 前置步骤：下载 Clash for Windows 安装包

通过终端命令直接下载安装包，避免浏览器下载可能出现的中断问题。

**切换到下载目录**

```shell
cd ~/Downloads/
```

**下载安装包**

```shell
wget https://github.com/Z-Siqi/Clash-for-Windows_Chinese/releases/download/0.20.39.3/Clash.for.Windows-0.20.39-Opt.3-linux-x64.tar.gz
```

验证下载完成：

```shell
ls | grep Clash.for.Windows-0.20.39-Opt.3-linux-x64.tar.gz
```

**解压安装包**

```shell
mkdir -p /home/mobufan/软件/
tar -zxvf Clash.for.Windows-0.20.39-Opt.3-linux-x64.tar.gz -C /home/mobufan/软件/
mv /home/mobufan/软件/Clash.for.Windows-0.20.39-Opt.3-linux-x64/ /home/mobufan/软件/cfw-linux-x64/
```

解压完成后，Clash 核心文件路径为：`/home/mobufan/软件/cfw-linux-x64/`

### 一、配置程序运行权限

**进入解压目录**

```shell
cd /home/mobufan/软件/cfw-linux-x64/
```

**赋予程序执行权限**

```shell
chmod +x cfw
```

**修复 chrome-sandbox 权限**

Linux 版 Clash 依赖 `chrome-sandbox`，需配置 root 权限否则会闪退：

```shell
sudo chown root:root /home/mobufan/软件/cfw-linux-x64/chrome-sandbox
sudo chmod 4755 /home/mobufan/软件/cfw-linux-x64/chrome-sandbox
```

### 二、安装必备依赖

Ubuntu 26.04 部分依赖包名称更新，执行以下命令安装适配依赖：

```shell
sudo apt update
sudo apt install -y libnss3 libgtk-3-0t64 libxss1 libasound2t64 libnotify4
```

### 三、启动 Clash for Windows

**终端直接启动**

```shell
./cfw
```

若启动失败或闪退，使用无沙箱模式启动：

```shell
./cfw --no-sandbox
```

**首次使用配置**

1. 打开后，点击「配置」→「导入」，粘贴你的 Clash 订阅链接
2. 导入成功后，在「代理」页面选择节点
3. 点击主界面「系统代理」开关，开启代理即可正常使用

### 四、创建桌面快捷方式

**创建 .desktop 配置文件**

```shell
cat > ~/.local/share/applications/clash-cfw.desktop << 'EOF'
[Desktop Entry]
Name=Clash For Windows
Comment=Clash Client
Exec=/home/mobufan/软件/cfw-linux-x64/cfw --no-sandbox
Icon=/home/mobufan/软件/cfw-linux-x64/resources/app/clash.png
Terminal=false
Type=Application
Categories=Network;
StartupWMClass=cfw
EOF
```

保存并添加执行权限：

```shell
chmod +x ~/.local/share/applications/clash-cfw.desktop
update-desktop-database ~/.local/share/applications/
```

**添加到桌面**

```shell
cp ~/.local/share/applications/clash-cfw.desktop ~/桌面/
chmod +x ~/桌面/clash-cfw.desktop
```

若桌面目录为英文环境，使用 `~/Desktop/` 路径。若提示「未信任」，右键图标选择「允许启动」。

### 五、终端全局启动

创建软链接，终端输入 `cfw` 即可启动：

```shell
sudo ln -s /home/mobufan/软件/cfw-linux-x64/cfw /usr/local/bin/cfw
```

之后在任意终端执行：

```shell
cfw --no-sandbox
```

### 六、开机自启配置

1. 打开 Ubuntu 「设置」→「应用」→「开机程序」
2. 点击「添加」，输入启动命令：`/home/mobufan/软件/cfw-linux-x64/cfw --no-sandbox`
3. 命名为「Clash For Windows」，点击「添加」即可

### 常见问题排查

**启动闪退 / 打不开**

- 检查 `chrome-sandbox` 权限是否配置
- 确认依赖已全部安装
- 改用无沙箱模式启动 `./cfw --no-sandbox`

**桌面快捷方式不显示 / 无法启动**

- 检查 `.desktop` 文件中 `Exec` 和 `Icon` 路径是否正确
- 重新执行 `update-desktop-database ~/.local/share/applications/`
- 确保桌面快捷方式已赋予可执行权限

**图标不显示**

- 替换 `Icon` 路径为自定义 PNG 图标
- 删除桌面快捷方式，重新创建
