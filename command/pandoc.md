pandoc
===

文档格式转换工具

## 补充说明

**pandoc** 是通用的文档转换工具，支持多种格式之间的相互转换，被称为文档界的"瑞士军刀"。支持 Markdown、HTML、PDF、Word 等数十种格式。

### 语法

```shell
pandoc [OPTIONS] [INPUT] -o OUTPUT
```

### 基本转换

```shell
# Markdown 转 HTML
pandoc input.md -o output.html
pandoc input.md -s -o output.html    # 生成完整 HTML 文档

# Markdown 转 PDF
pandoc input.md -o output.pdf
pandoc input.md --pdf-engine=xelatex -o output.pdf  # 中文 PDF

# Markdown 转 Word
pandoc input.md -o output.docx
pandoc input.md -o output.docx --reference-doc=template.docx

# Markdown 转 PowerPoint
pandoc input.md -o output.pptx

# Markdown 转 HTML 幻灯片
pandoc input.md -o output.html -t revealjs
pandoc input.md -o output.html -t slidy

# Word 转 Markdown
pandoc input.docx -o output.md
pandoc input.docx -t markdown -o output.md

# HTML 转 Markdown
pandoc input.html -o output.md
pandoc input.html -t markdown -o output.md

# PDF 转 Markdown
pandoc input.pdf -o output.md
```

### 输入格式

```shell
# 指定输入格式（可选，通常自动识别）
pandoc -f markdown input.md -o output.html
pandoc -f markdown -t html input.md -o output.html

# 支持的输入格式
markdown           # Markdown
markdown_strict    # 严格 Markdown
markdown_phpextra  # PHP Markdown Extra
markdown_github    # GitHub Markdown
commonmark         # CommonMark
gfm               # GitHub Flavored Markdown
html              # HTML
docx              # Word OOXML
odt               # OpenDocument Text
rtf               # Rich Text Format
pdf               # PDF
latex             # LaTeX
rst               # reStructuredText
org               # Emacs Org Mode
textile           # Textile
twiki             # TWiki
mediawiki         # MediaWiki
opml              # OPML
docbook           # DocBook
jats              # JATS XML
tsv               # TSV
csv               # CSV
json              # JSON
```

### 输出格式

```shell
# 指定输出格式（可选，通常通过扩展名自动识别）
pandoc input.md -t html -o output
pandoc input.md -o output.html

# 支持的输出格式（常用）
html               # HTML
html5              # HTML5
docx               # Word OOXML
odt                # OpenDocument Text
pdf                # PDF
latex              # LaTeX
beamer             # Beamer 幻灯片
pptx               # PowerPoint
revealjs           # Reveal.js 幻灯片
slidy              # Slidy 幻灯片
dzslides           # DZSlides 幻灯片
markdown           # Markdown
commonmark         # CommonMark
gfm                # GitHub Flavored Markdown
rst                # reStructuredText
org                # Emacs Org Mode
textile            # Textile
rtf                # RTF
epub               # EPUB
epub3              # EPUB 3
fb2                # FictionBook2
asciidoc           # AsciiDoc
man                # Groff man
texinfo            # GNU Texinfo
org                # Org Mode
plain              # 纯文本
json               # JSON
```

### PDF 相关选项

```shell
# PDF 引擎
pandoc input.md -o output.pdf --pdf-engine=pdflatex
pandoc input.md -o output.pdf --pdf-engine=xelatex    # 中文支持
pandoc input.md -o output.pdf --pdf-engine=lualatex
pandoc input.md -o output.pdf --pdf-engine=wkhtmltopdf
pandoc input.md -o output.pdf --pdf-engine=weasyprint

# 中文 PDF（推荐配置）
pandoc input.md -o output.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="SimSun" \
  -V geometry:margin=1in

# 使用中文字体配置
pandoc input.md -o output.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="Microsoft YaHei" \
  -V mainfont="Microsoft YaHei" \
  -V geometry:margin=2cm

# PDF 参数
pandoc input.md -o output.pdf --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V fontsize=12pt \
  -V colorlinks=true \
  -V linkcolor=blue
```

### 通用选项

