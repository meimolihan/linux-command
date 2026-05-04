linux_install_docker_1ms
===

毫秒镜像 安装 Docker


# Docker 一键安装教程（国内高速，全系统适配）

## 补充说明

该脚本提供 Docker 国内高速安装方案，使用毫秒镜像源，全系统适配，适合在国内网络环境下快速安装 Docker 的场景。

### 功能特点

* 国内镜像：使用毫秒镜像源，下载速度快
* 全系统适配：自动检测系统类型并选择最佳安装方式
* 多种安装方式：提供一键脚本、官方源、阿里云镜像等多种选择
* 详细教程：附带 Debian/Ubuntu/CentOS 等系统手动安装教程
* 插件安装：自动安装 Docker Compose 等常用插件

### 安装方式对比

| 安装方式 | 适用场景 | 速度 |
| --- | --- | --- |
| 毫秒镜像一键安装 | 国内网络环境首选 | 最快 |
| 阿里云镜像安装 | 毫秒镜像失败时的备选 | 快 |
| 官方脚本安装 | 国外网络环境 | 慢（国内） |

### 使用方法

```bash
# 国内镜像一键安装（推荐）
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)

# 阿里云镜像安装
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

### 注意事项

* 需要 root 权限或 sudo 权限执行
* 安装前建议卸载旧版本 Docker
* 国内网络环境优先使用毫秒镜像或阿里云镜像
* 安装完成后建议配置 Docker 镜像加速器

## 一、一键安装脚本（推荐，自动适配系统）

### 1. 国内镜像一键安装（首选，成功率最高）
```bash
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```

### 2. 官方原版安装（国内网络大概率失败）
```bash
curl -fsSL https://get.docker.com | bash -s docker
```

### 3. 阿里云镜像一键安装（备选）
```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

---

## 二、手动安装教程（一键安装失败时使用）

### 1. Debian 系统

```bash
# 更新包管理工具
sudo apt-get update

# 安装依赖并添加阿里云Docker源
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
sudo curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/debian/gpg | sudo apt-key add -
sudo add-apt-repository -y "deb [arch=$(dpkg --print-architecture)] https://mirrors.aliyun.com/docker-ce/linux/debian $(lsb_release -cs) stable"
sudo apt-get update

# 安装Docker及插件
sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Ubuntu 系统
```bash
# 更新包管理工具
sudo apt-get update

# 安装依赖并添加阿里云Docker源
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
sudo curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository -y "deb [arch=$(dpkg --print-architecture)] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update

# 安装Docker及插件
sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

### 3. CentOS 7.x 系统
```bash
# 更新包管理工具
sudo yum -y update

# 添加阿里云Docker源
sudo wget -O /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装Docker及插件
sudo yum -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

### 4. CentOS 8.x 系统
```bash
# 更新包管理工具
sudo dnf -y update

# 添加阿里云Docker源
sudo dnf config-manager --add-repo=https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装Docker及插件
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

### 5. Fedora 系统
```bash
# 更新包管理工具
sudo dnf -y update

# 添加阿里云Docker源
sudo dnf config-manager --add-repo=https://mirrors.aliyun.com/docker-ce/linux/fedora/docker-ce.repo

# 安装Docker及插件
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 三、验证安装是否成功
安装完成后，执行以下命令检查Docker版本，验证安装结果：
```bash
docker --version
docker compose version
```
显示版本信息即代表安装成功！

### 总结
1. 国内环境优先使用**linuxmirrors一键脚本**，自动适配系统、无需手动配置，成功率最高；
2. 一键安装失败时，根据自身Linux系统选择对应手动安装命令，全程使用阿里云镜像；
3. 安装后执行`docker --version`即可验证是否安装成功。
