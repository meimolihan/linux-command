cmd
===

Windows CMD命令行是Windows操作系统的传统命令行界面，用于执行各种系统管理、文件操作和网络诊断任务

## 补充说明

**cmd命令** 用于启动Windows命令提示符窗口，提供命令行界面来执行各种系统管理、文件操作和网络诊断任务。CMD是Windows操作系统的传统命令行工具，功能强大，可以完成从文件管理到系统配置的各种任务。相比图形界面，CMD更适合批量处理任务和进行系统诊断。

CMD命令可分为以下几类：文件和目录操作命令、系统信息查询命令、网络诊断命令、进程管理命令、磁盘管理命令等。

### 文件和目录操作命令

#### 查看当前目录

```shell
cd
```

显示当前工作目录的路径。

```shell
C:\Users\Administrator>cd
C:\Users\Administrator
```

#### 列出目录内容

```shell
dir
```

显示当前目录中的所有文件和文件夹。

常用参数：

- `/a` - 显示包括隐藏文件在内的所有文件
- `/p` - 分页显示
- `/s` - 显示当前目录及所有子目录
- `/w` - 宽列表格式显示
- `/o` - 按指定顺序排序

```shell
C:\Users\Administrator>dir
 Volume in drive C has no label.
 Volume Serial Number is ABCD-1234

 Directory of C:\Users\Administrator

2024/01/15  10:30 AM    <DIR>          .
2024/01/15  10:30 AM    <DIR>          ..
2024/01/15  10:30 AM    <DIR>          Desktop
2024/01/15  10:30 AM    <DIR>          Documents
2024/01/15  10:30 AM             1,234 readme.txt
               1 File(s)          1,234 bytes
               3 Dir(s)   45,678,901,234 bytes free
```

#### 进入目录

```shell
cd [目录名]
```

切换到指定目录。`cd ..` 返回上一级目录，`cd \` 返回根目录。

```shell
C:\Users>cd Administrator
C:\Users\Administrator>cd ..
C:\Users>
```

#### 创建目录

```shell
md [目录名]
```

创建新目录（Make Directory）。

```shell
C:\Users\Administrator>md NewFolder
C:\Users\Administrator>dir
 New Folder    <DIR>          01/15  10:30 AM            .
```

#### 删除目录

```shell
rd [目录名]
```

删除空目录。`/s` 参数可删除目录及所有子目录，`/q` 参数静默执行。

```shell
C:\Users\Administrator>rd EmptyFolder
```

#### 复制文件

```shell
copy [源文件] [目标文件]
```

复制文件到指定位置。`/y` 参数取消覆盖确认。

```shell
C:\Users\Administrator>copy file.txt D:\Backup\
         1 file(s) copied.
```

使用通配符复制多个文件：

```shell
C:\Users\Administrator>copy *.txt D:\Backup\
```

#### 移动文件

```shell
move [源文件] [目标位置]
```

移动文件或重命名文件。

```shell
C:\Users\Administrator>move oldname.txt newname.txt
C:\Users\Administrator>move file.txt D:\Documents\
```

#### 删除文件

```shell
del [文件名]
```

删除文件。`/f` 参数强制删除只读文件，`/s` 删除子目录中的文件，`/q` 静默模式。

```shell
C:\Users\Administrator>del temp.txt
```

删除特定类型的文件：

```shell
C:\Users\Administrator>del *.tmp
```

#### 重命名文件

```shell
ren [原名] [新名]
```

重命名文件或文件夹。

```shell
C:\Users\Administrator>ren old.txt new.txt
```

#### 显示文件内容

```shell
type [文件名]
```

显示文本文件的内容。

```shell
C:\Users\Administrator>type readme.txt
```

#### 查看或修改文件属性

```shell
attrib [文件名]
```

显示或更改文件属性。属性包括：`+r` 只读、`-r` 取消只读，`+h` 隐藏，`+s` 系统。

```shell
C:\Users\Administrator>attrib +r file.txt
C:\Users\Administrator>attrib file.txt
     R        file.txt
```

#### 以树形结构显示目录

```shell
tree [目录]
```

以树形结构显示目录结构。`/f` 参数显示文件名称。

```shell
C:\Users\Administrator>tree C:\MyFolder
```

#### 高级复制

```shell
xcopy [源] [目标] [参数]
```

高级复制命令，可复制目录树。常用参数：`/e` 复制子目录，`/h` 复制隐藏文件，`/k` 保留属性，`/y` 取消确认。

```shell
C:\Users\Administrator>xcopy C:\Data D:\Backup /e /h /y
```

#### 强力复制

```shell
robocopy [源] [目标] [参数]
```

高级文件复制工具，支持多线程、进度显示、断点续传。常用参数：`/mir` 镜像复制，`/e` 复制子目录。

```shell
C:\Users\Administrator>robocopy C:\Data D:\Backup /e /np
```

### 系统信息查询命令

#### 显示Windows版本

```shell
ver
```

显示当前Windows操作系统的版本信息。

```shell
C:\Users\Administrator>ver
Microsoft Windows [Version 10.0.19045.1234]
```

#### 显示系统详细信息

```shell
systeminfo
```

显示计算机的详细系统配置信息，包括操作系统版本、内存、网络适配器等。

```shell
C:\Users\Administrator>systeminfo

