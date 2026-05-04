npm
===

Node.js 包管理器

## 补充说明

**npm** (Node Package Manager) 是 Node.js 的默认包管理器，用于安装、管理、发布 JavaScript 包。是前端和 Node.js 开发的核心工具。

### 语法

```shell
npm [command] [options]
```

### 常用命令

```shell
# ========== 初始化项目 ==========

# 交互式创建 package.json
npm init
npm init -y                    # 使用默认配置
npm init -y --scope=@myorg     # 指定 scope

# ========== 安装包 ==========

# 安装依赖
npm install                     # 安装所有依赖
npm i                          # 简写
npm install package-name       # 安装单个包
npm i package-name

# 安装为生产依赖
npm install package-name --save
npm i package-name -S
npm install package-name        # npm 5+ 默认 --save

# 安装为开发依赖
npm install package-name --save-dev
npm i package-name -D

# 安装为可选依赖
npm install package-name --save-optional
npm i package-name -O

# 安装全局包
npm install -g package-name
npm i -g package-name

# 安装指定版本
npm install package-name@4.0.0
npm install package-name@latest
npm install package-name@">=4.0.0 <5.0.0"

# 安装 GitHub 仓库包
npm install github:user/repo
npm install git+https://github.com/user/repo.git

# 安装本地包
npm install ./package.tgz
npm install ../local-package

# ========== 卸载包 ==========

npm uninstall package-name
npm uninstall -g package-name
npm uninstall package-name --save
npm uninstall package-name --save-dev

# ========== 更新包 ==========

# 查看可更新的包
npm outdated

# 更新包
npm update                      # 更新所有依赖
npm update package-name        # 更新指定包
npm update -g                  # 更新全局包
npm update package-name@latest

# ========== 查看包信息 ==========

# 查看包信息
npm view package-name
npm view package-name versions  # 查看所有版本
npm view package-name version   # 查看最新版本
npm view package-name repository # 查看 repo 信息
npm view package-name dependencies

# 查看已安装的包
npm list
npm list -g                    # 全局包
npm list --depth=0             # 只显示顶层依赖
npm ls package-name            # 查看特定包

# ========== 搜索包 ==========

npm search package-name
npm search keyword

# ========== 运行脚本 ==========

# 运行 package.json 中的脚本
npm run start
npm run build
npm run test
npm run dev

# 特殊简写
npm start                       # npm run start
npm test                        # npm run test
npm stop                        # npm run stop
npm restart                     # npm run restart

# ========== 配置镜像源 ==========

# 设置镜像源
npm config set registry https://registry.npmmirror.com

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 使用官方源
npm config set registry https://registry.npmjs.org

# 查看当前镜像源
npm config get registry

# 显示所有配置
npm config list

# ========== 清理缓存 ==========

# 清理缓存
npm cache clean
npm cache clean --force

# 验证缓存
npm cache verify

# ========== 发布包 ==========

# 登录 npm
npm login
npm login --scope=@myorg

# 发布包
npm publish
npm publish --access public     # 公开发布
npm publish --access restricted # 受限制发布

# 发布指定 tag
npm publish --tag beta
npm publish --tag next

# 取消发布
npm unpublish package-name@version
npm unpublish package-name --force

# 废弃包版本
npm deprecate package-name@version "message"

# ========== 其他命令 ==========

# 查看版本
npm -v
npm --version

# 查看帮助
npm help
npm help install

# 查看用户信息
npm whoami

# 创建包
npm create package-name
npm create vite@latest my-app

# 执行包命令
npm exec package-name
npx package-name

# 检查安全漏洞
npm audit
npm audit fix
npm audit fix --force
```

### package.json 结构

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "项目描述",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src/"
  },
  "keywords": ["node", "express"],
  "author": "作者",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  },
  "homepage": "https://github.com/user/repo#readme",
  "bugs": {
    "url": "https://github.com/user/repo/issues"
  }
}
```

### 版本号说明

```shell
# 版本号格式: 主版本.次版本.修订版
# 1.0.0 -> 1.0.1 -> 1.1.0 -> 2.0.0

# 版本范围语法
^1.2.3        # 1.2.3 <= version < 2.0.0（默认）
~1.2.3        # 1.2.3 <= version < 1.3.0
1.2.x         # 1.2.0 <= version < 1.3.0
>=1.2.3       # 大于等于 1.2.3
<2.0.0        # 小于 2.0.0
1.2.3 - 2.3.4 # 1.2.3 <= version <= 2.3.4
||            # 或，如 ^1 || ^2
latest        # 最新版本

# npm version 命令
npm version patch    # 修订版 +1
npm version minor    # 次版本 +1
npm version major    # 主版本 +1
npm version 1.0.2    # 设为指定版本
```

### npx 使用

```shell
# 执行包命令（无需全局安装）
npx create-react-app my-app
npx create-vite my-app --template react
npx playwright test

# 使用指定版本的包
npx package-name@version

# 运行本地脚本
npx webpack
npx jest

# 从 URL 运行
npx github:user/repo
```

### 常用镜像源

```shell
# 淘宝镜像（推荐）
npm config set registry https://registry.npmmirror.com

# 腾讯镜像
npm config set registry https://mirrors.cloud.tencent.com/npm/

# 华为镜像
npm config set registry https://repo.huaweicloud.com/repository/npm/

# 官方源
npm config set registry https://registry.npmjs.org
```

### package-lock.json

```shell
# 生成 package-lock.json
npm install

# 使用 lock 安装精确版本
npm ci                      # 清洁安装，使用 lock 文件

# package-lock.json 作用：
# 1. 锁定依赖版本
# 2. 加快 npm install 速度
# 3. 确保团队依赖版本一致
```
