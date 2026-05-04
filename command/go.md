go
===

Go 语言工具链

## 补充说明

**go** 是 Go 语言的官方命令行工具，用于编译、测试、格式化、安装 Go 代码。Go 1.11+ 引入 Go Modules 进行依赖管理。

### 语法

```shell
go <command> [arguments]
```

### 模块管理

```shell
# 初始化模块
go mod init example.com/myapp
go mod init myapp

# 查看模块信息
go mod info
go list -m all                # 列出所有依赖模块

# 整理依赖
go mod tidy                   # 添加缺失的依赖，删除无用依赖
go mod tidy -v                # 详细输出

# 下载依赖
go mod download
go mod download module@version

# 验证依赖
go mod verify

# 查看模块依赖图
go mod graph
go mod graph | grep module-name

# 查看模块为什么需要某个依赖
go mod why module-name

# 复制依赖到 vendor 目录
go mod vendor

# 查看编辑模块依赖
go mod edit -module=example.com/newname
go mod edit -require=module@version
go mod edit -droprequire=module
go mod edit -exclude=module@version
go mod edit -replace=old@version=new@version
```

### 构建编译

```shell
# 编译当前目录
go build
go build .                     # 同上

# 编译指定包
go build ./...
go build ./cmd/server
go build example.com/myapp

# 指定输出文件
go build -o myapp
go build -o bin/myapp ./cmd/server

# 减小二进制体积
go build -ldflags="-s -w" -o myapp

# 编译指定系统架构
GOOS=linux go build
GOOS=windows go build
GOOS=darwin go build
GOARCH=amd64 go build
GOOS=linux GOARCH=arm64 go build

# 常见平台组合
# Linux: linux/amd64, linux/arm64
# Windows: windows/amd64
# macOS: darwin/amd64, darwin/arm64

# 静态编译
CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o myapp

# 编译并安装到 $GOPATH/bin
go install
go install ./cmd/server
go install example.com/myapp@latest

# 获取并编译包
go get example.com/myapp@latest
go get example.com/myapp@v1.2.3

# 获取依赖
go get ./...
```

### 运行测试

```shell
# 运行所有测试
go test
go test ./...
go test ./pkg/...

# 运行指定包测试
go test ./path/to/package

# 运行单个测试函数
go test -run TestFunctionName
go test -run "^TestName$"

# 详细输出
go test -v
go test -v -run TestFunction

# 测试覆盖率
go test -cover
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
go tool cover -func=coverage.out

# 基准测试
go test -bench=.
go test -bench=. -benchmem
go test -bench=BenchmarkName -benchtime=5s

# 竞态检测
go test -race

# 压力测试
go test -count=100 -run TestName

# 短测试（跳过长时间测试）
go test -short

# 测试特定文件
go test -run "" file_test.go

# 生成测试二进制
go test -c -o test binary
```

### 代码质量

```shell
# 格式化代码
go fmt
go fmt ./...
gofmt -w .
gofmt -d .                    # 显示差异

# 代码检查
go vet
go vet ./...

# 静态检查（需要安装）
go install honnef.co/go/tools/cmd/staticcheck@latest
staticcheck ./...

# 代码复杂度分析
go install github.com/fzipp/gocyclo/cmd/gocyclo@latest
gocyclo -avg -over 15 .

# 代码重复检测
go install github.com/mibk/dupl@latest
dupl -t 50

# 安全检查
go install github.com/securego/gosec/v2/cmd/gosec@latest
gosec ./...

# 地道 Go 代码检查
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
golangci-lint run
```

### 代码生成

```shell
# 生成代码（由 source 中的指令）
go generate
go generate ./...

# 字符串转换为常量
#go:generate stringer -type=Pill

# Mock 生成
#go:generate mockgen -source=request.go -destination=mock_request.go

# 生成文档
go doc
go doc fmt
go doc fmt.Printf
go doc -all fmt

# 查看包文档
go doc github.com/gin-gonic/gin

# 启动文档服务器
godoc -http=:6060
```

### 版本管理

```shell
# 查看 Go 版本
go version

# 升级依赖版本
go get module@version
go get module@latest
go get module@v1.2.3

# 升级所有依赖
go get -u
go get -u=patch                          # 只升级补丁版本

# 查看可用版本
go list -m -versions module
go list -m -versions github.com/gin-gonic/gin

# 查看模块详细信息
go list -m -json github.com/gin-gonic/gin

# 回退依赖版本
go get module@v1.0.0

# 清理模块缓存
go clean -modcache
```

### 工具命令

```shell
# 查看环境信息
go env
go env GOPATH
go env GOOS

# 设置环境变量
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GMO=on

# 查看模块下载路径
go env GOMODCACHE
go env GOPATH

# 清理构建缓存
go clean
go clean -cache
go clean -testcache                     # 清理测试缓存
go clean -modcache                      # 清理模块缓存

# 查看 GOPATH
go env GOPATH

# 查看模块代理
go env GOPROXY

# 设置代理（国内推荐）
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/,direct
go env -w GOSUMDB=sum.golang.org

# 打印构建信息
go build -x

# 列出包
go list
go list ./...
go list -m all
```

### go.mod 文件

```
module example.com/myapp

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/spf13/cobra v1.7.0
)

require (
    golang.org/x/sys v0.12.0 // indirect
)

replace github.com/old/module => github.com/new/module v1.0.0

exclude github.com/problematic/module v1.0.0
```

### 常用组合命令

```shell
# 完整构建流程
go mod tidy
go test ./...
go build -ldflags="-s -w" -o myapp

# CI 流水线常用命令
go mod download
go mod verify
go fmt ./...
go vet ./...
go test -race -cover ./...
go build

# 交叉编译常用
CGO_ENABLED=0 GOOS=linux   GOARCH=amd64 go build -o myapp-linux-amd64
CGO_ENABLED=0 GOOS=linux   GOARCH=arm64 go build -o myapp-linux-arm64
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o myapp-windows-amd64.exe
CGO_ENABLED=0 GOOS=darwin  GOARCH=amd64 go build -o myapp-darwin-amd64

# 开发时热编译（需要安装 air）
go install github.com/cosmtrek/air@latest
air

# 依赖分析
go mod graph | grep -v "^[" | cut -d' ' -f1 | sort -u
```