```shell
# 生成完整文档
pandoc input.md -s -o output.html    # 添加 HTML 头尾
pandoc input.md --standalone -o output.html

# 设置文档标题
pandoc input.md -o output.html -M title="My Document"
pandoc input.md --metadata title="My Document" -o output.html

# 设置作者
pandoc input.md -o output.html -M author="张三"
pandoc input.md --metadata author="张三" -o output.html

# 设置日期
pandoc input.md -o output.html -M date="2024-01-01"

# 目录
pandoc input.md -o output.html --toc
pandoc input.md -o output.html --toc --toc-depth=3

# 章节
pandoc input.md -o output.html --number-sections
pandoc input.md -o output.html --number-offset=1

# 模板
pandoc input.md -o output.html --template=template.html

# 变量
pandoc input.md -o output.html -V title="Hello"
pandoc input.md -o output.pdf -V geometry:margin=1in

# CSS（HTML 输出）
pandoc input.md -o output.html --css=styles.css
pandoc input.md -o output.html -c styles.css

# 数学公式
pandoc input.md -o output.html --mathjax
pandoc input.md -o output.html --katex
pandoc input.md -o output.html --webtex

# 代码语法高亮
pandoc input.md -o output.html --highlight-style=pygments
pandoc input.md -o output.html --highlight-style=tango
pandoc input.md -o output.html --highlight-style=espresso
pandoc input.md -o output.html --highlight-style=zenburn
pandoc input.md -o output.html --highlight-style=kate
pandoc input.md -o output.html --highlight-style=monochrome
```

### 过滤器

```shell
# 使用 Lua 过滤器
pandoc input.md -o output.html --lua-filter=filter.lua

# 使用 Python 过滤器
pandoc input.md -o output.html --filter=filter.py

# 使用 pandoc-crossref（交叉引用）
pandoc input.md -o output.html --filter=pandoc-crossref

# 使用 pandoc-citeproc（文献引用）
pandoc input.md -o output.html --citeproc

# 参考文献文件
pandoc input.md -o output.html --bibliography=refs.bib
```

### 合并文档

```shell
# 合并多个 Markdown 文件
pandoc chapter1.md chapter2.md chapter3.md -o book.pdf

# 从多个文件创建 EPUB
pandoc chapter1.md chapter2.md chapter3.md -o book.epub

# 使用 YAML 头设置书籍信息
#---
#title: My Book
#author: 张三
#date: 2024-01-01
#---
```

### 模板变量

```shell
# 常用模板变量
-V title="标题"                   # 标题
-V author="作者"                  # 作者
-V date="2024-01-01"             # 日期
-V geometry:margin=1in          # 边距
-V fontsize=12pt                 # 字号
-V documentclass=article         # 文档类
-V papersize=a4                  # 纸张大小
-V colorlinks=true               # 彩色链接
-V linkcolor=blue                # 链接颜色
-V urlcolor=blue                 # URL 颜色
-V mainfont="SimSun"             # 主字体
-V sansfont="Arial"              # 无衬线字体
-V monofont="Courier"            # 等宽字体
-V CJKmainfont="SimSun"          # 中文主字体
-V header-includes="..."         # 头部包含
```

### 常用组合

```shell
# Markdown 转 PDF（中文）
pandoc input.md -o output.pdf --pdf-engine=xelatex -V CJKmainfont="SimSun"

# Markdown 转 Word（带样式）
pandoc input.md -o output.docx --reference-doc=template.docx

# 生成带目录的 PDF
pandoc input.md -o output.pdf --pdf-engine=xelatex --toc -V CJKmainfont="SimSun"

# 创建幻灯片
pandoc slides.md -o slides.html -t revealjs -V theme=moon

# 批量转换
for f in *.md; do pandoc "$f" -o "${f%.md}.docx"; done

# 创建完整 HTML 文档
pandoc input.md -s -o output.html -c style.css --toc --toc-depth=3

# Markdown 转 LaTeX
pandoc input.md -o output.tex

# Word 转 PDF（需要安装 wkhtmltopdf）
pandoc input.docx -o output.pdf --pdf-engine=wkhtmltopdf
```
