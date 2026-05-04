istoreos_opkg
===

iStoreOS 软件包管理工具

## 补充说明

**opkg** 是 OpenWrt/iStoreOS 的软件包管理器，类似于 Debian 的 apt 或 CentOS 的 yum。用于安装、卸载、更新软件包。iStoreOS 基于 OpenWrt，使用 opkg 管理所有软件包。

### 语法

```shell
opkg [OPTIONS] COMMAND [ARGUMENTS]
```

### 选项

```shell
-f, --conf <file>            # 指定配置文件
-d, --dest <name>            # 指定安装目标
-o, --offline-root <path>    # 离线模式根目录
--add-arch <arch>:<prio>     # 添加架构
--add-dest <name>:<path>     # 添加目标
--force-depends              # 忽略依赖问题
--force-maintainer           # 覆盖维护者脚本
--force-reinstall            # 强制重新安装
--force-overwrite            # 强制覆盖文件
--force-removal-of-dependent-packages  # 强制删除依赖包
--noaction                   # 仅测试，不执行
--download-only              # 仅下载不安装
--nodeps                     # 不检查依赖
--autoremove                 # 自动删除不需要的依赖
--cache <dir>                # 使用缓存目录
```

### 常用命令

```shell
# 更新软件源索引
opkg update

# 安装软件包
opkg install <package>

# 卸载软件包
opkg remove <package>

# 列出所有已安装的软件包
opkg list-installed

# 搜索软件包
opkg search <keyword>

# 显示软件包信息
opkg info <package>

# 列出可用的软件包
opkg list

# 升级软件包
opkg upgrade <package>

# 升级所有可升级的软件包
opkg upgrade

# 查看软件包依赖
opkg whatdepends <package>

# 查看软件包文件列表
opkg files <package>

# 查找文件属于哪个包
opkg search <file>

# 查看软件包状态
opkg status <package>

# 清理缓存
opkg clean

# 下载软件包（不安装）
opkg download <package>
```

### 常用实例

```shell
# 更新软件源
opkg update
# 输出示例：
# Downloading http://downloads.openwrt.org/.../Packages.gz
# Updated list of available packages in /var/opkg-lists/openwrt_core

# 安装软件包
opkg install curl
opkg install luci-app-openclash

# 安装指定版本的软件包
opkg install curl_7.80.0-1_x86_64.ipk

# 安装本地 ipk 文件
opkg install /tmp/package.ipk

# 强制重新安装
opkg install --force-reinstall curl

# 卸载软件包
opkg remove curl

# 卸载并删除配置文件
opkg remove --force-removal-of-dependent-packages curl

# 查找已安装的软件
opkg list-installed | grep luci

# 搜索软件包
opkg find luci-*

# 查看软件包详细信息
opkg info curl

# 查看软件包安装的文件
opkg files curl

# 升级指定软件包
opkg upgrade curl

# 查看可升级的软件包
opkg list-upgradable

# 升级所有软件包（谨慎使用）
opkg upgrade $(opkg list-upgradable | awk '{print $1}')

# 查看软件包依赖
opkg whatdepends luci-app-openclash

# 查找文件属于哪个包
opkg search /usr/bin/curl
```

### iStoreOS 常用软件包

```shell
# 网络工具
opkg install curl          # HTTP 客户端
opkg install wget          # 下载工具
opkg install iperf3        # 网络测速
opkg install tcpdump       # 抓包工具
opkg install nmap          # 端口扫描

# 系统工具
opkg install htop          # 进程监控
opkg install vim-full      # 完整版 vim
opkg install tmux          # 终端复用
opkg install bash          # Bash shell
opkg install coreutils     # GNU 核心工具

# 存储工具
opkg install fdisk         # 分区工具
opkg install e2fsprogs     # ext4 文件系统工具
opkg install ntfs-3g       # NTFS 支持
opkg install kmod-fs-exfat # exFAT 支持

# LuCI 界面插件
opkg install luci-app-openclash    # OpenClash 科学上网
opkg install luci-app-passwall     # PassWall
opkg install luci-app-ddns         # 动态 DNS
opkg install luci-app-upnp         # UPnP
opkg install luci-app-samba4       # Samba 文件共享
```

### 软件源配置

```shell
# 查看当前软件源配置
cat /etc/opkg/customfeeds.conf

# 编辑软件源
vi /etc/opkg/customfeeds.conf

# 软件源配置示例
# src/gz openwrt_core http://downloads.openwrt.org/releases/22.03.0/packages/x86_64/base
# src/gz openwrt_base http://downloads.openwrt.org/releases/22.03.0/packages/x86_64/packages
# src/gz openwrt_luci http://downloads.openwrt.org/releases/22.03.0/packages/x86_64/luci

# 添加第三方软件源
echo "src/gz istoreos https://istoreos.github.io/packages" >> /etc/opkg/customfeeds.conf
opkg update
```

### 清理缓存

```shell
# 清理 opkg 缓存
rm -rf /tmp/opkg-*
rm -rf /var/opkg-lists/*

# 或使用 opkg 命令
opkg clean

# 释放缓存
sync && echo 3 > /proc/sys/vm/drop_caches
```

### 离线安装

```shell
# 下载软件包到指定目录
opkg download curl
# 文件保存到当前目录：curl_7.80.0-1_x86_64.ipk

# 批量下载软件包及其依赖
for pkg in curl wget vim; do
  opkg download $pkg
done

# 离线安装
opkg install /path/to/package.ipk
```

### 常见问题

```shell
# 问题1：软件包依赖错误
# 解决：强制忽略依赖或安装缺失的依赖
opkg install --force-depends package_name

# 问题2：存储空间不足
# 解决：将软件安装到外部存储
opkg -d usb install package_name

# 问题3：软件源无法访问
# 解决：更换国内镜像源
sed -i 's/downloads.openwrt.org/mirrors.tuna.tsinghua.edu.cn\/openwrt/g' /etc/opkg/customfeeds.conf
opkg update

# 问题4：找不到软件包
# 解决：更新软件源索引
opkg update
opkg find package_name
```

### 注意事项

1. 执行 install/remove 前建议先 update
2. 升级系统包可能导致系统不稳定
3. LuCI 插件通常需要重启 LuCI 生效
4. 内核模块（kmod-*）需要匹配当前内核版本
5. 安装大量软件前检查存储空间
