terraform
===

基础设施即代码工具

## 补充说明

**terraform** 是 HashiCorp 开发的开源基础设施即代码 (IaC) 工具，通过声明式配置文件管理云资源。支持 AWS、Azure、GCP、Kubernetes 等多种 provider。

### 基本语法

```hcl
# main.tf 示例

# 指定 provider
provider "aws" {
  region = "us-east-1"
}

# 指定 terraform 版本要求
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# 远程状态配置
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

# 创建资源
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "example-instance"
  }
}

# 变量定义
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

# 输出值
output "instance_ip" {
  value       = aws_instance.example.public_ip
  description = "The public IP of the instance"
}
```

### 变量

```hcl
# 字符串变量
variable "ami" {
  type        = string
  description = "AMI ID"
  default     = "ami-0c55b159cbfafe1f0"
}

# 数字变量
variable "count" {
  type        = number
  default     = 3
}

# 布尔变量
variable "enable_monitoring" {
  type        = bool
  default     = true
}

# 列表变量
variable "azs" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Map 变量
variable "tags" {
  type = map(string)
  default = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# 对象变量
variable "server" {
  type = object({
    name = string
    port = number
  })
  default = {
    name = "web"
    port = 8080
  }
}

# 使用变量
resource "aws_instance" "example" {
  ami           = var.ami
  instance_type = var.instance_type
}
```

### 资源

```hcl
# EC2 实例
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = <<-EOF
              #!/bin/bash
              yum install -y nginx
              systemctl start nginx
              EOF

  tags = {
    Name = "web-server"
  }
}

# 安全组
resource "aws_security_group" "web" {
  name = "web-sg"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# S3 桶
resource "aws_s3_bucket" "data" {
  bucket = "my-unique-bucket-name"

  tags = {
    Name = "data-bucket"
  }
}

# RDS 实例
resource "aws_db_instance" "default" {
  identifier           = "mydb"
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t2.micro"
  allocated_storage    = 20
  username             = "admin"
  password             = "password"
  skip_final_snapshot  = true
}
```

### 数据源

```hcl
# 获取 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 获取 VPC
data "aws_vpc" "default" {
  default = true
}

# 获取可用区
data "aws_availability_zones" "available" {
  state = "available"
}

# 使用数据源
resource "aws_instance" "web" {
  ami = data.aws_ami.ubuntu.id
}

# 获取 SSM 参数
data "aws_ssm_parameter" "ami" {
  name = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}
```

### 模块

```hcl
# 模块目录结构
# modules/
# └── ec2-instance/
#     ├── main.tf
#     ├── variables.tf
#     └── outputs.tf

# main.tf
resource "aws_instance" "this" {
  ami           = var.ami
  instance_type = var.instance_type
  subnet_id     = var.subnet_id

  tags = {
    Name = var.name
  }
}

# variables.tf
variable "ami" {
  type = string
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "subnet_id" {
  type = string
}

variable "name" {
  type = string
}

# outputs.tf
output "instance_id" {
  value = aws_instance.this.id
}

# 调用模块
module "web_servers" {
  source = "./modules/ec2-instance"

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.main.id
  name          = "web-server"
}

# 远程模块
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.0.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"
}
```

### 状态管理

```hcl
# 本地状态
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

# S3 后端
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# Azure Blob 存储后端
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform"
    storage_account_name  = "tfstate123"
    container_name        = "tfstate"
    key                   = "prod.terraform.tfstate"
  }
}

# GCS 后端
terraform {
  backend "gcs" {
    bucket = "my-terraform-state"
    prefix = "prod"
  }
}
```

### 工作流命令

```shell
# 初始化
terraform init
terraform init -upgrade    # 升级模块

# 格式化
terraform fmt

# 验证
terraform validate

# 规划
terraform plan
terraform plan -out=plan.tfplan    # 保存计划
terraform plan -var-file=prod.tfvars

# 应用
terraform apply
terraform apply plan.tfplan
terraform apply -auto-approve      # 自动确认

# 销毁
terraform destroy
terraform destroy -target=aws_instance.web  # 指定资源
terraform destroy -auto-approve

# 显示状态
terraform show
terraform show -json

# 状态操作
terraform state list                # 列出资源
terraform state show aws_instance.web  # 显示资源详情
terraform state mv aws_instance.web aws_instance.web_new  # 重命名
terraform state rm aws_instance.web  # 从状态移除
terraform state pull                # 拉取远程状态
terraform state push                # 推送本地状态
```

### 条件与循环

```hcl
# 条件表达式
resource "aws_instance" "example" {
  ami           = var.use_large_ami ? "ami-large" : "ami-small"
  instance_type = var.use_large_ami ? "t2.large" : "t2.micro"
}

# count 循环
resource "aws_instance" "server" {
  count = 3

  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  tags = {
    Name = "server-${count.index}"
  }
}

# for_each 循环
resource "aws_security_group_rule" "http" {
  for_each = toset(["80", "443"])

  type              = "ingress"
  from_port         = each.value
  to_port           = each.value
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.example.id
}

# for 表达式
locals {
  names = ["web", "api", "db"]
  tags = [for name in local.names : {
    name = name
    env = "prod"
  }]
}

# 动态块
resource "aws_security_group" "example" {
  name = "example"

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.from_port
      to_port     = ingress.value.to_port
      protocol    = ingress.value.protocol
      cidr_blocks = ingress.value.cidr_blocks
    }
  }
}
```

### 函数

```hcl
# 字符串函数
locals {
  name = lower("MY-SERVER")           # "my-server"
  name = replace("web-server", "-", "_")  # "web_server"
  name = format("server-%03d", 1)    # "server-001"
}

# 集合函数
locals {
  combined = concat(var.list1, var.list2)
  filtered = toset([for s in var.list : upper(s)])
  joined   = join(",", var.list)
}

# 文件函数
locals {
  user_data = file("${path.module}/scripts/init.sh")
  policy    = templatefile("${path.module}/templates/policy.json", {
    name = var.name
  })
}

# 查找函数
locals {
  region = try(var.override_region, data.aws_region.current.name)
}
```

### 输出与敏感数据

```hcl
# 普通输出
output "instance_ip" {
  value = aws_instance.web.public_ip
}

# 敏感输出（会隐藏值但仍显示）
output "password" {
  value     = aws_instance.web.password
  sensitive = true
}

# 条件输出
output "bucket_arn" {
  value = var.create_bucket ? aws_s3_bucket.example[0].arn : ""
}

# 多值输出
output "instance_ips" {
  value = aws_instance.web[*].public_ip
}
```

### workspace

```shell
# 列出 workspace
terraform workspace list

# 创建 workspace
terraform workspace new production

# 选择 workspace
terraform workspace select production

# 当前 workspace
terraform workspace show

# 删除 workspace（需要先切换走）
terraform workspace delete staging
```

### Import

```shell
# 导入已有资源
terraform import aws_instance.existing i-1234567890abcdef0

# 导入到模块
terraform import module.vpc.aws_vpc.this vpc-12345678
```
