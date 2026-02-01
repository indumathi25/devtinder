# Dev Tinder 🚀

A full-stack application built with a **Microservices Architecture**, featuring automated **CI/CD** on **AWS** and industry-standard **Asymmetric (RS256) Security**.

---

## 🏗 Architecture & Tech Stack

### Services
- **Frontend**: React (Vite) + Nginx (serving static files & reverse proxy).
- **Backend (Auth/API)**: Node.js/Express (Handles authentication, profiles, and user management).
- **Chat Service**: Node.js/Socket.io microservice (Handles real-time messaging).

### Infrastructure
- **Cloud**: AWS (EC2, Secrets Manager, S3).
- **Security**: RS256 Asymmetric JWT, CORS (Dynamic), Helmet.
- **IaC**: Terraform (VPC, Security Groups, EC2, IAM).
- **CI/CD**: GitHub Actions (Automated infrastructure & secret provisioning).

---

## 🔒 Security & Authentication

The project uses the **Zero-State Secret Pattern**:

1.  **Asymmetric Signing**: Access Tokens are signed by the **Backend** using an RSA Private Key and verified by **all microservices** using a Public Key.
2.  **AWS Secrets Manager**: Sensitive credentials (JWT Keys, Mongo URI) are stored in a consolidated JSON secret at runtime.
3.  **Automated Vaulting**: Secrets are pushed directly from GitHub to AWS via CLI, ensuring they **never** appear in plain-text Terraform state files (S3).
4.  **Hardened Cookies**: Uses `HttpOnly`, `SameSite=Lax`, and `Secure` attributes for session protection.

---

## 🚀 Deployment Guide (CI/CD)

The project is designed for **"Push to Deploy"** directly to AWS EC2.

### Step 1: Generate RSA Keys (Local)
Run these commands to generate the key pair for JWT signing:
```bash
# Private Key
ssh-keygen -t rsa -b 2048 -m PEM -f jwtRS256.key
# Public Key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

### Step 2: Configure GitHub Secrets
Go to **Settings -> Secrets -> Actions** and add:

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS Credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS Credentials |
| `JWT_PRIVATE_KEY` | Content of `jwtRS256.key` |
| `JWT_PUBLIC_KEY` | Content of `jwtRS256.key.pub` |
| `MONGO_URI` | `mongodb+srv://...net/devTinder` (Include Database name!) |
| `EC2_SSH_KEY` | Your EC2 private key for SSH |
| `EC2_PUBLIC_KEY` | Your EC2 public key for SSH |

### Step 3: Global IP Whitelisting (MongoDB Atlas)
1.  Allocate an **Elastic IP** in AWS and associate it with your EC2 instance.
2.  In MongoDB Atlas -> Network Access, add your **Elastic IP** to the whitelist.

### Step 4: Deploy
Simply push to the `main` branch. GitHub will handle the infrastructure, update the secrets vault, and restart the containers.

---

## 🔧 Running Locally

```bash
# Using Docker
docker-compose up --build

# Backend accessible at http://localhost:3000
# Chat accessible at http://localhost:7777 (via /api/chat proxy on localhost:80)
```

---

## 📝 Diagnostic Commands (on EC2)

```bash
cd ~/app
# View real-time logs for all services
docker compose logs -f

# Check if services are hitting the correct database
docker compose logs backend | grep "Database:"
docker compose logs chat-service | grep "Database:"
```
