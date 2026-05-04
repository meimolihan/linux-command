git-clone
===

克隆远程仓库到本地

## 补充说明

**git clone** 命令用于将远程仓库克隆到本地，创建一个完整的副本，包括所有文件、历史记录和分支。这是获取远程项目最常用的方式。

### 语法

```shell
git clone [OPTIONS] <repository> [<directory>]
```

### 选项

```shell
-b, --branch <name>          # 克隆指定分支而非默认分支
--depth <depth>              # 创建浅克隆，只获取最近N次提交
--single-branch              # 只克隆指定分支
--no-single-branch           # 克隆所有分支的历史
--recursive                  # 递归克隆子模块
--sparse                     # 创建稀疏检出的克隆
--filter <filter>            # 部分克隆过滤器
--bare                       # 创建裸仓库（无工作目录）
--mirror                     # 创建镜像仓库
--origin <name>              # 指定远程名称（默认origin）
--shallow-since <time>       # 基于时间创建浅克隆
--shallow-exclude <rev>      # 排除指定修订创建浅克隆
-j, --jobs <n>               # 并行获取的子模块数量
```

### 常用实例

```shell
# 克隆仓库到当前目录下的同名文件夹
git clone https://github.com/user/repo.git

# 克隆到指定目录
git clone https://github.com/user/repo.git my-project

# 克隆指定分支
git clone -b main https://github.com/user/repo.git

# 浅克隆（只获取最近1次提交）
git clone --depth=1 https://github.com/user/repo.git

# 浅克隆指定分支
git clone --depth=1 -b main https://github.com/user/repo.git

# 只克隆指定分支
git clone --single-branch -b develop https://github.com/user/repo.git

# 递归克隆子模块
git clone --recursive https://github.com/user/repo.git

# 稀疏克隆（只检出部分目录）
git clone --sparse https://github.com/user/repo.git
cd repo
git sparse-checkout set src/docs

# 通过 SSH 克隆
git clone git@github.com:user/repo.git

# 克隆到裸仓库（用于搭建服务器）
git clone --bare https://github.com/user/repo.git

# 部分克隆（不获取大文件）
git clone --filter=blob:none https://github.com/user/repo.git
```
