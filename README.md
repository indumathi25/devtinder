# Dev Tinder 🚀

A full-stack application built with a **Microservices Architecture**, featuring automated **CI/CD** on **AWS** using **Docker Registry (GHCR)** and **Ansible**.

---

## 🏗 Architecture & Tech Stack

### Services
- **Frontend**: React (Vite) - *Pre-built image on GHCR*.
- **Backend (Auth/API)**: Node.js/Express - *Pre-built image on GHCR*.
- **Chat Service**: Node.js/Socket.io microservice - *Pre-built image on GHCR*.

### Infrastructure
- **Cloud**: AWS (EC2, Secrets Manager, S3).
- **Deployment**: 
    - **CI**: GitHub Actions builds and pushes images to GitHub Container Registry.
    - **CD**: Ansible pulls images and configures the environment on EC2.
- **Monitoring**: Prometheus (Metrics), Loki (Logs), Grafana (Dashboard).

---

## 🚀 Deployment Guide (Professional Workflow)

The project uses a **Build -> Push -> Pull** workflow. No source code is stored on the production server.

### 1. Configure GitHub Secrets
Go to **Settings -> Secrets -> Actions** in your GitHub repository and add:

| Secret Name | Description | Example / Source |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS Credentials | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Credentials | `abcdef...` |
| `JWT_PRIVATE_KEY` | RSA Private Key | Content of `jwtRS256.key` |
| `JWT_PUBLIC_KEY` | RSA Public Key | Content of `jwtRS256.key.pub` |
| `MONGO_URI` | MongoDB Connection | `mongodb+srv://...` |
| `EC2_SSH_KEY` | private .pem key | Full content of your AWS `.pem` file |
| `EC2_PUBLIC_KEY` | public .pub key | Content of your SSH public key |
| `GH_PAT` | GitHub Personal Access Token | Token with `read:packages` scope |

### 2. Generate RSA Keys (If missing)
```bash
ssh-keygen -t rsa -b 2048 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

### 3. Deploy
Push to the `main` branch. 
*   **GitHub** builds the images and pushes them to `ghcr.io`.
*   **Ansible** connects to your server via SSH, pulls the new images, and restarts the stack.

---

## 📊 Monitoring & Observability

Access your production metrics and logs via Grafana:

*   **URL**: `http://YOUR_SERVER_IP:3001`
*   **Credentials**: `admin` / `admin` (forced via docker-compose)

**Explore Logs**: Go to the **Explore** tab in Grafana and select **Loki** to see real-time app logs.

---

## 🔧 Running Locally

```bash
# Using Docker (starts all services and monitoring)
docker-compose up --build
```
*   **App**: `http://localhost:80`
*   **Grafana**: `http://localhost:3001`
*   **Prometheus**: `http://localhost:9090`
