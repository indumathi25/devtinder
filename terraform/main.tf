terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.0.0"

  # We store the "state" file (the record of what exists) in an S3 bucket
   backend "s3" {
     bucket = "devtinder-state-bucket"
     key    = "devtinder/terraform.tfstate"
     region = "eu-west-1"
   }
}

provider "aws" {
  region = var.region
}

# Create a Security Group
resource "aws_security_group" "instance_sg" {
  name        = "dev-tinder-sg-v3"
  description = "Allow SSH, HTTP, and App ports"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 7777
    to_port     = 7777
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Create Key Pair (using local public key)
# Assumes you have ~/.ssh/id_rsa.pub. If not, generate one or change path.
resource "aws_key_pair" "deployer" {
  key_name   = "dev-tinder-key"
  public_key = var.public_key != "" ? var.public_key : file(var.public_key_path)
}

# Get latest Ubuntu 22.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# Create EC2 Instance
resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.deployer.key_name
  vpc_security_group_ids      = [aws_security_group.instance_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y ca-certificates curl gnupg git
              sudo install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              sudo chmod a+r /etc/apt/keyrings/docker.gpg
              
              echo \
                "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
                sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
              
              sudo apt-get update
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              
              # Add ubuntu user to docker group
              sudo usermod -aG docker ubuntu
              EOF

  iam_instance_profile = aws_iam_instance_profile.app_profile.name

  tags = {
    Name = "DevTinderServer"
  }
}

# 1. AWS Secrets Manager Secret
resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "devtinder/secrets"
  description             = "Consolidated Secrets (JWT & Mongo) for DevTinder"
  recovery_window_in_days = 0 # For development convenience
}

# 2. IAM Role for EC2
resource "aws_iam_role" "app_role" {
  name = "devtinder-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

# 3. IAM Policy for Secrets Manager
resource "aws_iam_role_policy" "secrets_policy" {
  name = "devtinder-secrets-policy"
  role = aws_iam_role.app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
        ]
        Effect   = "Allow"
        Resource = aws_secretsmanager_secret.app_secrets.arn
      },
    ]
  })
}

# 4. IAM Instance Profile
resource "aws_iam_instance_profile" "app_profile" {
  name = "devtinder-app-profile"
  role = aws_iam_role.app_role.name
}
