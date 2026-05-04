tmux
===

终端复用器

## 补充说明

**tmux** 是一个终端复用器，允许在一个终端窗口中管理多个终端会话。支持会话持久化、窗口分割、远程会话恢复等功能。

### 语法

```shell
tmux [command] [options]
```

### 会话管理

```shell
# 创建新会话
tmux
tmux new
tmux new -s session-name          # 指定会话名
tmux new-session -s session-name

# 列出所有会话
tmux ls
tmux list-sessions

# 连接到会话
tmux attach                       # 连接最近会话
tmux attach -t session-name       # 连接指定会话
tmux a                            # 简写
tmux a -t 0                       # 按编号连接

# 分离会话（快捷键）
Ctrl+b d                          # 分离当前会话

# 切换会话
tmux switch -t session-name

# 选择会话（交互式）
Ctrl+b s                          # 列出并选择会话

# 杀死会话
tmux kill-session -t session-name
tmux kill-session -a              # 杀死所有其他会话
tmux kill-session -a -t keep      # 除 keep 外全部杀死

# 重命名会话
tmux rename -t old-name new-name
Ctrl+b $                          # 快捷键重命名当前会话

# 发送命令到会话
tmux send-keys -t session-name "command" Enter
```

### 窗口管理

```shell
# 创建新窗口
Ctrl+b c                          # 创建新窗口

# 切换窗口
Ctrl+b n                          # 下一个窗口
Ctrl+b p                          # 上一个窗口
Ctrl+b 0-9                        # 切换到窗口 0-9
Ctrl+b w                          # 列出所有窗口并选择
Ctrl+b '                          # 输入窗口编号切换

# 关闭窗口
Ctrl+b &                          # 关闭当前窗口
Ctrl+b x                          # 关闭当前窗格（确认）

# 重命名窗口
Ctrl+b ,                          # 重命名当前窗口
tmux rename-window new-name

# 搜索窗口
Ctrl+b f                          # 搜索窗口名称
```

### 窗格管理

```shell
# 分割窗格
Ctrl+b "                          # 水平分割
Ctrl+b %                          # 垂直分割
tmux split-window -h              # 水平分割（命令行）
tmux split-window -v              # 垂直分割（命令行）

# 切换窗格
Ctrl+b ↑↓←→                       # 方向键切换
Ctrl+b o                          # 下一个窗格
Ctrl+b q                          # 显示窗格编号（点击切换）

# 调整窗格大小
Ctrl+b Ctrl+↑↓←→                  # 调整大小
Ctrl+b Alt+↑↓←→                   # 大幅度调整
tmux resize-pane -U 10            # 上扩 10 行
tmux resize-pane -D 10            # 下扩 10 行
tmux resize-pane -L 10            # 左扩 10 列
tmux resize-pane -R 10            # 右扩 10 列

# 关闭窗格
Ctrl+b x                          # 关闭当前窗格（确认）
exit                              # 在窗格中执行退出

# 窗格最大化/恢复
Ctrl+b z                          # 最大化当前窗格（再次按恢复）

# 窗格布局
Ctrl+b Space                      # 切换预设布局
tmux select-layout even-horizontal # 水平均匀
tmux select-layout even-vertical   # 垂直均匀

# 交换窗格
Ctrl+b {                          # 与上一个窗格交换
Ctrl+b }                          # 与下一个窗格交换
Ctrl+b Ctrl+o                     # 顺时针旋转所有窗格

# 窗格转换为新窗口
Ctrl+b !                          # 当前窗格转为新窗口

# 同步所有窗格输入
tmux setw synchronize-panes on    # 开启同步输入
tmux setw synchronize-panes off   # 关闭同步输入
Ctrl+b :setw synchronize-panes    # 快捷命令模式
```

### 命令模式

```shell
# 进入命令模式
Ctrl+b :                          # 进入命令模式

# 常用命令
new -s name                       # 创建新会话
neww -n name                      # 创建新窗口
rename-session new-name           # 重命名会话
rename-window new-name            # 重命名窗口
kill-session                      # 杀死会话
kill-window                       # 杀死窗口
setw synchronize-panes on         # 同步窗格输入
select-layout even-horizontal     # 设置布局
set-option mouse on               # 启用鼠标
```

### 配置文件

```shell
# ~/.tmux.conf 示例

# 启用鼠标支持
set -g mouse on

# 设置基础索引为 1（默认 0）
set -g base-index 1
setw -g pane-base-index 1

# 分割快捷键更直观
bind | split-window -h
bind - split-window -v

# 调整大小快捷键
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# 快速重载配置
bind r source-file ~/.tmux.conf \; display "已重载配置"

# 改变分隔符
set -g pane-border-style fg=green
set -g pane-active-border-style fg=white,bg=blue

# 设置状态栏
set -g status-bg black
set -g status-fg white
set -g status-left "#S "
set -g status-right "%H:%M %Y-%m-%d"

# 启用 256 色
set -g default-terminal "screen-256color"

# 增加历史记录
set -g history-limit 50000

# Vim 模式窗格选择
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# 复制模式使用 vi 键绑定
setw -g mode-keys vi
bind -T copy-mode-vi v send-keys -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel 'xclip -in -selection clipboard'
```

### 复制模式

```shell
# 进入复制模式
Ctrl+b [                          # 进入复制模式

# 复制模式操作（vi 风格）
q                                 # 退出复制模式
Space                             # 开始选择
Enter                             # 复制选中内容
v                                 # 开始选择（需配置 vi 模式）
y                                 # 复制（需配置）
Ctrl+b ]                          # 粘贴

# 搜索
/                                 # 向下搜索
?                                 # 向上搜索
n                                 # 下一个匹配
N                                 # 上一个匹配

# 粘贴缓冲区
Ctrl+b ]                          # 粘贴
Ctrl+b =                          # 选择粘贴缓冲区列表
```

### 实用技巧

```shell
# 从脚本创建 tmux 会话
tmux new-session -d -s dev
tmux send-keys -t dev 'vim' Enter
tmux split-window -h -t dev
tmux send-keys -t dev 'npm run dev' Enter
tmux attach -t dev

# 保存会话布局脚本
tmux list-windows -F "#{window_layout}" > layout.txt

# 命令行批量操作
tmux new-session -d -s work
tmux send-keys -t work 'cd ~/project' Enter
tmux send-keys -t work 'vim file.txt' Enter

# 脚本示例：创建开发环境
#!/bin/bash
tmux new-session -d -s dev -x 200 -y 50
tmux split-window -h -t dev
tmux split-window -v -t dev:0.0
tmux send-keys -t dev:0.0 'vim .' Enter
tmux send-keys -t dev:0.1 'npm run dev' Enter
tmux send-keys -t dev:0.2 'git status' Enter
tmux attach -t dev

# 恢复意外断开的会话
tmux attach -d                    # -d 参数分离其他客户端

# 远程会话最佳实践
# SSH 连接后立即创建/连接 tmux 会话
ssh server -t "tmux attach || tmux new"
```

### 故障排除

```shell
# 强制杀死 tmux 服务器（所有会话将丢失）
tmux kill-server

# 找到并杀死残留进程
ps aux | grep tmux
kill -9 PID

# 修复 UTF-8 显示
tmux -u                          # 启用 UTF-8
tmux set-option -g utf8 on

# 查看版本
tmux -V

# 查看所有配置
tmux show-options -g
tmux show-window-options -g
```
