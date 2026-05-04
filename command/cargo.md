cargo
===

Rust 包管理与构建工具

## 补充说明

**cargo** 是 Rust 的包管理器和构建工具，用于创建、构建、测试、发布 Rust 项目。集成包管理、编译、测试、文档生成等功能。

### 语法

```shell
cargo <command> [<args>...]
```

### 创建项目

```shell
# 创建新项目
cargo new myproject           # 创建二进制项目
cargo new --lib mylib         # 创建库项目

# 项目结构
myproject/
├── Cargo.toml               # 项目配置
├── src/
│   └── main.rs              # 入口文件
└── target/                   # 编译输出

# 在当前目录初始化
cargo init
cargo init --lib

# Cargo.toml 示例
[package]
name = "myproject"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }
```

### 构建项目

```shell
# 编译项目
cargo build                   # 调试构建
cargo build --release         # 发布构建（优化）
cargo build -r               # 简写

# 编译并运行
cargo run
cargo run --release
cargo run --release -- args   # 传递参数

# 检查代码（快速）
cargo check
cargo check --all

# 指定包构建
cargo build -p package-name

# 构建所有工作空间成员
cargo build --workspace
cargo build --all

# 构建特定目标
cargo build --target x86_64-unknown-linux-gnu

# 查看构建配置
cargo build --verbose
cargo build -vv
```

### 依赖管理

```shell
# 添加依赖
cargo add serde
cargo add serde --features derive
cargo add tokio --features full
cargo add serde@1.0.150      # 指定版本
cargo add serde@1.0          # 版本范围

# 删除依赖
cargo remove serde
cargo rm serde

# 更新依赖
cargo update
cargo update -p serde        # 更新特定包

# 列出依赖
cargo tree                   # 依赖树
cargo tree --depth 1         # 只显示第一层
cargo tree -i serde          # 显示依赖 serde 的包

# 查看过时依赖
cargo outdated               # 需要安装: cargo install cargo-outdated

# 查看依赖许可证
cargo license                # 需要安装: cargo install cargo-license

# 下载依赖
cargo fetch
```

### 测试

```shell
# 运行测试
cargo test
cargo test --all             # 测试所有包

# 运行特定测试
cargo test test_name
cargo test --test integration_test

# 详细输出
cargo test -- --nocapture
cargo test -- --show-output

# 并行测试
cargo test -- --test-threads=4

# 运行文档测试
cargo test --doc

# 运行基准测试
cargo bench

# 测试覆盖率（需要安装）
cargo install cargo-tarpaulin
cargo tarpaulin
cargo tarpaulin --out Html
```

### 文档

```shell
# 生成文档
cargo doc
cargo doc --open             # 生成并打开
cargo doc --no-deps          # 不生成依赖文档

# 文档测试
cargo test --doc

# 打开本地文档
cargo doc --open
```

### 发布与安装

```shell
# 发布到 crates.io
cargo publish
cargo publish --dry-run
cargo publish --allow-dirty

# 安装二进制包
cargo install ripgrep
cargo install --version 0.1.0 package-name
cargo install --path .       # 安装当前项目

# 安装到指定目录
cargo install --root ~/.cargo/bin

# 列出已安装的包
cargo install --list

# 卸载包
cargo uninstall package-name

# 从 git 安装
cargo install --git https://github.com/user/repo
cargo install --git https://github.com/user/repo --branch main

# 从本地安装
cargo install --path ./myproject
```

### 工作空间

```shell
# 创建工作空间
# Cargo.toml（根目录）
[workspace]
members = [
    "crate1",
    "crate2",
]

#Cargo.toml（工作空间成员）
[package]
name = "crate1"
version = "0.1.0"

[dependencies]
crate2 = { path = "../crate2" }

# 工作空间命令
cargo build --workspace      # 构建所有成员
cargo test --workspace       # 测试所有成员
cargo run -p crate1          # 运行特定成员

# 查看工作空间成员
cargo metadata --format-version 1
```

### 清理

```shell
# 清理构建产物
cargo clean
cargo clean --release        # 只清理 release

# 清理缓存（慎重）
rm -rf ~/.cargo/registry/cache
rm -rf ~/.cargo/registry/index
```

### 格式化与检查

```shell
# 格式化代码
cargo fmt
cargo fmt -- --check          # 只检查不修改

# 代码检查（Clippy）
cargo clippy
cargo clippy -- -W clippy::all
cargo clippy -- -D warnings  # 警告视为错误

# 查看包信息
cargo tree
cargo tree --duplicates      # 查看重复依赖

# 静态分析
cargo clippy --all-targets -- -D warnings
```

### 常用第三方工具

```shell
# 安装常用工具

# 代码格式化（已内置）
cargo fmt

# Linter（已内置）
cargo clippy

# 依赖检查
cargo install cargo-outdated
cargo install cargo-license

# 安全审计
cargo install cargo-audit
cargo audit

# 传递依赖检查
cargo audit --json

# 项目初始化模板
cargo install cargo-generate
cargo generate template-name

# 热重载开发
cargo install cargo-watch
cargo watch -x run
cargo watch -x "test --lib"
cargo watch -x "build --release"

# 输出构建时间
cargo install cargo-time
cargo time build

# 依赖大小分析
cargo install cargo-bloat
cargo bloat --release

# 火焰图
cargo install cargo-flamegraph
cargo flamegraph

# 发布自动化
cargo install cargo-release
cargo release --dry-run
cargo release patch

# 常用镜像源（~/.cargo/config.toml）
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"

# 字节跳动镜像
[source.rsproxy]
registry = "sparse+https://rsproxy.cn/crates.io-index/"
```

### 配置文件 (~/.cargo/config.toml)

```toml
# 镜像源配置
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"

# 构建优化
[build]
jobs = 8                      # 并行编译数

[target.x86_64-unknown-linux-gnu]
rustflags = ["-C", "link-arg=-fuse-ld=lld"]

# 网络配置
[net]
retry = 5
offline = false

[registries.crates-io]
protocol = "sparse"
```

### 常用命令速查

```shell
# 开发流程
cargo new myproject && cd myproject
cargo add serde --features derive
cargo run

# 发布流程
cargo test
cargo clippy
cargo fmt -- --check
cargo build --release

# CI 常用组合
cargo fmt -- --check
cargo clippy -- -D warnings
cargo test --all
cargo build --release
```
