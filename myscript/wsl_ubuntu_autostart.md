wsl_ubuntu_autostart
===

通过在 Windows 启动目录放置自启脚本，实现开机自动唤醒 WSL Ubuntu 并后台启动 Docker 服务，全程静默运行、日志留存，高效完成 WSL 环境常驻部署。

## 补充说明

该脚本用于在 Windows 启动目录放置自启脚本，实现开机自动唤醒 WSL Ubuntu 并后台启动 Docker 服务，适合需要 WSL 环境常驻运行的场景。

### 功能特点

* 开机自启：通过 Windows 启动目录实现 WSL Ubuntu 开机自动启动
* Docker 自启：自动启动 Docker 服务，无需手动操作
* 静默运行：全程后台运行，不弹出窗口
* 日志留存：记录启动过程到日志文件，便于排查问题
* UTF-8 支持：日志文件使用 UTF-8 编码，避免中文乱码

### 主要步骤

| 步骤 | 内容 |
| --- | --- |
| 列出发行版 | 查看已安装的 WSL 发行版和状态 |
| 创建自启脚本 | 在 Windows 启动目录创建 .bat 脚本 |
| 日志配置 | 配置日志文件路径和自动清理规则 |
| 验证测试 | 重启后验证 WSL 和 Docker 是否正常启动 |

### 使用方法

```bash
# 列出所有已安装的 Linux 发行版
wsl -l -v

# 创建自启动脚本（在 CMD 中执行）
copy nul "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\WSL_Ubuntu_自启.bat" /y && notepad "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\WSL_Ubuntu_自启.bat"
```

### 注意事项

* 需要 Windows 10 2004+ 或 Windows 11
* 需要先安装并配置好 WSL Ubuntu
* 需要 Ubuntu 中已安装并配置 Docker
* 日志文件默认保存在桌面，可自定义路径
* 建议先手动测试脚本，确认无误后再添加到启动目录

## 列出所有已安装的 Linux 发行版（PowerShell/CMD）命令

- 下面脚本启动的是 **ubuntu** 按需修改

```bash
wsl -l -v
```

  ```bash
  PS C:\Users\Administrator> wsl -l -v
    NAME      STATE           VERSION
  * ubuntu    Running         2
    debian    Stopped         2
  ```

## 创建 WSL 自启动脚本 （CMD）命令

- **Windows 开机自启 WSL Ubuntu 并自动启动 Docker**的优化脚本，自带**UTF-8 不乱码日志、自动清理日志大小、中文友好、运行后自动打开日志查看结果**。

```bash
copy nul "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\WSL_Ubuntu_自启.bat" /y && notepad "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\WSL_Ubuntu_自启.bat"
```

> 粘贴脚本源码

```bash
@echo off
chcp 65001 >nul 2>&1
set "logfile=%USERPROFILE%\Desktop\WSL_Ubuntu_Autostart.log"

if exist "%logfile%" (
    powershell -Command "$content = Get-Content '%logfile%' -Raw; if ($content) { $blocks = $content -split '(?=\r\n=+ \d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2} =+)|(?=^=+ \d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2} =+)'; $blocks = $blocks | Where-Object { $_ -match '\S' }; if ($blocks.Count -gt 3) { $blocks[-3..-1] -join '' | Out-File '%logfile%' -Encoding UTF8 } }"
)

for /f "delims=" %%i in ('powershell -Command "Get-Date -Format 'yyyy/MM/dd HH:mm:ss'"') do set "datetime=%%i"

echo ===================== %datetime% ===================== >> "%logfile%"
echo 正在启动WSL Ubuntu ... >> "%logfile%"

wsl -d ubuntu -- echo "WSL Ubuntu 唤醒成功" >> "%logfile%" 2>&1

if %errorlevel% equ 0 (
    echo WSL Ubuntu 启动成功 >> "%logfile%"
    wsl -d ubuntu -- /usr/sbin/service docker start >> "%logfile%" 2>&1
    echo Docker 服务已启动 >> "%logfile%"
) else (
    echo WSL Ubuntu 启动失败 >> "%logfile%"
)

echo ===================== 任务完成 ===================== >> "%logfile%"
echo. >> "%logfile%"

powershell -Command "Write-Host '2秒后自动打开日志文件' -NoNewline -ForegroundColor White; Start-Sleep -Milliseconds 200; Write-Host '.' -NoNewline -ForegroundColor Red; Start-Sleep -Milliseconds 200; Write-Host '.' -NoNewline -ForegroundColor Yellow; Start-Sleep -Milliseconds 200; Write-Host '.' -ForegroundColor Green"
timeout /t 2 /nobreak >nul
start notepad "%logfile%"

start powershell -NoExit -Command "cd ~/Desktop; wsl.exe -d ubuntu"
```

## 相关命令（选用）

```bash
# 打开 windows 自启动文件夹
start shell:startup

# 手动打开日志文件（CMD）命令
notepad "%USERPROFILE%\Desktop\WSL_Ubuntu_Autostart.log"

# 快速启动 WSL ubuntu 脚本
@echo off
start powershell -NoExit -Command "cd ~/Desktop; wsl.exe -d ubuntu"

# 启动指定发行版（如 ubuntu）
wsl.exe -d ubuntu

# 查看系统版本
cat /etc/os-release

# 将 Ubuntu 设置为默认的 WSL 系统
wsl --set-default ubuntu && wsl -l -v

# 立即关闭所有正在运行的 WSL 发行版（包括 Ubuntu、Debian 等），完全退出 WSL 虚拟机
# 直接在 CMD / PowerShell 执行
wsl --shutdown
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
- [wsl_ubuntu_autostart](../c/wsl_ubuntu_autostart.html "WSL Ubuntu 开机自启脚本")  👈 当前所在位置
- [wsl_debian_autostart](../c/wsl_debian_autostart.html "WSL Debian 开机自启脚本")
- [wsl_install_ubuntu](../c/wsl_install_ubuntu.html "WSL Ubuntu 安装配置指南")
- [wsl_install_debian](../c/wsl_install_debian.html "WSL Debian 安装配置指南")