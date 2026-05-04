aws
===

AWS CLI 命令行工具

## 补充说明

**aws** 是 Amazon Web Services 官方命令行工具，提供管理 AWS 服务的完整功能。支持 EC2、S3、Lambda、RDS、DynamoDB 等 200+ 服务。

### 语法

```shell
aws <command> <subcommand> [options and parameters]
```

### 基础配置

```shell
# 配置 AWS CLI
aws configure
aws configure --profile profile-name

# 配置多个账户
aws configure set aws_access_key_id <key_id> --profile profile-name
aws configure set aws_secret_access_key <secret> --profile profile-name
aws configure set region us-east-1 --profile profile-name
aws configure set output json --profile profile-name

# 查看配置
aws configure list
aws configure list --profile profile-name

# 环境变量
export AWS_ACCESS_KEY_ID=<key>
export AWS_SECRET_ACCESS_KEY=<secret>
export AWS_DEFAULT_REGION=us-east-1

# 凭证文件
cat ~/.aws/credentials
cat ~/.aws/config
```

### S3 操作

```shell
# 列出桶
aws s3 ls
aws s3 ls s3://bucket-name/

# 上传文件
aws s3 cp file.txt s3://bucket-name/
aws s3 cp ./folder/ s3://bucket-name/ --recursive

# 下载文件
aws s3 cp s3://bucket-name/file.txt ./
aws s3 cp s3://bucket-name/ ./download/ --recursive

# 同步目录
aws s3 sync ./local s3://bucket-name/
aws s3 sync s3://bucket-name/ ./local --delete

# 删除对象
aws s3 rm s3://bucket-name/file.txt
aws s3 rm s3://bucket-name/ --recursive

# 生成预签名 URL
aws s3 presign s3://bucket-name/file.txt
aws s3 presign s3://bucket-name/file.txt --expires-in 3600

# 设置 ACL
aws s3 cp file.txt s3://bucket-name/ --acl public-read
aws s3 cp file.txt s3://bucket-name/ --acl private

# 创建桶
aws s3 mb s3://new-bucket-name

# 删除桶
aws s3 rb s3://bucket-name
aws s3 rb s3://bucket-name --force
```

### EC2 操作

```shell
# 列出实例
aws ec2 describe-instances
aws ec2 describe-instances --instance-ids i-1234567890abcdef0

# 过滤实例
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"

# 启动实例
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# 停止实例
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# 重启实例
aws ec2 reboot-instances --instance-ids i-1234567890abcdef0

# 终止实例
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# 创建实例
aws ec2 run-instances \
    --image-id ami-12345678 \
    --instance-type t2.micro \
    --key-name my-key-pair \
    --security-group-ids sg-12345678 \
    --subnet-id subnet-12345678

# 列出安全组
aws ec2 describe-security-groups

# 列出密钥对
aws ec2 describe-key-pairs

# 创建密钥对
aws ec2 create-key-pair --key-name my-key-pair
aws ec2 create-key-pair --key-name my-key-pair --query 'KeyMaterial' --output text > key.pem

# 列出 AMI
aws ec2 describe-images --owners self amazon
aws ec2 describe-images --filters "Name=name,Values=amzn2*"
```

### IAM 操作

```shell
# 列出用户
aws iam list-users

# 创建用户
aws iam create-user --user-name username

# 创建访问密钥
aws iam create-access-key --user-name username

# 列出访问密钥
aws iam list-access-keys --user-name username

# 创建策略
aws iam create-policy --policy-name my-policy --policy-document file://policy.json

# 附加策略到用户
aws iam attach-user-policy --user-name username --policy-arn arn:aws:iam::123456789012:policy/my-policy

# 创建角色
aws iam create-role --role-name my-role --assume-role-policy-document file://trust-policy.json

# 列出角色
aws iam list-roles
```

### Lambda 操作

```shell
# 列出函数
aws lambda list-functions

# 获取函数配置
aws lambda get-function --function-name my-function

# 调用函数
aws lambda invoke --function-name my-function output.txt
aws lambda invoke --function-name my-function --payload '{"key": "value"}' output.txt

# 异步调用
aws lambda invoke --function-name my-function --invocation-type Event output.txt

# 创建函数
aws lambda create-function \
    --function-name my-function \
    --runtime python3.9 \
    --role arn:aws:iam::123456789012:role/lambda-role \
    --handler app.handler \
    --zip-file fileb://function.zip

# 更新函数代码
aws lambda update-function-code --function-name my-function --zip-file fileb://function.zip

# 删除函数
aws lambda delete-function --function-name my-function
```

### CloudFormation 操作

