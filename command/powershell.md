powershell
===

PowerShell是Windows的强大命令行脚本环境，基于.NET框架，采用动词-名词的Cmdlet命名规范

## 补充说明

**PowerShell** 是Windows操作系统的一个强大的命令行脚本环境，基于.NET框架开发。与传统的CMD命令不同，PowerShell使用cmdlet（读作"command-let"）作为基本命令单元，采用统一的"动词-名词"命名规范，如`Get-Process`、`Set-Content`等。

PowerShell的主要特点包括：

- **对象向导**：返回的是对象而非文本，便于后续处理
- **管道支持**：支持强大的管道操作，可将一个命令的输出作为另一个命令的输入
- **脚本能力**：支持编写复杂的自动化脚本
- **远程管理**：支持远程计算机的管理

PowerShell命令可分为以下几类：进程管理、服务管理、文件操作、网络管理、系统信���等。

### 进程管理命令

#### 获取进程列表

```shell
Get-Process
```

获取所有运行中的进程信息，包括进程ID、内存占用、CPU时间等。

```shell
PS C:\Users\Administrator> Get-Process

Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  ProcessName
-------  ------    -----      -----     ------    --  -----------
    152       6      2048       5120       0.50    123  explorer
    284       8      4096       8192       1.20    456  chrome
    128       4      1024       2048       0.10    789  notepad
```

按内存使用排序：

```shell
PS C:\Users\Administrator> Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10
```

#### 按名称获取进程

```shell
Get-Process -Name [进程名]
```

获取指定名称的进程信息。

```shell
PS C:\Users\Administrator> Get-Process -Name notepad
```

#### 启动进程

```shell
Start-Process [程序名]
```

启动一个新的进程（程序）。

```shell
PS C:\Users\Administrator> Start-Process notepad.exe
PS C:\Users\Administrator> Start-Process "chrome.exe" -ArgumentList "https://www.baidu.com"
```

#### 停止进程

```shell
Stop-Process [参数]
```

停止指定的进程。`-Name` 按进程名，`-Id` 按进程ID。

```shell
PS C:\Users\Administrator> Stop-Process -Name notepad
PS C:\Users\Administrator> Stop-Process -Id 1234
```

停止所有同名进程：

```shell
PS C:\Users\Administrator> Get-Process -Name chrome | Stop-Process
```

#### 等待进程结束

```shell
Wait-Process [进程名]
```

等待指定进程结束后再继续执行。

```shell
PS C:\Users\Administrator> Wait-Process -Name notepad
```

### 服务管理命令

#### 获取服务列表

```shell
Get-Service
```

获取所有服务的状态信息。

```shell
PS C:\Users\Administrator> Get-Service

Status   Name               DisplayName
------   ----               -----------
Running  wuauserv            Windows Update
Stopped  Spooler             Print Spooler
Running  W32Time            Windows Time
```

#### 获取运行中的服务

```shell
Get-Service | Where-Object {$_.Status -eq "Running"}
```

筛选正在运行的服务。

```shell
PS C:\Users\Administrator> Get-Service | Where-Object Status -eq "Running"
```

#### 获取特定服务

```shell
Get-Service -Name [服务名]
```

获取指定服务的信息。

```shell
PS C:\Users\Administrator> Get-Service -Name Spooler
```

#### 启动服务

```shell
Start-Service -Name [服务名]
```

启动指定的服务（需要管理员权限）。

```shell
PS C:\Users\Administrator> Start-Service -Name Spooler
```

#### 停止服务

```shell
Stop-Service -Name [服务名]
```

停止指定的服务。

```shell
PS C:\Users\Administrator> Stop-Service -Name Spooler
```

#### 重启服务

```shell
Restart-Service -Name [服务名]
```

重启指定的服务。

```shell
PS C:\Users\Administrator> Restart-Service -Name Spooler
```

#### 设置服务属性

```shell
Set-Service -Name [服务名] -StartupType [自动/手动/禁用]
```

设置服务的启动类型。

```shell
PS C:\Users\Administrator> Set-Service -Name Spooler -StartupType Automatic
```

### 文件和目录操作命令

#### 列出目录内容

```shell
Get-ChildItem
```

列出目录中的文件和子目录。别名：`ls`、`dir`、`gci`。

