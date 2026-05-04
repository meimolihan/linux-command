pve-sata-passthrough
===

PVE 中 SATA 直通的实现方法，让虚拟机直接访问物理 SATA 硬盘/控制器

## 补充说明

SATA 直通是 Proxmox VE（PVE）中让虚拟机直接访问物理 SATA 硬盘 / 控制器的技术，可获得接近原生的存储性能，适用于需要直接操控硬盘的场景（如虚拟机内安装独立系统、数据直存物理盘等）。

### 前置准备：确认硬件支持与硬盘信息

#### 1. 硬件要求（必须满足）

SATA 直通依赖 IOMMU 技术，需硬件和 BIOS 双重支持：

* **CPU 要求**：
  * Intel CPU：4 代酷睿及以上（或 B75 及以上芯片组），支持 **VT-d** 技术
  * AMD CPU：Ryzen 系列及以上（或对应芯片组），支持 **AMD-Vi** 技术

* **BIOS 设置**：
  1. 开机按 Del/F2 进入 BIOS
  2. 在「高级」→「CPU 配置」中启用 VT-d（Intel）/AMD-Vi（AMD）
  3. 部分主板需同时启用「PCIe 热插拔」或「IOMMU 控制器」

#### 2. 查看并记录 SATA 硬盘信息

通过命令精准获取硬盘 ID（避免盘符漂移导致直通失效）：

```shell
ls -l /dev/disk/by-id/ | grep -E 'ata-|lrwxrwxrwx'
```

* 重点记录 `ata-` 开头的硬盘 ID（如 `ata-WDC_WD2500BEVT-22ZCT0_WD-WXHZ08044989`）
* 同时记录 ID 对应的盘符（如 `sdx`，通过输出末尾 `-> ../../sdx` 查看）

示例输出解读：

```bash
lrwxrwxrwx 1 root root  9  5月  4 10:00 ata-WDC_WD2500BEVT-22ZCT0_WD-WXHZ08044989 -> ../../sdb
```

其中 `ata-xxx` 为硬盘 ID，`sdb` 为对应盘符。

### 核心步骤：开启 PVE 的 IOMMU 硬件直通

IOMMU 是硬件直通的基础，需配置 GRUB 并加载内核模块：

#### 1. 编辑 GRUB 配置文件

```shell
nano /etc/default/grub
```

找到 `GRUB_CMDLINE_LINUX_DEFAULT` 行，按 CPU 类型修改：

* **Intel CPU**（添加 `intel_iommu=on`）：

```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"
```

* **AMD CPU**（添加 `amd_iommu=on`）：

```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet amd_iommu=on"
```

* （可选）若后续直通失败，可追加分组优化参数：

```shell
# Intel 示例（追加后）
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on pcie_acs_override=downstream,multifunction"

# AMD 示例（追加后）
GRUB_CMDLINE_LINUX_DEFAULT="quiet amd_iommu=on pcie_acs_override=downstream,multifunction"
```

#### 2. 更新 GRUB 并加载内核模块

更新 GRUB 配置：

```shell
update-grub
```

编辑内核模块配置文件：

```shell
nano /etc/modules
```

添加以下必需模块：

```bash
vfio_iommu_type1
vfio_pci
vfio_virqfd
```

重启 PVE 系统使配置生效：

```shell
reboot
```

#### 3. 验证 IOMMU 是否启用成功

重启后执行以下命令，确认 IOMMU 已激活：

```shell
dmesg | grep -i iommu
```

* 成功标识：输出含 `IOMMU enabled`（Intel）或 `AMD-Vi: IOMMU enabled`（AMD）
* 若未输出，检查 BIOS 中 VT-d/AMD-Vi 是否真的启用，或 GRUB 配置是否正确

### 两种 SATA 直通方案（按需选择）

#### 方案一：直通单个 SATA 硬盘（推荐，风险低）

适合仅需给虚拟机分配某一块物理硬盘的场景，不影响 PVE 系统盘和其他硬盘。

##### 操作步骤

执行以下命令（替换占位符）：

```shell
qm set <VM ID> --sata<X> /dev/disk/by-id/<硬盘ID>
```

