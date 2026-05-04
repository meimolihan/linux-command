windows-esd2iso
===

将Windows ESD格式镜像转换为ISO格式完整教程

## 补充说明

ESD（Electronic Software Download）是微软推出的高密度压缩系统镜像格式，体积更小但部分平台（如虚拟机、macOS恢复助理）无法识别。本教程提供Windows和macOS两端将ESD镜像转换为ISO格式的方案，涵盖工具使用、操作步骤及注意事项。

## 实例

### 背景

三方网站（如[修系统](https://www.xiuxitong.com/)、[不忘初心系统](https://www.pc528.net/)）下载的精简Windows系统常提供ESD格式镜像，需转换为ISO以兼容更多平台。

### Windows端

#### 准备工作

1. 下载所需ISO外壳和[UltraISO软碟通](https://www.ultraiso.com/)软件
2. 将待转换的ESD文件重命名为`install.esd`

#### 操作步骤

1. 先打开Ultraiso软件，把`不忘初心系统ISO外壳.iso`托到Ultraiso软件里面。
   ![](https://file.meimolihan.eu.org/screenshot/esd2iso-001.webp)

2. 拖放完成后，在Ultraiso软碟通软件里面双击打开ISO。
   ![](https://file.meimolihan.eu.org/screenshot/esd2iso-002.webp)

3. 进入`\sources`这个文件夹，把刚才重命名后的`install.esd`拖入内。
   ![](https://file.meimolihan.eu.org/screenshot/esd2iso-003.webp)

4. 然后保存或者另存为新的ISO都行，这样ESD转ISO就完成了，用这个保存后的`不忘初心系统ISO外壳.iso`安装系统就可以了。
   ![](https://file.meimolihan.eu.org/screenshot/esd2iso-004.webp)

### macOS端

macOS下可使用以下工具操作：

#### AnyToISO

下载[AnyToISO](https://115cdn.com/s/swhaywl33ki?password=e5f4)（支持中文），可编辑、提取和打包ISO，但实测修改的Windows 11镜像无法在虚拟机中安装。

#### UUByte

[UUByte](https://www.uubyte.com/)功能与UltraISO类似，但需付费，未验证实际效果。

#### PowerISO

[PowerISO](https://www.poweriso.com/download-poweriso-command-line-utility-for-osx.htm)支持macOS和Windows，macOS下无图形界面，需使用命令行操作：

**提取镜像内容**

```shell
poweriso extract ./win11.iso / -od temp
```

**打包为ISO镜像**

```shell
poweriso create -o test.iso -add temp /
```

### 总结

Windows端使用UltraISO可无损编辑ISO，兼容性最佳，推荐优先使用此方法。macOS端工具存在兼容性问题，建议优先在Windows环境下完成转换。