Host Name:           DESKTOP-ABC123
OS Name:             Microsoft Windows 10 Pro
OS Version:          10.0.19045 N/A Build 19045
Original Install Date:  2024/01/15
System Manufacturer:   Dell Inc.
System Model:          OptiPlex 7090
Total Physical Memory:  16,384 MB
Available Physical Memory: 8,192 MB
```

#### 显示计算机名

```shell
hostname
```

显示计算机的名称。

```shell
C:\Users\Administrator>hostname
DESKTOP-ABC123
```

#### 显示当前用户名

```shell
whoami
```

显示当前登录的用户名。`/all` 参数显示更详细信息。

```shell
C:\Users\Administrator>whoami
desktop-abc123\administrator
```

### 网络诊断命令

#### 显示网络配置

```shell
ipconfig
```

显示当前TCP/IP网络配置。常用参数：

- `/all` - 显示完整网络信息
- `/release` - 释放IP地址
- `/renew` - 重新获取IP地址
- `/flushdns` - 清除DNS缓存

```shell
C:\Users\Administrator>ipconfig

Windows IP Configuration

Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . : local
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
```

显示完整信息：

```shell
C:\Users\Administrator>ipconfig /all
```

#### 测试网络连通性

```shell
ping [目标]
```

测试与目标主机的网络连接。`-t` 参数持续Ping，`-n` 指定数据包数量。

```shell
C:\Users\Administrator>ping www.baidu.com

Pinging www.baidu.com [110.242.69.234] with 32 bytes of data:
Reply from 110.242.69.234: bytes=32 time=10ms TTL=128
Reply from 110.242.69.234: bytes=32 time=9ms TTL=128
```

持续ping：

```shell
C:\Users\Administrator>ping 8.8.8.8 -t
```

#### 追踪路由

```shell
tracert [目标]
```

追踪数据包到达目标主机所经过的路由。

```shell
C:\Users\Administrator>tracert www.google.com
```

#### 显示网络连接状态

```shell
netstat
```

显示网络连接、端口监听等。常用参数：

- `-a` - 显示所有连接
- `-ano` - 显示进程ID
- `-r` - 显示路由表

```shell
C:\Users\Administrator>netstat -ano

Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    127.0.0.1:5357         127.0.0.1:49156        ESTABLISHED     864
  TCP    192.168.1.100:443      172.16.0.1:52341       ESTABLISHED     4
```

#### DNS查询

```shell
nslookup [域名]
```

查询域名的DNS信息。

```shell
C:\Users\Administrator>nslookup www.baidu.com
Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    www.baidu.com
Address:  110.242.69.234
```

#### 显示ARP缓存

```shell
arp -a
```

显示ARP缓存表，用于查看IP与MAC地址映射。

```shell
C:\Users\Administrator>arp -a
```

### 进程管理命令

#### 查看进程列表

```shell
tasklist
```

列出当前运行的所有进程。`/svc` 参数显示进程所属服务。

```shell
C:\Users\Administrator>tasklist

Image Name                     PID Session Name        Session#    Mem Usage
======================== ======== ================ =========== ============
System Idle Process              0 Services                   0          8 K
System                           4 Services                   0          8 K
svchost.exe                   768 Services                   0     12,345 K
explorer.exe                  1234 Console                   1     45,678 K
```

#### 结束进程

```shell
taskkill /pid [进程ID]
```

结束指定进程。`/f` 强制结束，`/im` 按进程名结束。

```shell
C:\Users\Administrator>taskkill /pid 1234
C:\Users\Administrator>taskkill /im notepad.exe /f
```

### 磁盘管理命令

#### 检查磁盘

```shell
chkdsk [驱动器:]
```

检查磁盘错误并显示状态。`/f` 参数修复错误，`/r` 恢复坏扇区数据。

```shell
C:\Users\Administrator>chkdsk C:
```

#### 格式化磁盘

```shell
format [驱动器:] /fs:[文件系统]
```

格式化磁盘。文件系统可以是`NTFS`、`FAT32`、`exFAT`。

```shell
C:\Users\Administrator>format D: /fs:NTFS
```

#### 磁盘分区工具

```shell
diskpart
```

磁盘分区管理工具。进入后使用`list disk`、`select disk`、`create partition`等命令。

```shell
C:\Users\Administrator>diskpart
> list disk
```

### 其他常用命令

#### 清除屏幕

```shell
cls
```

清除命令提示符窗口中的内容。

#### 显示帮助

```shell
help [命令]
```

显示命令的帮助信息。

```shell
C:\Users\Administrator>help dir
```

#### 关闭或重启计算机

```shell
shutdown /s /t [秒数]
shutdown /r /t [秒数]
```

关闭计算机。`/s` 关闭，`/r` 重启，`/t` 延迟秒数。

```shell
C:\Users\Administrator>shutdown /s /t 60
```

取消关机：

```shell
C:\Users\Administrator>shutdown /a
```

#### 创建共享

```shell
net share
```

管理网络共享资源。

```shell
C:\Users\Administrator>net share
```

#### 查看服务状态

```shell
sc query
```

显示服务状态。

```shell
C:\Users\Administrator>sc query
```

## CMD 命令行 进入目录

```shell
# 用户根目录
cd "%USERPROFILE%"

# 桌面
cd "%USERPROFILE%\Desktop"

# 下载
cd "%USERPROFILE%\Downloads"

# 文档
cd "%USERPROFILE%\Documents"

# 图片
cd "%USERPROFILE%\Pictures"

# 视频
cd "%USERPROFILE%\Videos"

# 音乐
cd "%USERPROFILE%\Music"
```

## 相关命令

- [cmd](../c/cmd.html "CMD 命令详解")  👈 当前所在位置
- [powershell](../c/powershell.html "PowerShell 命令详解")