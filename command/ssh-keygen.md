ssh-keygen
===

SSH 密钥生成工具

## 补充说明

**ssh-keygen** 是 OpenSSH 套件中的密钥生成工具，用于创建、管理和转换 SSH 密钥对（公钥和私钥），用于 SSH 身份验证。

### 语法

```shell
ssh-keygen [OPTIONS]
```

### 基本使用

```shell
# 生成默认密钥对（RSA 3072 位）
ssh-keygen

# 生成指定类型的密钥
ssh-keygen -t rsa                  # RSA 密钥
ssh-keygen -t dsa                  # DSA 密钥（已不推荐）
ssh-keygen -t ecdsa                # ECDSA 密钥
ssh-keygen -t ed25519              # Ed25519 密钥（推荐）

# 生成指定长度的 RSA 密钥
ssh-keygen -t rsa -b 4096          # 4096 位 RSA 密钥

# 指定密钥文件名
ssh-keygen -f ~/.ssh/my_key

# 指定注释
ssh-keygen -C "myemail@example.com"

# 不设置密码（空密码）
ssh-keygen -N ""
ssh-keygen -t ed25519 -N ""

# 指定密码
ssh-keygen -N "mypassword"
ssh-keygen -t rsa -b 4096 -N "mypassword" -f ~/.ssh/id_rsa_custom
```

### 密钥类型

```shell
# RSA（广泛支持）
ssh-keygen -t rsa -b 4096

# Ed25519（推荐，更安全更快）
ssh-keygen -t ed25519

# ECDSA（椭圆曲线）
ssh-keygen -t ecdsa -b 521         # 256/384/521 位

# DSA（已弃用，不推荐）
ssh-keygen -t dsa -b 1024

# 推荐顺序：
# 1. Ed25519 - 现代首选
# 2. RSA 4096 - 兼容性最好
# 3. ECDSA 521 - 中等选择
```

### 密钥管理

```shell
# 更改密钥密码
ssh-keygen -p -f ~/.ssh/id_rsa
ssh-keygen -p -f ~/.ssh/id_ed25519

# 更改密钥注释
ssh-keygen -c -f ~/.ssh/id_rsa -C "new-comment"

# 显示密钥指纹
ssh-keygen -l -f ~/.ssh/id_rsa
ssh-keygen -l -f ~/.ssh/id_rsa.pub
ssh-keygen -lf ~/.ssh/id_rsa

# 显示公钥
ssh-keygen -y -f ~/.ssh/id_rsa

# 显示密钥详细信息
ssh-keygen -l -v -f ~/.ssh/id_rsa

# 显示图形化密钥指纹
ssh-keygen -l -v -E md5 -f ~/.ssh/id_rsa
ssh-keygen -lv -f ~/.ssh/id_rsa

# 指定指纹哈希算法
ssh-keygen -l -E sha256 -f ~/.ssh/id_rsa
ssh-keygen -l -E md5 -f ~/.ssh/id_rsa
```

### 密钥转换

```shell
# 转换为 PEM 格式
ssh-keygen -m PEM -f ~/.ssh/id_rsa -e > id_rsa.pem

# 导出公钥为 OpenSSH 格式
ssh-keygen -e -f ~/.ssh/id_rsa.pub

# 导出公钥为 PEM 格式
ssh-keygen -e -m PEM -f ~/.ssh/id_rsa.pub

# 从 PEM 格式导入
ssh-keygen -i -m PEM -f key.pem >> ~/.ssh/authorized_keys

# 转换 PuTTY 格式（需要 puttygen）
puttygen id_rsa -o id_rsa.ppk

# 从 PuTTY 格式转换
puttygen id_rsa.ppk -O private-openssh -o id_rsa
```

### 证书认证

```shell
# 生成 CA 密钥
ssh-keygen -t rsa -b 4096 -f ca_key

# 签发用户证书
ssh-keygen -s ca_key -I user_identity -n user1,user2 -V +52w ~/.ssh/id_rsa.pub
# -I: 密钥身份标识
# -n: 主体名称（用户名）
# -V: 有效期（52 周）

# 签发主机证书
ssh-keygen -s ca_key -I host_identity -h -n server1,server2 -V +52w /etc/ssh/ssh_host_rsa_key.pub
# -h: 主机证书

# 查看证书
ssh-keygen -L -f ~/.ssh/id_rsa-cert.pub
```

### 实用技巧

```shell
# 快速生成并配置密钥（一键部署）
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519

# 将公钥复制到远程主机
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@remote-host
ssh-copy-id user@remote-host

# 生成多个密钥（不同用途）
ssh-keygen -t ed25519 -f ~/.ssh/github_key -C "github"
ssh-keygen -t ed25519 -f ~/.ssh/gitlab_key -C "gitlab"
ssh-keygen -t ed25519 -f ~/.ssh/server_key -C "server"

# 配置使用不同密钥（~/.ssh/config）
Host github.com
    IdentityFile ~/.ssh/github_key
Host gitlab.com
    IdentityFile ~/.ssh/gitlab_key

# 生成带特定注释的密钥
ssh-keygen -t ed25519 -C "$(whoami)@$(hostname)"

# 批量导出公钥
for f in ~/.ssh/*.pub; do
    echo "=== $f ==="
    cat "$f"
done
```

### known_hosts 管理

```shell
# 查看 known_hosts 中的密钥
ssh-keygen -l -f ~/.ssh/known_hosts

# 从 known_hosts 删除主机
ssh-keygen -R hostname
ssh-keygen -R 192.168.1.100

# 从 known_hosts 删除所有条目
> ~/.ssh/known_hosts

# 哈希 known_hosts（隐藏主机名）
ssh-keygen -H

# 查看哈希后的条目
ssh-keygen -l -f ~/.ssh/known_hosts

# 从文件添加到 known_hosts
ssh-keyscan -H hostname >> ~/.ssh/known_hosts
```

### authorized_keys 管理

```shell
# 添加公钥到 authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# 从远程主机复制公钥
ssh user@host "cat ~/.ssh/id_ed25519.pub" >> ~/.ssh/authorized_keys

# 设置正确权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# 验证 authorized_keys 格式
ssh-keygen -l -f ~/.ssh/authorized_keys
```

### 推荐配置

```shell
# 最佳实践：生成多个密钥

# 默认密钥（通用）
ssh-keygen -t ed25519 -C "default@$(hostname)"

# GitHub/GitLab 密钥
ssh-keygen -t ed25519 -f ~/.ssh/id_github -C "github"
ssh-keygen -t ed25519 -f ~/.ssh/id_gitlab -C "gitlab"

# 高安全密钥（带密码）
ssh-keygen -t ed25519 -f ~/.ssh/id_secure -C "secure"

# ~/.ssh/config 配置
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_github
    IdentitiesOnly yes

Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_gitlab
    IdentitiesOnly yes

Host production-server
    HostName 192.168.1.100
    User admin
    IdentityFile ~/.ssh/id_secure
    IdentitiesOnly yes
```

### 常用组合

```shell
# 一键生成 Ed25519 密钥
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519 -C "$(whoami)@$(hostname)"

# 生成 RSA 4096 位密钥
ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa

# 显示所有公钥
cat ~/.ssh/*.pub

# 显示密钥指纹（所有）
for f in ~/.ssh/id_*; do
    [ -f "$f" ] && echo "$f:" && ssh-keygen -l -f "$f"
done

# 验证密钥是否匹配
ssh-keygen -l -f ~/.ssh/id_rsa
ssh-keygen -l -f ~/.ssh/id_rsa.pub
# 两个指纹应该相同
```
