az
===

Azure CLI 命令行工具

## 补充说明

**az** 是 Microsoft Azure 官方命令行工具，用于管理 Azure 订阅中的资源。支持 VM、存储、网络、容器、Web 应用等多种 Azure 服务。

### 语法

```shell
az [group] [subgroup] [command] [parameters]
```

### 登录与配置

```shell
# 登录
az login
az login --tenant <tenant-id>

# 使用服务主体登录
az login --service-principal -u <app-id> -p <password-or-cert> --tenant <tenant-id>

# 登出
az account clear

# 列出订阅
az account list
az account list --all

# 设置订阅
az account set --subscription "subscription-name"
az account set --subscription <subscription-id>

# 显示当前订阅
az account show

# 刷新令牌
az account get-access-token

# 配置默认输出格式
az configure --defaults location=eastus
az configure --defaults group=my-resource-group
```

### 资源组

```shell
# 列出资源组
az group list

# 创建资源组
az group create --name myResourceGroup --location eastus

# 删除资源组
az group delete --name myResourceGroup
az group delete --name myResourceGroup --no-wait

# 列出资源
az resource list

# 标签管理
az group update --resource-group myGroup --set tags.Environment=Test
az tag create --resource-id /subscriptions/xxx/resourceGroups/myGroup --tags "Environment=Test"
```

### 虚拟机

```shell
# 创建 VM
az vm create \
    --resource-group myResourceGroup \
    --name myVM \
    --image UbuntuLTS \
    --admin-username azureuser \
    --generate-ssh-keys

# 列出 VM
az vm list
az vm list --resource-group myResourceGroup

# 显示 VM 详情
az vm show --resource-group myResourceGroup --name myVM

# 启动/停止/重启 VM
az vm start --resource-group myResourceGroup --name myVM
az vm stop --resource-group myResourceGroup --name myVM
az vm restart --resource-group myResourceGroup --name myVM

# 删除 VM
az vm delete --resource-group myResourceGroup --name myVM

# 列出 VM 大小
az vm list-sizes --location eastus

# 重置 SSH
az vm user update --resource-group myResourceGroup --name myVM --username azureuser --ssh-key-value ~/.ssh/id_rsa.pub
```

### 存储

```shell
# 创建存储账户
az storage account create \
    --name mystorageaccount \
    --resource-group myResourceGroup \
    --sku Standard_LRS

# 列出存储账户
az storage account list --resource-group myResourceGroup

# 获取连接字符串
az storage account show-connection-string --name mystorageaccount

# 创建容器
az storage container create --name mycontainer --account-name mystorageaccount

# 列出容器
az storage container list --account-name mystorageaccount

# 上传文件
az storage blob upload \
    --account-name mystorageaccount \
    --container-name mycontainer \
    --name myblob \
    --file ./localfile.txt

# 下载文件
az storage blob download \
    --account-name mystorageaccount \
    --container-name mycontainer \
    --name myblob \
    --file ./download.txt

# 列出 blob
az storage blob list --account-name mystorageaccount --container-name mycontainer

# SAS 令牌
az storage blob generate-sas \
    --account-name mystorageaccount \
    --container-name mycontainer \
    --name myblob \
    --permissions r \
    --expiry 2024-12-31
```

### 网络

```shell
# 创建虚拟网络
az network vnet create \
    --resource-group myResourceGroup \
    --name myVnet \
    --subnet-name mySubnet

# 列出虚拟网络
az network vnet list

# 创建子网
az network vnet subnet create \
    --resource-group myResourceGroup \
    --vnet-name myVnet \
    --name mySubnet \
    --address-prefixes 10.0.1.0/24

# 创建公共 IP
az network public-ip create \
    --resource-group myResourceGroup \
    --name myPublicIP

# 创建网络安全组
az network nsg create \
    --resource-group myResourceGroup \
    --name myNSG

# 添加安全规则
az network nsg rule create \
    --resource-group myResourceGroup \
    --nsg-name myNSG \
    --name allow-http \
    --protocol tcp \
    --priority 100 \
    --destination-port-range 80 \
    --access allow

# 列出网络接口
az network nic list

# 创建负载均衡器
az network lb create \
    --resource-group myResourceGroup \
    --name myLoadBalancer \
    --sku Standard
```

### Web 应用