```shell
# 列出栈
aws cloudformation list-stacks

# 列出栈事件
aws cloudformation describe-stack-events --stack-name my-stack

# 创建栈
aws cloudformation create-stack \
    --stack-name my-stack \
    --template-body file://template.yaml \
    --parameters ParameterKey=KeyName,ParameterValue=my-key

# 更新栈
aws cloudformation update-stack \
    --stack-name my-stack \
    --template-body file://template.yaml

# 删除栈
aws cloudformation delete-stack --stack-name my-stack

# 估算栈成本
aws cloudformation estimate-template-cost \
    --template-body file://template.yaml \
    --parameters ParameterKey=InstanceType,ParameterValue=t2.micro
```

### ECS 操作

```shell
# 列出集群
aws ecs list-clusters

# 列出任务
aws ecs list-tasks --cluster my-cluster

# 描述任务定义
aws ecs describe-task-definition --task-definition my-task:1

# 运行任务
aws ecs run-task --cluster my-cluster --task-definition my-task

# 更新服务
aws ecs update-service --cluster my-cluster --service my-service --desired-count 2

# 注册任务定义
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### DynamoDB 操作

```shell
# 列出表
aws dynamodb list-tables

# 描述表
aws dynamodb describe-table --table-name my-table

# 创建表
aws dynamodb create-table \
    --table-name my-table \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

# 放入项目
aws dynamodb put-item --table-name my-table --item '{"id": {"S": "1"}, "name": {"S": "Alice"}}'

# 获取项目
aws dynamodb get-item --table-name my-table --key '{"id": {"S": "1"}}'

# 查询
aws dynamodb query --table-name my-table --key-condition-expression "id = :id" --expression-attribute-values '{":id": {"S": "1"}}'

# 扫描
aws dynamodb scan --table-name my-table

# 删除项目
aws dynamodb delete-item --table-name my-table --key '{"id": {"S": "1"}}'
```

### RDS 操作

```shell
# 列出实例
aws rds describe-db-instances

# 创建实例
aws rds create-db-instance \
    --db-instance-identifier my-db \
    --db-instance-class db.t2.micro \
    --engine mysql \
    --allocated-storage 20 \
    --master-username admin \
    --master-user-password password

# 修改实例
aws rds modify-db-instance \
    --db-instance-identifier my-db \
    --allocated-storage 50

# 删除实例
aws rds delete-db-instance --db-instance-identifier my-db --skip-final-snapshot

# 创建快照
aws rds create-db-snapshot --db-instance-identifier my-db --db-snapshot-identifier my-snapshot

# 列出快照
aws rds describe-db-snapshots
```

### EKS 操作

```shell
# 列出集群
aws eks list-clusters

# 描述集群
aws eks describe-cluster --name my-cluster

# 更新 kubeconfig
aws eks update-kubeconfig --name my-cluster

# 列出节点组
aws eks list-nodegroups --cluster-name my-cluster

# 创建节点组
aws eks create-nodegroup \
    --cluster-name my-cluster \
    --nodegroup-name my-nodes \
    --subnet-ids subnet-123 subnet-456 \
    --node-role arn:aws:iam::123456789:role/node-role
```

### CloudWatch 操作

```shell
# 列出指标
aws cloudwatch list-metrics

# 获取指标统计
aws cloudwatch get-metric-statistics \
    --namespace AWS/EC2 \
    --metric-name CPUUtilization \
    --start-time 2024-01-01T00:00:00 \
    --end-time 2024-01-02T00:00:00 \
    --period 3600 \
    --statistics Average

# 创建告警
aws cloudwatch put-metric-alarm \
    --alarm-name high-cpu \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=InstanceId,Value=i-12345678

# 创建日志组
aws logs create-log-group --log-group-name my-logs

# 列出日志流
aws logs describe-log-streams --log-group-name my-logs
```

### 输出格式

```shell
# 指定输出格式
aws s3 ls --output table
aws s3 ls --output json
aws s3 ls --output text
aws s3 ls --output yaml

# JMESPath 查询
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name]'
aws ec2 describe-instances --query 'Reservations[0].Instances[0].InstanceId'

# 静默模式
aws s3 ls s3://bucket/ --quiet
```

### 常用选项

```shell
# 调试模式
aws ec2 describe-instances --debug

# 干运行（支持的操作）
aws cloudformation create-stack --dry-run

# 指定区域
aws ec2 describe-instances --region us-west-2

# 指定配置文件
aws ec2 describe-instances --profile production

# 指定输出文件
aws ec2 describe-instances > instances.json

# 显示帮助
aws ec2 help
aws ec2 describe-instances help
```
