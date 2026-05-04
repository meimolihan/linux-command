vim
===

Vim 文本编辑器配置与技巧

## 补充说明

**Vim** 是高度可配置的文本编辑器，以其高效的键盘操作和强大的文本处理能力著称。本文档涵盖常用配置、快捷键和实用技巧。

### 基本配置

```vim
" ~/.vimrc 示例

" 基础设置
set nocompatible              " 关闭 vi 兼容模式
set encoding=utf-8             " 设置编码
set fileencoding=utf-8         " 文件编码
set fileencodings=utf-8,gbk   " 自动识别编码
set termencoding=utf-8

" 行号和显示
set number                    " 显示行号
set relativenumber             " 显示相对行号
set cursorline                " 高亮当前行
set cursorcolumn              " 高亮当前列
set showmatch                 " 高亮匹配括号
set matchtime=2               " 匹配高亮时间

" 缩进
set tabstop=4                 " Tab 宽度
set softtabstop=4             " 软 Tab 宽度
set shiftwidth=4              " 缩进宽度
set expandtab                 " 使用空格代替 Tab
set autoindent                " 自动缩进
set smartindent               " 智能缩进

" 搜索
set incsearch                 " 增量搜索
set hlsearch                  " 高亮搜索结果
set ignorecase                " 忽略大小写
set smartcase                 " 智能大小写

" 杂项
set wildmenu                  " 命令行补全
set wildmode=list:longest,full
set hidden                    " 允许隐藏未保存缓冲区
set backup                    " 备份文件
set writebackup               " 写入前备份
set undofile                  " 持久撤销
set clipboard=unnamed         " 系统剪贴板
set mouse=a                   " 鼠标支持
set ttyfast                   " 快速终端
set showcmd                   " 显示命令
set laststatus=2              " 始终显示状态栏
```

### 插件管理

```vim
" vim-plug 配置
" 在 ~/.vimrc 中添加：
"
" call plug#begin('~/.vim/plugged')
" Plug 'tpope/vim-sensible'      " 基础配置
" Plug 'scrooloose/nerdtree'     " 文件树
" Plug 'ctrlpvim/ctrlp.vim'      " 文件搜索
" Plug 'vim-airline/vim-airline' " 状态栏
" Plug 'tpope/vim-fugitive'      " Git
" Plug 'tpope/vim-surround'      " 环绕符号
" Plug 'tpope/vim-commentary'    " 注释
" Plug 'leafgarland/typescript-vim' " TypeScript
" call plug#end()

" 安装插件命令
" vim +PlugInstall +qall
```

### 常用快捷键

```vim
" 模式切换
i           " 插入模式
a           " 在光标后插入
A           " 在行尾插入
I           " 在行首插入
o           " 在下行插入
O           " 在上行插入
s           " 删除光标字符并插入
S           " 删除整行并插入
Esc         " 返回普通模式
Ctrl+[      " 替代 Esc

" 移动（普通模式）
h j k l     " 左下上右
w            " 下一个词首
b            " 上一个词首
e            " 下一个词尾
ge           " 上一个词尾
0            " 行首
^            " 行首非空
$            " 行尾
gg           " 文件首
G            " 文件尾
:N           " 跳转到第 N 行

" 屏幕移动
H M L        " 屏幕顶部/中部/底部
Ctrl+d       " 下翻半屏
Ctrl+u       " 上翻半屏
Ctrl+f       " 下翻整屏
Ctrl+b       " 上翻整屏
zt           " 当前行置顶
zz           " 当前行居中
zb           " 当前行置底

" 跳转
%            " 跳转到匹配括号
[{           " 跳转到上一个 {
]}           " 跳转到下一个 {
]]           " 跳转到下一个 {
[[           " 跳转到上一个 {
*            " 搜索当前词并跳转
#            " 反向搜索当前词
'            " 跳转到标记
`.           " 跳转到上次编辑位置
g;           " 跳转到修改位置历史
```

### 编辑命令

```vim
" 删除
x            " 删除光标字符
dd           " 删除整行
dw           " 删除词
d$           " 删除到行尾
d0           " 删除到行首
D            " 删除到行尾
:5,10d       " 删除第 5-10 行

" 复制粘贴
yy           " 复制整行
yw           " 复制词
y$           " 复制到行尾
p            " 粘贴到光标后
P            " 粘贴到光标前

" 撤销重做
u            " 撤销
Ctrl+r       " 重做
U            " 撤销整行
.            " 重复上次命令

" 替换
r            " 替换单个字符
R            " 替换模式
~            " 大小写切换
guu          " 整行小写
gUU          " 整行大写
g~~          " 翻转大小写

" 缩进
>>           " 右缩进
<<           " 左缩进
==           " 自动缩进
5>>          " 右缩进 5 行
5<<          " 左缩进 5 行
```

### 高级编辑

```vim
" 块操作
Ctrl+v       " 进入可视块模式
v            " 进入可视模式
V            " 进入可视行模式
o            " 跳转块端点
O            " 跳转块另一端

