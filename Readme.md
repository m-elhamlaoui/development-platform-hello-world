# 🚀 Multi-Node Application Deployment with Docker, Jenkins & MicroK8s

We used the same application we developed for the first project 'plateformes de développement' .
This project demonstrates the deployment of a distributed application composed of three modules:
- ✅ **Frontend** (Next.js)
- ✅ **Backend 1** (Django)
- ✅ **Backend 2** (Spring Boot)

Each module is deployed to a different machine using:
- **Docker** for containerization
- **Jenkins** for CI/CD automation
- **MicroK8s** for orchestration and container management

---

## 📡 Deployment Architecture

d:\téléchargements\WhatsApp Image 2025-05-23 at 23.44.13.jpeg

---

## ⚙️ Technologies Used

| Tool         | Purpose                                        |
|--------------|------------------------------------------------|
| Docker       | Containerize each service                      |
| Jenkins      | Automate build, test, and deploy pipelines     |
| MicroK8s     | Lightweight Kubernetes for service orchestration |
| GitHub       | Version control and webhook integration        |


---

## 🔧 Deployment Setup

### 🖥️ Machine 1 – Jenkins Master

- Runs the Jenkins server
- Monitors GitHub via webhook
- Contains build pipeline stages for all services
- Sends builds to corresponding worker nodes using SSH or Kubernetes context

### 🖥️ Machine 2 – Django Node

- Hosts the `SatelliteTracker` Django app
- Dockerized using a `Dockerfile`
- Deploys the app to MicroK8s via Jenkins

### 🖥️ Machine 3 – Spring Node

- Hosts the `spring-module` app
- Dockerized and deployed via pipeline
- Also joins the MicroK8s cluster (if multi-node orchestration is needed)

---

## 🔁 CI/CD Pipeline Flow

1. **Push to GitHub** triggers webhook
2. **Jenkins** checks out the code
3. **Docker Build** happens for each service:
   - Uses `Jenkinsfile` for consistent stage control
4. **Image Deployment**:
   - Pushed to container registry or deployed directly via MicroK8s
5. **MicroK8s** applies YAML manifests for service exposure

---

## 🛠 Sample Jenkins Pipeline (per module)

```groovy
pipeline {
  agent any
  environment {
    IMAGE_NAME = 'satellite-backend:latest'
  }
  stages {
    stage('Build Docker Image') {
      steps {
        dir('SpaceApp/SatelliteTracker') {
          sh 'docker build -t $IMAGE_NAME .'
        }
      }
    }
    stage('Deploy to MicroK8s') {
      steps {
        sh 'microk8s kubectl apply -f deploy.yml'
        sh 'microk8s kubectl apply -f service.yml'
      }
    }
  }
}
