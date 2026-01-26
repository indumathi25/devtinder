terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.0.0"

  # UNCOMMENT THIS BLOCK AFTER CREATING YOUR S3 BUCKET
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
  name        = "dev-tinder-sg"
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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create Key Pair (using local public key)
# Assumes you have ~/.ssh/id_rsa.pub. If not, generate one or change path.
resource "aws_key_pair" "deployer" {
  key_name   = "dev-tinder-key"
  public_key = file(var.public_key_path)
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
  vpc_security_group_ids = [aws_security_group.instance_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              # 1. Update and install Docker
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

              # 2. Setup App Directory
              mkdir -p /home/ubuntu/app
              cd /home/ubuntu/app
              
              # 3. Clone Repository
              git clone https://github.com/indumathivelan/devtinder.git .

              # 4. Start Application
              sudo docker compose up -d --build
              EOF

  tags = {
    Name = "DevTinderServer"
  }
}