" 可视模式操作
d            " 删除选中
y            " 复制选中
c            " 替换选中
g Ctrl+a     " 数字递增
g Ctrl+x     " 数字递减
>            " 右缩进
<            " 左缩进

" 多光标编辑（配合插件）
" :set mouse=n   " 鼠标支持
" Shift+右键拖动 " 列选择
" Ctrl+右键拖动 " 列块选择

" 寄存器
"1-9          " 删除寄存器
"0            " 复制寄存器
"a-z          " 命名寄存器
":            " 命令寄存器
".            " 最近插入文本

" 宏
qa           " 开始录制宏到寄存器 a
q            " 停止录制
@a           " 执行宏
@@           " 重复上次宏
10@a         " 执行 10 次宏
```

### 搜索与替换

```vim
" 基本搜索
/pattern     " 向下搜索
?pattern     " 向上搜索
n            " 下一个匹配
N            " 上一个匹配
:vim /pat/g file   " 搜索并列出
:vim /pat/ **/*.txt " 搜索文件

" 替换
:s/old/new/              " 替换第一个
:s/old/new/g             " 替换行内所有
:%s/old/new/g            " 替换文件中所有
:%s/old/new/gc           " 确认替换
:%s/old/new/gci          " 忽略大小写确认

" 正则替换
:%s/\(\d\{4\}\)-\(\d\{2\}\)-\(\d\{2\}\)/\3\/\2\/\1/g
" 2024-01-15 -> 15\/01\/2024

" 使用历史
q/             " 打开搜索历史
q:             " 打开命令历史
/ <Up>         " 浏览搜索历史
```

### 窗口与标签页

```vim
" 分割窗口
:sp file      " 水平分割
:vsp file     " 垂直分割
Ctrl+w s      " 水平分割当前文件
Ctrl+w v      " 垂直分割当前文件

" 关闭窗口
:q            " 关闭窗口
:qa           " 退出所有
Ctrl+w c      " 关闭当前窗口
Ctrl+w o      " 只保留当前窗口

" 窗口导航
Ctrl+w h/j/k/l  " 导航窗口
Ctrl+w w       " 循环窗口
Ctrl+w r       " 交换窗口
Ctrl+w x       " 交换窗口

" 窗口大小
Ctrl+w =       " 等分窗口
Ctrl+w _       " 最大化高度
Ctrl+w |       " 最大化宽度
:resize 20     " 设置高度
:vertical resize 80 " 设置宽度

" 标签页
:tabnew       " 新建标签页
gt            " 下一个标签
gT            " 上一个标签
:tabfirst     " 第一个标签
:tablast      " 最后一个标签
:tabm 0       " 移动到第一个
Ngt           " 跳转到第 N 个标签
```

### 文件操作

```vim
" 打开保存
:e file       " 打开文件
:e .          " 文件浏览器
:ene          " 新建未命名缓冲区
:w            " 保存
:w file       " 另存为
:wa           " 保存所有
:q            " 退出
:qa!          " 强制退出（不保存）
:x            " 保存并退出

" 文件浏览器
:Explore      " 打开目录
:SExplore     " 水平分割打开目录
:VExplore     " 垂直分割打开目录
:Lexplore     " 侧边栏文件树

" 文件树插件
:NERDTree     " 打开文件树
:NERDTreeToggle " 切换文件树
m             " 菜单操作
```

### Git 集成

```vim
" vim-fugitive
:Gstatus      " Git 状态
:Gcommit      " Git 提交
:Gpush        " Git 推送
:Gpull        " Git 拉取
:Gdiff        " Git 差异
:Gsdiff       " 水平分割差异
:Glog         " Git 历史
:Gblame       " Git 责备

" 快捷映射
nnoremap <leader>gs :Gstatus<CR>
nnoremap <leader>gc :Gcommit<CR>
nnoremap <leader>gp :Gpush<CR>
nnoremap <leader>gl :Glog<CR>
```

### 自定义映射

```vim
" .vimrc 中添加映射
let mapleader = " "

" 空格键保存
nnoremap <Space> :w<CR>

" 方向键调整窗口
nnoremap <Up> :resize +2<CR>
nnoremap <Down> :resize -2<CR>
nnoremap <Left> :vertical resize -2<CR>
nnoremap <Right> :vertical resize +2<CR>

" 快速注释
nnoremap <leader>c/ :s/^/\/\/ /<CR>
vnoremap <leader>c/ :s/^\/\/ //<CR>

" 切换行号显示
nnoremap <leader>n :set number!<CR>
```

### 常用命令

```shell
# 启动 Vim
vim file.txt
vim +10 file.txt           # 打开并跳转到第 10 行
vim +/pattern file.txt     # 打开并搜索模式
vim -o file1 file2         # 水平分割打开
vim -O file1 file2         " 垂直分割打开
vim -p file1 file2         # 多标签打开

# 从命令行编辑
vim -c "normal G" file.txt  # 执行命令后编辑
vim -c "wq" file.txt        # 保存退出

# 批量处理
for f in *.txt; do vim -c ":%s/old/new/g" -c "wq" $f; done

# 格式化
vim +"normal gg=G" +"wq" file.c

# 只读模式
vim -R file.txt
view file.txt
```