```shell
PS C:\Users\Administrator> Get-ChildItem -Path C:\Windows

    Directory: C:\Windows

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d----l        1/15/2024   10:30 AM                System32
d----l        1/15/2024   10:30 AM                Fonts
d-r---        1/15/2024   10:30 AM         1,234 autoexec.bat
```

递归列出：

```shell
PS C:\Users\Administrator> Get-ChildItem -Path C:\Data -Recurse -Depth 2
```

#### 创建目录

```shell
New-Item -Path [路径] -ItemType Directory
```

创建新目录。

```shell
PS C:\Users\Administrator> New-Item -Path "C:\NewFolder" -ItemType Directory
```

#### 复制文件

```shell
Copy-Item -Path [源] -Destination [目标]
```

复制文件或目录。`-Force` 强制覆盖。

```shell
PS C:\Users\Administrator> Copy-Item -Path "C:\file.txt" -Destination "D:\backup\file.txt"
PS C:\Users\Administrator> Copy-Item -Path "C:\Folder" -Destination "D:\Backup" -Recurse
```

#### 移动文件

```shell
Move-Item -Path [源] -Destination [目标]
```

移动文件或目录。

```shell
PS C:\Users\Administrator> Move-Item -Path "C:\file.txt" -Destination "D:\Documents\"
```

#### 删除文件

```shell
Remove-Item -Path [路径]
```

删除文件或目录。`-Recurse` 递归删除，`-Force` 强制删除。

```shell
PS C:\Users\Administrator> Remove-Item -Path "C:\temp.txt"
PS C:\Users\Administrator> Remove-Item -Path "C:\OldFolder" -Recurse -Force
```

#### 读取文件内容

```shell
Get-Content -Path [文件路径]
```

读取并显示文件内容。别名：`gc`、`cat`。

```shell
PS C:\Users\Administrator> Get-Content -Path "C:\readme.txt"
```

读取文件最后几行：

```shell
PS C:\Users\Administrator> Get-Content -Path "C:\log.txt" -Tail 20
```

#### 写入文件内容

```shell
Set-Content -Path [文件路径] -Value [内容]
```

写入或覆盖文件内容。别名：`sc`。

```shell
PS C:\Users\Administrator> Set-Content -Path "C:\test.txt" -Value "Hello World"
```

#### 追加文件内容

```shell
Add-Content -Path [文件路径] -Value [内容]
```

追加内容到文件。

```shell
PS C:\Users\Administrator> Add-Content -Path "C:\test.txt" -Value "New Line"
```

### 网络管理命令

#### 测试网络连接

```shell
Test-Connection [目标]
```

测试网络连通性，类似于ping命令，但返回对象。`-Count` 指定测试次数。

```shell
PS C:\Users\Administrator> Test-Connection www.baidu.com -Count 4

Source        Destination     IPV4Address      ResponseTime
------        -----------     -----------      -----------
DESKTOP       www.baidu.com   110.242.69.234         10
DESKTOP       www.baidu.com   110.242.69.234          9
```

#### 测试端口连接

```shell
Test-NetConnection -ComputerName [目标] -Port [端口]
```

测试TCP端口连接。

```shell
PS C:\Users\Administrator> Test-NetConnection -ComputerName www.baidu.com -Port 80
```

#### 获取网络适配器信息

```shell
Get-NetAdapter
```

获取网络适配器详情，包括名称、MAC地址、状态、速度等。

```shell
PS C:\Users\Administrator> Get-NetAdapter

Name                      InterfaceDescription                    Status
----                      --------------------                    ------
Ethernet0                  Intel(R) PRO/1000 MT                    Up
Wi-Fi                      Broadcom 802.11ac                    Disconnected
```

#### 获取IP地址

```shell
Get-NetIPAddress
```

获取网络接口的IP地址信息。`-AddressFamily IPv4` 仅显示IPv4地址。

```shell
PS C:\Users\Administrator> Get-NetIPAddress -AddressFamily IPv4
```

#### 获取网络配置

```shell
Get-NetIPConfiguration
```

获取当前网络配置信息。

```shell
PS C:\Users\Administrator> Get-NetIPConfiguration
```

#### DNS解析

```shell
Resolve-DnsName [域名]
```

解析域名对应的IP地址，类似于nslookup。

```shell
PS C:\Users\Administrator> Resolve-DnsName www.baidu.com
```

#### 获取TCP连接

```shell
Get-NetTCPConnection
```

获取所有TCP连接信息。`-State Listen` 仅显示监听端口。

