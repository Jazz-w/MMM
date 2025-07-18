# Complete Application Deployment Guide

This guide covers deploying the entire application stack (Backend, Frontend, and Admin Dashboard) to Kubernetes.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Admin Dashboard│
│   (127.0.0.1)   │◄───│   (API)         │◄───│   (127.0.0.2)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ frontend-service│    │ backend-service │    │admindashboard-  │
│                 │    │                 │    │    service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                                 ▼
                    ┌─────────────────┐
                    │  MongoDB        │
                    │  (Database)     │
                    └─────────────────┘
```

## 📋 Prerequisites

1. **Kubernetes cluster** running and accessible
2. **kubectl** configured and working
3. **Docker** installed for building images
4. **Ingress controller** deployed (nginx-ingress recommended)

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
# Make the script executable
chmod +x k8s/deploy-all.sh

# Run the deployment
./k8s/deploy-all.sh
```

### Option 2: Manual Step-by-Step

1. **Create secrets:**
   ```bash
   kubectl create secret generic app-secrets \
     --from-literal=mongodb-uri='mongodb://mongodb-service:27017/parapharmacy' \
     --from-literal=jwt-secret='your-super-secret-jwt-key'
   ```

2. **Build Docker images:**
   ```bash
   # Backend
   cd server && docker build -t backend:latest . && cd ..
   
   # Frontend
   cd frontend && docker build -t frontend:latest . && cd ..
   
   # Admin Dashboard
   cd admindashboard && docker build -t admindashboard:latest . && cd ..
   ```

3. **Deploy to Kubernetes:**
   ```bash
   # Deploy MongoDB
   kubectl apply -f k8s/mongodb-deployment.yaml
   
   # Deploy Backend
   kubectl apply -f k8s/backend-deployment.yaml
   
   # Deploy Frontend
   kubectl apply -f k8s/frontend-deployment.yaml
   
   # Deploy Admin Dashboard
   kubectl apply -f k8s/admindashboard-deployment.yaml
   
   # Update Ingress
   kubectl apply -f k8s/ingress.yaml
   ```

## 🌐 Access Points

After deployment, you can access:

- **Main Application**: `http://127.0.0.1`
- **Admin Dashboard**: `http://127.0.0.2`
- **API Endpoints**: `http://127.0.0.1/api` or `http://127.0.0.2/api`
- **Grafana**: `http://127.0.0.1/grafana` (if monitoring is deployed)
- **Prometheus**: `http://127.0.0.1/prometheus` (if monitoring is deployed)

## 🔧 Configuration Details

### Backend Configuration
- **Image**: `backend:latest`
- **Port**: 5000
- **Replicas**: 2
- **Resources**: 256Mi memory, 200m CPU (requests)
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGODB_URI` (from secret)
  - `JWT_SECRET` (from secret)

### Frontend Configuration
- **Image**: `frontend:latest`
- **Port**: 80
- **Replicas**: 2
- **Resources**: 128Mi memory, 100m CPU (requests)
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PUBLIC_URL=http://127.0.0.1`
  - `REACT_APP_API_URL=/api`

### Admin Dashboard Configuration
- **Image**: `admindashboard:latest`
- **Port**: 80
- **Replicas**: 1
- **Resources**: 128Mi memory, 100m CPU (requests)
- **Environment Variables**:
  - `NODE_ENV=production`
  - `REACT_APP_API_URL=/api`

## 🔒 Security Considerations

### Network Security
- Admin dashboard is isolated on separate host (127.0.0.2)
- API access is shared between frontend and admin (single backend)
- Internal service communication uses ClusterIP

### Access Control
- Admin dashboard requires admin authentication
- JWT tokens for API authentication
- CORS enabled for cross-origin requests

### Secrets Management
- MongoDB URI stored in Kubernetes secrets
- JWT secret stored in Kubernetes secrets
- No hardcoded credentials in containers

## 📊 Monitoring Integration

The deployment integrates with existing monitoring stack:
- Backend metrics exposed on `/metrics` endpoint
- Prometheus annotations for scraping
- Grafana dashboards available

## 🔍 Troubleshooting

### Common Issues

1. **Pods not starting:**
   ```bash
   kubectl get pods
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

2. **Secrets missing:**
   ```bash
   kubectl get secrets
   kubectl create secret generic app-secrets --from-literal=mongodb-uri='...' --from-literal=jwt-secret='...'
   ```

3. **Images not found:**
   ```bash
   # Rebuild images
   cd server && docker build -t backend:latest .
   cd frontend && docker build -t frontend:latest .
   cd admindashboard && docker build -t admindashboard:latest .
   ```

4. **Ingress not working:**
   ```bash
   kubectl get ingress
   kubectl describe ingress app-ingress
   ```

### Useful Commands

```bash
# Check all deployments
kubectl get deployments

# Check all services
kubectl get services

# Check all pods
kubectl get pods -o wide

# View logs
kubectl logs -l app=backend
kubectl logs -l app=frontend
kubectl logs -l app=admindashboard

# Check ingress
kubectl get ingress
kubectl describe ingress app-ingress

# Port forward for testing
kubectl port-forward svc/backend-service 5000:5000
kubectl port-forward svc/frontend-service 8080:80
kubectl port-forward svc/admindashboard-service 8081:80
```

## 🔄 Updates and Rollbacks

### Rolling Updates
```bash
# Update backend
cd server && docker build -t backend:latest .
kubectl rollout restart deployment/backend-deployment

# Update frontend
cd frontend && docker build -t frontend:latest .
kubectl rollout restart deployment/frontend-deployment

# Update admin dashboard
cd admindashboard && docker build -t admindashboard:latest .
kubectl rollout restart deployment/admindashboard-deployment
```

### Rollback
```bash
# Check rollout history
kubectl rollout history deployment/backend-deployment

# Rollback to previous version
kubectl rollout undo deployment/backend-deployment
```

## 🧪 Testing

### Health Checks
```bash
# Test API
curl http://127.0.0.1/api/health

# Test Frontend
curl http://127.0.0.1

# Test Admin Dashboard
curl http://127.0.0.2
```

### Validate Deployment
```bash
# Run the validation script
./k8s/validate-deployment.sh
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review pod logs: `kubectl logs <pod-name>`
3. Check service status: `kubectl get services`
4. Verify ingress configuration: `kubectl describe ingress app-ingress` 