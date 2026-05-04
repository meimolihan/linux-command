gcloud
===

Google Cloud CLI 命令行工具

## 补充说明

**gcloud** 是 Google Cloud Platform 官方命令行工具，用于管理 Compute Engine、Cloud Storage、BigQuery、Kubernetes 等 GCP 服务。

### 语法

```shell
gcloud <group> <command> [flags]
```

### 初始配置

```shell
# 登录
gcloud auth login

# 列出账户
gcloud auth list

# 激活服务账户
gcloud auth activate-service-account --key-file=key.json

# 撤销登录
gcloud auth revoke

# 设置项目
gcloud config set project my-project-id

# 设置默认区域和区域
gcloud config set compute/zone us-central1-a
gcloud config set compute/region us-central1

# 列出配置
gcloud config configurations list

# 创建配置
gcloud config configurations create my-config
gcloud config configurations activate my-config

# 显示当前配置
gcloud config list
gcloud config get-value project
```

### 计算引擎

```shell
# 列出实例
gcloud compute instances list

# 创建实例
gcloud compute instances create my-instance \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --image-family=debian-11 \
    --image-project=debian-cloud

# 创建带启动脚本的实例
gcloud compute instances create my-instance \
    --zone=us-central1-a \
    --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y nginx'

# 启动/停止实例
gcloud compute instances start my-instance --zone=us-central1-a
gcloud compute instances stop my-instance --zone=us-central1-a

# 删除实例
gcloud compute instances delete my-instance --zone=us-central1-a

# 连接 SSH
gcloud compute ssh my-instance --zone=us-central1-a
gcloud compute ssh my-instance --zone=us-central1-a -- -L 8080:localhost:80

# 列出实例模板
gcloud compute instance-templates list

# 从模板创建实例
gcloud compute instances create my-instance --zone=us-central1-a --template=my-template
```

### 防火墙与网络

```shell
# 列出防火墙规则
gcloud compute firewall-rules list

# 创建防火墙规则
gcloud compute firewall-rules create allow-http \
    --allow tcp:80 \
    --target-tags=http-server

# 允许 SSH
gcloud compute firewall-rules create allow-ssh --allow tcp:22

# 删除防火墙规则
gcloud compute firewall-rules delete allow-http

# 创建静态 IP
gcloud compute addresses create my-ip --region=us-central1

# 列出 IP
gcloud compute addresses list

# 列出网络
gcloud compute networks list

# 创建网络
gcloud compute networks create my-network --subnet-mode=auto

# 创建子网
gcloud compute networks subnets create my-subnet \
    --network=my-network \
    --region=us-central1 \
    --range=10.0.0.0/24
```

### Cloud Storage

```shell
# 列出桶
gsutil ls
gsutil ls gs://my-bucket/

# 创建桶
gsutil mb -l us-central1 gs://my-bucket

# 复制文件
gsutil cp file.txt gs://my-bucket/
gsutil cp -r ./folder gs://my-bucket/

# 下载文件
gsutil cp gs://my-bucket/file.txt ./
gsutil cp gs://my-bucket/* ./

# 同步目录
gsutil rsync -r ./local gs://my-bucket

# 设置 ACL
gsutil acl ch -u allUsers:R gs://my-bucket/file.txt
gsutil setacl public-read gs://my-bucket/file.txt

# 设置存储类别
gsutil defstorageclass set NEARLINE gs://my-bucket
gsutil rewrite -s NEARLINE gs://my-bucket/**

# 删除
gsutil rm gs://my-bucket/file.txt
gsutil rm -r gs://my-bucket/

# 签名 URL
gsutil signurl -d 10m key.json gs://my-bucket/file.txt

# 使用 gcloud 命令（替代 gsutil）
gcloud storage ls gs://my-bucket/
gcloud storage cp file.txt gs://my-bucket/
gcloud storage cp -r ./folder gs://my-bucket/
```

### Kubernetes (GKE)

```shell
# 列出集群
gcloud container clusters list

# 创建集群
gcloud container clusters create my-cluster \
    --zone=us-central1-a \
    --num-nodes=3 \
    --machine-type=e2-medium

# 获取凭证
gcloud container clusters get-credentials my-cluster --zone=us-central1-a

# 调整大小
gcloud container clusters resize my-cluster --zone=us-central1-a --num-nodes=5

# 升级
gcloud container clusters upgrade my-cluster --zone=us-central1-a

# 删除集群
gcloud container clusters delete my-cluster --zone=us-central1-a

# 列出节点池
gcloud container node-pools list --cluster=my-cluster --zone=us-central1-a

# 创建节点池
gcloud container node-pools create my-pool \
    --cluster=my-cluster \
    --zone=us-central1-a \
    --num-nodes=2 \
    --machine-type=e2-medium
```

### BigQuery

