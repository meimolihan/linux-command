mobufan
===

个人一键脚本工具

## 补充说明

该脚本是个人定制的一键脚本工具，基于 [kejilion.sh](https://github.com/kejilion/sh) 进行二次开发，集成了常用工具的安装和配置功能。

### 功能特点

* 多系统支持：支持 Debian/Ubuntu（apt）、CentOS/RHEL（yum）、Alpine（apk）、OpenWrt/iStoreOS（opkg）
* 一键安装：提供一键安装命令，支持 curl 和 wget 两种方式
* 个人定制：大量配置与逻辑适配作者本地环境
* 依赖自动安装：自动检测并安装所需依赖（如 curl）

### 使用方法

```bash
# curl 方式安装
bash <(curl -sL gitee.com/meimolihan/sh/raw/master/install/mobufan.sh)

# wget 方式安装
bash <(wget -qO- gitee.com/meimolihan/sh/raw/master/install/mobufan.sh)
```

### 注意事项

* 本脚本**未做通用性兼容处理**，大量配置适配作者本地环境
* 若执意在其他设备中运行，请自行承担全部风险
* 建议先查看脚本源码，确认是否适配您的环境
* 目录结构、服务器 IP、个人偏好设置均为作者本地配置

##  MOBUFAN.SH - 个人一键脚本工具

### 安装依赖

```bash
## Debian / Ubuntu / 基于 apt
apt update -y && apt install -y curl

## CentOS / RHEL (yum)
yum install -y curl

## Alpine Linux
apk update && apk add curl

## OpenWrt / iStoreOS (opkg)
opkg update && opkg install curl
```



###  一键安装命令

```bash
# curl
bash <(curl -sL gitee.com/meimolihan/sh/raw/master/install/mobufan.sh)

bash <(curl -sL sh.meimolihan.eu.org/install/mobufan.sh)

# wget
bash <(wget -qO- gitee.com/meimolihan/sh/raw/master/install/mobufan.sh)

bash <(wget -qO- sh.meimolihan.eu.org/install/mobufan.sh)
```

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/mobufan.webp "截图演示")

## ⚠️ 重要声明

- 本脚本基于 [kejilion.sh](https://github.com/kejilion/sh "GitHub 代码托管平台") 进行二次开发。
- **大量配置与逻辑仅适配本人（YOUR_NAME）的本地环境**
  - 目录结构
  - 服务器 IP
  - 个人偏好设置
  - **未做通用性兼容处理**，不保证在其他设备或系统中正常运行。
  - **若执意使用，请自行承担全部风险**。

