# CRUD App with ArgoCD Image Updater (Automatic Docker Image Deployment)

This project demonstrates a complete **GitOps workflow** for deploying a Node.js CRUD application to Kubernetes, using **ArgoCD**, **ArgoCD Image Updater**, and **Docker Hub** for automated image updates.  

Whenever a new Docker image is pushed, ArgoCD Image Updater detects it and ArgoCD auto-syncs the deployment automatically.

---

## **Tech Stack**

- **Kubernetes** – Deployment environment
- **Docker** – Containerization
- **Docker Hub** – Image registry
- **ArgoCD** – GitOps continuous deployment
- **ArgoCD Image Updater** – Automatic image updates
- **Prometheus & Grafana** – Monitoring via `kube-prometheus-stack`
- **Helm** – Package management for Kubernetes

---

## **Architecture Flow**

```text
Docker Hub → ArgoCD Image Updater → ArgoCD Application → Kubernetes Deployment → Pods
```
- Developer pushes a new Docker image to Docker Hub.
- ArgoCD Image Updater detects the new image based on annotation.
- Updates the ArgoCD Application manifest with new image digest.
- ArgoCD auto-syncs → Kubernetes Deployment updates automatically.
- New pods run the updated image.

---

## Step 1: Install Helm

```
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm

```

---

## Step 2: Install Prometheus & Grafana (kube-prometheus-stack)

```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring
kubectl get pods -n monitoring


```

---

## Step 3: Install ArgoCD via Helm

```
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

kubectl create namespace argocd
helm install argocd argo/argo-cd --namespace argocd

kubectl get svc -n argocd argocd-server


```
Log in to ArgoCD

```
kubectl -n argocd get pods
# Username: admin
# Password: <argocd-server pod name>

```
---

## Step 4: Install ArgoCD Image Updater

```

helm upgrade --install argocd-image-updater argo/argocd-image-updater -n argocd

```

---

## Step 5: Configure Docker Hub Credentials

```
kubectl -n argocd create secret docker-registry dockerhub-creds \
  --docker-server=https://registry-1.docker.io \
  --docker-username=softconsist \
  --docker-password=<DOCKER_HUB_PERSONAL_ACCESS_TOKEN>


```

---

## Step 6: Configure ArgoCD Image Updater Registry Access

Create registries.conf.yaml:

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-config
  namespace: argocd
data:
  registries.conf: |
    registries:
    - name: Docker Hub
      api_url: https://registry-1.docker.io
      prefix: docker.io
      defaultns: library
      credentials: pullsecret:argocd/dockerhub-creds
      ping: true

```

Apply config and restart AUI:

```
kubectl apply -f registries.conf.yaml
kubectl -n argocd rollout restart deploy/argocd-image-updater

```
---

## Step 7: Annotate ArgoCD Application for Image Updates

```
kubectl -n argocd patch application crud-app-k8s \
  --type merge \
  -p '{
    "metadata": {
      "annotations": {
        "argocd-image-updater.argoproj.io/write-back-method": "argocd",
        "argocd-image-updater.argoproj.io/image-list": "crud=docker.io/softconsist/crud-123:latest",
        "argocd-image-updater.argoproj.io/crud.update-strategy": "digest",
        "argocd-image-updater.argoproj.io/update-interval": "10s"
      }
    }
  }'


```
Verify annotation:

```
kubectl -n argocd get application crud-app-k8s -o yaml | grep argocd-image-updater

```

---

## Step 8: Monitor ArgoCD Image Updater Logs

```
kubectl -n argocd logs deploy/argocd-image-updater -f


```
Watch for messages showing image updates and deployment syncs.
--- 


## Step 9: Verify Deployment

```
kubectl -n crud-app get pods -o wide
kubectl -n crud-app get deploy crud-app -o yaml | grep image


```

You should see the latest Docker image automatically deployed to your cluster.

---


## ✅ Result

Any new image pushed to Docker Hub triggers automatic deployment.
No manual intervention is required.
Prometheus & Grafana provide monitoring for cluster and app metrics.

---

Optional: Trigger Manual Update

kubectl -n argocd exec deploy/argocd-image-updater -- argocd-image-updater run-once

---
