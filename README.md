# Dev Tinder 🚀

A full-stack application built with **React**, **Node.js**, and **Docker**, featuring a fully automated **CI/CD pipeline** on **AWS**.

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, DaisyUI, Redux Toolkit, SWR.
- **Backend**: Node.js, Express, MongoDB.
- **Infrastructure**: Docker, Terraform, GitHub Actions, AWS EC2, S3 (State Management).

---

## � Fully Automated Deployment (CI/CD)

The project is designed to be **"Push to Deploy."** Once configured, you never need to run `terraform apply` or `ssh` manually. GitHub does it all.

### Step 1: Initial AWS Setup (One-Time)

1.  **S3 Bucket**: Create a private S3 bucket in AWS (e.g., `devtinder-state-bucket`).
2.  **Enable Remote State**: In `terraform/main.tf`, uncomment the `backend "s3"` block and update the `bucket` name to your bucket name.
3.  **Local Sync**: Run this once from your laptop to move your current server record to the cloud:
    ```bash
    cd terraform
    terraform init
    ```

### Step 2: Configure GitHub Secrets

Go to your Repo -> **Settings** -> **Secrets and variables** -> **Actions** and add:

| Secret Name | Value |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Your IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM Secret Key |
| `EC2_SSH_KEY` | Content of `~/.ssh/id_rsa` (Private Key) |

### Step 3: Trigger Deployment

Simply push your code:
```bash
git add .
git commit -m "New feature"
git push origin main
```

**What happens?**
- GitHub Actions wakes up.
- It runs **Terraform** to ensure the EC2 server exists and is configured correctly.
- It dynamically retrieves the server IP.
- It **SSHs** into the server, pulls the latest code, and restarts the **Docker** containers.

---

## � Local Development

If you want to run things on your laptop:

### Using Docker (Recommended)
```bash
docker-compose up --build
```
*Accessible at `http://localhost:80`*

---

## 🔧 Troubleshooting

### Mongoose Connection / 502 Error
If the server starts but can't talk to the database:
- **Reason**: MongoDB Atlas IP whitelist.
- **Fix**: Go to MongoDB Atlas -> Network Access -> Add your AWS Server IP.
- **Restart**: Push any small change to GitHub to trigger a fresh automated deployment.
