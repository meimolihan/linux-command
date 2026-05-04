pve-nic-passthrough
===

PVE 中网卡直通的实现方法，让虚拟机直接访问物理网卡，获得接近原生的网络性能

## 补充说明

网卡直通（NIC Passthrough）是 Proxmox VE（PVE）中让虚拟机直接访问物理网卡的技术，通过 IOMMU 将物理网卡独占给虚拟机使用，可获得接近原生的网络性能，适用于软路由、防火墙、网络设备等对网络性能要求高的场景。

### 前置准备：确认硬件支持与网卡信息

#### 1. 硬件要求（必须满足）

网卡直通依赖 IOMMU 技术，需硬件和 BIOS 双重支持：

* **CPU 要求**：
  * Intel CPU：4 代酷睿及以上（或 B75 及以上芯片组），支持 **VT-d** 技术
  * AMD CPU：Ryzen 系列及以上（或对应芯片组），支持 **AMD-Vi** 技术

* **BIOS 设置**：
  1. 开机按 Del/F2 进入 BIOS
  2. 在「高级」→「CPU 配置」中启用 VT-d（Intel）/AMD-Vi（AMD）
  3. 部分主板需同时启用「PCIe 热插拔」或「IOMMU 控制器」

#### 2. 查看并记录网卡信息

查看系统中所有网卡及其 PCI 地址：

```shell
lspci | grep -i ethernet
```

示例输出：

```bash
00:1f.6 Ethernet controller: Intel Corporation Ethernet Connection I219-V
02:00.0 Ethernet controller: Intel Corporation I210 Gigabit Network Connection
03:00.0 Ethernet controller: Intel Corporation I210 Gigabit Network Connection
```

记录需要直通的网卡 PCI 地址（如 `02:00.0`）。

查看网卡详细信息，确认 IOMMU 分组情况：

```shell
lspci -nnk -s 02:00.0
```

查看网卡所属的 IOMMU 分组：

```shell
find /sys/kernel/iommu_groups/ -type l | grep 02:00.0
```

或查看所有分组：

```shell
for d in /sys/kernel/iommu_groups/*/devices/*; do echo "${d}"; done
```

### 核心步骤：开启 PVE 的 IOMMU 并配置网卡直通

#### 1. 编辑 GRUB 配置文件启用 IOMMU

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

* （可选）若网卡与其他设备在同一 IOMMU 分组，需追加分组拆分参数：

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

#### 3. 绑定网卡到 VFIO 驱动（可选但推荐）

为避免 PVE 系统占用网卡，可将网卡驱动绑定为 VFIO：

查看网卡驱动信息：

```shell
lspci -nnk -s 02:00.0
```

记录网卡的设备 ID（如 `[8086:1539]`）。

编辑 VFIO 配置文件：

```shell
nano /etc/modprobe.d/vfio.conf
```

添加网卡 ID（替换 `8086:1539` 为实际设备 ID）：

```bash
options vfio-pci ids=8086:1539
```

若有多块网卡需要直通，用逗号分隔：

```bash
options vfio-pci ids=8086:1539,8086:1540
```

更新 initramfs 并重启：

```shell
update-initramfs -u -k all
reboot
```

#### 4. 验证 IOMMU 是否启用成功

重启后执行以下命令，确认 IOMMU 已激活：

```shell
dmesg | grep -e DMAR -e IOMMU
或
lspci | grep -i net
```

```bash
root@pve:~# lspci | grep -i net
01:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
02:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
03:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
04:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
05:00.0 Ethernet controller: Intel Corporation Ethernet Controller I226-V (rev 04)
```

* 成功标识：输出含 `IOMMU enabled`（Intel）或 `AMD-Vi: IOMMU enabled`（AMD）
* 若未输出，检查 BIOS 中 VT-d/AMD-Vi 是否真的启用，或 GRUB 配置是否正确

### PVE 网页端添加网卡直通

#### 操作步骤

1. 登录 PVE 网页管理界面（默认地址：https://PVE-IP:8006）
2. 进入目标虚拟机 →「硬件」→「添加」→「PCI 设备」
3. 选择需要直通的网卡（如 `02:00.0 Ethernet controller`）
4. 勾选以下选项：
   * **所有功能**：确保网卡所有功能都被直通
   * **ROM-Bar**：部分网卡需要此选项才能正常工作
   * **PCI-Express**：大多数现代网卡是 PCIe 设备，建议勾选