##### 参数说明

* `<VM ID>`：目标虚拟机的 ID（如 100）
* `<X>`：SATA 控制器编号（从 0 开始，如 sata0、sata1）
* `<硬盘ID>`：第一步记录的 `ata-` 开头的硬盘唯一 ID

##### 示例

给 ID 为 100 的虚拟机，添加一块 SATA 硬盘（ID 为 `ata-WDC_WD2500BEVT-22ZCT0_WD-WXHZ08044989`）到 sata0 接口：

```shell
qm set 100 --sata0 /dev/disk/by-id/ata-WDC_WD2500BEVT-22ZCT0_WD-WXHZ08044989
```

##### 验证

1. 启动虚拟机
2. 在虚拟机内执行 `lsblk` 或 `fdisk -l`，即可看到直通的物理硬盘

#### 方案二：直通整个 SATA 控制器（进阶，风险高）

适合需要给虚拟机分配多个 SATA 硬盘，或需要原生 SATA 控制器功能的场景。

##### 操作步骤

查看 SATA 控制器的 PCI 设备信息：

```shell
lspci | grep SATA
```

示例输出（记录控制器的 PCI 地址，如 `00:17.0`）：

```bash
00:17.0 SATA controller: Intel Corporation Alder Lake-N SATA AHCI Controller
```

PVE 网页端操作：

1. 登录 PVE 网页管理界面（默认地址：https://PVE-IP:8006）
2. 进入目标虚拟机 →「硬件」→「添加」→「PCI 设备」
3. 选择步骤 1 记录的 SATA 控制器（如 `00:17.0 SATA controller`）
4. 勾选「所有功能」「ROM-Bar」「PCI-Express」（部分老控制器需取消「PCI-Express」）

##### 重要风险提示

* 若 PVE 系统盘连接在该 SATA 控制器上，直通后 PVE 会失去对系统盘的控制，导致系统无法启动
* 解决方案：将 PVE 系统安装在 NVMe 硬盘或独立的 SATA 控制器
* 直通后，该控制器下的所有 SATA 硬盘都会被虚拟机独占，PVE 无法访问

### 故障排查与避坑指南

#### 1. 常见错误及解决方案

| 错误现象 | 可能原因 | 解决方案 |
| --- | --- | --- |
| 执行 `qm set` 后，虚拟机内看不到硬盘 | 硬盘 ID 错误 / 盘符漂移 | 重新执行 `ls -l /dev/disk/by-id/` 确认硬盘 ID，使用 ID 而非盘符配置 |
| 直通后虚拟机无法启动 | IOMMU 未启用 / PCI 设备冲突 | 验证 IOMMU 是否启用（`dmesg \| grep -i iommu`），检查 PCI 分组 |
| PVE 根目录变为只读 | 误直通了系统盘所在的 SATA 控制器 | 强制重启 PVE，删除虚拟机的 SATA 控制器直通配置，重新规划系统盘和直通控制器 |
| 硬盘直通后性能低下 | 未启用 PCI-Express 模式 | 编辑虚拟机的 SATA 控制器直通配置，勾选「PCI-Express」选项 |

#### 2. 关键避坑要点

* 优先选择「方案一：直通单个硬盘」，风险低、灵活性高
* 始终使用 `/dev/disk/by-id/` 下的硬盘 ID 配置直通，而非 `/dev/sdx` 盘符
* 配置前备份虚拟机重要数据
* 若主板有多个 SATA 控制器，可将系统盘和直通硬盘分别连接到不同控制器

## 总结

PVE 中 SATA 直通的核心是「启用 IOMMU + 正确配置直通目标」：

* 新手推荐「单个硬盘直通」，步骤简单、风险可控
* 进阶用户可选择「SATA 控制器直通」，但需确保系统盘与直通控制器分离
* 配置过程中若遇到问题，优先检查 IOMMU 启用状态和硬盘 ID 正确性

通过以上步骤，虚拟机可直接操控物理 SATA 硬盘，获得与物理机一致的存储性能，适用于 NAS 搭建、数据库存储等对硬盘性能和直接访问有要求的场景。
