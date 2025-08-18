# 🛠️ CRUD App with Jenkins, Docker, MySQL, and SonarCloud

A simple CRUD (Create, Read, Update, Delete) Node.js application with MySQL database hosted on AWS RDS. Jenkins is used for CI/CD pipeline and SonarCloud for static code analysis.

---

## 📋 Project Setup Guide

### 1. 🚀 Launch an EC2 Instance (Ubuntu)

- Create an EC2 instance using **Ubuntu (Free Tier)**
- Open ports in the **security group**:
  - `22` (SSH)
  - `8080` (Jenkins)
  - `3000` (Node.js app)
- Connect via SSH:
  ```bash
  ssh -i <your-key>.pem ubuntu@<EC2_PUBLIC_IP>
  ```
---

### 2. ⚙️ Run EC2 Setup Script

- Run the script to install:
    - System updates
    - Docker
    - Jenkins

  ```bash
  chmod +x scripts/docker-jenkins-install.sh
  ./scripts/docker-jenkins-install.sh
  ```
---

### 3. 🗄️ AWS RDS (MySQL)

- Go to RDS → Create database
- Select:
    - Engine: MySQL
    - DB identifier: testdb-1
    - Username: root
    - Password: *********
    - Public access: Yes (for testing)
- After creation, note the endpoint:
  ```bash
  testdb-1.cp24ccc4chcf.ap-southeast-1.rds.amazonaws.com
  ```

---

### 4. 📦 Clone the Repository

  ```bash
  git clone https://github.com/ashubambal/crud-app.git
  cd crud-app
  ```

---

### 5. 🔐 Access Jenkins

- Visit: http://<EC2_PUBLIC_IP>:8080
- Get the Jenkins unlock key:

  ```bash
  sudo cat /var/lib/jenkins/secrets/initialAdminPassword
  ```
---

### 6. ➕ Install Jenkins Plugins

- Install the following plugins:
    - Docker Pipeline
    - SonarQube Scanner
    - Pipeline Stage View

---

### 7. 🔍 Setup SonarCloud

- Go to SonarCloud
- Click: "Analyze a new project"
- Link your GitHub repository
- Organization name: Jenkins
- Click: "Create organization"
- Create a Sonar Token (keep it safe)
    - Step two create sonar token -> Click on My-account -> Security -> Ganrate token

---

### 8. 🔑 Add Credentials in Jenkins

- Go to:
- Manage Jenkins → Credentials → System → Global credentials → Add Credentials
- Add the following:
```
| ID            | Type                | Use                       |
| ------------- | ------------------- | ------------------------- |
| `sonar-token` | Secret text         | SonarCloud authentication |
| `docker-cred` | Username + Password | DockerHub login           |
```  
---

### 9. ⚙️ Configure SonarQube in Jenkins

- Go to:
- Manage Jenkins → Global Tool Configuration
- SonarQube Scanner installations:
    - Name: sonar-scanner
    - Version: select appropriate version -> save
- Go to:
- Manage Jenkins → System   
- SonarQube servers:
    - Name: SonarCloud
    - Select Environment Variable check box
    - URL: https://sonarcloud.io
    - Credentials: sonar-token -> save

---

### 10. 🚀 Create Jenkins Pipeline

- Create a new item (ci-jenkins) -> pipeline -> click on check box (GitHub hook trigger for GITScm polling)
- Pipeline (Pipeline script from SCM) -> Use GitHub as source -> save
- Add webhook support -> Go to Github Repo settings -> Webhooks -> http://<EC2-IP>:8080/github-webhook/ -> Content type * (appliation/json) -> save

---

### 11. 🌐 Run & Access the App

  ```bash
  http://<EC2_PUBLIC_IP>:3000
  ```
---

## 📁 Project Structure

  ```bash
crud-app/
├── app.js                  # Express app
├── Dockerfile              # Docker container config
├── Jenkinsfile             # Jenkins pipeline
├── package.json
├── public/                 # Static frontend
├── scripts/
│   └── docker-jenkins-install.sh
└── .env                    # (not committed, local secrets)
  ```
---

## ✅ Technologies Used

- Node.js + Express
- MySQL (AWS RDS)
- Docker
- Jenkins
- SonarCloud
- GitHub

---

## Website UI and Operation

<p align="center">
  <img src="assets/recording.gif" alt="Demo" width="700">
</p>