5. 点击「添加」完成配置

#### 命令行方式添加（替代方案）

也可通过命令行直接添加 PCI 设备：

```shell
qm set <VM ID> -hostpci0 02:00.0,pcie=1,x-vga=off
```

参数说明：

* `<VM ID>`：目标虚拟机的 ID（如 100）
* `hostpci0`：主机 PCI 设备编号（可使用 hostpci0 到 hostpci5）
* `02:00.0`：网卡的 PCI 地址
* `pcie=1`：指定为 PCIe 设备
* `x-vga=off`：非显卡设备需设为 off

示例：

```shell
qm set 100 -hostpci0 02:00.0,pcie=1,x-vga=off
```

### 验证网卡直通是否成功

#### 1. 启动虚拟机后验证

在虚拟机内执行以下命令，查看是否能识别到直通的网卡：

**Linux 虚拟机**：

```shell
lspci | grep -i ethernet
ip link show
```

**Windows 虚拟机**：

打开「设备管理器」→「网络适配器」，查看是否出现直通的网卡

#### 2. 测试网络连通性

为直通的网卡配置 IP 地址后，测试网络连通性：

```shell
ping -c 4 192.168.1.1
```

### 故障排查与避坑指南

#### 1. 常见错误及解决方案

| 错误现象 | 可能原因 | 解决方案 |
| --- | --- | --- |
| 添加 PCI 设备后虚拟机无法启动 | IOMMU 未启用 / 网卡与其他设备同组 | 验证 IOMMU（`dmesg \| grep -i iommu`），尝试添加 `pcie_acs_override` 参数 |
| 虚拟机内看不到网卡 | 驱动未安装 / VFIO 绑定失败 | 检查虚拟机内是否安装对应网卡驱动，确认 VFIO 配置正确 |
| PVE 启动后网卡消失 | VFIO 驱动绑定导致 PVE 无法识别 | 若需 PVE 管理网口，不要绑定管理网口到 VFIO |
| 网络性能低下 | 未启用 PCI-Express 模式 | 编辑虚拟机的 PCI 设备配置，勾选「PCI-Express」选项 |
| 多网卡直通后部分不可用 | IOMMU 分组问题 | 使用 `pcie_acs_override` 参数拆分分组，或更换网卡插槽 |

#### 2. 关键避坑要点

* **不要直通 PVE 管理网口**：确保用于 PVE Web 管理的网口不被直通，否则会失去对 PVE 的管理
* **优先使用独立网卡**：板载网卡通常与 PVE 系统有依赖关系，建议使用独立 PCIe 网卡进行直通
* **检查 IOMMU 分组**：若网卡与 USB 控制器等其他设备在同一分组，直通会影响其他设备
* **备份配置**：操作前备份虚拟机配置文件（`/etc/pve/qemu-server/<VM ID>.conf`）
* **驱动准备**：确保虚拟机内已安装对应网卡的驱动程序（Intel、Realtek 等）

#### 3. 多网卡直通建议

若需要直通多块网卡（如软路由场景）：

1. 使用多口独立网卡（如四口 Intel I350），只需直通整个网卡设备
2. 查看网卡包含的所有功能：`lspci -nnk -s 02:00.*`
3. 一次添加所有网口，或分别添加每个网口

```shell
# 示例：直通四口网卡的所有网口
qm set 100 -hostpci0 02:00.0,pcie=1
qm set 100 -hostpci1 02:00.1,pcie=1
qm set 100 -hostpci2 02:00.2,pcie=1
qm set 100 -hostpci3 02:00.3,pcie=1
```

## 总结

PVE 中网卡直通的核心是「启用 IOMMU + 正确配置 PCI 设备直通」：

* 启用 IOMMU 是网卡直通的基础，需在 GRUB 中正确配置
* 推荐使用独立 PCIe 网卡进行直通，避免影响 PVE 管理网口
* 通过 VFIO 驱动绑定可避免 PVE 系统占用网卡
* 直通后在虚拟机内安装对应驱动即可获得接近原生的网络性能

网卡直通特别适合软路由（如 OpenWrt、pfSense）、防火墙等网络设备虚拟机，可充分发挥物理网卡的性能优势。