```shell
PS C:\Users\Administrator> Get-NetTCPConnection -State Listen
```

### 系统信息命令

#### 获取系统信息

```shell
Get-ComputerInfo
```

获取计算机的完整系统信息。

```shell
PS C:\Users\Administrator> Get-ComputerInfo | Select-Object OsName, OsVersion, CsTotalPhysicalMemory
```

#### 获取磁盘信息

```shell
Get-Volume
```

获取磁盘卷信息。

```shell
PS C:\Users\Administrator> Get-Volume

DriveLetter  FileSystemLabel  FileSystem  FreeSpaceB  Size
----------  ---------------  ---------  ----------  ----
C           System          NTFS       45,678,90   100,023,45
D           Data            NTFS       234,567,89   500,023,45
```

#### 清除DNS缓存

```shell
Clear-DnsClientCache
```

清除本地DNS缓存。

```shell
PS C:\Users\Administrator> Clear-DnsClientCache
```

#### 获取主机名

```shell
$env:COMPUTERNAME
```

获取计算机名称。

```shell
PS C:\Users\Administrator> $env:COMPUTERNAME
```

#### 获取环境变量

```shell
Get-ChildItem Env:
```

获取所有环境变量。

```shell
PS C:\Users\Administrator> Get-ChildItem Env:
```

### 高级命令

#### 获取帮助

```shell
Get-Help [命令]
```

获取命令的帮助文档。

```shell
PS C:\Users\Administrator> Get-Help Get-Process
PS C:\Users\Administrator> Get-Help Get-Process -Examples
```

#### 筛选对象

```shell
Where-Object {$_.属性 -eq "值"}
```

根据条件筛选对象。

```shell
PS C:\Users\Administrator> Get-Process | Where-Object CPU -gt 100
PS C:\Users\Administrator> Get-Service | Where-Object Status -eq "Running"
```

#### 排序对象

```shell
Sort-Object [属性]
```

按指定属性排序对象。

```shell
PS C:\Users\Administrator> Get-Process | Sort-Object WorkingSet -Descending
```

#### 选择属性

```shell
Select-Object [属性1],[属性2]
```

选择需要显示的属性。

```shell
PS C:\Users\Administrator> Get-Process | Select-Object Name, Id, CPU
```

#### 格式化输出

```shell
Format-List *
```

以列表格式显示所有属性。

```shell
PS C:\Users\Administrator> Get-Process -Name notepad | Format-List *
```

#### 计算文件哈希

```shell
Get-FileHash -Path [文件路径]
```

计算文件的哈希值。

```shell
PS C:\Users\Administrator> Get-FileHash -Path "C:\file.txt" -Algorithm SHA256
```

#### 下载文件

```shell
Invoke-WebRequest -Uri [URL] -OutFile [保存路径]
```

下载文件，别名：`curl`。

```shell
PS C:\Users\Administrator> Invoke-WebRequest -Uri "https://example.com/data.zip" -OutFile "data.zip"
```

#### 调用Web API

```shell
Invoke-RestMethod -Uri [URL]
```

调用REST API并返回解析后的对象。

```shell
PS C:\Users\Administrator> Invoke-RestMethod -Uri "https://api.example.com/data"
```

#### 驱动备份命令

```PowerShell
dism /online /export-driver /destination:目标路径
```

### 常用别名

PowerShell常用别名对照表：

| Cmdlet | 别名 |
|-------|------|
| Get-Process | ps |
| Get-Service | gsv |
| Get-ChildItem | ls, dir, gci |
| Set-Content | sc |
| Get-Content | gc, cat |
| Copy-Item | cp, cpi |
| Move-Item | mi, mv |
| Remove-Item | rm, ri |
| Where-Object | ?, where |
| ForEach-Object | %, foreach |
| Select-Object | select |

## PowerShell 进入目录

```powershell
# 用户根目录
cd $env:USERPROFILE

# 桌面
cd "$env:USERPROFILE\Desktop"

# 下载
cd "$env:USERPROFILE\Downloads"

# 文档
cd "$env:USERPROFILE\Documents"

# 图片
cd "$env:USERPROFILE\Pictures"

# 视频
cd "$env:USERPROFILE\Videos"

# 音乐
cd "$env:USERPROFILE\Music"
```

## 相关命令

- [cmd](../c/cmd.html "CMD 命令详解")
- [powershell](../c/powershell.html "PowerShell 命令详解")  👈 当前所在位置