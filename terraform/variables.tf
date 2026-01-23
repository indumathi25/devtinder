variable "region" {
  description = "AWS Region"
  default     = "eu-west-1"
}

variable "instance_type" {
  description = "EC2 Instance Type"
  default     = "t3.micro"
}

variable "public_key_path" {
  description = "Path to the public SSH key to be used for the EC2 instance"
  # User needs to ensure this file exists or update the path
  default     = "~/.ssh/id_rsa.pub"
}