```shell
# 创建 App Service 计划
az appservice plan create \
    --resource-group myResourceGroup \
    --name myAppServicePlan \
    --sku B1 \
    --is-linux

# 创建 Web 应用
az webapp create \
    --resource-group myResourceGroup \
    --plan myAppServicePlan \
    --name myWebApp \
    --deployment-container-image-name nginx

# 列出 Web 应用
az webapp list

# 部署
az webapp up --name myWebApp --location eastus
az webapp up --runtime PYTHON|3.9 --name myWebApp --location eastus

# 配置
az webapp config appsettings set \
    --resource-group myResourceGroup \
    --name myWebApp \
    --settings WEBSITES_PORT=8080

# 重启
az webapp restart --resource-group myResourceGroup --name myWebApp

# 启用诊断日志
az webapp log config \
    --resource-group myResourceGroup \
    --name myWebApp \
    --web-server-logging filesystem
```

### 容器

```shell
# 创建容器注册表
az acr create \
    --resource-group myResourceGroup \
    --name myacr \
    --sku Basic

# 登录注册表
az acr login --name myacr

# 构建并推送镜像
az acr build \
    --registry myacr \
    --image myapp:v1 \
    --file Dockerfile ./

# 列出镜像
az acr repository list --name myacr

# 创建 AKS 集群
az aks create \
    --resource-group myResourceGroup \
    --name myAKSCluster \
    --node-count 3 \
    --generate-ssh-keys

# 获取 kubeconfig
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# 列出 AKS 集群
az aks list

# 节点池操作
az aks nodepool add \
    --cluster-name myAKSCluster \
    --name npool \
    --resource-group myResourceGroup \
    --node-count 2
```

### 数据库

```shell
# 创建 SQL 数据库
az sql server create \
    --name myserver \
    --resource-group myResourceGroup \
    --admin-user sqluser \
    --admin-password <password>

az sql db create \
    --resource-group myResourceGroup \
    --server myserver \
    --name mydb \
    --service-objective S0

# 创建 MySQL
az mysql server create \
    --resource-group myResourceGroup \
    --name mydbserver \
    --admin-user myadmin \
    --admin-password <password> \
    --sku-name B_Gen5_1

# 创建 PostgreSQL
az postgres server create \
    --resource-group myResourceGroup \
    --name mypgserver \
    --admin-user pguser \
    --admin-password <password> \
    --sku-name B_Gen5_1

# 创建 Cosmos DB
az cosmosdb create \
    --name mycosmosdb \
    --resource-group myResourceGroup \
    --kind MongoDB

# 防火墙规则
az sql server firewall-rule create \
    --server myserver \
    --resource-group myResourceGroup \
    --name allowip \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 255.255.255.255
```

### 函数应用

```shell
# 创建函数应用
az functionapp create \
    --resource-group myResourceGroup \
    --consumption-plan-location eastus \
    --name myFunctionApp \
    --storage-account mystorageaccount \
    --runtime python

# 部署函数
az functionapp deployment source config-zip \
    --resource-group myResourceGroup \
    --name myFunctionApp \
    --src function.zip

# 列出函数
az functionapp function list \
    --resource-group myResourceGroup \
    --name myFunctionApp
```

### Key Vault

```shell
# 创建 Key Vault
az keyvault create \
    --name mykeyvault \
    --resource-group myResourceGroup \
    --location eastus

# 设置密钥
az keyvault secret set \
    --vault-name mykeyvault \
    --name mysecret \
    --value "mysecretvalue"

# 获取密钥
az keyvault secret show \
    --vault-name mykeyvault \
    --name mysecret

# 创建密钥
az keyvault key create \
    --vault-name mykeyvault \
    --name mykey

# 列出密钥
az keyvault key list --vault-name mykeyvault
```

### 监控与日志

```shell
# 查看活动日志
az monitor activity-log list

# 列出告警规则
az monitor alert list

# 创建告警
az monitor metrics alert create \
    --name cpu-alert \
    --resource-group myResourceGroup \
    --scopes /subscriptions/xxx/resourceGroups/myResourceGroup/providers/Microsoft.Compute/virtualMachines/myVM \
    --condition "avg CPU > 80" \
    --description "CPU alert"

# 查看指标
az monitor metrics list \
    --resource /subscriptions/xxx/resourceGroups/myResourceGroup/providers/Microsoft.Compute/virtualMachines/myVM \
    --metric "Percentage CPU"

# 启用诊断设置
az monitor diagnostic-settings create \
    --name myDiag \
    --resource /subscriptions/xxx/resourceGroups/myResourceGroup/providers/Microsoft.Compute/virtualMachines/myVM \
    --workspace /subscriptions/xxx/resourceGroups/myResourceGroup/providers/Microsoft.OperationalInsights/workspaces/myWorkspace
```

### 常用选项

```shell
# 指定输出格式
az vm list --output table
az vm list --output json
az vm list --output tsv
az vm list --output yaml

# 使用查询
az vm list --query "[?location=='eastus'].{Name:name, State:powerState}"

# 静默模式
az vm list --quiet

# 调试模式
az vm list --debug

# 显示帮助
az vm --help
az vm create --help
```
