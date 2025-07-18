#!/bin/bash

echo "🚀 Deploying Grafana Monitoring Stack"
echo "======================================"

# Function to wait for deployment to be ready
wait_for_deployment() {
    local deployment_name=$1
    echo "⏳ Waiting for $deployment_name to be ready..."
    kubectl wait --for=condition=Available --timeout=300s deployment/$deployment_name
    if [ $? -eq 0 ]; then
        echo " $deployment_name is ready"
    else
        echo "❌ $deployment_name failed to become ready"
        exit 1
    fi
}

# Function to wait for daemonset to be ready
wait_for_daemonset() {
    local daemonset_name=$1
    echo "⏳ Waiting for $daemonset_name to be ready..."
    kubectl wait --for=condition=Ready --timeout=300s ds/$daemonset_name
    if [ $? -eq 0 ]; then
        echo "✅ $daemonset_name is ready"
    else
        echo "❌ $daemonset_name failed to become ready"
        exit 1
    fi
}

echo "📋 Step 1: Deploying Prometheus Configuration"
kubectl apply -f prometheus-config.yaml
sleep 2

echo "📋 Step 2: Deploying Prometheus"
kubectl apply -f prometheus-deployment.yaml
wait_for_deployment "prometheus-deployment"

echo "📋 Step 3: Deploying MongoDB Exporter"
kubectl apply -f mongodb-exporter-deployment.yaml
wait_for_deployment "mongodb-exporter-deployment"

echo "📋 Step 4: Deploying Kube State Metrics"
kubectl apply -f kube-state-metrics-deployment.yaml
wait_for_deployment "kube-state-metrics"

echo "📋 Step 5: Deploying Node Exporter"
kubectl apply -f node-exporter-daemonset.yaml
wait_for_daemonset "node-exporter"

echo "📋 Step 6: Deploying Grafana Configuration"
kubectl apply -f grafana-config.yaml
kubectl apply -f grafana-dashboard-infrastructure.yaml
kubectl apply -f grafana-dashboard-mongodb.yaml
sleep 2

echo "📋 Step 7: Deploying Grafana"
kubectl apply -f grafana-deployment.yaml
wait_for_deployment "grafana-deployment"

echo "📋 Step 8: Updating Ingress"
kubectl apply -f ingress.yaml

echo ""
echo "🎉 Monitoring Stack Deployed Successfully!"
echo "=========================================="
echo ""
echo "📊 Access Points:"
echo "  • Grafana:    http://your-domain/grafana"
echo "  • Prometheus: http://your-domain/prometheus"
echo ""
echo "🔐 Grafana Login:"
echo "  • Username: admin"
echo "  • Password: admin123"
echo ""
echo "📈 Available Dashboards:"
echo "  • Application Overview"
echo "  • Infrastructure Monitoring"
echo "  • MongoDB Monitoring"
echo ""
echo "📊 Metrics Available:"
echo "  • HTTP request metrics (rate, duration, status codes)"
echo "  • Application health (active connections, DB status)"
echo "  • Business metrics (user registrations, product views)"
echo "  • Infrastructure metrics (CPU, memory, disk, network)"
echo "  • MongoDB metrics (connections, operations, performance)"
echo ""
echo "🔍 To check status:"
echo "  kubectl get pods -l app=grafana"
echo "  kubectl get pods -l app=prometheus"
echo "  kubectl get pods -l app=mongodb-exporter"
echo "  kubectl get pods -l app=kube-state-metrics"
echo ""

# Show pod status
echo "📊 Current Pod Status:"
kubectl get pods -l app=grafana,app=prometheus,app=mongodb-exporter,app=kube-state-metrics 