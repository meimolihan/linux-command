pve-merge-local-lvm
===

PVE 中合并 local 与 local-lvm 存储空间，统一存储管理

## 补充说明

Proxmox VE（PVE）默认安装会创建两个默认存储：`local`（目录类型，挂载于 `/var/lib/vz`，存ISO、模板、备份）和 `local-lvm`（LVM-Thin类型，存虚拟机磁盘）。两者独立管理不便，合并后可统一为目录存储，简化操作并扩大可用空间。

### 前置准备

1. **数据备份**：操作会删除 `local-lvm` 对应的LVM精简池，务必备份所有虚拟机数据。
2. **清空 local-lvm**：确保 `local-lvm` 上无虚拟机磁盘：
   ```shell
   pvesm list local-lvm
   ```
   有磁盘需先迁移或删除。
3. **查看当前配置**：
   ```shell
   cat /etc/pve/storage.cfg
   lvs /dev/pve
   ```

### 操作步骤

#### 1. 删除 local-lvm 存储配置

编辑存储配置文件，删除 `local-lvm` 配置段：
```shell
nano /etc/pve/storage.cfg
```
删除示例内容：
```bash
lvmthin: local-lvm
        thinpool data
        vgname pve
        content rootdir,images
```
保存后网页端 `local-lvm` 会自动消失。

#### 2. 删除 LVM-Thin 精简池

删除 `data` 逻辑卷（`local-lvm` 对应的LVM池）：
```shell
lvremove /dev/pve/data
```
输入 `y` 确认。

#### 3. 扩展 local 所在根分区

`local` 存储位于根分区 `/dev/pve/root`，将释放空间全部分配给根分区：
```shell
lvextend -l +100%FREE /dev/pve/root
```

#### 4. 调整文件系统大小

根据根分区文件系统类型执行：
- ext4 文件系统：
  ```shell
  resize2fs /dev/pve/root
  ```
- xfs 文件系统：
  ```shell
  xfs_growfs /
  ```

#### 5. 验证结果

```shell
pvesm status    # 确认local-lvm已移除
df -h /         # 确认根分区空间扩大
```

### 避坑指南

| 错误现象 | 可能原因 | 解决方案 |
| --- | --- | --- |
| 删除data LV失败 | data上仍有磁盘占用 | 用 `lvs --segments /dev/pve/data` 查占用，迁移对应磁盘 |
| 根分区扩展失败 | 文件系统类型不匹配 | 用 `df -T /` 确认类型，执行对应resize命令 |
| PVE无法启动 | 误删root/swap LV | 用Live CD恢复或重装（务必提前备份） |

### 关键要点

* 操作前必须备份所有数据，避免误删丢失
* 删除 `local-lvm` 前确保该存储无任何虚拟机磁盘
* 合并后为目录存储，可直接用文件命令管理虚拟机磁盘
