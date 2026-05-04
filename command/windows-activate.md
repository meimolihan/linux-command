windows-activate
===

Windows 系统激活指南

## 补充说明

Windows系统激活是验证操作系统合法性的必要步骤，确保用户能够享受完整的功能和安全更新。未激活的系统会面临功能限制和水印提示，影响正常使用体验。

主要激活方式包括数字许可证激活、KMS激活、电话激活等。本指南提供MAS自动激活和KMS手动激活两种方案，以及激活状态验证方法和注意事项。

## 实例

### 方法一：Microsoft Activation Scripts 自动激活

Microsoft Activation Scripts (MAS) 是开源的Windows和Office激活解决方案，支持Windows 7-11及各版本Office，操作简单可靠。

**使用步骤**

以管理员身份打开PowerShell，执行以下命令：

```shell
irm https://get.activated.win | iex
```

脚本自动检测系统并选择最优激活方案，等待激活完成提示后，验证激活状态：

```shell
slmgr.vbs -xpr
```

### 方法二：KMS 服务器手动激活

KMS（Key Management Service）是微软官方提供的批量激活服务，通过连接KMS服务器实现180天周期激活，需定期续期。

**操作步骤**

以管理员身份打开命令提示符或PowerShell，依次执行以下命令：

```shell
# 安装企业版产品密钥
slmgr /ipk W269N-WFGWX-YVC9B-4J6C9-T83GX

# 设置KMS服务器地址
slmgr /skms kms.03k.org

# 执行激活
slmgr /ato
```

### 激活状态查询与验证

使用以下命令检查激活状态：

```shell
# 查看详细激活信息
slmgr -dlv

# 检查激活剩余时间
slmgr.vbs -xpr

# 查看安装的产品密钥
slmgr -dli
```

验证指标说明：
- 许可证状态显示「已授权」或「Licensed」表示激活成功
- KMS激活会显示剩余天数，需每180天重新连接服务器续期
- 可查看密钥类型（零售版、批量版等）和激活方式

### 注意事项

1. 始终以管理员身份运行激活相关命令
2. 激活前建议备份重要数据，创建系统还原点
3. 确保网络连接稳定，避免杀毒软件拦截激活进程
4. 请在合法授权的系统上使用激活工具，遵守当地法律法规和微软软件许可条款
5. 激活失败可检查网络、防火墙设置，或尝试更换其他公共KMS服务器地址
