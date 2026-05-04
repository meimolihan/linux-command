gpg
===

GPG 加密签名工具

## 补充说明

**GPG** (GNU Privacy Guard) 是开源的加密和签名工具，用于文件加密、数字签名、密钥管理。是 OpenPGP 标准的实现。

### 语法

```shell
gpg [OPTIONS] [COMMAND] [FILES]
```

### 密钥生成

```shell
# 生成密钥对（交互式）
gpg --gen-key
gpg --full-generate-key           # 更详细的选项

# 快速生成密钥对
gpg --quick-generate-key "张三 <zhangsan@example.com>"

# 生成指定类型的密钥
gpg --full-generate-key
# 选项：
# (1) RSA and RSA     - RSA 加密和签名
# (2) DSA and Elgamal - DSA 签名，Elgamal 加密
# (3) DSA             - 仅签名
# (4) RSA             - 仅签名

# 生成 ECC 密钥（更现代）
gpg --quick-generate-key "张三 <zhangsan@example.com>" future-default

# 生成仅用于签名的密钥
gpg --quick-generate-key "张三 <zhangsan@example.com>" ed25519 sign

# 生成仅用于加密的密钥
gpg --quick-generate-key "张三 <zhangsan@example.com>" cv25519 encrypt
```

### 密钥管理

```shell
# 查看公钥列表
gpg --list-keys
gpg -k
gpg --list-public-keys

# 查看私钥列表
gpg --list-secret-keys
gpg -K

# 查看密钥指纹
gpg --fingerprint
gpg --fingerprint "张三"

# 查看详细密钥信息
gpg --list-keys --keyid-format LONG

# 查看指定密钥
gpg --list-keys zhangsan@example.com

# 编辑密钥
gpg --edit-key zhangsan@example.com

# 密钥编辑器常用命令
help                            # 帮助
list                            # 列出密钥
fpr                             # 显示指纹
uid 1                           # 选择用户 ID
trust                           # 设置信任级别
expire                          # 设置过期时间
adduid                          # 添加用户 ID
deluid                          # 删除用户 ID
addkey                          # 添加子密钥
delkey                          # 删除子密钥
passwd                          # 更改密码
save                            # 保存更改
quit                            # 退出
```

### 密钥导出导入

```shell
# 导出公钥
gpg --export zhangsan@example.com > public.key
gpg --armor --export zhangsan@example.com > public.asc
gpg -a --export > all_public_keys.asc

# 导出私钥
gpg --export-secret-keys zhangsan@example.com > private.key
gpg --armor --export-secret-keys > private.asc
gpg -a --export-secret-keys zhangsan@example.com > private.asc

# 导出特定密钥
gpg --armor --export KEYID > public.asc

# 导入公钥
gpg --import public.key
gpg --import public.asc

# 导入私钥
gpg --import private.key
gpg --allow-secret-key-import --import private.key

# 导出并包含所有子密钥
gpg --armor --export-secret-keys --export-options export-backup KEYID > backup.asc

# 从密钥服务器获取公钥
gpg --keyserver keys.openpgp.org --recv-keys KEYID
gpg --keyserver hkps://keys.openpgp.org --search-keys zhangsan@example.com

# 发送公钥到密钥服务器
gpg --keyserver keys.openpgp.org --send-keys KEYID
```

### 加密解密

```shell
# 加密文件（使用公钥）
gpg --encrypt --recipient zhangsan@example.com file.txt
gpg -e -r zhangsan@example.com file.txt
# 输出: file.txt.gpg

# 加密为 ASCII 格式
gpg --armor --encrypt --recipient zhangsan@example.com file.txt
gpg -a -e -r zhangsan@example.com file.txt

# 加密多个收件人
gpg --encrypt --recipient user1@example.com --recipient user2@example.com file.txt

# 使用密码加密（对称加密）
gpg --symmetric file.txt
gpg -c file.txt
# 输出: file.txt.gpg

# 解密文件
gpg --decrypt file.txt.gpg
gpg -d file.txt.gpg
gpg -d file.txt.gpg > output.txt

# 解密并保留原文件名
gpg --output file.txt --decrypt file.txt.gpg

# 加密并签名
gpg --encrypt --sign --recipient recipient@example.com file.txt
gpg -es -r recipient@example.com file.txt

# 指定输出文件
gpg --encrypt --recipient zhangsan@example.com --output encrypted.gpg file.txt
gpg --decrypt --output decrypted.txt encrypted.gpg
```

### 签名验证

```shell
# 创建签名（默认）
gpg --sign file.txt
# 输出: file.txt.gpg（二进制签名+原内容）

# 创建分离签名
gpg --detach-sign file.txt
gpg -b file.txt
# 输出: file.txt.sig

# 创建 ASCII 签名
gpg --armor --sign file.txt
gpg --clear-sign file.txt         # 可读签名
# 输出: file.txt.asc

# 验证签名
gpg --verify file.txt.sig
gpg --verify file.txt.sig file.txt

# 验证并解密
gpg --decrypt file.txt.gpg

# 验证分离签名
gpg --verify file.txt.sig file.txt

# 签名并加密
gpg --sign --encrypt --recipient recipient@example.com file.txt
```

### 信任管理

```shell
# 编辑密钥信任级别
gpg --edit-key zhangsan@example.com
# 输入: trust
# 选择:
# 1 = 不知道
# 2 = 我不信任
# 3 = 信任有限
# 4 = 完全信任
# 5 = 绝对信任（仅用于自己的密钥）

# 删除密钥
gpg --delete-key zhangsan@example.com        # 删除公钥
gpg --delete-secret-key zhangsan@example.com # 删除私钥
gpg --delete-secret-and-public-key KEYID     # 删除公钥和私钥

# 吊销密钥
gpg --gen-revoke zhangsan@example.com > revoke.asc
# 然后导入吊销证书
gpg --import revoke.asc

# 签名密钥（信任他人公钥）
gpg --sign-key other@example.com

# 检查签名
gpg --check-sigs
```

### 常用组合

```shell
# 完整工作流：生成密钥、导出、加密
gpg --quick-generate-key "张三 <zhangsan@example.com>"
gpg --armor --export zhangsan@example.com > public.asc
gpg --encrypt --recipient zhangsan@example.com secret.txt

# 备份 GPG 密钥
gpg --armor --export-secret-keys --export-options export-backup > backup_private.asc
gpg --armor --export > backup_public.asc
gpg --export-ownertrust > trust.txt

# 恢复 GPG 密钥
gpg --import backup_private.asc
gpg --import backup_public.asc
gpg --import-ownertrust trust.txt

# 加密并邮件发送
gpg --armor --encrypt --recipient recipient@example.com file.txt

# 验证下载文件的签名
gpg --verify software.tar.gz.sig software.tar.gz

# 快速加密（密码）
echo "secret data" | gpg --symmetric --armor > encrypted.asc
gpg --decrypt encrypted.asc
```

### Git 提交签名

```shell
# 配置 Git 使用 GPG 签名
git config --global user.signingkey KEYID
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# 指定 GPG 程序
git config --global gpg.program gpg

# 对单个提交签名
git commit -S -m "signed commit"

# 签名标签
git tag -s v1.0.0 -m "signed tag"

# 验证标签
git tag -v v1.0.0

# 验证提交
git log --show-signature
git verify-commit HEAD
```