```shell
# 列出数据集
bq ls

# 创建数据集
bq mk my_dataset

# 查询
bq query "SELECT * FROM \`project.dataset.table\` LIMIT 10"
bq query --use_legacy_sql=false "SELECT COUNT(*) FROM dataset.table"

# 查询并保存结果
bq query --destination_table my_dataset.new_table "SELECT * FROM dataset.table"

# 加载数据
bq load --source_format=CSV my_dataset.table gs://bucket/data.csv

# 导出数据
bq extract my_dataset.table gs://bucket/output.csv

# 列出表
bq ls my_dataset

# 创建表
bq mk my_dataset.new_table

# 删除表
bq rm my_dataset.table
```

### Cloud Functions

```shell
# 部署函数
gcloud functions deploy my-function \
    --runtime python39 \
    --trigger-http \
    --allow-unauthenticated

# 列出函数
gcloud functions list

# 调用函数
gcloud functions call my-function --data '{"name":"test"}'

# 删除函数
gcloud functions delete my-function

# 查看日志
gcloud functions logs read my-function

# 更新函数
gcloud functions deploy my-function \
    --runtime python39 \
    --trigger-http \
    --source ./function_code \
    --entry-point hello_world
```

### App Engine

```shell
# 列出应用
gcloud app versions list

# 部署应用
gcloud app deploy

# 部署到特定服务
gcloud app deploy --version=v1 --service=default

# 流量迁移
gcloud app versions migrate v2

# 浏览应用
gcloud app browse

# 查看日志
gcloud app logs tail

# 创建服务
gcloud app services list
gcloud app services delete my-service
```

### Cloud Run

```shell
# 部署服务
gcloud run deploy my-service \
    --image gcr.io/project/my-image \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

# 列出服务
gcloud run services list

# 查看服务
gcloud run services describe my-service --region us-central1

# 流量更新
gcloud run services update-traffic my-service --region us-central1 --to-latest

# 删除服务
gcloud run services delete my-service --region us-central1
```

### IAM 与安全

```shell
# 列出服务账户
gcloud iam service-accounts list

# 创建服务账户
gcloud iam service-accounts create my-sa \
    --display-name "My Service Account"

# 创建密钥
gcloud iam service-accounts keys create key.json \
    --iam-account my-sa@project.iam.gserviceaccount.com

# 添加 IAM 策略绑定
gcloud projects add-iam-policy-binding my-project \
    --member="serviceAccount:my-sa@project.iam.gserviceaccount.com" \
    --role="roles/editor"

# 列出角色
gcloud iam roles list

# 描述角色
gcloud iam roles describe roles/editor
```

### SQL

```shell
# 列出实例
gcloud sql instances list

# 创建实例
gcloud sql instances create my-instance \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1

# 创建数据库
gcloud sql databases create mydb --instance=my-instance

# 创建用户
gcloud sql users create user --instance=my-instance --password=password

# 连接
gcloud sql connect my-instance --user=root

# 导出
gcloud sql export sql my-instance gs://bucket/export.sql.gz

# 导入
gcloud sql import sql my-instance gs://bucket/import.sql.gz
```

### 部署管理器

```shell
# 列出部署
gcloud deployment-manager deployments list

# 创建部署
gcloud deployment-manager deployments create my-deployment \
    --config deployment.yaml

# 描述部署
gcloud deployment-manager deployments describe my-deployment

# 更新部署
gcloud deployment-manager deployments update my-deployment \
    --config new-deployment.yaml

# 删除部署
gcloud deployment-manager deployments delete my-deployment
```

### Pub/Sub

```shell
# 列出主题
gcloud pubsub topics list

# 创建主题
gcloud pubsub topics create my-topic

# 发布消息
gcloud pubsub topics publish my-topic --message "Hello"

# 列出订阅
gcloud pubsub subscriptions list

# 创建订阅
gcloud pubsub subscriptions create my-sub --topic=my-topic

# 拉取消息
gcloud pubsub subscriptions pull my-sub --limit=10

# 模拟发布
gcloud pubsub topics publish my-topic --message '{"data":"test"}'
```

### 日志与监控

```shell
# 读取日志
gcloud logging read "resource.type=gce_instance"
gcloud logging read "resource.type=gce_instance" --limit=10

# 过滤器
gcloud logging read "resource.type=gce_instance AND severity>=WARNING"

# 写入日志
gcloud logging write my-log "Test message" --severity=INFO

# 导出日志到 Cloud Storage
gcloud logging sinks create my-sink \
    storage.googleapis.com/my-bucket \
    --log-filter='resource.type="gce_instance"'

# 查看指标
gcloud monitoring metrics list
```

### 常用选项

```shell
# 指定项目
gcloud compute instances list --project my-project

# 指定区域/区域
gcloud compute instances list --zone=us-central1-a

# 输出格式
gcloud compute instances list --format=json
gcloud compute instances list --format=yaml
gcloud compute instances list --format="table(name,status,machineType)"
gcloud compute instances list --format="csv[separator='\t')(no-heading"

# 异步操作
gcloud compute instances create my-instance --async

# 详细输出
gcloud compute instances list --verbosity=debug

# 帮助
gcloud compute instances --help
```
