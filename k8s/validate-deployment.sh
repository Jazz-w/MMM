#!/bin/bash

echo "🔍 Validating Kubernetes Deployment"
echo "===================================="

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

# Track validation results
ERRORS=0
WARNINGS=0

# Function to increment error count
add_error() {
    ERRORS=$((ERRORS + 1))
    print_error "$1"
}

# Function to increment warning count
add_warning() {
    WARNINGS=$((WARNINGS + 1))
    print_warning "$1"
}

print_status "🔍 Step 1: Checking Kubernetes cluster connectivity..."
kubectl cluster-info >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "✅ Kubernetes cluster is accessible"
else
    add_error "❌ Cannot connect to Kubernetes cluster"
    exit 1
fi

print_status "🔍 Step 2: Checking deployments..."
EXPECTED_DEPLOYMENTS=("backend-deployment" "frontend-deployment" "admindashboard-deployment" "mongodb-deployment")

for deployment in "${EXPECTED_DEPLOYMENTS[@]}"; do
    status=$(kubectl get deployment $deployment -o jsonpath='{.status.conditions[?(@.type=="Available")].status}' 2>/dev/null)
    if [ "$status" = "True" ]; then
        print_success "✅ $deployment is available"
    else
        add_error "❌ $deployment is not available"
    fi
done

print_status "🔍 Step 3: Checking services..."
EXPECTED_SERVICES=("backend-service" "frontend-service" "admindashboard-service" "mongodb-service")

for service in "${EXPECTED_SERVICES[@]}"; do
    kubectl get service $service >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "✅ $service exists"
    else
        add_error "❌ $service not found"
    fi
done

print_status "🔍 Step 4: Checking pods..."
# Check if all pods are running
NOT_RUNNING_PODS=$(kubectl get pods -l "app in (backend,frontend,admindashboard,mongodb)" --no-headers | grep -v "Running" | wc -l)
TOTAL_PODS=$(kubectl get pods -l "app in (backend,frontend,admindashboard,mongodb)" --no-headers | wc -l)

if [ $NOT_RUNNING_PODS -eq 0 ]; then
    print_success "✅ All $TOTAL_PODS pods are running"
else
    add_warning "⚠️  $NOT_RUNNING_PODS out of $TOTAL_PODS pods are not running"
    kubectl get pods -l "app in (backend,frontend,admindashboard,mongodb)" --no-headers | grep -v "Running"
fi

print_status "🔍 Step 5: Checking ingress..."
kubectl get ingress app-ingress >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "✅ Ingress app-ingress exists"
    
    # Check if ingress has an IP
    INGRESS_IP=$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ -n "$INGRESS_IP" ]; then
        print_success "✅ Ingress has IP: $INGRESS_IP"
    else
        add_warning "⚠️  Ingress doesn't have an external IP yet"
    fi
else
    add_error "❌ Ingress app-ingress not found"
fi

print_status "🔍 Step 6: Checking secrets..."
kubectl get secret app-secrets >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "✅ Secret app-secrets exists"
else
    add_error "❌ Secret app-secrets not found"
fi

print_status "🔍 Step 7: Testing connectivity..."

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    local timeout=10
    
    # Use curl with timeout and follow redirects
    if curl -s --max-time $timeout --connect-timeout 5 "$url" >/dev/null 2>&1; then
        print_success "✅ $description is accessible at $url"
    else
        add_warning "⚠️  $description is not accessible at $url (may need time to start)"
    fi
}

# Test endpoints (these might take time to be ready)
print_status "Testing application endpoints (these may take time to be ready)..."
test_url "http://127.0.0.1" "Frontend application"
test_url "http://127.0.0.2" "Admin dashboard"
test_url "http://127.0.0.1/api" "Backend API"

print_status "🔍 Step 8: Resource usage check..."
echo ""
print_status "📊 Current resource usage:"
kubectl top pods -l "app in (backend,frontend,admindashboard,mongodb)" 2>/dev/null || add_warning "⚠️  Metrics server not available for resource usage"

print_status "🔍 Step 9: Pod logs check..."
# Check for error patterns in recent logs
PODS=$(kubectl get pods -l "app in (backend,frontend,admindashboard)" -o jsonpath='{.items[*].metadata.name}')
for pod in $PODS; do
    ERROR_COUNT=$(kubectl logs $pod --tail=50 2>/dev/null | grep -i "error\|exception\|failed" | wc -l)
    if [ $ERROR_COUNT -gt 0 ]; then
        add_warning "⚠️  Found $ERROR_COUNT potential errors in $pod logs"
    else
        print_success "✅ No obvious errors in $pod logs"
    fi
done

echo ""
echo "🏁 Validation Summary"
echo "===================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "🎉 All validation checks passed! Deployment is healthy."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    print_warning "⚠️  Validation completed with $WARNINGS warnings"
    echo ""
    print_status "📋 Recommendations:"
    echo "   • Wait a few minutes for all services to fully start"
    echo "   • Check pod logs if you encounter issues"
    echo "   • Verify ingress controller is properly configured"
    exit 0
else
    print_error "❌ Validation failed with $ERRORS errors and $WARNINGS warnings"
    echo ""
    print_status "🔧 Troubleshooting steps:"
    echo "   1. Check pod status: kubectl get pods"
    echo "   2. Check deployment status: kubectl get deployments"
    echo "   3. Check pod logs: kubectl logs <pod-name>"
    echo "   4. Check secrets: kubectl get secrets"
    echo "   5. Re-run deployment script: ./k8s/deploy-all.sh"
    exit 1
fi 