#!/bin/bash

echo "🚀 Deploying Complete Application Stack to Kubernetes"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to wait for deployment to be ready
wait_for_deployment() {
    local deployment_name=$1
    print_status "⏳ Waiting for $deployment_name to be ready..."
    kubectl wait --for=condition=Available --timeout=300s deployment/$deployment_name
    if [ $? -eq 0 ]; then
        print_success "✅ $deployment_name is ready"
    else
        print_error "❌ $deployment_name failed to become ready"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -d "k8s" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Build Docker images
print_status "📦 Step 1: Building Docker images..."

# Build backend
print_status "Building backend image..."
cd server
docker build -t backend:latest .
if [ $? -eq 0 ]; then
    print_success "Backend image built successfully"
else
    print_error "Failed to build backend image"
    exit 1
fi
cd ..

# Build frontend
print_status "Building frontend image..."
cd frontend
docker build -t frontend:latest .
if [ $? -eq 0 ]; then
    print_success "Frontend image built successfully"
else
    print_error "Failed to build frontend image"
    exit 1
fi
cd ..

# Build admin dashboard
print_status "Building admin dashboard image..."
cd admindashboard
docker build -t admindashboard:latest .
if [ $? -eq 0 ]; then
    print_success "Admin dashboard image built successfully"
else
    print_error "Failed to build admin dashboard image"
    exit 1
fi
cd ..

# Step 2: Check if secrets exist
print_status "📋 Step 2: Checking Kubernetes secrets..."
kubectl get secret app-secrets >/dev/null 2>&1
if [ $? -ne 0 ]; then
    print_warning "app-secrets not found. Please create it first:"
    echo "kubectl create secret generic app-secrets \\"
    echo "  --from-literal=mongodb-uri='mongodb://mongodb-service:27017/your-db' \\"
    echo "  --from-literal=jwt-secret='your-jwt-secret'"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "app-secrets found"
fi

# Step 3: Deploy MongoDB first (if not already deployed)
print_status "📋 Step 3: Deploying MongoDB..."
kubectl apply -f k8s/mongodb-deployment.yaml
wait_for_deployment "mongodb-deployment"

# Step 4: Deploy Backend
print_status "📋 Step 4: Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml
wait_for_deployment "backend-deployment"

# Step 5: Deploy Frontend
print_status "📋 Step 5: Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
wait_for_deployment "frontend-deployment"

# Step 6: Deploy Admin Dashboard
print_status "📋 Step 6: Deploying Admin Dashboard..."
kubectl apply -f k8s/admindashboard-deployment.yaml
wait_for_deployment "admindashboard-deployment"

# Step 7: Update Ingress
print_status "📋 Step 7: Updating Ingress..."
kubectl apply -f k8s/ingress.yaml
if [ $? -eq 0 ]; then
    print_success "Ingress updated successfully"
else
    print_error "Failed to update ingress"
    exit 1
fi

# Step 8: Check deployment status
print_status "📊 Step 8: Checking deployment status..."
echo ""
print_status "🔍 Current Pod Status:"
kubectl get pods -l "app in (backend,frontend,admindashboard,mongodb)" -o wide

echo ""
print_status "🌐 Service Status:"
kubectl get services -l "app in (backend,frontend,admindashboard,mongodb)"

echo ""
print_status "🔀 Ingress Status:"
kubectl get ingress

echo ""
print_success "🎉 Deployment Complete!"
echo "========================================"
echo ""
print_status "📊 Access Points:"
echo "  • Main Application:  http://127.0.0.1"
echo "  • Admin Dashboard:   http://127.0.0.2"
echo "  • API Endpoints:     http://127.0.0.1/api or http://127.0.0.2/api"
echo "  • Grafana:          http://127.0.0.1/grafana"
echo "  • Prometheus:       http://127.0.0.1/prometheus"
echo ""
print_status "🔍 To check status:"
echo "  kubectl get pods"
echo "  kubectl get services"
echo "  kubectl get ingress"
echo ""
print_status "🔍 To view logs:"
echo "  kubectl logs -l app=backend"
echo "  kubectl logs -l app=frontend"
echo "  kubectl logs -l app=admindashboard"
echo ""

# Final validation
print_status "⏳ Final validation (waiting 30 seconds for services to stabilize)..."
sleep 30

echo ""
print_status "🏥 Health Check:"
kubectl get pods -l "app in (backend,frontend,admindashboard)" --no-headers | while read line; do
    pod_name=$(echo $line | awk '{print $1}')
    status=$(echo $line | awk '{print $3}')
    if [ "$status" = "Running" ]; then
        print_success "✅ $pod_name is running"
    else
        print_warning "⚠️  $pod_name status: $status"
    fi
done

echo ""
print_success "🚀 All services deployed successfully!"
print_status "You can now access the applications at the URLs listed above." 